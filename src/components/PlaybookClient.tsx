"use client";

import Link from "next/link";
import {
  CANALES_BARRIDO,
  CANALES_TOQUE,
  CANALES_PLAYBOOK_RESUMEN,
  COLA_CAP_COPY,
  COLA_NUEVOS_CAP_DIA,
  ETAPAS_PLAYBOOK,
  ETAPA_LABEL,
  NEXT_STEP_LABEL,
  NEXT_STEPS,
  REGLA_DUAL_FUNNEL,
  REGLA_EQUILIBRIO,
  REGLA_NEXT_STEP,
  nextStepsForAudiencia,
} from "@/lib/playbook";
import { Plan4SemanasZona } from "./Plan4SemanasZona";

export function PlaybookClient() {
  const finSteps = nextStepsForAudiencia("financiador");
  const intSteps = nextStepsForAudiencia("estudiante");

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold">Playbook comercial</h1>
          <p className="mt-1 text-sm text-navy/65">
            Regla de oro · embudo dual · plan 4 semanas zona activa · canales
            barrido vs toque
          </p>
        </div>
        <Link
          href="/hoy"
          className="min-h-11 inline-flex items-center rounded-lg border border-navy bg-white px-3 text-sm font-semibold text-navy"
          style={{ color: "#1a2b4a" }}
        >
          Ir a Hoy →
        </Link>
      </div>

      <section className="mb-4 rounded-[10px] border border-gold/40 bg-[#fffdf8] p-4">
        <h2 className="m-0 text-base font-semibold">Reglas de oro</h2>
        <ul className="mt-2 mb-0 list-disc space-y-1.5 pl-5 text-sm text-navy/80">
          <li>{REGLA_DUAL_FUNNEL}</li>
          <li>{REGLA_EQUILIBRIO}</li>
          <li>{REGLA_NEXT_STEP}</li>
          <li>
            Pauta Meta / LinkedIn / web usan las <strong>mismas etapas</strong>{" "}
            del playbook que base facultad.
          </li>
          <li>
            En Hoy: <strong>Respondieron</strong> arriba; cola de nuevos fríos
            debajo (tope ~{COLA_NUEVOS_CAP_DIA}/día). Una próxima acción + fecha
            por lead.
          </li>
        </ul>
      </section>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">Barrido (encontrar)</h2>
          <p className="mt-2 mb-0 text-sm leading-relaxed text-navy/75">
            {CANALES_BARRIDO}
          </p>
        </section>
        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">Toque (contactar)</h2>
          <p className="mt-2 mb-0 text-sm leading-relaxed text-navy/75">
            {CANALES_TOQUE}
          </p>
          <p className="mt-2 mb-0 text-xs text-navy/55">
            {CANALES_PLAYBOOK_RESUMEN}
          </p>
        </section>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">Etapas CRM</h2>
          <ol className="mt-3 mb-0 list-decimal space-y-1 pl-5 text-sm">
            {ETAPAS_PLAYBOOK.map((e) => (
              <li key={e}>
                <code className="text-[11px] text-navy/50">{e}</code>{" "}
                <strong>{ETAPA_LABEL[e]}</strong>
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">
            Next step · embudo dual
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-navy/15 bg-[#eef2f8] p-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-navy/50">
                Financiador
              </div>
              <ul className="mt-2 mb-0 list-disc pl-4 text-sm">
                {finSteps.map((s) => (
                  <li key={s}>{NEXT_STEP_LABEL[s]}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-ok/25 bg-[#e8f5ee] p-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-ok">
                Interesado
              </div>
              <ul className="mt-2 mb-0 list-disc pl-4 text-sm">
                {intSteps.map((s) => (
                  <li key={s}>{NEXT_STEP_LABEL[s]}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-3 mb-0 text-[11px] text-navy/55">
            Catálogo completo:{" "}
            {NEXT_STEPS.map((s) => NEXT_STEP_LABEL[s]).join(" · ")}
          </p>
        </section>
      </div>

      <div className="mb-4">
        <Plan4SemanasZona variant="full" showChannels />
      </div>

      <p className="text-xs text-navy/50">{COLA_CAP_COPY}</p>
    </>
  );
}
