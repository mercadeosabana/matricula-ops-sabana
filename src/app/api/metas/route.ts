import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  bogotaNow,
  getMetasCohorte,
  pushActividad,
  totalesMetas,
  updateMetasCohorte,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const metas = await getMetasCohorte();
  const totales = totalesMetas(metas);
  return NextResponse.json({
    metas,
    totales,
    canEdit: session.rol === "direccion",
  });
}

export async function PUT(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (session.rol !== "direccion") {
    return NextResponse.json(
      { error: "Solo Dirección puede editar las metas (Lucía / Ivan)." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const programas = Array.isArray(body.programas) ? body.programas : null;
  if (!programas || programas.length === 0) {
    return NextResponse.json(
      { error: "Envía las 4 metas por programa" },
      { status: 400 }
    );
  }

  for (const pr of programas) {
    if (pr.metaInscritos === undefined || pr.metaInscritos === null || pr.metaInscritos === "") {
      return NextResponse.json(
        { error: `metaInscritos es obligatoria (${pr.programa || "programa"})` },
        { status: 400 }
      );
    }
  }

  const metas = await updateMetasCohorte(
    {
      programas,
      fechaCierreCohorte: body.fechaCierreCohorte
        ? String(body.fechaCierreCohorte)
        : undefined,
      cohorte: body.cohorte ? String(body.cohorte) : undefined,
    },
    { id: session.id, displayName: session.displayName }
  );

  const { time, iso } = bogotaNow();
  const tot = totalesMetas(metas);
  await pushActividad({
    time,
    actor: session.displayName,
    text: `Actualizó metas cohorte ${metas.cohorte}: ${tot.metaInscritosTotal} inscritos · $${Math.round(tot.metaIngresosCop / 1_000_000)}M · equilibrio ${tot.puntoEquilibrioCupos} cupos (suma de 4 programas).`,
    kind: "human",
    createdAt: iso,
  });

  return NextResponse.json({
    ok: true,
    metas,
    totales: tot,
  });
}
