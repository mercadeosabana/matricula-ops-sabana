import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** Demo password for seed users — document in CORREO-INSTRUCCIONES.md */
export const DEMO_PASSWORD = "sabana2027";

const DEMO_SALT = "matricula-ops-demo-salt-v1";

export function hashPassword(plain: string, salt?: string): string {
  const s = salt || randomBytes(16).toString("hex");
  const hash = scryptSync(plain, s, 64).toString("hex");
  return `${s}:${hash}`;
}

/** Deterministic hash for seeded demo accounts */
export function hashDemoPassword(): string {
  return hashPassword(DEMO_PASSWORD, DEMO_SALT);
}

export function verifyPassword(plain: string, stored: string): boolean {
  if (!stored || !plain) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const h = scryptSync(plain, salt, 64).toString("hex");
    const a = Buffer.from(hash, "hex");
    const b = Buffer.from(h, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
