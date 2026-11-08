// IndexedDB store for files uploaded in demo mode (photos and GLB models can exceed localStorage limits).
const DB = 'menu-ar-files';
const STORE = 'files';
export const BLOB_PREFIX = 'idb:';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putBlob(file: Blob): Promise<string> {
  const id = crypto.randomUUID();
  await tx('readwrite', (s) => s.put(file, id));
  return BLOB_PREFIX + id;
}

const urls = new Map<string, string>();

/** Resolves an idb: reference to an object URL (cached for the page lifetime). */
export async function resolveBlobUrl(ref: string): Promise<string | null> {
  if (urls.has(ref)) return urls.get(ref)!;
  const blob = await tx<Blob | undefined>('readonly', (s) => s.get(ref.slice(BLOB_PREFIX.length)));
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urls.set(ref, url);
  return url;
}
