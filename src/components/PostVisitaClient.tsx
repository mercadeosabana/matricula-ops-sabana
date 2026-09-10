"use client";

import { useState } from "react";
import type { Colegio, Lead } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";
import { scoreLead } from "@/lib/scoring";
import { toast } from "./Toast";

type Row = { lead: Lead; colegio?: Colegio };

export function PostVisitaClient({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(
    leadId: string,
    field: keyof NonNullable<Lead["postVisita"]>
  ) {
    const row = rows.find((r) => r.lead.id === leadId);
    if (!row?.lead.postVisita) return;
    if (field === "visitaAt" || field === "notas") return;
    const next = {
      ...row.lead.postVisita,
      [field]: !row.lead.postVisita[field],
    };
    setBusy(leadId);
    try {
      const res = await fetch("/api/post-visita", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, checklist: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error", "err");
        return;
      }
      setRows((prev) =>
        prev.map((r) =>
          r.lead.id === leadId
            ? { ...r, lead: { ...r.lead, postVisita: next } }
            : r
        )
      );
      toast("Checklist actualizado", "ok");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="m-0 text-2xl font-bold">Post-visita → matrícula</h1>
        <p className="mt-1 text-sm text-navy/65">
          Checklist tras visita campus: documentos, pago, beca, reminders D+1 /
          D+3
        </p>
      </div>

      <div className="mb-4 rounded-[10px] border border-border bg-[#eef2f8] px-4 py-3 text-sm">
        <strong>Flujo:</strong> visita realizada → carpeta docs → pago
        inscripción → decisión beca → reminders D+1 y D+3 si no avanza. Owner:
        Laura Natalia · Agente Admisiones propone textos.
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-navy/60">No hay leads en post-visita.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map(({ lead, colegio }) => {
            const pv = lead.postVisita!;
            const score = scoreLead(lead);
            return (
              <article
                key={lead.id}
                className="rounded-[10px] border border-border bg-cream-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="m-0 text-lg font-semibold">{lead.nombre}</h2>
                    <p className="m-0 text-sm text-navy/60">
                      {colegio?.nombre} · {lead.programaInteres}
                    </p>
                  </div>
                  <ScoreBadge score={score} />
                </div>
                <p className="mt-2 text-xs text-navy/55">
                  Visita: {pv.visitaAt ? pv.visitaAt.slice(0, 10) : "—"} ·{" "}
                  {pv.notas}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  {(
                    [
                      ["docs", "Documentos"],
                      ["pago", "Pago"],
                      ["beca", "Beca"],
                      ["reminderD1", "Reminder D+1"],
                      ["reminderD3", "Reminder D+3"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      disabled={busy === lead.id}
                      onClick={() => toggle(lead.id, key)}
                      className={`rounded-lg border px-3 py-3 text-left text-sm ${
                        pv[key]
                          ? "border-ok/40 bg-[#e8f5ee] text-ok"
                          : "border-border bg-cream text-navy/70"
                      }`}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                        {label}
                      </div>
                      <div className="mt-1 font-semibold">
                        {pv[key] ? "Listo ✓" : "Pendiente"}
                      </div>
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
