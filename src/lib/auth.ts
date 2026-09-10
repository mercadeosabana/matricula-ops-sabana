import { cookies } from "next/headers";
import type { Rol } from "./types";

export const SESSION_COOKIE = "matricula_ops_rol";

export async function getSessionRol(): Promise<Rol | null> {
  const jar = await cookies();
  const v = jar.get(SESSION_COOKIE)?.value;
  if (v === "mercadeo" || v === "direccion") return v;
  return null;
}

export function rolLabel(rol: Rol) {
  return rol === "direccion" ? "Dirección" : "Mercadeo";
}

export function userIdForRol(rol: Rol) {
  return rol === "direccion" ? "u-direccion" : "u-mercadeo";
}

export function actorNameForRol(rol: Rol) {
  return rol === "direccion" ? "Dirección Facultad" : "Ana Mercadeo";
}
