import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  bogotaNow,
  createUser,
  listUsers,
  pushActividad,
  reassignPendingOwnership,
  resetUserPassword,
  setUserActive,
} from "@/lib/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (session.rol !== "direccion") {
    return NextResponse.json({ error: "Solo Dirección" }, { status: 403 });
  }
  const users = await listUsers();
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session || session.rol !== "direccion") {
    return NextResponse.json({ error: "Solo Dirección" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "create");

  if (action === "create") {
    const created = await createUser({
      nombre: String(body.nombre || ""),
      email: String(body.email || ""),
      rol: body.rol === "direccion" ? "direccion" : "mercadeo",
      tempPassword: String(body.tempPassword || ""),
    });
    if ("error" in created) {
      return NextResponse.json({ error: created.error }, { status: 400 });
    }
    const { time, iso } = bogotaNow();
    await pushActividad({
      time,
      actor: session.displayName,
      text: `Invitó a ${created.displayName} (${created.email}) como ${created.rol === "direccion" ? "Dirección" : "Mercadeo"}.`,
      kind: "human",
      createdAt: iso,
    });
    return NextResponse.json({ ok: true, user: created });
  }

  if (action === "deactivate" || action === "reactivate") {
    const id = String(body.id || "");
    const activo = action === "reactivate";
    if (id === session.id && !activo) {
      return NextResponse.json(
        { error: "No puedes desactivarte a ti misma/o" },
        { status: 400 }
      );
    }
    const passToUserId = body.passToUserId
      ? String(body.passToUserId)
      : "";

    const updated = await setUserActive(id, activo);
    if (!updated) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    let reassignNote = "";
    if (!activo && passToUserId) {
      const moved = await reassignPendingOwnership({
        fromUserId: id,
        toUserId: passToUserId,
      });
      if (moved.leadsMoved > 0) {
        reassignNote = ` Pasó ${moved.leadsMoved} pendientes a ${moved.toName}.`;
      } else {
        reassignNote = ` (Sin leads con owner ${moved.fromName || "origen"} para pasar.)`;
      }
    } else if (!activo) {
      reassignNote =
        " Historial intacto; la data de la org sigue visible para el equipo (opción B).";
    }

    const { time, iso } = bogotaNow();
    await pushActividad({
      time,
      actor: session.displayName,
      text: activo
        ? `Reactivó a ${updated.displayName} (${updated.email}).`
        : `Desactivó a ${updated.displayName} (${updated.email}).${reassignNote}`,
      kind: "human",
      createdAt: iso,
    });
    return NextResponse.json({ ok: true, user: updated, reassignNote });
  }

  if (action === "reassign_pending") {
    const fromUserId = String(body.fromUserId || "");
    const toUserId = String(body.toUserId || "");
    if (!fromUserId || !toUserId) {
      return NextResponse.json(
        { error: "Elige origen y destino" },
        { status: 400 }
      );
    }
    const moved = await reassignPendingOwnership({ fromUserId, toUserId });
    const { time, iso } = bogotaNow();
    await pushActividad({
      time,
      actor: session.displayName,
      text: `Pasó pendientes de ${moved.fromName} a ${moved.toName} (${moved.leadsMoved} leads). El historial conserva el actor original.`,
      kind: "human",
      createdAt: iso,
    });
    return NextResponse.json({ ok: true, ...moved });
  }

  if (action === "reset_password") {
    const id = String(body.id || "");
    const tempPassword = String(body.tempPassword || "");
    if (!tempPassword || tempPassword.length < 6) {
      return NextResponse.json(
        { error: "Contraseña temporal mínimo 6 caracteres" },
        { status: 400 }
      );
    }
    const updated = await resetUserPassword(id, tempPassword);
    if (!updated) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    const { time, iso } = bogotaNow();
    await pushActividad({
      time,
      actor: session.displayName,
      text: `Restableció contraseña temporal de ${updated.displayName}.`,
      kind: "human",
      createdAt: iso,
    });
    return NextResponse.json({ ok: true, user: updated });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
