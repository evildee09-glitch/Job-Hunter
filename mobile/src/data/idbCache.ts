/** Small key-value cache on IndexedDB (large quota). Every failure degrades to memory-only. */
const DB_NAME = 'ajh-cache';
const STORE = 'kv';
export interface CacheRecord<T> { value: T; savedAt: number }

const mem = new Map<string, CacheRecord<unknown>>();
let dbp: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (!dbp) {
    dbp = new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.onblocked = () => resolve(null);
    });
  }
  return dbp;
}

export async function cacheGet<T>(key: string): Promise<CacheRecord<T> | null> {
  const m = mem.get(key);
  if (m) return m as CacheRecord<T>;
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const rq = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      rq.onsuccess = () => {
        const v = rq.result as CacheRecord<T> | undefined;
        if (v) mem.set(key, v);
        resolve(v ?? null);
      };
      rq.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function cacheSet<T>(key: string, value: T): Promise<void> {
  const rec: CacheRecord<T> = { value, savedAt: Date.now() };
  mem.set(key, rec);
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(rec, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}
