import { NextResponse } from "next/server";
import { getSessionRol } from "@/lib/auth";
import { listAgendaEvents } from "@/lib/db";
import { isOutlookCalendarConnected } from "@/lib/connections";

export const dynamic = "force-dynamic";

export async function GET() {
  const rol = await getSessionRol();
  if (!rol) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const events = await listAgendaEvents();
  return NextResponse.json({
    events,
    calendarConnected: isOutlookCalendarConnected(),
  });
}

