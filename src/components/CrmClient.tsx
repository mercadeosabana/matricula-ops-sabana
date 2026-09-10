"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Colegio, Lead } from "@/lib/types";
import { CANAL_LABEL } from "@/lib/types";
import { scoreLead, SCORE_LABEL, type ScoreLabel } from "@/lib/scoring";
import { ScoreBadge } from "./ScoreBadge";

const ETAPAS = [
  "contacto",
  "interes",
  "agendada",
  "visita",
  "post-visita",
  "aplicacion",
  "matricula",
];

export function CrmClient({
  colegios,
  leads,
}: {
  colegios: Colegio[];
  leads: Lead[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todos" | ScoreLabel>("todos");
  const [etapa, setEtapa] = useState<string>("todas");

  const byId = useMemo(
    () => new Map(colegios.map((c) => [c.id, c])),
    [colegios]
  );

  const rows = useMemo(() => {
    return leads
      .map((l) => ({
        lead: l,
        colegio: byId.get(l.colegioId),
        score: scoreLead(l),
      }))
      .filter((r) => (filtro === "todos" ? true : r.score === filtro))
      .filter((r) =>
        etapa === "todas" ? true : r.lead.etapaFunnel === etapa
      )
      .sort((a, b) => {
        const order = { caliente: 0, tibio: 1, frio: 2 };
        return order[a.score] - order[b.score];
      });
  }, [leads, byId, filtro, etapa]);

  const selected = rows.find((r) => r.lead.id === selectedId) || null;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold">CRM · Colegios y leads</h1>
          <p className="mt-1 text-sm text-navy/65">
            Embudo · owner Laura Natalia · score caliente/tibio/frío · demo sin
            Azure
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-border bg-cream-card px-3 py-1 font-medium">
            {leads.length} leads
          </span>
          <span className="rounded-full border border-border bg-cream-card px-3 py-1 font-medium">
            {colegios.length} colegios
          </span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["todos", "caliente", "tibio", "frio"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              filtro === f
                ? "border-navy bg-navy text-white"
                : "border-border bg-cream-card text-navy/70"
            }`}
          >
            {f === "todos" ? "Todos" : SCORE_LABEL[f]}
          </button>
        ))}
        <select
          className="min-h-9 rounded-lg border border-border bg-white px-2 text-xs"
          value={etapa}
          onChange={(e) => setEtapa(e.target.value)}
        >
          <option value="todas">Todas las etapas</option>
          {ETAPAS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-[10px] border border-border bg-cream-card">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-navy/50">
                <th className="px-3 py-2">Lead / Colegio</th>
                <th className="px-3 py-2">Etapa</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Próximo toque</th>
                <th className="px-3 py-2">Origen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ lead, colegio, score }) => (
                <tr
                  key={lead.id}
                  className={`cursor-pointer border-b border-border/70 hover:bg-cream ${
                    selectedId === lead.id ? "bg-[#eef2f8]" : ""
                  }`}
                  onClick={() => setSelectedId(lead.id)}
                >
                  <td className="px-3 py-2.5">
                    <strong className="block">{lead.nombre}</strong>
                    <span className="text-xs text-navy/55">
                      {colegio?.nombre} · {colegio?.ciudadZona}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 capitalize">{lead.etapaFunnel}</td>
                  <td className="px-3 py-2.5">
                    <ScoreBadge score={score} />
                  </td>
                  <td className="px-3 py-2.5 text-xs">{lead.owner}</td>
                  <td className="px-3 py-2.5 text-xs text-navy/70">
                    {lead.nextTouch || "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {CANAL_LABEL[lead.canalOrigen] || lead.canalOrigen}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="rounded-[10px] border border-border bg-cream-card p-4">
          {!selected ? (
            <p className="text-sm text-navy/55">
              Haz clic en un lead para ver el detalle.
            </p>
          ) : (
            <>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="m-0 text-lg font-semibold">
                  {selected.lead.nombre}
                </h2>
                <ScoreBadge score={selected.score} />
              </div>
              <p className="m-0 text-sm text-navy/65">
                {selected.colegio?.nombre} · {selected.colegio?.ciudadZona}
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <Row k="Cargo" v={selected.lead.cargo} />
                <Row k="Etapa" v={selected.lead.etapaFunnel} />
                <Row
                  k="Programa"
                  v={selected.lead.programaInteres || "—"}
                />
                <Row k="Owner" v={selected.lead.owner} />
                <Row k="Próximo toque" v={selected.lead.nextTouch || "—"} />
                <Row
                  k="Canal origen"
                  v={
                    CANAL_LABEL[selected.lead.canalOrigen] ||
                    selected.lead.canalOrigen
                  }
                />
                <Row
                  k="Email"
                  v={selected.lead.email || "—"}
                />
                <Row
                  k="WhatsApp"
                  v={selected.lead.telefonoWa || "—"}
                />
                <Row
                  k="Opened / Visita"
                  v={`${selected.lead.opened ? "Abrió" : "No abrió"} · ${
                    selected.lead.visitado ? "Visitó" : "Sin visita"
                  }`}
                />
                <Row
                  k="Tags"
                  v={selected.lead.tags.join(", ") || "—"}
                />
              </dl>
              {selected.lead.etapaFunnel === "post-visita" && (
                <Link
                  href="/post-visita"
                  className="mt-4 inline-block text-sm font-medium underline"
                >
                  Ir a checklist post-visita →
                </Link>
              )}
            </>
          )}
        </aside>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2 border-b border-border/50 pb-1.5">
      <dt className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-navy/45">
        {k}
      </dt>
      <dd className="m-0 flex-1 capitalize">{v}</dd>
    </div>
  );
}
