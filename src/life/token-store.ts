import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/** Prefer a writable dir on Vercel (/var/task is read-only). */
function dataDir() {
  if (process.env.LIFE_DATA_DIR) return process.env.LIFE_DATA_DIR;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(tmpdir(), "life-ops");
  }
  return path.join(process.cwd(), ".data");
}

function fileFor(name: string) {
  return path.join(dataDir(), name);
}

export function readJsonFile<T>(name: string): T | null {
  try {
    const file = fileFor(name);
    if (!existsSync(file)) return null;
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

export function writeJsonFile(name: string, value: unknown) {
  const dir = dataDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(fileFor(name), JSON.stringify(value, null, 2));
}
