import { NextResponse } from "next/server";
import {
  bogotaNow,
  getTarea,
  hasUnresolvedConfirm,
  pushActividad,
  updateLeadEtapa,
  updateTarea,
  createEnvio,
  createAgendaEvent,
  findLeadEmailForDest,
} from "@/lib/db";
import { getSessionUser, getSessionRol, userIdForRol, actorNameForRol } from "@/lib/auth";
import {
  getConnectionStatus,
  isOutlookCalendarConnected,
  isOutlookConnected,
  isWhatsAppConnected,
} from "@/lib/connections";
import {
  createOutlookCalendarEvent,
  defaultCampusVisitWindow,
  sendViaOutlook,
} from "@/lib/outlook";
import { sendViaWhatsApp } from "@/lib/whatsapp";
import { v4 as uuidv4 } from "uuid";
import type { EstadoEnvio } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const session = await getSessionUser();
  const rol = session?.rol ?? (await getSessionRol());
  if (!rol || !session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const action = body.action as string;
  const tarea = await getTarea(id);
  if (!tarea) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  const { time, iso } = bogotaNow();
  const actor = session.displayName || actorNameForRol(rol);
  const userId = session.id || userIdForRol(rol);

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
    const demoAgendar = body.demo === true || body.demo === "1";
    const calConnected = isOutlookCalendarConnected();
    const window = defaultCampusVisitWindow();
    const lead = await findLeadEmailForDest(tarea.dest);
    const subject =
      tarea.asunto?.trim() ||
      `Visita campus Chía · ${tarea.titulo}`.slice(0, 200);

    if (!calConnected && !demoAgendar) {
      return NextResponse.json(
        {
          error:
            "Conecta Agenda Outlook (Calendars.ReadWrite) o usa modo DEMO",
          code: "CALENDAR_NOT_CONNECTED",
        },
        { status: 400 }
      );
    }

    let mode: "graph" | "demo" | "queued" = "demo";
    let graphEventId: string | null = null;
    let webLink: string | null = null;
    let message = "DEMO: bloqueado en agenda";

    if (calConnected && !demoAgendar) {
      const result = await createOutlookCalendarEvent({
        subject,
        body: tarea.cuerpo,
        startIso: window.startIso,
        endIso: window.endIso,
        location: "Campus Unisabana · Chía",
        attendeeEmail: lead.email,
        attendeeName: lead.nombre,
      });
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error, code: result.code },
          { status: 400 }
        );
      }
      mode = result.mode;
      graphEventId = result.eventId;
      webLink = result.webLink || null;
      message =
        result.mode === "graph"
          ? `Evento creado en Outlook · ${window.label}`
          : result.mode === "queued"
            ? `Evento encolado · ${window.label}`
            : `DEMO: bloqueado en agenda · ${window.label}`;
    } else {
      mode = "demo";
      graphEventId = `demo-${Date.now()}`;
      message = `DEMO: bloqueado en agenda · ${window.label}`;
    }

    await createAgendaEvent({
      subject,
      startIso: window.startIso,
      endIso: window.endIso,
      location: "Campus Unisabana · Chía",
      attendeeEmail: lead.email,
      attendeeName: lead.nombre,
      tareaHoyId: id,
      mode,
      graphEventId,
      webLink,
      createdAt: iso,
      createdBy: actor,
    });

    const updated = await updateTarea(id, {
      estado: "agendada",
      aprobadaPorUserId: userId,
    });
    await updateLeadEtapa(tarea.dest, "visita_agendada");

    const actText =
      mode === "demo"
        ? `DEMO: bloqueado en agenda · tarea #${tarea.orden} · ${tarea.dest} · ${window.label}.`
        : mode === "graph"
          ? `Creó evento Outlook · tarea #${tarea.orden} · ${window.label} · ${tarea.dest}.`
          : `Encoló evento de agenda · tarea #${tarea.orden} · ${window.label}.`;

    await pushActividad({
      time,
      actor,
      text: actText,
      kind: "human",
      createdAt: iso,
    });
    return NextResponse.json({
      tarea: updated,
      agenda: { mode, label: window.label, graphEventId, webLink },
      message,
    });
  }

  if (action === "enviar") {
    const status = getConnectionStatus();
    const demoSend = body.demo === true || body.demo === "1";
    const textCheck = `${tarea.asunto}\n${tarea.cuerpo}`;
    if (!demoSend && hasUnresolvedConfirm(textCheck)) {
      return NextResponse.json(
        {
          error:
            "Hay marcas [CONFIRMAR] sin resolver. Edita la tarea antes de enviar.",
          code: "CONFIRMAR",
        },
        { status: 400 }
      );
    }

    const forceMock = status.forceMockSend || demoSend;
    let estadoEnvio: EstadoEnvio = demoSend ? "demo" : "sent_mock";
    let message = demoSend
      ? "Envío simulado (DEMO) — no salió a Graph/Meta"
      : "Envío registrado (mock)";

    if (tarea.canal === "telefono") {
      estadoEnvio = demoSend ? "demo" : forceMock ? "sent_mock" : "sent";
      message = demoSend
        ? "Llamada simulada (DEMO)"
        : "Llamada marcada como lista";
    } else if (tarea.canal === "linkedin" || tarea.canal === "visita") {
      return NextResponse.json(
        {
          error:
            tarea.canal === "linkedin"
              ? "LinkedIn solo tiene borradores — copia/pega tras aprobar"
              : "Usa Agendar visita para cupos de campus",
          code: "NO_SEND",
        },
        { status: 400 }
      );
    } else if (tarea.canal === "region") {
      // Carta a secretaría: demo or mock path (email-like, no Graph required in demo)
      if (demoSend || forceMock) {
        estadoEnvio = demoSend ? "demo" : "sent_mock";
        message = demoSend
          ? "[DEMO] Carta a Secretaría simulada — no enviada"
          : "Carta Región registrada (mock)";
      } else if (!isOutlookConnected()) {
        return NextResponse.json(
          {
            error: "Conecta Outlook o usa Simular envío (demo)",
            code: "OUTLOOK_NOT_CONNECTED",
          },
          { status: 400 }
        );
      } else {
        const result = await sendViaOutlook({
          to: tarea.dest,
          subject: tarea.asunto || tarea.titulo,
          body: tarea.cuerpo,
        });
        if (!result.ok) {
          return NextResponse.json(
            { error: result.error, code: result.code },
            { status: 400 }
          );
        }
        estadoEnvio =
          result.mode === "graph"
            ? "sent"
            : result.mode === "queued"
              ? "queued"
              : "sent_mock";
        message =
          result.mode === "graph"
            ? "Carta Región enviada vía Outlook"
            : result.mode === "queued"
              ? "Carta Región encolada"
              : "Carta Región (mock)";
      }
    } else if (tarea.canal === "email" || tarea.canal === "email_wa") {
      if (!forceMock && !isOutlookConnected()) {
        return NextResponse.json(
          {
            error: "Conecta Outlook primero",
            code: "OUTLOOK_NOT_CONNECTED",
          },
          { status: 400 }
        );
      }
      const result = await sendViaOutlook({
        to: tarea.dest,
        subject: tarea.asunto || tarea.titulo,
        body: tarea.cuerpo,
      });
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error, code: result.code },
          { status: 400 }
        );
      }
      if (result.mode === "graph") {
        estadoEnvio = "sent";
        message = "Email enviado vía Outlook (Microsoft Graph)";
      } else if (result.mode === "queued") {
        estadoEnvio = "queued";
        message = "Email encolado para envío (sin destinatario real o cola)";
      } else {
        estadoEnvio = "sent_mock";
        message = demoSend
          ? "Envío simulado (DEMO) — no salió a Graph"
          : "Envío registrado (mock · FORCE_MOCK_SEND=1)";
      }
    } else if (tarea.canal === "whatsapp") {
      if (!forceMock && !isWhatsAppConnected()) {
        return NextResponse.json(
          {
            error: "Conecta WhatsApp primero",
            code: "WHATSAPP_NOT_CONNECTED",
          },
          { status: 400 }
        );
      }
      const result = await sendViaWhatsApp({
        to: tarea.dest,
        body: tarea.cuerpo,
      });
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error, code: result.code },
          { status: 400 }
        );
      }
      if (result.mode === "cloud") {
        estadoEnvio = "sent";
        message = "WhatsApp enviado vía Cloud API";
      } else if (result.mode === "queued") {
        estadoEnvio = "queued";
        message = "WhatsApp encolado para envío";
      } else {
        estadoEnvio = "sent_mock";
        message = demoSend
          ? "Envío simulado (DEMO) — no salió a Meta"
          : "Envío registrado (mock · FORCE_MOCK_SEND=1)";
      }
    }

    await createEnvio({
      id: uuidv4(),
      tareaHoyId: id,
      canal: tarea.canal,
      destinatario: tarea.dest,
      payload: JSON.stringify({
        asunto: tarea.asunto,
        cuerpo: tarea.cuerpo,
        mode: estadoEnvio,
      }),
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
        ? demoSend
          ? "[DEMO] Simuló llamada"
          : "Marcó lista para llamada"
        : estadoEnvio === "demo"
          ? "[DEMO] Simuló envío"
          : estadoEnvio === "sent_mock"
            ? "Envió (mock)"
            : estadoEnvio === "queued"
              ? "Encoló envío"
              : "Envió";
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
      message,
    });
  }

  return NextResponse.json({ error: "Acción no soportada" }, { status: 400 });
}
