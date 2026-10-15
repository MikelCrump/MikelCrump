/**
 * Set the site login password without it ever leaving this machine in plain text.
 *
 *   pnpm auth:set-password
 *
 * Prompts (hidden) for the password, stores only its PBKDF2 hash as SITE_PASSWORD_HASH
 * in the linked Vercel project's production env, and creates SITE_SESSION_SECRET if it
 * does not exist yet. Redeploy afterwards for the change to take effect.
 */
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { hashPassword } from "../src/lib/site-auth";

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(question);
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (ch: string) => {
      if (ch === "\r" || ch === "\n" || ch === "\u0004") {
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.off("data", onData);
        process.stdout.write("\n");
        resolve(value);
      } else if (ch === "\u0003") {
        process.exit(130);
      } else if (ch === "\u007f" || ch === "\b") {
        value = value.slice(0, -1);
      } else {
        value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

function vercelEnvNames(): Set<string> {
  const out = execFileSync("vercel", ["env", "ls", "production"], { encoding: "utf8" });
  return new Set(
    out
      .split("\n")
      .map((l) => l.trim().split(/\s+/)[0] ?? "")
      .filter((n) => /^[A-Z][A-Z0-9_]+$/.test(n)),
  );
}

function setVercelEnv(name: string, value: string, exists: boolean) {
  if (exists) {
    execFileSync("vercel", ["env", "rm", name, "production", "--yes"], { stdio: "ignore" });
  }
  execFileSync("vercel", ["env", "add", name, "production"], {
    input: value,
    stdio: ["pipe", "ignore", "inherit"],
  });
  console.log(`✓ ${name} saved to Vercel (production)`);
}

async function main() {
  const password = await askHidden("New site password: ");
  if (password.length < 12) {
    console.error("Use at least 12 characters.");
    process.exit(1);
  }
  if ((await askHidden("Repeat password: ")) !== password) {
    console.error("Passwords didn't match.");
    process.exit(1);
  }

  const existing = vercelEnvNames();
  setVercelEnv("SITE_PASSWORD_HASH", await hashPassword(password), existing.has("SITE_PASSWORD_HASH"));
  if (!existing.has("SITE_SESSION_SECRET")) {
    setVercelEnv("SITE_SESSION_SECRET", randomBytes(32).toString("base64url"), false);
  }
  if (!existing.has("SITE_OWNER_EMAIL")) {
    console.warn("! SITE_OWNER_EMAIL is not set; sign-in will fail until it is.");
  }
  console.log("Done. Redeploy (vercel deploy --prod) for it to take effect.");
}

void main();
