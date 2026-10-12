import { createCipheriv, createDecipheriv } from "node:crypto";
import { describe, expect, it } from "vitest";

const KEY = "ed*wijdi$h6fe3ew";

function encrypt(content: string) {
  const cipher = createCipheriv("aes-128-ecb", Buffer.from(KEY, "utf8"), null);
  return Buffer.concat([
    cipher.update(Buffer.from(content, "utf8")),
    cipher.final(),
  ]).toString("base64");
}

function decrypt(encrypted: string) {
  const decipher = createDecipheriv("aes-128-ecb", Buffer.from(KEY, "utf8"), null);
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

describe("renpho aes transport", () => {
  it("round-trips JSON payloads with AES-128-ECB", () => {
    const payload = JSON.stringify({ login: { email: "a@b.c", password: "x" } });
    expect(decrypt(encrypt(payload))).toBe(payload);
  });
});
