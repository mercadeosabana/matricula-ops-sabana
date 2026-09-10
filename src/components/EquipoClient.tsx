"use client";

import { useMemo, useState } from "react";
import { toast } from "./Toast";

type UserRow = {
  id: string;
  nombre: string;
  displayName: string;
  email: string;
  rol: "mercadeo" | "direccion";
  activo: boolean;
  createdAt: string;
};

export function EquipoClient({
  initialUsers,
  selfId,
}: {
  initialUsers: UserRow[];
  selfId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [busy, setBusy] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<"mercadeo" | "direccion">("mercadeo");
  const [tempPassword, setTempPassword] = useState("sabana2027");
  const [passModal, setPassModal] = useState<UserRow | null>(null);
  const [passToId, setPassToId] = useState("");

  const activos = useMemo(() => users.filter((u) => u.activo).length, [users]);
  const mercadeoActivos = useMemo(
    () => users.filter((u) => u.activo && u.rol === "mercadeo"),
    [users]
  );

  async function refresh() {
    const res = await fetch("/api/equipo");
    const data = await res.json();
    if (res.ok) setUsers(data.users);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/equipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          nombre,
          email,
          rol,
          tempPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "No se pudo invitar", "err");
        return;
      }
      toast(`Invitada/o ${data.user.displayName}`, "ok");
      setNombre("");
      setEmail("");
      setTempPassword("sabana2027");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  function askDeactivate(u: UserRow) {
    if (!u.activo) {
      void toggleActive(u);
      return;
    }
    // Recommend pass-pending when replacing mercadeo
    if (u.rol === "mercadeo") {
      const candidates = mercadeoActivos.filter((x) => x.id !== u.id);
      setPassToId(candidates[0]?.id || "");
      setPassModal(u);
      return;
    }
    void toggleActive(u);
  }

  async function confirmDeactivate(withPass: boolean) {
    if (!passModal) return;
    setBusy(true);
    try {
      const res = await fetch("/api/equipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deactivate",
          id: passModal.id,
          passToUserId: withPass && passToId ? passToId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error", "err");
        return;
      }
      toast(
        withPass && passToId
          ? "Desactivada · pendientes pasados"
          : "Desactivada · historial intacto (equipo ve toda la org)",
        "ok"
      );
      setPassModal(null);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(u: UserRow) {
    setBusy(true);
    try {
      const res = await fetch("/api/equipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: u.activo ? "deactivate" : "reactivate",
          id: u.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error", "err");
        return;
      }
      toast(
        u.activo
          ? "Cuenta desactivada · el historial se conserva"
          : "Cuenta reactivada",
        "ok"
      );
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(u: UserRow) {
    const pwd = window.prompt(
      `Nueva contraseña temporal para ${u.displayName}`,
      "sabana2027"
    );
    if (!pwd) return;
    setBusy(true);
    try {
      const res = await fetch("/api/equipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          id: u.id,
          tempPassword: pwd,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error", "err");
        return;
      }
      toast("Contraseña temporal actualizada", "ok");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold">Equipo</h1>
          <p className="mt-1 text-sm text-navy/65">
            Lucía e Ivan (Dirección) administran accesos · puedes tener varias
            personas de Mercadeo en paralelo
          </p>
        </div>
        <span className="rounded-full border border-border bg-cream-card px-3 py-1 text-xs font-medium">
          {activos} activas · {users.length} en total
        </span>
      </div>

      <div className="mb-4 rounded-[10px] border border-border bg-[#eef2f8] px-4 py-3 text-sm leading-relaxed">
        <strong>Regla:</strong> desactivar revoca el acceso,{" "}
        <em>no borra</em> historial. Opcional:{" "}
        <strong>Pasar pendientes a…</strong> al reemplazar Mercadeo. Si no, la
        persona nueva igual ve toda la data de la facultad.
      </div>

      <section className="mb-5 rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">Invitar / agregar persona</h2>
        <form onSubmit={createUser} className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-navy/55">
              Nombre
            </label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-navy/55">
              Correo
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              placeholder="nombre@unisabana.edu.co"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-navy/55">
              Rol
            </label>
            <select
              value={rol}
              onChange={(e) =>
                setRol(e.target.value === "direccion" ? "direccion" : "mercadeo")
              }
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="mercadeo">Mercadeo</option>
              <option value="direccion">Dirección / admin</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-navy/55">
              Contraseña temporal
            </label>
            <input
              required
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              minLength={6}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white disabled:opacity-50"
            >
              Agregar al equipo
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">Personas</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-navy/50">
                <th className="py-2 pr-2">Nombre</th>
                <th className="py-2 pr-2">Correo</th>
                <th className="py-2 pr-2">Rol</th>
                <th className="py-2 pr-2">Estado</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/70">
                  <td className="py-2.5 pr-2 font-medium">
                    {u.displayName}
                    {u.id === selfId ? (
                      <span className="ml-1 text-[10px] text-navy/45">(tú)</span>
                    ) : null}
                  </td>
                  <td className="py-2.5 pr-2 text-navy/70">{u.email}</td>
                  <td className="py-2.5 pr-2">
                    {u.rol === "direccion" ? "Dirección" : "Mercadeo"}
                  </td>
                  <td className="py-2.5 pr-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        u.activo
                          ? "border-ok/30 bg-[#e8f5ee] text-ok"
                          : "border-border bg-cream text-navy/55"
                      }`}
                    >
                      {u.activo ? "Activa" : "Desactivada"}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy || (u.id === selfId && u.activo)}
                        onClick={() => askDeactivate(u)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium disabled:opacity-40"
                      >
                        {u.activo ? "Desactivar" : "Reactivar"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => resetPassword(u)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium disabled:opacity-40"
                      >
                        Reset clave
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {passModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
          <div className="w-full max-w-md rounded-[12px] border border-border bg-cream-card p-5 shadow-lg">
            <h3 className="m-0 text-lg font-semibold">
              Desactivar {passModal.displayName}
            </h3>
            <p className="mt-2 text-sm text-navy/70">
              Recomendado al reemplazar:{" "}
              <strong>Pasar pendientes a…</strong> otra persona de Mercadeo. El
              historial sigue firmado con el actor original.
            </p>
            {mercadeoActivos.filter((x) => x.id !== passModal.id).length > 0 ? (
              <label className="mt-3 block text-sm">
                <span className="mb-1 block text-xs font-semibold uppercase text-navy/55">
                  Pasar pendientes a
                </span>
                <select
                  value={passToId}
                  onChange={(e) => setPassToId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  {mercadeoActivos
                    .filter((x) => x.id !== passModal.id)
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.displayName}
                      </option>
                    ))}
                </select>
              </label>
            ) : (
              <p className="mt-3 rounded-lg border border-gold/40 bg-[#f8f1de] px-3 py-2 text-xs text-warn">
                No hay otra Mercadeo activa. Puedes desactivar igual: la data de
                la org sigue visible cuando invites a alguien nuevo.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => confirmDeactivate(true)}
                className="min-h-11 rounded-lg bg-navy px-3 text-sm font-medium text-white disabled:opacity-50"
              >
                Desactivar y pasar pendientes
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => confirmDeactivate(false)}
                className="min-h-11 rounded-lg border border-border px-3 text-sm disabled:opacity-50"
              >
                Solo desactivar
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setPassModal(null)}
                className="min-h-11 rounded-lg px-3 text-sm text-navy/60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
