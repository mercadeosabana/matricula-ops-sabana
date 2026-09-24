import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  bogotaNow,
  listAprobaciones,
  pushActividad,
  updateAprobacion,
} from "@/lib/db";
import { isAprobacionDue, type AprobacionCard } from "@/lib/aprobacion";

export const dynamic = "force-dynamic";

function bogotaDate(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Bogota",
  });
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const today = bogotaDate();
  const all = await listAprobaciones();
  const pendientes = all.filter((c) => c.estado !== "aprobada");
  const aprobadas = all.filter((c) => c.estado === "aprobada");

  // Sort: due/pending first, then programados by date
  const sortCards = (a: AprobacionCard, b: AprobacionCard) => {
    const aDue = isAprobacionDue(a, today) ? 0 : 1;
    const bDue = isAprobacionDue(b, today) ? 0 : 1;
    if (aDue !== bDue) return aDue - bDue;
    const as = a.scheduledFor || a.createdAt;
    const bs = b.scheduledFor || b.createdAt;
    return as < bs ? -1 : 1;
  };

  return NextResponse.json({
    ok: true,
    today,
    backendNote: null,
    pendientes: pendientes.sort(sortCards),
    aprobadas: aprobadas.sort(
      (a, b) => (a.approvedAt || "") < (b.approvedAt || "") ? 1 : -1
    ),
  });
}

export async function PATCH(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const id = String(body.id || "").trim();
  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const action = String(body.action || "").trim().toLowerCase();
  const { time, iso } = bogotaNow();

  if (action === "aprobar") {
    const preview =
      typeof body.preview === "string" ? body.preview : undefined;
    const updated = await updateAprobacion(id, {
      estado: "aprobada",
      approvedAt: iso,
      ...(preview !== undefined ? { preview } : {}),
    });
    if (!updated) {
      return NextResponse.json({ error: "Card no encontrada" }, { status: 404 });
    }
    await pushActividad({
      time,
      actor: session.displayName,
      text: `Aprobó (demo, sin envío real): ${updated.etiqueta || "card"} · ${updated.nombre}`,
      kind: "human",
      createdAt: iso,
    });
    return NextResponse.json({ ok: true, card: updated });
  }

  if (action === "editar") {
    const preview = String(body.preview || "").trim();
    if (!preview) {
      return NextResponse.json(
        { error: "preview requerido" },
        { status: 400 }
      );
    }
    const updated = await updateAprobacion(id, { preview });
    if (!updated) {
      return NextResponse.json({ error: "Card no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, card: updated });
  }

  return NextResponse.json(
    { error: "action debe ser aprobar o editar" },
    { status: 400 }
  );
}
