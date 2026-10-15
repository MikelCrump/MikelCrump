import { describe, expect, it } from "vitest";
import {
  SESSION_TTL_MS,
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
} from "@/lib/site-auth";

const SECRET = "test-secret-not-real";
const EMAIL = "owner@example.com";

describe("password hashing", () => {
  it("verifies the right password and rejects others", async () => {
    const stored = await hashPassword("correct horse battery", undefined, 1000);
    expect(stored.startsWith("pbkdf2:1000:")).toBe(true);
    expect(stored).not.toContain("correct horse battery");
    expect(await verifyPassword("correct horse battery", stored)).toBe(true);
    expect(await verifyPassword("correct horse batterY", stored)).toBe(false);
  });

  it("rejects malformed stored hashes", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "plain:text")).toBe(false);
  });
});

describe("session tokens", () => {
  it("accepts a fresh token for the owner", async () => {
    const token = await createSessionToken(EMAIL, SECRET);
    expect(await verifySessionToken(token, SECRET, EMAIL)).toBe(EMAIL);
  });

  it("rejects a token signed with another secret", async () => {
    const token = await createSessionToken(EMAIL, "other-secret");
    expect(await verifySessionToken(token, SECRET, EMAIL)).toBeNull();
  });

  it("rejects a tampered expiry", async () => {
    const token = await createSessionToken(EMAIL, SECRET);
    const [e, , sig] = token.split(".");
    const forged = `${e}.${Date.now() + 10 * SESSION_TTL_MS}.${sig}`;
    expect(await verifySessionToken(forged, SECRET, EMAIL)).toBeNull();
  });

  it("rejects expired tokens and other emails", async () => {
    const old = await createSessionToken(EMAIL, SECRET, Date.now() - SESSION_TTL_MS - 1000);
    expect(await verifySessionToken(old, SECRET, EMAIL)).toBeNull();
    const other = await createSessionToken("someone@else.com", SECRET);
    expect(await verifySessionToken(other, SECRET, EMAIL)).toBeNull();
  });

  it("fails closed when not configured", async () => {
    const token = await createSessionToken(EMAIL, SECRET);
    expect(await verifySessionToken(token, undefined, EMAIL)).toBeNull();
    expect(await verifySessionToken(token, SECRET, undefined)).toBeNull();
    expect(await verifySessionToken(undefined, SECRET, EMAIL)).toBeNull();
  });
});
