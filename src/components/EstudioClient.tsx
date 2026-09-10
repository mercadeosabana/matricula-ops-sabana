"use client";

import Link from "next/link";
import {
  COMPETENCIA,
  EMBUDO_ESTUDIANTES,
  EMBUDO_FINANCIADORES,
  FINANCIADORES_ESTIMADO,
  FUENTES,
  HECHOS_OFICIALES,
  INVERSION_RITMO,
  PLAN_12_SEMANAS,
  PROGRAMA_FOCO,
  SAM_ESTIMADO,
  SEMANA_ACTIVA,
  TOQUES_CANAL,
  formatMillonesEstudio,
  pctAbordadoGlobal,
} from "@/lib/estudio-mercado";
import { MapaMercadoColombia } from "./MapaMercadoColombia";
import { MetasCohortePanel } from "./MetasCohortePanel";
import { OrigenAttributionPanel } from "./OrigenAttributionPanel";
import type { Lead, MetasCohorte } from "@/lib/types";

export function EstudioClient({
  metas,
  metasTotales,
  leads,
}: {
  metas: MetasCohorte;
  metasTotales: {
    metaInscritosTotal: number;
    metaIngresosCop: number;
    puntoEquilibrioCupos: number;
  };
  leads: Lead[];
}) {
  const g = pctAbordadoGlobal();
  const tortaTotal = SAM_ESTIMADO.segmentos.reduce((s, x) => s + x.n, 0);
  const maxEst = Math.max(...EMBUDO_ESTUDIANTES.map((e) => e.valor), 1);
  const maxFin = Math.max(...EMBUDO_FINANCIADORES.map((e) => e.valor), 1);
  const pctSpend = Math.round(
    (INVERSION_RITMO.spendCop / INVERSION_RITMO.presupuestoCop) * 100
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-warn">
            Estudio de mercadeo
          </div>
          <h1 className="m-0 text-2xl font-bold">
            Maestrías Educación · Unisabana
          </h1>
          <p className="mt-1 text-sm text-navy/65">
            {PROGRAMA_FOCO.facultad} · campus {PROGRAMA_FOCO.campus} · cohorte{" "}
            {PROGRAMA_FOCO.cohorte}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/hoy"
            className="rounded-full border border-border bg-cream-card px-3 py-1 text-xs font-medium underline"
          >
            Hoy (rebanada) →
          </Link>
          <Link
            href="/direccion"
            className="rounded-full border border-border bg-cream-card px-3 py-1 text-xs font-medium underline"
          >
            Dirección →
          </Link>
        </div>
      </div>

      <div className="mb-4 rounded-[10px] border border-border bg-[#eef2f8] px-4 py-3 text-sm leading-relaxed">
        <strong>Cómo leer este estudio:</strong> cifras con fuente = oficiales /
        citadas. Todo lo demás lleva etiqueta{" "}
        <span className="rounded bg-[#f5e6c8] px-1 text-xs font-bold text-warn">
          ESTIMADO
        </span>
        . Una sola fuente de verdad alimenta Hoy (Natalia) y Dirección (Lucía).
      </div>

      <MetasCohortePanel
        initialMetas={metas}
        initialTotales={metasTotales}
        canEdit={false}
      />

      <OrigenAttributionPanel leads={leads} compact />

      {/* 1. Hechos oficiales */}
      <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">1. Hechos de mercado</h2>
        <p className="mt-1 text-xs text-navy/55">Oficial / citado · con fuente</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <FactCard
            label="Docentes asignación académica"
            value={HECHOS_OFICIALES.docentesAsignacionAcademica.total.toLocaleString(
              "es-CO"
            )}
            hint={`~${HECHOS_OFICIALES.docentesAsignacionAcademica.oficiales.toLocaleString("es-CO")} oficiales / ~${HECHOS_OFICIALES.docentesAsignacionAcademica.noOficiales.toLocaleString("es-CO")} no oficiales`}
            fuente="DANE EDUC 2023"
          />
          <FactCard
            label="Matrícula posgrado ES 2025"
            value={HECHOS_OFICIALES.matriculaPosgradoES2025.total.toLocaleString(
              "es-CO"
            )}
            hint={`+${HECHOS_OFICIALES.matriculaPosgradoES2025.varYoYPct
              .toString()
              .replace(".", ",")}% vs 2024`}
            fuente="SNIES / MEN"
          />
          <FactCard
            label="Oferta de posgrados"
            value="IES privadas"
            hint={HECHOS_OFICIALES.ofertaPrivadaFuerte.nota}
            fuente="Contexto IES"
          />
        </div>
      </section>

      {/* 2. Torta SAM */}
      <section className="mb-4 rounded-[12px] border border-navy/15 bg-navy px-4 py-4 text-white">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-gold">
          Torta · SAM ESTIMADO
        </div>
        <h2 className="m-0 mt-1 text-xl font-bold">{SAM_ESTIMADO.titulo}</h2>
        <p className="m-0 mt-1 text-sm text-white/75">{SAM_ESTIMADO.nota}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SAM_ESTIMADO.segmentos.map((s) => (
            <div key={s.id} className="rounded-lg bg-white/10 px-3 py-3">
              <div className="text-[10px] uppercase tracking-wide text-white/55">
                {s.rol === "financiador" ? "Financiador" : "Interesado"} ·
                ESTIMADO
              </div>
              <div className="mt-1 text-2xl font-bold">
                {s.n.toLocaleString("es-CO")}
              </div>
              <div className="text-xs text-white/70">{s.label}</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{
                    width: `${Math.max(8, (s.n / tortaTotal) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 mb-0 text-[11px] leading-snug text-white/55">
                {s.criterio}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 mb-0 text-sm text-white/80">
          Abordado global:{" "}
          <strong>
            {g.tocados.toLocaleString("es-CO")} /{" "}
            {g.universo.toLocaleString("es-CO")} (~{g.pct}%)
          </strong>{" "}
          · ESTIMADO operativo demo
        </p>
      </section>

      {/* Segmentos abordados */}
      <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">
          2. Segmentos · qué % ya comimos
        </h2>
        <div className="mt-3 flex flex-col gap-3">
          {SAM_ESTIMADO.abordados.map((a) => (
            <div key={a.segmento}>
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-medium">
                  {a.segmento}{" "}
                  <span className="rounded bg-[#f5e6c8] px-1 text-[10px] font-bold text-warn">
                    {a.etiqueta}
                  </span>
                </span>
                <span>
                  {a.tocados.toLocaleString("es-CO")} /{" "}
                  {a.universo.toLocaleString("es-CO")}{" "}
                  <span className="text-navy/50">({a.pct}%)</span>
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream">
                <div
                  className="h-full rounded-full bg-navy"
                  style={{ width: `${Math.min(100, a.pct * 10)}%` }}
                />
              </div>
              <div className="mt-0.5 text-[11px] text-navy/50">{a.semana}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Mapa */}
      <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">
          3. Mapa comercial Colombia
        </h2>
        <p className="mt-1 text-xs text-navy/55">
          Click en región o chip de ciudad · docentes ESTIMADO o N/D · prioridad
          para comer el elefante
        </p>
        <div className="mt-3">
          <MapaMercadoColombia initialZonaId="huila" />
        </div>
      </section>

      {/* 4. Cómo comemos el elefante */}
      <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">
          4. Cómo comemos el elefante · 12 semanas
        </h2>
        <p className="mt-1 text-xs text-navy/55">
          Ejemplo gerencial · semana {SEMANA_ACTIVA.semana} activa (
          {SEMANA_ACTIVA.rango})
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-navy/50">
                <th className="py-2 pr-2 font-semibold">Sem</th>
                <th className="py-2 pr-2 font-semibold">Rango</th>
                <th className="py-2 pr-2 font-semibold">Foco</th>
                <th className="py-2 pr-2 font-semibold">Territorio</th>
                <th className="py-2 pr-2 font-semibold">Meta</th>
                <th className="py-2 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_12_SEMANAS.map((s) => (
                <tr
                  key={s.semana}
                  className={`border-b border-border/70 ${
                    s.estado === "activa" ? "bg-[#f8f1de]" : ""
                  }`}
                >
                  <td className="py-2 pr-2 font-bold">{s.semana}</td>
                  <td className="py-2 pr-2 text-xs text-navy/65">{s.rango}</td>
                  <td className="py-2 pr-2">{s.foco}</td>
                  <td className="py-2 pr-2">{s.territorio}</td>
                  <td className="py-2 pr-2 text-xs">{s.meta}</td>
                  <td className="py-2">
                    <EstadoPill estado={s.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Inversión / ritmo */}
      <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">5. Inversión y ritmo</h2>
        <p className="mt-1 text-xs text-navy/55">{INVERSION_RITMO.nota}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Invertido / presupuesto"
            value={`${formatMillonesEstudio(INVERSION_RITMO.spendCop)} (${pctSpend}%)`}
            hint={`Tope ${formatMillonesEstudio(INVERSION_RITMO.presupuestoCop)}`}
          />
          <Stat
            label="CAC ESTIMADO"
            value={formatMillonesEstudio(INVERSION_RITMO.cacCop)}
            hint="COP / matrícula"
          />
          <Stat
            label="Costo visita / desayuno"
            value={`~${formatMillonesEstudio(INVERSION_RITMO.costoPorVisitaCop)}`}
            hint="ESTIMADO"
          />
          <Stat
            label="Inscritos / meta"
            value={`${INVERSION_RITMO.realInscritos}/${INVERSION_RITMO.metaInscritos}`}
            hint={`${INVERSION_RITMO.semanasRestantes} sem restantes · ${INVERSION_RITMO.horasEquipo} h equipo`}
          />
        </div>
        <div className="mt-3 rounded-lg border border-border bg-cream px-3 py-2 text-sm">
          <strong>Financiadores:</strong>{" "}
          {FINANCIADORES_ESTIMADO.tipos.join(" · ")}. Punto de equilibrio
          cohorte:{" "}
          <strong>
            {FINANCIADORES_ESTIMADO.cuposFinanciadosActual}/
            {FINANCIADORES_ESTIMADO.puntoEquilibrioCohorte}
          </strong>{" "}
          cupos.{" "}
          <span className="text-xs text-warn font-bold">ESTIMADO</span>
        </div>
      </section>

      {/* 6. Dual embudo */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">
            6a. Embudo financiadores
          </h2>
          <p className="mt-1 text-xs text-navy/55">
            Primero · ESTIMADO demo
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {EMBUDO_FINANCIADORES.map((f) => (
              <div
                key={f.etapa}
                className="grid grid-cols-[140px_1fr_40px] items-center gap-2 text-sm"
              >
                <span className={f.meta ? "font-semibold text-warn" : ""}>
                  {f.etapa}
                </span>
                <div className="h-7 overflow-hidden rounded bg-cream">
                  <div
                    className="flex h-full items-center px-2 text-xs font-semibold"
                    style={{
                      width: `${Math.max(8, (f.valor / maxFin) * 100)}%`,
                      background: f.meta
                        ? "linear-gradient(90deg,#c4a35a,#d4b86a)"
                        : "var(--navy)",
                      color: f.meta ? "#1a2b4a" : "#fff",
                    }}
                  >
                    {f.valor}
                  </div>
                </div>
                <span className="text-right text-xs text-navy/50">
                  {f.meta ? "meta" : ""}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">
            6b. Embudo interesados
          </h2>
          <p className="mt-1 text-xs text-navy/55">
            Después del equilibrio territorial · ESTIMADO demo
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {EMBUDO_ESTUDIANTES.map((f) => (
              <div
                key={f.etapa}
                className="grid grid-cols-[130px_1fr] items-center gap-2 text-sm"
              >
                <span>{f.etapa}</span>
                <div className="h-7 overflow-hidden rounded bg-cream">
                  <div
                    className="flex h-full items-center px-2 text-xs font-semibold"
                    style={{
                      width: `${Math.max(6, (f.valor / maxEst) * 100)}%`,
                      background:
                        f.etapa === "Matrícula"
                          ? "linear-gradient(90deg,#c4a35a,#d4b86a)"
                          : "var(--navy)",
                      color: f.etapa === "Matrícula" ? "#1a2b4a" : "#fff",
                    }}
                  >
                    {f.valor}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ul className="mt-3 mb-0 space-y-1 text-xs text-navy/60">
            {TOQUES_CANAL.map((t) => (
              <li key={t.canal} className="flex justify-between">
                <span>{t.canal}</span>
                <strong>{t.n}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 7. Competencia */}
      <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">
          7. Competencia · maestrías Educación
        </h2>
        <p className="mt-1 text-xs text-navy/55">
          Listado cualitativo por ciudad/región · sin matrículas ni % de share
          inventados · filas &quot;verificar&quot; = confirmar SNIES antes de
          pitch
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-navy/50">
                <th className="py-2 pr-2 font-semibold">Ciudad / región</th>
                <th className="py-2 pr-2 font-semibold">Universidad</th>
                <th className="py-2 pr-2 font-semibold">Programa</th>
                <th className="py-2 pr-2 font-semibold">Modalidad</th>
                <th className="py-2 font-semibold">Nota vs Sabana</th>
              </tr>
            </thead>
            <tbody>
              {COMPETENCIA.map((c) => (
                <tr
                  key={c.id}
                  className={`border-b border-border/70 ${
                    c.esSabana ? "bg-[#e8f5ee]" : ""
                  }`}
                >
                  <td className="py-2 pr-2 align-top">{c.ciudadRegion}</td>
                  <td className="py-2 pr-2 align-top font-medium">
                    {c.universidad}
                    {c.esSabana && (
                      <span className="ml-1 rounded bg-ok/15 px-1 text-[10px] font-bold text-ok">
                        NOSOTROS
                      </span>
                    )}
                    {c.verificar && (
                      <span className="ml-1 rounded bg-[#f5e6c8] px-1 text-[10px] font-bold text-warn">
                        VERIFICAR
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-2 align-top text-xs">{c.programa}</td>
                  <td className="py-2 pr-2 align-top capitalize">
                    {c.modalidad}
                  </td>
                  <td className="py-2 align-top text-xs leading-snug text-navy/75">
                    {c.notaVsSabana}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Fuentes */}
      <section className="mb-6 rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">Fuentes</h2>
        <ul className="mt-2 mb-0 space-y-2 text-sm">
          {FUENTES.map((f) => (
            <li key={f.id}>
              <strong>{f.label}</strong>
              {f.año ? ` (${f.año})` : ""}: {f.detalle}
            </li>
          ))}
        </ul>
        <p className="mt-3 mb-0 text-xs text-navy/55">
          Módulo: <code>src/lib/estudio-mercado.ts</code> · reutilizado en /hoy
          y /direccion.
        </p>
      </section>
    </>
  );
}

function FactCard({
  label,
  value,
  hint,
  fuente,
}: {
  label: string;
  value: string;
  hint: string;
  fuente: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-cream p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/45">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs leading-snug text-navy/60">{hint}</div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-ok">
        Fuente: {fuente}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg bg-cream p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/45">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold">{value}</div>
      <div className="text-xs text-navy/55">{hint}</div>
    </div>
  );
}

function EstadoPill({
  estado,
}: {
  estado: "hecho" | "activa" | "planeada";
}) {
  const cls =
    estado === "activa"
      ? "border-warn/30 bg-[#f5e6c8] text-warn"
      : estado === "hecho"
        ? "border-ok/30 bg-[#e8f5ee] text-ok"
        : "border-border bg-cream text-navy/60";
  const label =
    estado === "activa" ? "Activa" : estado === "hecho" ? "Hecha" : "Planeada";
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${cls}`}
    >
      {label}
    </span>
  );
}
