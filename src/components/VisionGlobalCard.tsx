"use client";

import Link from "next/link";
import {
  FINANCIADORES_ESTIMADO,
  RESUMEN_VISION,
  SAM_ESTIMADO,
  SEMANA_ACTIVA,
  pctAbordadoGlobal,
} from "@/lib/estudio-mercado";

/** Card compartida: elefante + % abordado + link al estudio completo */
export function VisionGlobalCard({
  variant = "hoy",
}: {
  variant?: "hoy" | "direccion";
}) {
  const g = pctAbordadoGlobal();
  const eqPct = Math.round(
    (FINANCIADORES_ESTIMADO.cuposFinanciadosActual /
      FINANCIADORES_ESTIMADO.puntoEquilibrioCohorte) *
      100
  );

  return (
    <section
      className={`mb-4 rounded-[12px] border shadow-sm ${
        variant === "hoy"
          ? "border-gold/50 bg-gradient-to-br from-[#fffdf8] to-[#f8f1de]"
          : "border-navy/20 bg-cream-card"
      } p-4`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-warn">
            {RESUMEN_VISION.titulo}
          </div>
          <h2 className="m-0 mt-1 text-lg font-bold leading-snug text-navy">
            El elefante y la rebanada
          </h2>
        </div>
        <Link
          href="/estudio"
          className="min-h-11 inline-flex items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white hover:bg-navy-mid"
        >
          Ver estudio completo →
        </Link>
      </div>

      <p className="mt-2 mb-3 text-sm leading-relaxed text-navy/75">
        {RESUMEN_VISION.elefante}{" "}
        <span className="rounded bg-[#f5e6c8] px-1 text-xs font-bold text-warn">
          ESTIMADO
        </span>
      </p>

      <div className="grid gap-2 sm:grid-cols-4">
        {SAM_ESTIMADO.segmentos.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border border-border/80 bg-white/80 px-3 py-2"
          >
            <div className="text-[10px] uppercase tracking-wide text-navy/45">
              {s.rol === "financiador" ? "Financiador" : "Interesado"}
            </div>
            <div className="text-xl font-bold">
              {s.n.toLocaleString("es-CO")}
            </div>
            <div className="text-[11px] leading-snug text-navy/60 line-clamp-2">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="min-w-[160px] flex-1">
          <div className="mb-1 flex justify-between text-xs font-medium text-navy/70">
            <span>% del SAM tocado (global)</span>
            <span>
              {g.tocados.toLocaleString("es-CO")} /{" "}
              {g.universo.toLocaleString("es-CO")} (~{g.pct}%)
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-cream">
            <div
              className="h-full rounded-full bg-navy"
              style={{ width: `${Math.min(100, Math.max(2, g.pct * 8))}%` }}
            />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs">
          <div className="text-navy/50">Semana activa</div>
          <strong>
            S{SEMANA_ACTIVA.semana} · {SEMANA_ACTIVA.territorio}
          </strong>
          <div className="text-navy/65">{SEMANA_ACTIVA.foco}</div>
        </div>
        <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs">
          <div className="text-navy/50">Equilibrio cupos</div>
          <strong>
            {FINANCIADORES_ESTIMADO.cuposFinanciadosActual}/
            {FINANCIADORES_ESTIMADO.puntoEquilibrioCohorte}
          </strong>
          <div className="text-navy/65">{eqPct}% · ESTIMADO</div>
        </div>
      </div>

      {variant === "hoy" && (
        <p className="mt-3 mb-0 text-xs text-navy/60">
          Abajo: la <strong>rebanada de esta semana</strong>. Arriba y en el
          estudio: la torta completa para no perder la visión global.
        </p>
      )}
      {variant === "direccion" && (
        <p className="mt-3 mb-0 text-xs text-navy/60">
          Los KPIs de portfolio (inscritos, CAC, ritmo) se leen contra este mismo
          estudio — una sola fuente de verdad.
        </p>
      )}
    </section>
  );
}
