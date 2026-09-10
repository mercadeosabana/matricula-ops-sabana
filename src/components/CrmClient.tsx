"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Audiencia, Colegio, Lead } from "@/lib/types";
import {
  ORIGENES,
  ORIGEN_BADGE_CLASS,
  ORIGEN_LABEL,
  isOrigen,
  labelOrigen,
  normalizeOrigen,
  type Origen,
} from "@/lib/origen";
import {
  ETAPAS_PLAYBOOK,
  ETAPA_LABEL,
  NEXT_STEP_LABEL,
  REGLA_NEXT_STEP,
  audienciaLabel,
  labelEtapa,
  normalizeEtapa,
  normalizeNextStep,
  nextStepsForAudiencia,
} from "@/lib/playbook";
import { scoreLead, SCORE_LABEL, type ScoreLabel } from "@/lib/scoring";
import { ScoreBadge } from "./ScoreBadge";
import { toast } from "./Toast";

export function CrmClient({
  colegios,
  leads: initialLeads,
}: {
  colegios: Colegio[];
  leads: Lead[];
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todos" | ScoreLabel>("todos");
  const [etapa, setEtapa] = useState<string>("todas");
  const [origenFiltro, setOrigenFiltro] = useState<string>("todos");
  const [audFiltro, setAudFiltro] = useState<"todos" | Audiencia>("todos");
  const [saving, setSaving] = useState(false);

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
        origen: normalizeOrigen(l.origen, l.canalOrigen),
        etapa: normalizeEtapa(l.etapaFunnel),
        nextStep: normalizeNextStep(l.nextStep, l.audiencia),
      }))
      .filter((r) => (filtro === "todos" ? true : r.score === filtro))
      .filter((r) => (etapa === "todas" ? true : r.etapa === etapa))
      .filter((r) =>
        origenFiltro === "todos" ? true : r.origen === origenFiltro
      )
      .filter((r) =>
        audFiltro === "todos" ? true : r.lead.audiencia === audFiltro
      )
      .sort((a, b) => {
        const order = { caliente: 0, tibio: 1, frio: 2 };
        return order[a.score] - order[b.score];
      });
  }, [leads, byId, filtro, etapa, origenFiltro, audFiltro]);

  const selected = rows.find((r) => r.lead.id === selectedId) || null;

  async function saveOrigen(leadId: string, origen: Origen) {
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origen }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data.error || "No se pudo guardar el origen", "err");
        return;
      }
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, origen } : l))
      );
      toast(`Origen → ${ORIGEN_LABEL[origen]}`, "ok");
    } catch {
      toast("Error de red al guardar origen", "err");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold">CRM · Colegios y leads</h1>
          <p className="mt-1 text-sm text-navy/65">
            Playbook · embudo dual Financiador / Interesado · origen · score
          </p>
          <p className="mt-1 mb-0 text-[11px] text-navy/50">{REGLA_NEXT_STEP}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/playbook"
            className="rounded-full border border-navy/20 bg-white px-3 py-1 font-semibold"
            style={{ color: "#1a2b4a" }}
          >
            Playbook →
          </Link>
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
        {(["todos", "financiador", "estudiante"] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAudFiltro(a)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              audFiltro === a
                ? "border-navy bg-navy text-white"
                : "border-border bg-cream-card text-navy/70"
            }`}
          >
            {a === "todos"
              ? "Ambos embudos"
              : a === "financiador"
                ? "Financiador"
                : "Interesado"}
          </button>
        ))}
        <select
          className="min-h-9 rounded-lg border border-border bg-white px-2 text-xs"
          value={etapa}
          onChange={(e) => setEtapa(e.target.value)}
        >
          <option value="todas">Todas las etapas</option>
          {ETAPAS_PLAYBOOK.map((e) => (
            <option key={e} value={e}>
              {ETAPA_LABEL[e]}
            </option>
          ))}
        </select>
        <select
          className="min-h-9 rounded-lg border border-border bg-white px-2 text-xs"
          value={origenFiltro}
          onChange={(e) => setOrigenFiltro(e.target.value)}
          aria-label="Filtrar por origen"
        >
          <option value="todos">Todos los orígenes</option>
          {ORIGENES.map((o) => (
            <option key={o} value={o}>
              {ORIGEN_LABEL[o]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-[10px] border border-border bg-cream-card">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-navy/50">
                <th className="px-3 py-2">Lead / Colegio</th>
                <th className="px-3 py-2">Embudo</th>
                <th className="px-3 py-2">Etapa</th>
                <th className="px-3 py-2">Próx. acción</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Origen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ lead, colegio, score, origen, etapa: et, nextStep }) => (
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
                  <td className="px-3 py-2.5">
                    <AudBadge audiencia={lead.audiencia} />
                  </td>
                  <td className="px-3 py-2.5 text-xs">{ETAPA_LABEL[et]}</td>
                  <td className="px-3 py-2.5 text-xs text-navy/70">
                    <strong className="block text-navy">
                      {NEXT_STEP_LABEL[nextStep]}
                    </strong>
                    {lead.nextStepFecha || "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <ScoreBadge score={score} />
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    <OrigenBadge origen={origen} />
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
                <AudBadge audiencia={selected.lead.audiencia} />
                <OrigenBadge origen={selected.origen} />
              </div>
              <p className="m-0 text-sm text-navy/65">
                {selected.colegio?.nombre} · {selected.colegio?.ciudadZona}
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <Row k="Cargo" v={selected.lead.cargo} />
                <Row k="Embudo" v={audienciaLabel(selected.lead.audiencia)} />
                <Row k="Etapa" v={labelEtapa(selected.lead.etapaFunnel)} />
                <Row
                  k="Próx. acción"
                  v={`${NEXT_STEP_LABEL[selected.nextStep]} · ${
                    selected.lead.nextStepFecha || "sin fecha"
                  }`}
                />
                <Row k="Programa" v={selected.lead.programaInteres || "—"} />
                <Row k="Owner" v={selected.lead.owner} />
                <Row k="Próximo toque" v={selected.lead.nextTouch || "—"} />
                <div className="flex gap-2 border-b border-border/50 pb-1.5">
                  <dt className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-navy/45">
                    Origen
                  </dt>
                  <dd className="m-0 flex-1">
                    <select
                      className="w-full min-h-9 rounded-lg border border-border bg-white px-2 text-xs"
                      value={selected.origen}
                      disabled={saving}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (isOrigen(v)) void saveOrigen(selected.lead.id, v);
                      }}
                    >
                      {ORIGENES.map((o) => (
                        <option key={o} value={o}>
                          {ORIGEN_LABEL[o]}
                        </option>
                      ))}
                    </select>
                  </dd>
                </div>
                <Row k="Email" v={selected.lead.email || "—"} />
                <Row k="WhatsApp" v={selected.lead.telefonoWa || "—"} />
                <Row
                  k="Opened / Visita"
                  v={`${selected.lead.opened ? "Abrió" : "No abrió"} · ${
                    selected.lead.visitado ? "Visitó" : "Sin visita"
                  }`}
                />
                <Row
                  k="Next steps OK"
                  v={nextStepsForAudiencia(selected.lead.audiencia)
                    .map((s) => NEXT_STEP_LABEL[s])
                    .join(" · ")}
                />
                <Row k="Tags" v={selected.lead.tags.join(", ") || "—"} />
              </dl>
              {selected.lead.postVisita && (
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

function AudBadge({ audiencia }: { audiencia: Audiencia }) {
  const fin = audiencia === "financiador";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
        fin
          ? "border-navy/25 bg-[#eef2f8] text-navy"
          : "border-ok/30 bg-[#e8f5ee] text-ok"
      }`}
    >
      {fin ? "Financiador" : "Interesado"}
    </span>
  );
}

function OrigenBadge({ origen }: { origen: Origen }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${ORIGEN_BADGE_CLASS[origen]}`}
      title={`Origen: ${labelOrigen(origen)}`}
    >
      {ORIGEN_LABEL[origen]}
    </span>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2 border-b border-border/50 pb-1.5">
      <dt className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-navy/45">
        {k}
      </dt>
      <dd className="m-0 flex-1">{v}</dd>
    </div>
  );
}
