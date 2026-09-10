"use client";

import Link from "next/link";
import type { Lead } from "@/lib/types";
import {
  ORIGEN_BADGE_CLASS,
  ORIGEN_LABEL,
  buildAttribution,
  formatCopCorto,
  type AttributionSnapshot,
} from "@/lib/origen";

export function OrigenAttributionPanel({
  leads,
  compact = false,
}: {
  leads: Lead[];
  compact?: boolean;
}) {
  const snap = buildAttribution(leads);

  if (compact) {
    return <CompactAttribution snap={snap} />;
  }

  return (
    <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="m-0 text-base font-semibold">De dónde vienen</h2>
          <p className="mt-0.5 text-xs text-navy/55">
            Atribución por origen · embudo derivado del CRM · gasto pauta{" "}
            <span className="rounded bg-[#f5e6c8] px-1 text-[10px] font-bold text-warn">
              EJEMPLO
            </span>
          </p>
        </div>
        <span className="rounded-full border border-border bg-cream px-3 py-1 text-xs font-medium">
          {snap.total} leads
        </span>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <NarrativeCard
          title="Base existente"
          hint="Facultad, referidos, web, convenio, otro"
          count={snap.baseExistente.count}
          pct={snap.baseExistente.pct}
          matriculas={snap.baseExistente.matriculas}
          tone="base"
        />
        <NarrativeCard
          title="Demanda nueva"
          hint="LinkedIn orgánico + pauta Meta / LinkedIn"
          count={snap.demandaNueva.count}
          pct={snap.demandaNueva.pct}
          matriculas={snap.demandaNueva.matriculas}
          tone="nueva"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-navy/50">
              <th className="py-2 pr-2">Origen</th>
              <th className="py-2 pr-2">Leads</th>
              <th className="py-2 pr-2">Contactados</th>
              <th className="py-2 pr-2">Respondieron</th>
              <th className="py-2 pr-2">Visita / desayuno</th>
              <th className="py-2">Matrícula</th>
            </tr>
          </thead>
          <tbody>
            {snap.byOrigen.map((row) => (
              <tr key={row.origen} className="border-b border-border/70">
                <td className="py-2 pr-2">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${ORIGEN_BADGE_CLASS[row.origen]}`}
                  >
                    {row.label}
                  </span>
                </td>
                <td className="py-2 pr-2 font-semibold">{row.count}</td>
                <td className="py-2 pr-2">{row.funnel.contactados}</td>
                <td className="py-2 pr-2">{row.funnel.respondieron}</td>
                <td className="py-2 pr-2">{row.funnel.visita}</td>
                <td className="py-2">{row.funnel.matricula}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SpendCard
          label="Pauta Meta"
          spend={snap.spendEjemplo.pauta_meta}
          cac={snap.cacEjemplo.pauta_meta}
          matriculas={
            snap.byOrigen.find((r) => r.origen === "pauta_meta")?.funnel
              .matricula || 0
          }
        />
        <SpendCard
          label="Pauta LinkedIn"
          spend={snap.spendEjemplo.pauta_linkedin}
          cac={snap.cacEjemplo.pauta_linkedin}
          matriculas={
            snap.byOrigen.find((r) => r.origen === "pauta_linkedin")?.funnel
              .matricula || 0
          }
        />
      </div>
      <p className="mt-3 m-0 text-[11px] text-navy/50">
        Spend y CAC son{" "}
        <strong className="text-warn">EJEMPLO</strong> (sin Ads API). Embudo =
        etapas CRM + opened/visitado cuando aplica. Detalle editable en{" "}
        <Link href="/crm" className="underline">
          /crm
        </Link>
        .
      </p>
    </section>
  );
}

function CompactAttribution({ snap }: { snap: AttributionSnapshot }) {
  const top = [...snap.byOrigen]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  return (
    <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="m-0 text-sm font-semibold">De dónde vienen</h2>
          <p className="m-0 text-[11px] text-navy/55">
            Base {snap.baseExistente.pct}% · Demanda nueva{" "}
            {snap.demandaNueva.pct}%
          </p>
        </div>
        <Link
          href="/direccion"
          className="rounded-full border border-navy/20 bg-cream px-2.5 py-0.5 text-[11px] font-semibold underline"
        >
          Ver panel completo →
        </Link>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {top.map((r) => (
          <span
            key={r.origen}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${ORIGEN_BADGE_CLASS[r.origen]}`}
          >
            {ORIGEN_LABEL[r.origen]}
            <span className="opacity-70">{r.count}</span>
          </span>
        ))}
      </div>
      <p className="mt-2 mb-0 text-[10px] text-navy/45">
        Pauta Meta {formatCopCorto(snap.spendEjemplo.pauta_meta)} · Pauta LI{" "}
        {formatCopCorto(snap.spendEjemplo.pauta_linkedin)}{" "}
        <span className="font-bold text-warn">EJEMPLO</span>
      </p>
    </section>
  );
}

function NarrativeCard({
  title,
  hint,
  count,
  pct,
  matriculas,
  tone,
}: {
  title: string;
  hint: string;
  count: number;
  pct: number;
  matriculas: number;
  tone: "base" | "nueva";
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        tone === "nueva"
          ? "border-[#0a66c2]/25 bg-[#e8f1fa]"
          : "border-navy/15 bg-[#eef2f8]"
      }`}
    >
      <div className="text-[11px] font-bold uppercase tracking-wide text-navy/50">
        {title}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold">{count}</span>
        <span className="text-sm text-navy/60">{pct}% del CRM</span>
      </div>
      <p className="m-0 mt-1 text-xs text-navy/55">{hint}</p>
      <p className="m-0 mt-1 text-xs font-medium">
        → matrícula / app: <strong>{matriculas}</strong>
      </p>
    </div>
  );
}

function SpendCard({
  label,
  spend,
  cac,
  matriculas,
}: {
  label: string;
  spend: number;
  cac: number | null;
  matriculas: number;
}) {
  return (
    <div className="rounded-lg border border-gold/35 bg-[#f8f1de] px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className="rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-bold uppercase text-warn">
          EJEMPLO
        </span>
      </div>
      <div className="mt-1 text-lg font-bold">{formatCopCorto(spend)} COP</div>
      <p className="m-0 mt-1 text-xs text-navy/65">
        Matrículas atribuidas: <strong>{matriculas}</strong>
        {" · "}
        CAC:{" "}
        <strong>
          {cac != null ? `${formatCopCorto(cac)} COP` : "— (sin matrícula)"}
        </strong>
      </p>
    </div>
  );
}
