import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const rol = body.rol;
  if (rol !== "mercadeo" && rol !== "direccion") {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, rol });
  res.cookies.set(SESSION_COOKIE, rol, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
