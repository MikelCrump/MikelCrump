const DB_NAME = "crump360-media";
const STORE = "files";
const DB_VERSION = 1;

export type StoredMediaMeta = {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Failed to open media DB"));
  });
}

export function isLocalMediaRef(value?: string | null) {
  return Boolean(value && value.startsWith("idb:"));
}

export function localMediaId(value: string) {
  return value.replace(/^idb:/, "");
}

export async function saveMediaFile(file: File): Promise<StoredMediaMeta> {
  const db = await openDb();
  const id = `media-${crypto.randomUUID()}`;
  const record = {
    id,
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    createdAt: Date.now(),
    blob: file,
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to save media"));
  });

  db.close();
  return {
    id,
    name: record.name,
    type: record.type,
    size: record.size,
    createdAt: record.createdAt,
  };
}

export async function getMediaBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  const result = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => {
      const row = req.result as { blob?: Blob } | undefined;
      resolve(row?.blob ?? null);
    };
    req.onerror = () => reject(req.error ?? new Error("Failed to read media"));
  });
  db.close();
  return result;
}

export async function getMediaMeta(id: string): Promise<StoredMediaMeta | null> {
  const db = await openDb();
  const result = await new Promise<StoredMediaMeta | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => {
      const row = req.result as
        | (StoredMediaMeta & { blob?: Blob })
        | undefined;
      if (!row) {
        resolve(null);
        return;
      }
      resolve({
        id: row.id,
        name: row.name,
        type: row.type,
        size: row.size,
        createdAt: row.createdAt,
      });
    };
    req.onerror = () => reject(req.error ?? new Error("Failed to read media meta"));
  });
  db.close();
  return result;
}

export async function deleteMediaFile(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to delete media"));
  });
  db.close();
}

export function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
