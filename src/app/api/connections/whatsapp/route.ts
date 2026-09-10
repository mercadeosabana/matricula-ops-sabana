import { NextResponse } from "next/server";
import { getSessionRol } from "@/lib/auth";
import {
  getConnectionStatus,
  setWhatsAppConnection,
} from "@/lib/connections";
import { saveWhatsAppFromUi } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rol = await getSessionRol();
  if (!rol) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (rol !== "mercadeo") {
    return NextResponse.json({ error: "Solo Mercadeo" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const phoneNumberId =
    typeof body.phoneNumberId === "string" ? body.phoneNumberId.trim() : "";
  const businessAccountId =
    typeof body.businessAccountId === "string"
      ? body.businessAccountId.trim()
      : "";

  if (!token || !phoneNumberId) {
    return NextResponse.json(
      {
        error:
          "Se requieren token y Phone Number ID de WhatsApp Business Cloud API",
      },
      { status: 400 }
    );
  }

  saveWhatsAppFromUi({ token, phoneNumberId, businessAccountId });
  return NextResponse.json({ ok: true, status: getConnectionStatus() });
}

export async function DELETE() {
  const rol = await getSessionRol();
  if (!rol) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (rol !== "mercadeo") {
    return NextResponse.json({ error: "Solo Mercadeo" }, { status: 403 });
  }
  setWhatsAppConnection(null);
  return NextResponse.json({ ok: true, status: getConnectionStatus() });
}
