"use client";

import Link from "next/link";
import {
  COMO_VAMOS_ALERTA,
  COMO_VAMOS_PROGRAMAS,
  COMO_VAMOS_TOTAL,
} from "@/lib/demo-aprobacion";

function formatCop(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(n / 1000)}k`;
}

function ProgressBar({
  value,
  max,
  tone = "navy",
}: {
  value: number;
  max: number;
  tone?: "navy" | "gold" | "ok" | "warn";
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const fill =
    tone === "gold"
      ? "bg-gold"
      : tone === "ok"
        ? "bg-ok"
        : tone === "warn"
          ? "bg-warn"
          : "bg-navy";
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-navy/10">
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ComoVamosClient() {
  const t = COMO_VAMOS_TOTAL;
  const spendPct = Math.round((t.spendCop / t.spendBudgetCop) * 100);

  return (
    <div className="text-navy">
      <div className="mb-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/50">
          ¿Cómo vamos?
        </div>
        <h1 className="m-0 mt-0.5 text-xl font-bold leading-tight text-navy">
          Cohorte 2027-1
        </h1>
        <p className="mt-1 text-sm text-navy/65">
          {t.territorio} · {t.semana}
        </p>
      </div>

      <div className="max-w-lg pb-8">
        {/* Big numbers */}
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-cream-card p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/50">
              Inscritos vs meta
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums">{t.inscritos}</span>
              <span className="text-sm text-navy/50">/ {t.meta}</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={t.inscritos} max={t.meta} />
            </div>
            <p className="mt-2 text-[11px] text-navy/55">
              Meta portfolio 20 × 4 maestrías
            </p>
          </div>
          <div className="rounded-xl border border-border bg-cream-card p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/50">
              Break-even
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums text-warn">
                {t.equilibrioPorPrograma}
              </span>
              <span className="text-sm text-navy/50">/ programa</span>
            </div>
            <p className="mt-3 text-xs leading-snug text-navy/65">
              Portfolio: {t.inscritos} de {t.equilibrioPortfolio} cupos
              equilibrio
            </p>
            <div className="mt-2">
              <ProgressBar
                value={t.inscritos}
                max={t.equilibrioPortfolio}
                tone="gold"
              />
            </div>
          </div>
        </section>

        {/* By maestría */}
        <section className="mt-6">
          <h2 className="m-0 mb-3 text-base font-bold">Por maestría</h2>
          <div className="flex flex-col gap-2.5">
            {COMO_VAMOS_PROGRAMAS.map((p) => {
              const nearBe = p.inscritos >= p.equilibrio * 0.5;
              return (
                <div
                  key={p.programa}
                  className="rounded-xl border border-border bg-cream-card px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">{p.corto}</div>
                    <div className="text-sm tabular-nums">
                      <strong>{p.inscritos}</strong>
                      <span className="text-navy/45"> / {p.meta}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <ProgressBar
                      value={p.inscritos}
                      max={p.meta}
                      tone={nearBe ? "ok" : "navy"}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[11px] text-navy/50">
                    <span>Equilibrio {p.equilibrio}</span>
                    <span>
                      {p.inscritos < p.equilibrio
                        ? `Faltan ${p.equilibrio - p.inscritos} a BE`
                        : "Sobre equilibrio"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Spend vs progress */}
        <section className="mt-6 rounded-xl border border-border bg-cream-card p-4 shadow-sm">
          <h2 className="m-0 text-base font-bold">Gasto vs avance</h2>
          <p className="mt-1 text-xs text-navy/55">Números demo · sin Azure aún</p>
          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium">Spend pauta / ops</span>
                <span className="tabular-nums">
                  {formatCop(t.spendCop)} / {formatCop(t.spendBudgetCop)} (
                  {spendPct}%)
                </span>
              </div>
              <ProgressBar value={t.spendCop} max={t.spendBudgetCop} tone="gold" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium">Avance inscritos</span>
                <span className="tabular-nums">{t.progressPct}%</span>
              </div>
              <ProgressBar value={t.inscritos} max={t.meta} />
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-navy/55">
            Spend al {spendPct}% del presupuesto; inscritos al {t.progressPct}%
            de la meta. Prioridad: cupos financiados Neiva antes de más pauta.
          </p>
        </section>

        {/* Alert */}
        <section className="mt-6">
          <div className="rounded-xl border-2 border-warn/40 bg-[#fbf6ea] p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-warn">
              Alerta
            </div>
            <h3 className="m-0 mt-1 text-sm font-bold leading-snug">
              {COMO_VAMOS_ALERTA.titulo}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-navy/80">
              {COMO_VAMOS_ALERTA.cuerpo}
            </p>
            <p className="mt-2 text-[11px] text-navy/50">
              {COMO_VAMOS_ALERTA.agente} · listo en Mi día
            </p>
          </div>
        </section>

        <p className="mt-8 text-center text-[11px] text-navy/40">
          Detalle ampliado en{" "}
          <Link href="/direccion" className="underline decoration-navy/30">
            Dirección (detalle)
          </Link>
        </p>
      </div>
    </div>
  );
}
