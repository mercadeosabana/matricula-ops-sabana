import { NextResponse } from "next/server";
import { getSessionRol } from "@/lib/auth";
import { getConnectionStatus } from "@/lib/connections";
import { outlookSetupChecklist } from "@/lib/outlook";
import { whatsappSetupChecklist } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET() {
  const rol = await getSessionRol();
  if (!rol) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const status = getConnectionStatus();
  return NextResponse.json({
    ...status,
    setup: {
      outlook: outlookSetupChecklist(),
      whatsapp: whatsappSetupChecklist(),
    },
  });
}
