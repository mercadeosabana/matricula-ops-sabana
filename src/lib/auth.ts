import { cookies } from "next/headers";
import type { Rol } from "./types";

export const SESSION_COOKIE = "matricula_ops_rol";

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
    cargo: "Directora maestrías presenciales · Educación",
  },
};

export async function getSessionRol(): Promise<Rol | null> {
  const jar = await cookies();
  const v = jar.get(SESSION_COOKIE)?.value;
  if (v === "mercadeo" || v === "direccion") return v;
  return null;
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
