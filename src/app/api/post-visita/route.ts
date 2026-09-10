import { NextResponse } from "next/server";
import { getSessionRol, actorNameForRol } from "@/lib/auth";
import { bogotaNow, pushActividad, updatePostVisita } from "@/lib/db";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const rol = await getSessionRol();
  if (!rol) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const leadId = body.leadId as string;
  const checklist = body.checklist as NonNullable<Lead["postVisita"]>;
  if (!leadId || !checklist) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const lead = await updatePostVisita(leadId, checklist);
  if (!lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }
  const { time, iso } = bogotaNow();
  await pushActividad({
    time,
    actor: actorNameForRol(rol),
    text: `Actualizó checklist post-visita · ${lead.nombre}`,
    kind: "human",
    createdAt: iso,
  });
  return NextResponse.json({ ok: true, lead });
}
