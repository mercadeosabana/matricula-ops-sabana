import { cookies } from "next/headers";
import type { Rol } from "./types";
import { findUserByEmail, findUserById, publicUser } from "./db";
import { verifyPassword } from "./passwords";

export const SESSION_COOKIE = "matricula_ops_rol";
export const SESSION_USER_COOKIE = "matricula_ops_uid";

export const PERSONAS: Record<
  Rol,
  { id: string; nombre: string; rolLabel: string; cargo?: string }
> = {
  mercadeo: {
    id: "u-mercadeo",
    nombre: "Laura Natalia",
    rolLabel: "Mercadeo",
  },
  direccion: {
    id: "u-direccion",
    nombre: "Laura Lucía",
    rolLabel: "Dirección",
    cargo: "Directora maestrías · Educación",
  },
};

export type SessionUser = {
  id: string;
  email: string;
  nombre: string;
  displayName: string;
  rol: Rol;
  rolLabel: string;
};

export async function getSessionRol(): Promise<Rol | null> {
  const session = await getSessionUser();
  return session?.rol ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const uid = jar.get(SESSION_USER_COOKIE)?.value;
  if (uid) {
    const u = await findUserById(uid);
    if (u && u.activo) {
      return {
        id: u.id,
        email: u.email,
        nombre: u.nombre,
        displayName: u.displayName || u.nombre,
        rol: u.rol,
        rolLabel: u.rol === "direccion" ? "Dirección" : "Mercadeo",
      };
    }
  }
  // Compat: cookie antigua solo con rol
  const v = jar.get(SESSION_COOKIE)?.value;
  if (v === "mercadeo" || v === "direccion") {
    const fallbackId = PERSONAS[v].id;
    const u = await findUserById(fallbackId);
    if (u && u.activo) {
      return {
        id: u.id,
        email: u.email,
        nombre: u.nombre,
        displayName: u.displayName || u.nombre,
        rol: u.rol,
        rolLabel: PERSONAS[v].rolLabel,
      };
    }
    return {
      id: PERSONAS[v].id,
      email: "",
      nombre: PERSONAS[v].nombre,
      displayName: PERSONAS[v].nombre,
      rol: v,
      rolLabel: PERSONAS[v].rolLabel,
    };
  }
  return null;
}

export async function authenticateEmailPassword(
  email: string,
  password: string
): Promise<{ ok: true; user: ReturnType<typeof publicUser> } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return { ok: false, error: "Escribe correo y contraseña" };
  }
  const user = await findUserByEmail(normalized);
  if (!user) {
    return { ok: false, error: "Correo o contraseña incorrectos" };
  }
  if (!user.activo) {
    return { ok: false, error: "Esta cuenta está desactivada. Habla con Dirección." };
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "Correo o contraseña incorrectos" };
  }
  return { ok: true, user: publicUser(user) };
}

export function rolLabel(rol: Rol) {
  return PERSONAS[rol].rolLabel;
}

export function userIdForRol(rol: Rol) {
  return PERSONAS[rol].id;
}

export function actorNameForRol(rol: Rol) {
  return PERSONAS[rol].nombre;
}

export function personaForRol(rol: Rol) {
  return PERSONAS[rol];
}

export function sessionCookieOptions(maxAge = 60 * 60 * 24 * 14) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
