import { createCipheriv, createDecipheriv } from "node:crypto";

const API_BASE = "https://cloud.renpho.com";
const ENCRYPTION_KEY = "ed*wijdi$h6fe3ew";
const APP_VERSION = "7.0.0";

type EncryptedEnvelope = { code: number | string; msg?: string; data?: string };

function encryptAes(content: string) {
  const cipher = createCipheriv(
    "aes-128-ecb",
    Buffer.from(ENCRYPTION_KEY, "utf8"),
    null,
  );
  return Buffer.concat([
    cipher.update(Buffer.from(content, "utf8")),
    cipher.final(),
  ]).toString("base64");
}

function encryptEmptyBytes() {
  const cipher = createCipheriv(
    "aes-128-ecb",
    Buffer.from(ENCRYPTION_KEY, "utf8"),
    null,
  );
  return Buffer.concat([cipher.update(Buffer.alloc(0)), cipher.final()]).toString(
    "base64",
  );
}

function decryptAes(encrypted: string) {
  const decipher = createDecipheriv(
    "aes-128-ecb",
    Buffer.from(ENCRYPTION_KEY, "utf8"),
    null,
  );
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function extractId(json: string, key: string) {
  const match = json.match(new RegExp(`"${key}":(\\d+)`));
  return match?.[1] ?? null;
}

function isSuccess(code: number | string | undefined, msg?: string) {
  if (msg?.toLowerCase() === "success") return true;
  return [0, "0", 101, "101", 200, "200", 20000, "20000"].includes(code as never);
}

export interface RenphoRawMeasurement {
  weight?: number;
  bodyfat?: number;
  muscle?: number;
  timeStamp?: number;
  timestamp?: number;
  createTime?: string;
}

export async function fetchRenphoMeasurements(email: string, password: string) {
  const loginPayload = {
    questionnaire: {},
    login: {
      password,
      areaCode: "US",
      appRevision: APP_VERSION,
      cellphoneType: "LifeOps",
      systemType: "11",
      email,
      platform: "android",
    },
    bindingList: {
      deviceTypes: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "0A"],
    },
  };

  const loginRes = await fetch(`${API_BASE}/renpho-aggregation/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ encryptData: encryptAes(JSON.stringify(loginPayload)) }),
  });
  const loginJson = (await loginRes.json()) as EncryptedEnvelope;
  if (!isSuccess(loginJson.code, loginJson.msg) || !loginJson.data) {
    throw new Error(`Renpho login failed: ${loginJson.msg ?? loginJson.code}`);
  }

  const rawLogin = decryptAes(loginJson.data);
  const loginData = JSON.parse(rawLogin) as {
    login?: { token?: string; id?: string | number };
  };
  const token = loginData.login?.token;
  const userId =
    extractId(rawLogin, "id") ??
    (loginData.login?.id != null ? String(loginData.login.id) : null);
  if (!token || !userId) throw new Error("Renpho login missing token/userId");

  const headers = {
    "Content-Type": "application/json",
    token,
    userId,
    appVersion: APP_VERSION,
    platform: "android",
  };

  let deviceJson: EncryptedEnvelope;
  try {
    const deviceRes = await fetch(`${API_BASE}/renpho-aggregation/device/count`, {
      method: "POST",
      headers,
      body: JSON.stringify({ encryptData: encryptEmptyBytes() }),
    });
    deviceJson = (await deviceRes.json()) as EncryptedEnvelope;
  } catch {
    const deviceRes = await fetch(`${API_BASE}/renpho-aggregation/device/count`, {
      method: "POST",
      headers,
      body: JSON.stringify({ encryptData: encryptAes("{}") }),
    });
    deviceJson = (await deviceRes.json()) as EncryptedEnvelope;
  }

  if (!isSuccess(deviceJson.code, deviceJson.msg) || !deviceJson.data) {
    throw new Error(`Renpho device info failed: ${deviceJson.msg ?? deviceJson.code}`);
  }

  const rawDevice = decryptAes(deviceJson.data);
  const deviceData = JSON.parse(rawDevice) as {
    scale?: Array<{ tableName: string; count: number; userIds?: Array<string | number> }>;
  };
  const scales = deviceData.scale ?? [];
  if (!scales.length) throw new Error("Renpho account has no scale tables");

  const measurements: RenphoRawMeasurement[] = [];
  for (const scale of scales.slice(0, 3)) {
    const userIds = (scale.userIds?.map(String) ?? [userId]).filter(Boolean);
    const pageSize = 50;
    const pages = Math.max(1, Math.ceil(Math.min(scale.count || 50, 200) / pageSize));
    for (let pageNum = pages; pageNum >= Math.max(1, pages - 3); pageNum -= 1) {
      const measureRes = await fetch(
        `${API_BASE}/RenphoHealth/scale/queryAllMeasureDataList`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            encryptData: encryptAes(
              JSON.stringify({
                pageNum,
                pageSize,
                userIds,
                tableName: scale.tableName,
              }),
            ),
          }),
        },
      );
      const measureJson = (await measureRes.json()) as EncryptedEnvelope;
      if (!isSuccess(measureJson.code, measureJson.msg) || !measureJson.data) continue;
      const pageData = JSON.parse(decryptAes(measureJson.data)) as unknown;
      const records = Array.isArray(pageData)
        ? pageData
        : Array.isArray((pageData as { list?: unknown[] }).list)
          ? ((pageData as { list: RenphoRawMeasurement[] }).list ?? [])
          : [];
      measurements.push(...(records as RenphoRawMeasurement[]));
    }
  }

  return measurements;
}
