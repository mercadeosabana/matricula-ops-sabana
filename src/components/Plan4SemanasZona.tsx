"use client";

import Link from "next/link";
import {
  CANALES_BARRIDO,
  CANALES_TOQUE,
  PLAN_4_SEMANAS_ZONA,
  REGLA_DUAL_FUNNEL,
  REGLA_EQUILIBRIO,
  REGLA_NEXT_STEP,
  SEMANA_ZONA_ACTIVA,
  ZONA_ACTIVA,
  estadoZonaPill,
  type SemanaZonaEstado,
} from "@/lib/playbook";

function EstadoPill({ estado }: { estado: SemanaZonaEstado }) {
  const cls =
    estado === "activa"
      ? "border-gold/50 bg-[#f8f1de] text-warn"
      : estado === "hecho"
        ? "border-ok/30 bg-[#e8f5ee] text-ok"
        : estado === "bloqueada"
          ? "border-border bg-[#f3f3f3] text-navy/45"
          : "border-border bg-cream text-navy/60";
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${cls}`}
    >
      {estadoZonaPill(estado)}
    </span>
  );
}

export function Plan4SemanasZona({
  variant = "full",
  showChannels = true,
}: {
  variant?: "full" | "compact";
  showChannels?: boolean;
}) {
  return (
    <section className="rounded-[10px] border border-border bg-cream-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="m-0 text-base font-semibold">
            Plan 4 semanas · zona activa
          </h2>
          <p className="mt-0.5 text-xs text-navy/55">
            {ZONA_ACTIVA.nombre} · equilibrio ~{ZONA_ACTIVA.equilibrioPorPrograma}
            /programa · cupos demo {ZONA_ACTIVA.cuposActuales}/
            {ZONA_ACTIVA.cuposEquilibrioPortfolio} portfolio ·{" "}
            <strong>
              {SEMANA_ZONA_ACTIVA.etiqueta} activa
            </strong>
          </p>
        </div>
        {variant === "compact" && (
          <Link
            href="/playbook"
            className="text-xs font-semibold underline"
            style={{ color: "#1a2b4a" }}
          >
            Ver playbook →
          </Link>
        )}
      </div>

      <p className="mt-2 mb-0 text-xs leading-relaxed text-navy/70">
        {REGLA_EQUILIBRIO} {REGLA_DUAL_FUNNEL}
      </p>
      <p className="mt-1 mb-3 text-[11px] text-navy/55">{REGLA_NEXT_STEP}</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-navy/50">
              <th className="py-2 pr-2">Sem</th>
              <th className="py-2 pr-2">Rango</th>
              <th className="py-2 pr-2">Foco</th>
              <th className="py-2 pr-2">Prioridad</th>
              <th className="py-2 pr-2">Meta</th>
              <th className="py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_4_SEMANAS_ZONA.map((s) => (
              <tr
                key={s.semana}
                className={`border-b border-border/70 ${
                  s.estado === "activa" ? "bg-[#f8f1de]" : ""
                }`}
              >
                <td className="py-2 pr-2 font-bold">{s.etiqueta}</td>
                <td className="py-2 pr-2 text-xs text-navy/65">{s.rango}</td>
                <td className="py-2 pr-2">
                  {s.foco}
                  {s.nota && variant === "full" && (
                    <div className="text-[11px] text-navy/50">{s.nota}</div>
                  )}
                </td>
                <td className="py-2 pr-2 text-xs capitalize">
                  {s.audienciaPrioritaria === "financiador"
                    ? "Financiadores"
                    : s.audienciaPrioritaria === "interesado"
                      ? "Interesados"
                      : "Mixto"}
                </td>
                <td className="py-2 pr-2 text-xs">{s.meta}</td>
                <td className="py-2">
                  <EstadoPill estado={s.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showChannels && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-cream px-3 py-2 text-xs text-navy/75">
            <strong className="text-navy">Barrido</strong>
            <p className="m-0 mt-1 leading-relaxed">{CANALES_BARRIDO}</p>
          </div>
          <div className="rounded-lg border border-border bg-cream px-3 py-2 text-xs text-navy/75">
            <strong className="text-navy">Toque</strong>
            <p className="m-0 mt-1 leading-relaxed">{CANALES_TOQUE}</p>
          </div>
        </div>
      )}
    </section>
  );
}
