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
  unsignedMessageProto: protobuf.Type;
  fromVcsecProto: protobuf.Type;
  VcsecResult: Record<string, number>;
  RkeAction: Record<string, number>;
  ClosureMoveType: Record<string, number>;
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
  const protoVcsec = await protobuf.load(path.join(dir, "vcsec.proto"));
  roots = {
    Domain: protoMessage.lookupEnum("UniversalMessage.Domain").values,
    msgProto: protoMessage.lookupType("UniversalMessage.RoutableMessage"),
    sessionInfoProto: protoSignatures.lookupType("Signatures.SessionInfo"),
    carServerResponseProto: protoCarServer.lookupType("CarServer.Response"),
    actionProto: protoCarServer.lookupType("CarServer.Action"),
    ActionResult: protoCarServer.lookupEnum("CarServer.OperationStatus_E").values,
    Tags: protoSignatures.lookupEnum("Signatures.Tag").values,
    SignatureTypes: protoSignatures.lookupEnum("Signatures.SignatureType").values,
    unsignedMessageProto: protoVcsec.lookupType("VCSEC.UnsignedMessage"),
    fromVcsecProto: protoVcsec.lookupType("VCSEC.FromVCSECMessage"),
    VcsecResult: protoVcsec.lookupEnum("VCSEC.OperationStatus_E").values,
    RkeAction: protoVcsec.lookupEnum("VCSEC.RKEAction_E").values,
    ClosureMoveType: protoVcsec.lookupEnum("VCSEC.ClosureMoveType_E").values,
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

/** Lock / unlock / trunk / remote-start go through VCSEC (vehicle security domain). */
export async function sendSignedVcsecMessage(options: {
  fleetBase: string;
  accessToken: string;
  vin: string;
  privateKeyPem: string;
  unsigned: Record<string, unknown>;
}) {
  const r = await loadRoots();
  const key = parsePrivateKeyPem(options.privateKeyPem);
  const sessionBox: { signer: Signer | null } = { signer: null };
  const domain = r.Domain.DOMAIN_VEHICLE_SECURITY;

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
      return r.fromVcsecProto.decode(
        res.protobufMessageAsBytes as Uint8Array,
      ) as unknown as {
        commandStatus?: { operationStatus?: number };
      };
    }
    throw new Error("Invalid VCSEC response");
  }

  await sendRequest({
    toDestination: { domain },
    fromDestination: { routingAddress: randomBytes(16) },
    sessionInfoRequest: { publicKey: key.publicKey },
    uuid: randomBytes(16),
  });

  if (!sessionBox.signer) {
    throw new Error("Vehicle security session failed to start");
  }

  const payload = r.unsignedMessageProto.create(options.unsigned);
  const encodedPayload = r.unsignedMessageProto.encode(payload).finish();
  const signature = sessionBox.signer.generateSignature(encodedPayload, domain, 5);
  const response = await sendRequest({
    toDestination: { domain },
    fromDestination: { routingAddress: randomBytes(16) },
    protobufMessageAsBytes: encodedPayload,
    signatureData: signature,
    uuid: randomBytes(16),
    flags: 0,
  });

  const status = (response as { commandStatus?: { operationStatus?: number } })
    .commandStatus?.operationStatus;
  if (status === r.VcsecResult.OPERATIONSTATUS_OK) return;
  if (status === r.VcsecResult.OPERATIONSTATUS_WAIT) return;
  throw new Error("Vehicle security rejected command — pair virtual key?");
}

function parseMaybeJson(value?: string | number | boolean) {
  if (typeof value !== "string") return {};
  const t = value.trim();
  if (!t.startsWith("{")) return {};
  try {
    return JSON.parse(t) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export type SignedControlPlan =
  | { domain: "infotainment"; action: Record<string, unknown> }
  | { domain: "vehicle_security"; unsigned: Record<string, unknown> };

const SEAT_HEAT_LEVELS = [
  "SEAT_HEATER_OFF",
  "SEAT_HEATER_LOW",
  "SEAT_HEATER_MED",
  "SEAT_HEATER_HIGH",
] as const;
const SEAT_HEAT_POSITIONS = [
  "CAR_SEAT_FRONT_LEFT",
  "CAR_SEAT_FRONT_RIGHT",
  "CAR_SEAT_REAR_LEFT",
  "CAR_SEAT_REAR_LEFT_BACK",
  "CAR_SEAT_REAR_CENTER",
  "CAR_SEAT_REAR_RIGHT",
  "CAR_SEAT_REAR_RIGHT_BACK",
  "CAR_SEAT_THIRD_ROW_LEFT",
  "CAR_SEAT_THIRD_ROW_RIGHT",
] as const;

/** Map Life Ops actions → signed Vehicle Command Protocol payloads. */
export function resolveSignedControl(
  action: string,
  value?: string | number | boolean,
): SignedControlPlan | null {
  const obj = parseMaybeJson(value);

  // VCSEC (lock / unlock / trunk / remote start)
  if (action === "lock") {
    return {
      domain: "vehicle_security",
      unsigned: { RKEAction: "RKE_ACTION_LOCK" },
    };
  }
  if (action === "unlock") {
    return {
      domain: "vehicle_security",
      unsigned: { RKEAction: "RKE_ACTION_UNLOCK" },
    };
  }
  if (action === "remote_start_drive") {
    return {
      domain: "vehicle_security",
      unsigned: { RKEAction: "RKE_ACTION_REMOTE_DRIVE" },
    };
  }
  if (action === "actuate_trunk") {
    const which =
      typeof value === "string" && !value.startsWith("{")
        ? value
        : String(obj.which_trunk ?? "rear");
    const move = "CLOSURE_MOVE_TYPE_MOVE";
    return {
      domain: "vehicle_security",
      unsigned: {
        closureMoveRequest:
          which === "front"
            ? { frontTrunk: move }
            : { rearTrunk: move },
      },
    };
  }

  const vehicleAction = actionForControl(action, value);
  if (!vehicleAction) return null;
  return { domain: "infotainment", action: vehicleAction };
}

function resolveOn(
  value: string | number | boolean | undefined,
  obj: Record<string, unknown>,
) {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1 || value === "1") return true;
  if (value === "false" || value === 0 || value === "0" || value === "off") {
    return false;
  }
  if (typeof obj.on === "boolean") return obj.on;
  return true;
}

/** Map Life Ops actions → CarServer VehicleAction fields (camelCase for protobufjs). */
export function actionForControl(
  action: string,
  value?: string | number | boolean,
): Record<string, unknown> | null {
  const obj = parseMaybeJson(value);
  const on = resolveOn(value, obj);

  switch (action) {
    case "climate_on":
      return { hvacAutoAction: { powerOn: true, manualOverride: true } };
    case "climate_off":
      return { hvacAutoAction: { powerOn: false, manualOverride: true } };
    case "set_temps": {
      const tempF =
        typeof value === "number"
          ? value
          : Number(obj.driver_temp_f ?? obj.temp ?? obj.driver_temp ?? value);
      if (!Number.isFinite(tempF)) return null;
      const c = ((tempF - 32) * 5) / 9;
      return {
        hvacTemperatureAdjustmentAction: {
          absoluteCelsius: c,
          driverTempCelsius: c,
          passengerTempCelsius: c,
          hvacTemperatureZone: [
            { TEMP_ZONE_FRONT_LEFT: {} },
            { TEMP_ZONE_FRONT_RIGHT: {} },
          ],
        },
      };
    }
    case "set_climate_keeper_mode": {
      const mode =
        typeof value === "number"
          ? value
          : Number(obj.climate_keeper_mode ?? value ?? 0);
      return {
        hvacClimateKeeperAction: {
          ClimateKeeperAction: mode,
          manualOverride: true,
        },
      };
    }
    case "set_preconditioning_max":
      return { hvacSetPreconditioningMaxAction: { on, manualOverride: true } };
    case "set_bioweapon_mode":
      return { hvacBioweaponModeAction: { on, manualOverride: true } };
    case "charge_start":
      return { chargingStartStopAction: { start: {} } };
    case "charge_stop":
      return { chargingStartStopAction: { stop: {} } };
    case "charge_standard":
      return { chargingStartStopAction: { startStandard: {} } };
    case "charge_max_range":
      return { chargingStartStopAction: { startMaxRange: {} } };
    case "set_charge_limit": {
      const percent =
        typeof value === "number" ? value : Number(obj.percent ?? value);
      return Number.isFinite(percent)
        ? { chargingSetLimitAction: { percent } }
        : null;
    }
    case "set_charging_amps": {
      const amps =
        typeof value === "number" ? value : Number(obj.charging_amps ?? value);
      return Number.isFinite(amps)
        ? { setChargingAmpsAction: { chargingAmps: amps } }
        : null;
    }
    case "charge_port_door_open":
      return { chargePortDoorOpen: {} };
    case "charge_port_door_close":
      return { chargePortDoorClose: {} };
    case "flash_lights":
      return { vehicleControlFlashLightsAction: {} };
    case "honk_horn":
      return { vehicleControlHonkHornAction: {} };
    case "set_sentry_mode":
      return { vehicleControlSetSentryModeAction: { on } };
    case "set_valet_mode":
      return {
        vehicleControlSetValetModeAction: {
          on: obj.on !== false && value !== "false" && value !== false,
          password: String(obj.password ?? obj.pin ?? value ?? ""),
        },
      };
    case "reset_valet_pin":
      return { vehicleControlResetValetPinAction: {} };
    case "set_pin_to_drive":
      return {
        vehicleControlSetPinToDriveAction: {
          on: obj.on !== false && value !== "false" && value !== false,
          password: String(obj.password ?? obj.pin ?? value ?? ""),
        },
      };
    case "reset_pin_to_drive_pin":
      return { vehicleControlResetPinToDriveAction: {} };
    case "guest_mode":
      return { guestModeAction: { GuestModeActive: on } };
    case "erase_user_data":
      return { eraseUserDataAction: { reason: "life-ops" } };
    case "trigger_homelink": {
      const lat = Number(obj.lat ?? obj.latitude);
      const lon = Number(obj.lon ?? obj.longitude);
      return {
        vehicleControlTriggerHomelinkAction: {
          location:
            Number.isFinite(lat) && Number.isFinite(lon)
              ? { latitude: lat, longitude: lon }
              : undefined,
        },
      };
    }
    case "window_control": {
      const command =
        typeof value === "string" && !value.startsWith("{")
          ? value
          : String(obj.command ?? "vent");
      return {
        vehicleControlWindowAction:
          command === "close" ? { close: {} } : { vent: {} },
      };
    }
    case "sun_roof_control": {
      const state =
        typeof value === "string" && !value.startsWith("{")
          ? value
          : String(obj.state ?? "vent");
      if (state === "close") {
        return { vehicleControlSunroofOpenCloseAction: { close: {} } };
      }
      if (state === "open") {
        return { vehicleControlSunroofOpenCloseAction: { open: {} } };
      }
      return { vehicleControlSunroofOpenCloseAction: { vent: {} } };
    }
    case "media_next_track":
      return { mediaNextTrack: {} };
    case "media_prev_track":
      return { mediaPreviousTrack: {} };
    case "media_next_fav":
      return { mediaNextFavorite: {} };
    case "media_prev_fav":
      return { mediaPreviousFavorite: {} };
    case "media_volume_up":
      return { mediaUpdateVolume: { volumeDelta: 1 } };
    case "media_volume_down":
      return { mediaUpdateVolume: { volumeDelta: -1 } };
    case "adjust_volume": {
      const volume =
        typeof value === "number" ? value : Number(obj.volume ?? value);
      return Number.isFinite(volume)
        ? { mediaUpdateVolume: { volumeAbsoluteFloat: volume } }
        : null;
    }
    case "remote_steering_wheel_heater_request":
    case "remote_auto_steering_wheel_heat_climate_request":
      return { hvacSteeringWheelHeaterAction: { powerOn: on } };
    case "remote_auto_seat_climate_request": {
      const seat = Number(obj.seat_position ?? obj.seat ?? 0);
      return {
        autoSeatClimateAction: {
          carseat: [
            {
              on,
              seatPosition: seat === 1 ? 2 : 1, // FrontRight : FrontLeft
            },
          ],
        },
      };
    }
    case "set_vehicle_name":
      return {
        setVehicleNameAction: {
          vehicleName: String(obj.vehicle_name ?? value ?? ""),
        },
      };
    case "cancel_software_update":
      return { vehicleControlCancelSoftwareUpdateAction: {} };
    case "schedule_software_update": {
      const offset =
        typeof value === "number" ? value : Number(obj.offset_sec ?? value ?? 0);
      return {
        vehicleControlScheduleSoftwareUpdateAction: { offsetSec: offset },
      };
    }
    case "set_cabin_overheat_protection":
      return {
        setCabinOverheatProtectionAction: {
          on,
          fanOnly: Boolean(obj.fan_only),
        },
      };
    case "set_cop_temp": {
      const cop =
        typeof value === "number" ? value : Number(obj.cop_temp ?? value);
      return Number.isFinite(cop)
        ? { setCopTempAction: { copActivationTemp: cop } }
        : null;
    }
    case "remote_seat_heater_request": {
      const level = Math.min(3, Math.max(0, Number(obj.level ?? value ?? 1)));
      const seat = Math.min(
        SEAT_HEAT_POSITIONS.length - 1,
        Math.max(0, Number(obj.seat_position ?? obj.seat ?? 0)),
      );
      const levelKey = SEAT_HEAT_LEVELS[level] ?? "SEAT_HEATER_LOW";
      const seatKey = SEAT_HEAT_POSITIONS[seat] ?? "CAR_SEAT_FRONT_LEFT";
      return {
        hvacSeatHeaterActions: {
          hvacSeatHeaterAction: [{ [levelKey]: {}, [seatKey]: {} }],
        },
      };
    }
    case "remote_seat_cooler_request": {
      const level = Math.min(3, Math.max(0, Number(obj.level ?? value ?? 1)));
      const seat = Number(obj.seat_position ?? obj.seat ?? 0);
      // Enum: Unknown=0 Off=1 Low=2 Med=3 High=4
      const coolerLevel = level + 1;
      return {
        hvacSeatCoolerActions: {
          hvacSeatCoolerAction: [
            {
              seatCoolerLevel: coolerLevel,
              seatPosition: seat === 1 ? 2 : 1,
            },
          ],
        },
      };
    }
    case "speed_limit_set_limit": {
      const limit =
        typeof value === "number"
          ? value
          : Number(obj.limit_mph ?? obj.speed_limit_mph ?? value);
      return Number.isFinite(limit)
        ? { drivingSetSpeedLimitAction: { limitMph: limit } }
        : null;
    }
    case "speed_limit_activate":
      return {
        drivingSpeedLimitAction: {
          activate: true,
          pin: String(obj.pin ?? value ?? ""),
        },
      };
    case "speed_limit_deactivate":
      return {
        drivingSpeedLimitAction: {
          activate: false,
          pin: String(obj.pin ?? value ?? ""),
        },
      };
    case "speed_limit_clear_pin":
      return {
        drivingClearSpeedLimitPinAction: {
          pin: String(obj.pin ?? value ?? ""),
        },
      };
    case "set_scheduled_charging": {
      const enabled = obj.enabled !== false;
      const chargingTime = Number(obj.charging_time ?? obj.time ?? value ?? 0);
      return {
        scheduledChargingAction: {
          enabled,
          chargingTime: Number.isFinite(chargingTime) ? chargingTime : 0,
        },
      };
    }
    case "set_scheduled_departure": {
      const enabled = obj.enabled !== false;
      const departureTime = Number(
        obj.departure_time ?? obj.time ?? value ?? 0,
      );
      return {
        scheduledDepartureAction: {
          enabled,
          departureTime: Number.isFinite(departureTime) ? departureTime : 0,
        },
      };
    }
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
