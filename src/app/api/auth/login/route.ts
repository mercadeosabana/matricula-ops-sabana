import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_USER_COOKIE,
  authenticateEmailPassword,
  sessionCookieOptions,
  PERSONAS,
} from "@/lib/auth";
import { findUserById } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Quick demo: { demoUserId } or { rol } without password
  const demoUserId = body.demoUserId ? String(body.demoUserId) : "";
  if (demoUserId && !body.password) {
    const user = await findUserById(demoUserId);
    if (!user || !user.activo) {
      return NextResponse.json(
        { error: "Cuenta no disponible" },
        { status: 403 }
      );
    }
    const res = NextResponse.json({
      ok: true,
      rol: user.rol,
      userId: user.id,
      demoRapido: true,
    });
    const opts = sessionCookieOptions();
    res.cookies.set(SESSION_COOKIE, user.rol, opts);
    res.cookies.set(SESSION_USER_COOKIE, user.id, opts);
    return res;
  }

  if (
    (body.rol === "mercadeo" || body.rol === "direccion") &&
    !body.email &&
    !body.password
  ) {
    const uid = PERSONAS[body.rol as "mercadeo" | "direccion"].id;
    const user = await findUserById(uid);
    if (user && !user.activo) {
      return NextResponse.json(
        { error: "Cuenta desactivada" },
        { status: 403 }
      );
    }
    const res = NextResponse.json({
      ok: true,
      rol: body.rol,
      userId: uid,
      demoRapido: true,
    });
    const opts = sessionCookieOptions();
    res.cookies.set(SESSION_COOKIE, body.rol, opts);
    res.cookies.set(SESSION_USER_COOKIE, uid, opts);
    return res;
  }

  const email = String(body.email || "");
  const password = String(body.password || "");
  const result = await authenticateEmailPassword(email, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  const res = NextResponse.json({
    ok: true,
    rol: result.user.rol,
    user: result.user,
  });
  const opts = sessionCookieOptions();
  res.cookies.set(SESSION_COOKIE, result.user.rol, opts);
  res.cookies.set(SESSION_USER_COOKIE, result.user.id, opts);
  return res;
}
