import { NextResponse } from "next/server";
import { bogotaNow, pushActividad } from "@/lib/db";
import { getSessionRol, actorNameForRol } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rol = await getSessionRol();
  if (!rol) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const slot =
    typeof body.slot === "string" && body.slot.trim()
      ? body.slot.trim()
      : "sábado [CONFIRMAR]";

  const { time, iso } = bogotaNow();
  const actor = actorNameForRol(rol);

  await pushActividad({
    time,
    actor,
    text: `Marcó cupo visita campus para confirmar · ${slot}.`,
    kind: "human",
    createdAt: iso,
  });

  return NextResponse.json({
    ok: true,
    message: "Cupo marcado — pendiente validar [CONFIRMAR] con Dirección",
  });
}
