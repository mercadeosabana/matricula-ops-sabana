import { NextResponse } from "next/server";
import { bogotaNow, pushActividad, createEnvio } from "@/lib/db";
import { getSessionRol, userIdForRol, actorNameForRol } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

const RESULTADOS = ["Agendó visita", "Callback", "No contesta"] as const;

export async function POST(req: Request) {
  const rol = await getSessionRol();
  if (!rol) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const resultado =
    typeof body.resultado === "string" &&
    RESULTADOS.includes(body.resultado as (typeof RESULTADOS)[number])
      ? body.resultado
      : "Callback";

  const dest =
    typeof body.destinatario === "string" && body.destinatario.trim()
      ? body.destinatario.trim()
      : "Warm lead · demo Llamada IA";

  const { time, iso } = bogotaNow();
  const actor = actorNameForRol(rol);
  const userId = userIdForRol(rol);

  await createEnvio({
    id: uuidv4(),
    tareaHoyId: "demo-llamada-ia",
    canal: "telefono",
    destinatario: dest,
    payload: JSON.stringify({
      modo: "demo",
      resultado,
      guion: "90s piloto",
    }),
    estado: "demo",
    enviadoPorUserId: userId,
    createdAt: iso,
  });

  await pushActividad({
    time,
    actor,
    text: `[DEMO] Simuló Llamada IA · ${dest} · resultado: ${resultado}.`,
    kind: "human",
    createdAt: iso,
  });

  if (resultado === "Agendó visita") {
    await pushActividad({
      time,
      actor,
      text: `[DEMO] Lead pasó a visita_agendada tras Llamada IA.`,
      kind: "human",
      createdAt: iso,
    });
  }

  return NextResponse.json({
    ok: true,
    demo: true,
    resultado,
    message: `Llamada simulada (DEMO): ${resultado}`,
  });
}
