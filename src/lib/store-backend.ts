/**
 * Durable JSON store backend.
 * - Local (non-VERCEL): data/store.json via fs
 * - Vercel + BLOB_READ_WRITE_TOKEN: @vercel/blob pathname matricula-ops/store.json
 * - Vercel without token: /tmp fallback (ephemeral — set the token in production)
 */
import fs from "fs";
import path from "path";
import {
  put,
  get,
  head,
  BlobPreconditionFailedError,
} from "@vercel/blob";

export const BLOB_STORE_PATHNAME = "matricula-ops/store.json";

const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_STORE_PATH = path.join(LOCAL_DATA_DIR, "store.json");
const TMP_DATA_DIR = path.join("/tmp", "matricula-ops-data");
const TMP_STORE_PATH = path.join(TMP_DATA_DIR, "store.json");

export type StoreBackendKind = "fs-local" | "fs-tmp" | "blob";

function blobAccess(): "public" | "private" {
  return process.env.BLOB_ACCESS === "public" ? "public" : "private";
}

export function resolveBackend(): StoreBackendKind {
  if (!process.env.VERCEL) return "fs-local";
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return "fs-tmp";
}

export function storePathForFs(kind: "fs-local" | "fs-tmp"): string {
  return kind === "fs-local" ? LOCAL_STORE_PATH : TMP_STORE_PATH;
}

function ensureFsDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export type LoadedRaw = {
  json: string | null;
  /** ETag for Blob optimistic concurrency; null for fs */
  etag: string | null;
  backend: StoreBackendKind;
};

/** Read raw JSON text from the active backend. */
export async function readStoreRaw(): Promise<LoadedRaw> {
  const backend = resolveBackend();

  if (backend === "blob") {
    try {
      const result = await get(BLOB_STORE_PATHNAME, {
        access: blobAccess(),
        useCache: false,
      });
      if (!result || result.statusCode !== 200 || !result.stream) {
        // Try head in case get returned null (missing)
        return { json: null, etag: null, backend };
      }
      const text = await new Response(result.stream).text();
      return {
        json: text || null,
        etag: result.blob.etag || null,
        backend,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Missing blob → empty store
      if (/not found|404|BlobNotFound/i.test(msg)) {
        return { json: null, etag: null, backend };
      }
      console.error("[store-backend] blob read failed:", msg);
      throw err;
    }
  }

  const filePath = storePathForFs(backend);
  ensureFsDir(filePath);
  if (!fs.existsSync(filePath)) {
    return { json: null, etag: null, backend };
  }
  try {
    const json = fs.readFileSync(filePath, "utf8");
    return { json, etag: null, backend };
  } catch {
    return { json: null, etag: null, backend };
  }
}

/**
 * Persist JSON. For Blob, uses ifMatch when etag is provided (optimistic concurrency).
 * Retries once on precondition failure by re-reading is the caller's job — this throws.
 */
export async function writeStoreRaw(
  json: string,
  etag: string | null
): Promise<{ etag: string | null; backend: StoreBackendKind }> {
  const backend = resolveBackend();

  if (backend === "blob") {
    const opts: Parameters<typeof put>[2] = {
      access: blobAccess(),
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    };
    if (etag) {
      opts.ifMatch = etag;
    }
    try {
      const result = await put(BLOB_STORE_PATHNAME, json, opts);
      // put may not return etag on all versions — refresh via head
      let nextEtag: string | null = (result as { etag?: string }).etag ?? null;
      if (!nextEtag) {
        try {
          const meta = await head(BLOB_STORE_PATHNAME);
          nextEtag = meta.etag ?? null;
        } catch {
          nextEtag = null;
        }
      }
      return { etag: nextEtag, backend };
    } catch (err) {
      if (err instanceof BlobPreconditionFailedError) {
        throw err;
      }
      console.error(
        "[store-backend] blob write failed:",
        err instanceof Error ? err.message : err
      );
      throw err;
    }
  }

  const filePath = storePathForFs(backend);
  ensureFsDir(filePath);
  fs.writeFileSync(filePath, json, "utf8");
  return { etag: null, backend };
}

/** Delete store file (fs only). Blob: overwrite with empty is handled by reset caller. */
export async function deleteStoreRaw(): Promise<void> {
  const backend = resolveBackend();
  if (backend === "blob") {
    // Leave deletion to put of fresh seed; optional del would need import
    return;
  }
  const filePath = storePathForFs(backend);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export { BlobPreconditionFailedError };
