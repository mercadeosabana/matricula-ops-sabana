import { NextResponse } from "next/server";
import { getSessionRol, actorNameForRol } from "@/lib/auth";
import { bogotaNow, getLead, pushActividad, updateLead } from "@/lib/db";
import { isOrigen, labelOrigen } from "@/lib/origen";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const rol = await getSessionRol();
  if (!rol) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const origen = body.origen as string | undefined;
  if (!origen || !isOrigen(origen)) {
    return NextResponse.json(
      { error: "origen inválido" },
      { status: 400 }
    );
  }
  const before = await getLead(id);
  if (!before) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }
  const lead = await updateLead(id, { origen });
  if (!lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }
  if (before.origen !== origen) {
    const { time, iso } = bogotaNow();
    await pushActividad({
      time,
      actor: actorNameForRol(rol),
      text: `Cambió origen de ${lead.nombre}: ${labelOrigen(before.origen)} → ${labelOrigen(origen)}`,
      kind: "human",
      createdAt: iso,
    });
  }
  return NextResponse.json({ ok: true, lead });
}
