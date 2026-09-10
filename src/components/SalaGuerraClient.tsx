"use client";

import { useState } from "react";
import {
  COSTOS_EJEMPLO,
  SALA_GUERRA_ACCIONES,
  TERRITORIOS,
  briefSemanaTexto,
} from "@/lib/admissions-data";
import { FUNNEL_EJEMPLO } from "@/lib/seed-data";
import { toast } from "./Toast";

// FUNNEL_MOVE might not exist - I'll inline in admissions-data or fix import
const MOVE = [
  { label: "Contactos → Interés", delta: "+12% WoW", tone: "ok" },
  { label: "Interés → Agendadas", delta: "38% (meta 45%)", tone: "warn" },
  { label: "Agendadas → Visitaron", delta: "75% show-up", tone: "ok" },
  { label: "Apps → Matrículas", delta: "6 / meta 40", tone: "warn" },
];

export function SalaGuerraClient() {
  const [brief, setBrief] = useState<string | null>(null);

  function generar() {
    const text = briefSemanaTexto();
    setBrief(text);
    toast("Brief de la semana generado (Orquestadora)", "ok");
  }

  async function copiar() {
    if (!brief) return;
    try {
      await navigator.clipboard.writeText(brief);
      toast("Brief copiado", "ok");
    } catch {
      toast("No se pudo copiar", "err");
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold">Sala de guerra</h1>
          <p className="mt-1 text-sm text-navy/65">
            Brief semanal · Natalia (Mercadeo) + Lucía (Dirección) · voz
            Orquestadora
          </p>
        </div>
        <button
          type="button"
          onClick={generar}
          className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white"
        >
          Generar brief de la semana
        </button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MOVE.map((m) => (
          <div
            key={m.label}
            className="rounded-[10px] border border-border bg-cream-card p-3"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/45">
              Embudo
            </div>
            <div className="mt-1 text-sm font-semibold">{m.label}</div>
            <div
              className={`mt-1 text-xs font-medium ${
                m.tone === "ok" ? "text-ok" : "text-warn"
              }`}
            >
              {m.delta}
            </div>
          </div>
        ))}
      </div>

      <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">Movimiento del embudo</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {FUNNEL_EJEMPLO.map((s) => (
            <div
              key={s.etapa}
              className="min-w-[88px] flex-1 rounded-lg bg-cream px-2 py-2 text-center"
            >
              <div className="text-lg font-bold">{s.valor}</div>
              <div className="text-[11px] text-navy/60">{s.etapa}</div>
              {s.conv && (
                <div className="text-[10px] font-medium text-gold">{s.conv}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">Top 10 acciones</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
            {SALA_GUERRA_ACCIONES.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
        </section>
        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">Territorios</h2>
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase text-navy/50">
                <th className="py-1">Zona</th>
                <th className="py-1">Colegios</th>
                <th className="py-1">Calientes</th>
                <th className="py-1">Owner</th>
              </tr>
            </thead>
            <tbody>
              {TERRITORIOS.map((t) => (
                <tr key={t.zona} className="border-b border-border/60">
                  <td className="py-2">{t.zona}</td>
                  <td className="py-2">{t.colegios}</td>
                  <td className="py-2 font-semibold text-[#9b3410]">
                    {t.leadsCalientes}
                  </td>
                  <td className="py-2 text-xs">{t.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 rounded-lg border border-dashed border-border bg-cream p-3 text-sm">
            <strong>Costo por matrícula EJEMPLO</strong>
            <div className="mt-1 text-2xl font-bold">
              ${(COSTOS_EJEMPLO.costoPorMatriculaCop / 1_000_000).toFixed(1)}M
              COP
            </div>
            <p className="mt-1 text-xs text-navy/55">{COSTOS_EJEMPLO.nota}</p>
          </div>
        </section>
      </div>

      {brief && (
        <section className="rounded-[10px] border border-navy/20 bg-[#eef2f8] p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="m-0 text-base font-semibold">
              Brief · voz Orquestadora
            </h2>
            <button
              type="button"
              onClick={copiar}
              className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium"
            >
              Copiar
            </button>
          </div>
          <pre className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-navy/85">
            {brief}
          </pre>
        </section>
      )}
    </>
  );
}
