import { NextResponse } from "next/server";
import {
  bogotaNow,
  getTarea,
  hasUnresolvedConfirm,
  pushActividad,
  updateLeadEtapa,
  updateTarea,
  createEnvio,
} from "@/lib/db";
import { getSessionRol, userIdForRol, actorNameForRol } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const rol = await getSessionRol();
  if (!rol) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const action = body.action as string;
  const tarea = await getTarea(id);
  if (!tarea) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  const { time, iso } = bogotaNow();
  const actor = actorNameForRol(rol);
  const userId = userIdForRol(rol);

  if (action === "aprobar") {
    const updated = await updateTarea(id, {
      estado: "aprobada",
      aprobadaPorUserId: userId,
    });
    await pushActividad({
      time,
      actor,
      text: `Aprobó tarea #${tarea.orden} · ${tarea.titulo}.`,
      kind: "human",
      createdAt: iso,
    });

    // Secuencia D+3/7/14: al aprobar crea 3 envíos programados (mock)
    if (tarea.tipo === "secuencia_d") {
      for (const offset of [3, 7, 14]) {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        await createEnvio({
          id: uuidv4(),
          tareaHoyId: id,
          canal: tarea.canal,
          destinatario: tarea.dest,
          payload: JSON.stringify({
            programado: `D+${offset}`,
            fecha: d.toISOString().slice(0, 10),
            cuerpo: tarea.cuerpo,
          }),
          estado: "queued",
          enviadoPorUserId: userId,
          createdAt: iso,
        });
      }
      await pushActividad({
        time,
        actor,
        text: `Programó envíos D+3 / D+7 / D+14 para tarea #${tarea.orden}.`,
        kind: "human",
        createdAt: iso,
      });
    }

    return NextResponse.json({ tarea: updated });
  }

  if (action === "editar") {
    const asunto = typeof body.asunto === "string" ? body.asunto : tarea.asunto;
    const cuerpo = typeof body.cuerpo === "string" ? body.cuerpo : tarea.cuerpo;
    const updated = await updateTarea(id, {
      asunto,
      cuerpo,
      estado: "editada",
      aprobadaPorUserId: userId,
    });
    await pushActividad({
      time,
      actor,
      text: `Editó tarea #${tarea.orden} · ${tarea.titulo}.`,
      kind: "human",
      createdAt: iso,
    });
    return NextResponse.json({ tarea: updated });
  }

  if (action === "agendar") {
    const updated = await updateTarea(id, {
      estado: "agendada",
      aprobadaPorUserId: userId,
    });
    await updateLeadEtapa(tarea.dest, "visita_agendada");
    await pushActividad({
      time,
      actor,
      text: `Agendó visita · tarea #${tarea.orden} · ${tarea.dest}.`,
      kind: "human",
      createdAt: iso,
    });
    return NextResponse.json({ tarea: updated });
  }

  if (action === "enviar") {
    const textCheck = `${tarea.asunto}\n${tarea.cuerpo}`;
    if (hasUnresolvedConfirm(textCheck)) {
      return NextResponse.json(
        {
          error:
            "Hay marcas [CONFIRMAR] sin resolver. Edita la tarea antes de enviar.",
          code: "CONFIRMAR",
        },
        { status: 400 }
      );
    }

    // Mock send: email/telefono = sent_mock; WA/Outlook real = still mock in v1
    // Spec: if Outlook not connected → blocked_stub for email; we do mock OK for demo
    // User asked: "mock send only"
    const estadoEnvio =
      tarea.canal === "whatsapp" || tarea.canal === "email"
        ? "sent_mock"
        : "sent_mock";

    await createEnvio({
      id: uuidv4(),
      tareaHoyId: id,
      canal: tarea.canal,
      destinatario: tarea.dest,
      payload: JSON.stringify({ asunto: tarea.asunto, cuerpo: tarea.cuerpo }),
      estado: estadoEnvio,
      enviadoPorUserId: userId,
      createdAt: iso,
    });

    const updated = await updateTarea(id, {
      estado: "enviada",
      enviadaAt: iso,
      aprobadaPorUserId: userId,
    });

    const verb =
      tarea.canal === "telefono"
        ? "Marcó lista para llamada"
        : "Envió (mock)";
    await pushActividad({
      time,
      actor,
      text: `${verb} tarea #${tarea.orden} · ${tarea.titulo}.`,
      kind: "human",
      createdAt: iso,
    });

    return NextResponse.json({
      tarea: updated,
      envio: { estado: estadoEnvio },
      message:
        tarea.canal === "telefono"
          ? "Llamada marcada como lista"
          : "Envío registrado (mock)",
    });
  }

  return NextResponse.json({ error: "Acción no soportada" }, { status: 400 });
}
