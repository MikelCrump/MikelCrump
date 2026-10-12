import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parsePem } from "eckey-utils";
import elliptic from "elliptic";
import protobuf from "protobufjs";

const EPOCH_LENGTH = 1 << 30;

type EcKey = {
  privateKey: Buffer;
  publicKey: Buffer;
};

let roots: {
  Domain: Record<string, number>;
  msgProto: protobuf.Type;
  sessionInfoProto: protobuf.Type;
  carServerResponseProto: protobuf.Type;
  actionProto: protobuf.Type;
  ActionResult: Record<string, number>;
  Tags: Record<string, number>;
  SignatureTypes: Record<string, number>;
} | null = null;

function protoDir() {
  const candidates = [
    path.join(process.cwd(), "src/life/tesla-command/proto"),
    path.join(process.cwd(), "life/tesla-command/proto"),
  ];
  for (const dir of candidates) {
    if (existsSync(path.join(dir, "car_server.proto"))) return dir;
  }
  throw new Error("Tesla command protos missing from deployment");
}

async function loadRoots() {
  if (roots) return roots;
  const dir = protoDir();
  const protoSignatures = await protobuf.load(path.join(dir, "signatures.proto"));
  const protoMessage = await protobuf.load(path.join(dir, "universal_message.proto"));
  const protoCarServer = await protobuf.load(path.join(dir, "car_server.proto"));
  roots = {
    Domain: protoMessage.lookupEnum("UniversalMessage.Domain").values,
    msgProto: protoMessage.lookupType("UniversalMessage.RoutableMessage"),
    sessionInfoProto: protoSignatures.lookupType("Signatures.SessionInfo"),
    carServerResponseProto: protoCarServer.lookupType("CarServer.Response"),
    actionProto: protoCarServer.lookupType("CarServer.Action"),
    ActionResult: protoCarServer.lookupEnum("CarServer.OperationStatus_E").values,
    Tags: protoSignatures.lookupEnum("Signatures.Tag").values,
    SignatureTypes: protoSignatures.lookupEnum("Signatures.SignatureType").values,
  };
  return roots;
}

function parsePrivateKeyPem(pem: string): EcKey {
  const normalized = pem.includes("\\n") ? pem.replace(/\\n/g, "\n") : pem;
  const parsed = parsePem(normalized) as { privateKey: Buffer; publicKey: Buffer };
  if (!parsed.privateKey || !parsed.publicKey) {
    throw new Error("Invalid TESLA_PRIVATE_KEY_PEM");
  }
  return { privateKey: parsed.privateKey, publicKey: parsed.publicKey };
}

class Metadata {
  context: ReturnType<typeof createHmac>;
  last = 0;
  constructor(context: ReturnType<typeof createHmac>) {
    this.context = context;
  }
  add(tag: number, value: Buffer | null) {
    if (value == null) return;
    if (tag < this.last) throw new Error("metadata tag order");
    if (value.length > 255) throw new Error("metadata too long");
    this.last = tag;
    this.context.update(Buffer.from([tag]));
    this.context.update(Buffer.from([value.length]));
    this.context.update(value);
  }
  addUint32(tag: number, value: number) {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(value);
    this.add(tag, buffer);
  }
  checksum(message: Uint8Array) {
    this.context.update(Buffer.from([255]));
    this.context.update(message);
    return this.context.digest();
  }
}

class AuthSession {
  key: Buffer;
  localPublic: Buffer;
  constructor(key: EcKey, serverPublicKey: Uint8Array) {
    const ec = new elliptic.ec("p256");
    const privateKey = ec.keyFromPrivate(key.privateKey);
    const publicKey = ec.keyFromPublic(Buffer.from(serverPublicKey));
    const sharedSecret = privateKey.derive(publicKey.getPublic());
    const hash = createHash("sha1");
    hash.update(Buffer.from(sharedSecret.toString(16), "hex"));
    this.key = hash.digest().subarray(0, 16);
    this.localPublic = key.publicKey;
  }
  newHMAC(label: string) {
    const kdf = createHmac("sha256", this.key);
    kdf.update(Buffer.from(label, "utf8"));
    return createHmac("sha256", kdf.digest());
  }
}

class Signer {
  session: AuthSession;
  verifierName: string;
  timeZero: number;
  epoch: Buffer;
  counter: number;
  Tags: Record<string, number>;
  SignatureTypes: Record<string, number>;

  constructor(
    key: EcKey,
    verifierName: string,
    verifierSessionInfo: {
      publicKey: Uint8Array;
      clockTime: number;
      epoch: Uint8Array;
      counter: number;
    },
    tags: Record<string, number>,
    signatureTypes: Record<string, number>,
  ) {
    this.session = new AuthSession(key, verifierSessionInfo.publicKey);
    this.verifierName = verifierName;
    this.timeZero = Math.floor(Date.now() / 1000) - verifierSessionInfo.clockTime;
    this.epoch = Buffer.from(verifierSessionInfo.epoch);
    this.counter = verifierSessionInfo.counter;
    this.Tags = tags;
    this.SignatureTypes = signatureTypes;
  }

  validateSessionInfo(encodedSessionInfo: Uint8Array, challenge: Uint8Array, tag: Uint8Array) {
    const meta = new Metadata(this.session.newHMAC("session info"));
    meta.add(
      this.Tags.TAG_SIGNATURE_TYPE,
      Buffer.from([this.SignatureTypes.SIGNATURE_TYPE_HMAC]),
    );
    meta.add(this.Tags.TAG_PERSONALIZATION, Buffer.from(this.verifierName));
    meta.add(this.Tags.TAG_CHALLENGE, Buffer.from(challenge));
    const validTag = meta.checksum(encodedSessionInfo);
    return timingSafeEqual(validTag, Buffer.from(tag));
  }

  generateSignature(encodedPayload: Uint8Array, domain: number, expiresIn: number) {
    this.counter += 1;
    const meta = new Metadata(this.session.newHMAC("authenticated command"));
    meta.add(
      this.Tags.TAG_SIGNATURE_TYPE,
      Buffer.from([this.SignatureTypes.SIGNATURE_TYPE_HMAC_PERSONALIZED]),
    );
    meta.add(this.Tags.TAG_DOMAIN, Buffer.from([domain]));
    meta.add(this.Tags.TAG_PERSONALIZATION, Buffer.from(this.verifierName));
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn - this.timeZero;
    if (expiresAt > EPOCH_LENGTH || expiresAt < 0) {
      throw new Error("out of bounds expiration time");
    }
    meta.add(this.Tags.TAG_EPOCH, this.epoch);
    meta.addUint32(this.Tags.TAG_EXPIRES_AT, expiresAt);
    meta.addUint32(this.Tags.TAG_COUNTER, this.counter);
    return {
      signerIdentity: { publicKey: this.session.localPublic },
      HMAC_PersonalizedData: {
        epoch: this.epoch,
        counter: this.counter,
        expiresAt,
        tag: meta.checksum(encodedPayload),
      },
    };
  }
}

async function postSignedCommand(
  fleetBase: string,
  accessToken: string,
  vin: string,
  message: Uint8Array,
) {
  const res = await fetch(`${fleetBase}/api/1/vehicles/${vin}/signed_command`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "MikelLifeOps/1.0",
    },
    body: JSON.stringify({
      routable_message: Buffer.from(message).toString("base64"),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`signed_command ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { response?: string };
  if (!json.response) throw new Error("Invalid signed_command response");
  return Buffer.from(json.response, "base64");
}

export async function sendSignedVehicleAction(options: {
  fleetBase: string;
  accessToken: string;
  vin: string;
  privateKeyPem: string;
  action: Record<string, unknown>;
}) {
  const r = await loadRoots();
  const key = parsePrivateKeyPem(options.privateKeyPem);
  const sessionBox: { signer: Signer | null } = { signer: null };

  async function sendRequest(req: Record<string, unknown>) {
    const message = r.msgProto.create(req);
    const buffer = r.msgProto.encode(message).finish();
    const bufResp = await postSignedCommand(
      options.fleetBase,
      options.accessToken,
      options.vin,
      buffer,
    );
    const res = r.msgProto.decode(bufResp) as Record<string, unknown>;

    if (res.sessionInfo && res.signatureData) {
      const signatureData = res.signatureData as {
        sessionInfoTag?: { tag?: Uint8Array };
      };
      const tag = signatureData.sessionInfoTag?.tag;
      if (!tag) throw new Error("Missing sessionInfo tag");
      const sessionInfo = r.sessionInfoProto.decode(
        res.sessionInfo as Uint8Array,
      ) as unknown as {
        publicKey: Uint8Array;
        clockTime: number;
        epoch: Uint8Array;
        counter: number;
      };
      const next = new Signer(
        key,
        options.vin,
        sessionInfo,
        r.Tags,
        r.SignatureTypes,
      );
      if (
        !next.validateSessionInfo(
          res.sessionInfo as Uint8Array,
          res.requestUuid as Uint8Array,
          tag,
        )
      ) {
        sessionBox.signer = null;
        throw new Error("Session info hmac invalid — pair virtual key?");
      }
      sessionBox.signer = next;
      return sessionInfo;
    }

    if (res.protobufMessageAsBytes) {
      return r.carServerResponseProto.decode(
        res.protobufMessageAsBytes as Uint8Array,
      ) as unknown as {
        actionStatus?: {
          result?: number;
          resultReason?: { plainText?: string };
        };
      };
    }
    throw new Error("Invalid vehicle response");
  }

  await sendRequest({
    toDestination: { domain: r.Domain.DOMAIN_INFOTAINMENT },
    fromDestination: { routingAddress: randomBytes(16) },
    sessionInfoRequest: { publicKey: key.publicKey },
    uuid: randomBytes(16),
  });

  if (!sessionBox.signer) {
    throw new Error("Vehicle command session failed to start");
  }

  const payload = r.actionProto.create({ vehicleAction: options.action });
  const encodedPayload = r.actionProto.encode(payload).finish();
  const signature = sessionBox.signer.generateSignature(
    encodedPayload,
    r.Domain.DOMAIN_INFOTAINMENT,
    5,
  );
  const response = await sendRequest({
    toDestination: { domain: r.Domain.DOMAIN_INFOTAINMENT },
    fromDestination: { routingAddress: randomBytes(16) },
    protobufMessageAsBytes: encodedPayload,
    signatureData: signature,
    uuid: randomBytes(16),
    flags: 0,
  });

  const status = (
    response as {
      actionStatus?: { result?: number; resultReason?: { plainText?: string } };
    }
  ).actionStatus;
  if (status?.result === r.ActionResult.OPERATIONSTATUS_OK) return;
  if (status?.result === r.ActionResult.OPERATIONSTATUS_ERROR) {
    throw new Error(status.resultReason?.plainText ?? "Vehicle rejected command");
  }
  throw new Error("Invalid CarServer action result");
}

export function actionForControl(action: string): Record<string, unknown> | null {
  switch (action) {
    case "climate_on":
      return { hvacAutoAction: { powerOn: true, manualOverride: true } };
    case "climate_off":
      return { hvacAutoAction: { powerOn: false, manualOverride: true } };
    case "charge_start":
      return { chargingStartStopAction: { start: {} } };
    case "charge_stop":
      return { chargingStartStopAction: { stop: {} } };
    default:
      return null;
  }
}

export function hasTeslaPrivateKey(pem: string | undefined | null) {
  return Boolean(pem && pem.includes("PRIVATE KEY"));
}

export function loadPrivateKeyFromDiskFallback() {
  const file = path.join(process.cwd(), ".data", "tesla-private.pem");
  if (!existsSync(file)) return null;
  return readFileSync(file, "utf8");
}
