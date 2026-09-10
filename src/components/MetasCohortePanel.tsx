"use client";

import { useMemo, useState } from "react";
import type { MetasCohorte } from "@/lib/types";
import { toast } from "./Toast";

type Totales = {
  metaInscritosTotal: number;
  metaIngresosCop: number;
  puntoEquilibrioCupos: number;
};

function formatM(cop: number) {
  if (!cop) return "—";
  return `$${(cop / 1_000_000).toFixed(cop >= 10_000_000 ? 0 : 1)}M`;
}

function formatUpdated(iso: string | null) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-CO", {
      timeZone: "America/Bogota",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function MetasCohortePanel({
  initialMetas,
  initialTotales,
  canEdit,
  variant = "full",
}: {
  initialMetas: MetasCohorte;
  initialTotales: Totales;
  canEdit: boolean;
  variant?: "full" | "compact";
}) {
  const [metas, setMetas] = useState(initialMetas);
  const [totales, setTotales] = useState(initialTotales);
  const [draft, setDraft] = useState(initialMetas);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  const liveTotales = useMemo(() => {
    const src = editing ? draft : metas;
    return {
      metaInscritosTotal: src.programas.reduce(
        (s, p) => s + (Number(p.metaInscritos) || 0),
        0
      ),
      metaIngresosCop: src.programas.reduce(
        (s, p) => s + (Number(p.metaIngresosCop) || 0),
        0
      ),
      puntoEquilibrioCupos: src.programas.reduce(
        (s, p) => s + (Number(p.cuposEquilibrio) || 0),
        0
      ),
    };
  }, [editing, draft, metas]);

  function startEdit() {
    setDraft({
      ...metas,
      programas: metas.programas.map((p) => ({ ...p })),
    });
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(metas);
    setEditing(false);
  }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch("/api/metas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cohorte: draft.cohorte,
          fechaCierreCohorte: draft.fechaCierreCohorte,
          programas: draft.programas.map((p) => ({
            programa: p.programa,
            metaInscritos: Number(p.metaInscritos) || 0,
            metaIngresosCop:
              p.metaIngresosCop === null || p.metaIngresosCop === undefined
                ? null
                : Number(p.metaIngresosCop) || 0,
            cuposEquilibrio:
              p.cuposEquilibrio === null || p.cuposEquilibrio === undefined
                ? null
                : Number(p.cuposEquilibrio) || 0,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "No se pudo guardar", "err");
        return;
      }
      setMetas(data.metas);
      setTotales(data.totales);
      setDraft(data.metas);
      setEditing(false);
      toast("Metas de la cohorte guardadas", "ok");
    } finally {
      setBusy(false);
    }
  }

  function patchPrograma(
    idx: number,
    field: "metaInscritos" | "metaIngresosCop" | "cuposEquilibrio",
    value: string
  ) {
    setDraft((prev) => {
      const programas = prev.programas.map((p, i) => {
        if (i !== idx) return p;
        if (value === "") {
          if (field === "metaInscritos") return { ...p, metaInscritos: 0 };
          return { ...p, [field]: null };
        }
        const n = Math.max(0, Math.round(Number(value) || 0));
        return { ...p, [field]: n };
      });
      return { ...prev, programas };
    });
  }

  const shown = editing ? draft : metas;
  const tot = editing
    ? liveTotales
    : {
        metaInscritosTotal: totales.metaInscritosTotal,
        metaIngresosCop: totales.metaIngresosCop,
        puntoEquilibrioCupos: totales.puntoEquilibrioCupos,
      };
  const updatedLabel = formatUpdated(metas.updatedAt);

  return (
    <section
      className={`rounded-[10px] border border-border bg-cream-card ${
        variant === "compact" ? "p-3" : "p-4"
      } mb-4`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="m-0 text-base font-semibold">
            Metas de la cohorte · {shown.cohorte}
          </h2>
          <p className="mt-1 text-xs text-navy/55">
            {canEdit
              ? "Las define Dirección (Lucía / Ivan). Portfolio = suma de las 4 maestrías."
              : "Solo lectura · definidas por Dirección. Las 4 maestrías."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && !editing && (
            <button
              type="button"
              onClick={startEdit}
              className="min-h-11 rounded-lg bg-navy px-3 text-sm font-medium text-white hover:bg-navy-mid"
            >
              Editar metas
            </button>
          )}
          {canEdit && editing && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={cancelEdit}
                className="min-h-11 rounded-lg border border-border px-3 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={save}
                className="min-h-11 rounded-lg bg-ok px-3 text-sm font-medium text-white disabled:opacity-50"
              >
                Guardar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-navy/50">
              <th className="py-2 pr-2 font-semibold">Programa</th>
              <th className="py-2 pr-2 font-semibold">Meta inscritos *</th>
              <th className="py-2 pr-2 font-semibold">Meta ingresos (opc.)</th>
              <th className="py-2 font-semibold">Cupos equilibrio (opc.)</th>
            </tr>
          </thead>
          <tbody>
            {shown.programas.map((p, idx) => (
              <tr key={p.programa} className="border-b border-border/70">
                <td className="py-2 pr-2 font-medium align-middle">
                  {p.programa}
                </td>
                <td className="py-2 pr-2 align-middle">
                  {editing ? (
                    <input
                      type="number"
                      min={0}
                      className="w-24 rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
                      value={p.metaInscritos}
                      onChange={(e) =>
                        patchPrograma(idx, "metaInscritos", e.target.value)
                      }
                    />
                  ) : (
                    <strong>{p.metaInscritos}</strong>
                  )}
                </td>
                <td className="py-2 pr-2 align-middle">
                  {editing ? (
                    <input
                      type="number"
                      min={0}
                      step={1_000_000}
                      placeholder="COP"
                      className="w-36 rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
                      value={p.metaIngresosCop ?? ""}
                      onChange={(e) =>
                        patchPrograma(idx, "metaIngresosCop", e.target.value)
                      }
                    />
                  ) : (
                    formatM(p.metaIngresosCop || 0)
                  )}
                </td>
                <td className="py-2 align-middle">
                  {editing ? (
                    <input
                      type="number"
                      min={0}
                      className="w-24 rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
                      value={p.cuposEquilibrio ?? ""}
                      onChange={(e) =>
                        patchPrograma(idx, "cuposEquilibrio", e.target.value)
                      }
                    />
                  ) : p.cuposEquilibrio != null ? (
                    p.cuposEquilibrio
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            <tr className="bg-[#eef2f8]">
              <td className="py-2 pr-2 font-bold">Portfolio (suma)</td>
              <td className="py-2 pr-2 font-bold">
                {editing ? liveTotales.metaInscritosTotal : tot.metaInscritosTotal}
              </td>
              <td className="py-2 pr-2 font-bold">
                {formatM(
                  editing ? liveTotales.metaIngresosCop : tot.metaIngresosCop
                )}
              </td>
              <td className="py-2 font-bold">
                {editing
                  ? liveTotales.puntoEquilibrioCupos
                  : tot.puntoEquilibrioCupos}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-navy/60">
        <label className="inline-flex items-center gap-2">
          <span className="font-semibold text-navy/50">Cierre cohorte</span>
          {editing ? (
            <input
              type="date"
              className="rounded-lg border border-border bg-white px-2 py-1"
              value={draft.fechaCierreCohorte}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  fechaCierreCohorte: e.target.value,
                }))
              }
            />
          ) : (
            <span>{shown.fechaCierreCohorte}</span>
          )}
        </label>
        {updatedLabel && (
          <span>
            Última actualización: <strong>{updatedLabel} COT</strong>
            {metas.updatedByName ? ` · ${metas.updatedByName}` : ""}
          </span>
        )}
        {!updatedLabel && (
          <span>Aún no editadas · valores demo semilla</span>
        )}
      </div>
    </section>
  );
}
