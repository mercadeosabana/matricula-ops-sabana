import { NextResponse } from "next/server";
import { getSessionRol } from "@/lib/auth";
import { getConnectionStatus, setOutlookTokens } from "@/lib/connections";

export const dynamic = "force-dynamic";

export async function POST() {
  const rol = await getSessionRol();
  if (!rol) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (rol !== "mercadeo") {
    return NextResponse.json({ error: "Solo Mercadeo" }, { status: 403 });
  }
  setOutlookTokens(null);
  return NextResponse.json({ ok: true, status: getConnectionStatus() });
}
