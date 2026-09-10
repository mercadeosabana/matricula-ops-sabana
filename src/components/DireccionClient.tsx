"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CANAL_FUNNEL_POTENCIAL, readDemoClient } from "@/lib/demo";
import { CanalesPanel } from "./CanalesPanel";
import {
  PORTFOLIO_GERENCIA,
  PROGRAMAS_GERENCIA,
  SEMANA_MERCADO,
  TORTA_MERCADO,
  equilibrioMetido,
  formatMillones,
  paceDePrograma,
} from "@/lib/market-story";
import {
  AgendaConnectModal,
  OutlookConnectModal,
  WhatsAppConnectModal,
  useConnections,
} from "./ConnectModals";

type Props = {
  metrica: Record<string, unknown> | null;
  funnel: { etapa: string; valor: number; conv: string | null }[];
  revenue: {
    metaCop: number;
    pagadoCop: number;
    proyeccionEarlyBird: string;
    gap: string;
    semaforo: string;
    ticketPromedio: string;
    metaMatriculas: number;
    matriculas: number;
  };
  mix: {
    programa: string;
    matriculas: number;
    pipeline: number;
    prioridad: string;
  }[];
  estrategia: string[];
  wow: { label: string; tone: string }[];
};

export function DireccionClient({
  metrica,
  funnel,
  revenue,
  mix,
  estrategia,
  wow,
}: Props) {
  const { status, refresh } = useConnections();
  const [demoMode, setDemoMode] = useState(false);
  const [outlookOpen, setOutlookOpen] = useState(false);
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);

  useEffect(() => {
    setDemoMode(readDemoClient());
  }, []);

  const pf = PORTFOLIO_GERENCIA;
  const eq = equilibrioMetido(pf.cuposFinanciados, pf.cuposEquilibrio);
  const pctInscritos = Math.round(
    (pf.realInscritosTotal / Math.max(1, pf.metaInscritosTotal)) * 100
  );
  const pctSpend = Math.round((pf.spendCop / Math.max(1, pf.presupuestoCop)) * 100);
  const pctHoras = Math.round((pf.horasEquipo / Math.max(1, pf.horasPresupuesto)) * 100);
  const portfolioPace =
    pctInscritos >= 70 ? "ok" : pctInscritos >= 40 ? "atrasado" : "critico";

  const tortaTotal = TORTA_MERCADO.segmentos.reduce((s, x) => s + x.n, 0);
  const maxEst = Math.max(
    ...TORTA_MERCADO.embudoEstudiantes.map((e) => e.valor),
    1
  );
  const maxFin = Math.max(
    ...TORTA_MERCADO.embudoFinanciadores.map((e) => e.valor),
    1
  );
  const maxFunnel = funnel[0]?.valor || 420;
  const progressPct = Math.round((revenue.pagadoCop / revenue.metaCop) * 100);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold">Dirección · panorama</h1>
          <p className="mt-1 text-sm text-navy/65">
            Cohorte {pf.nota.includes("2027-1") ? "2027-1" : ""} · números{" "}
            <strong>EJEMPLO</strong> · escaneo en 5 segundos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Semaforo
            tone={portfolioPace === "ok" ? "ok" : portfolioPace === "atrasado" ? "warn" : "crit"}
            label={
              portfolioPace === "ok"
                ? "Portfolio al día"
                : portfolioPace === "atrasado"
                  ? "Portfolio atrasado"
                  : "Portfolio crítico"
            }
          />
          <span className="rounded-full border border-border bg-cream-card px-3 py-1 text-xs font-medium">
            Semana mercado · {SEMANA_MERCADO.sedeFoco}
          </span>
          <Link
            href="/equipo"
            className="rounded-full border border-navy/20 bg-cream-card px-3 py-1 text-xs font-medium underline"
          >
            Equipo →
          </Link>
        </div>
      </div>

      {/* Hero portfolio numbers */}
      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <BigStat
          label="Inscritos / meta"
          value={`${pf.realInscritosTotal}/${pf.metaInscritosTotal}`}
          hint={`${pctInscritos}% · faltan ${pf.metaInscritosTotal - pf.realInscritosTotal}`}
          tone={portfolioPace === "ok" ? "ok" : "warn"}
        />
        <BigStat
          label="Dinero invertido"
          value={formatMillones(pf.spendCop)}
          hint={`${pctSpend}% de presupuesto ${formatMillones(pf.presupuestoCop)}`}
          tone={pctSpend > 85 ? "warn" : "ok"}
        />
        <BigStat
          label="Tiempo equipo"
          value={`${pf.horasEquipo} h`}
          hint={`Desde ${pf.campanaInicioLabel} · ${pf.semanasCampana} sem · tope ${pf.horasPresupuesto} h (${pctHoras}%)`}
          tone="neutral"
        />
        <BigStat
          label="Cupos financiados"
          value={`${pf.cuposFinanciados}/${pf.cuposEquilibrio}`}
          hint={
            eq.met
              ? "Equilibrio OK · buscar interesados"
              : `Faltan ${eq.faltan} para equilibrio (Neiva)`
          }
          tone={eq.met ? "ok" : "warn"}
        />
      </section>

      {/* Per program pace */}
      <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="m-0 text-base font-semibold">Avance por programa</h2>
            <p className="mt-1 text-xs text-navy/55">
              Meta vs real · gap · ritmo (semanas restantes) · EJEMPLO
            </p>
          </div>
          <Link href="/sala-guerra" className="text-xs underline text-navy/60">
            Sala de guerra →
          </Link>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {PROGRAMAS_GERENCIA.map((p) => {
            const pace = paceDePrograma(p);
            return (
              <div
                key={p.programa}
                className="rounded-lg border border-border bg-cream p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="font-semibold text-sm">{p.programa}</div>
                  <Semaforo
                    tone={
                      pace.pace === "ok"
                        ? "ok"
                        : pace.pace === "atrasado"
                          ? "warn"
                          : "crit"
                    }
                    label={pace.paceLabel}
                  />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold leading-none">
                    {p.realInscritos}
                  </span>
                  <span className="text-sm text-navy/55">
                    / {p.metaInscritos} meta · {pace.pctAvance}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full ${
                      pace.pace === "ok"
                        ? "bg-ok"
                        : pace.pace === "atrasado"
                          ? "bg-gold"
                          : "bg-[#9b2c2c]"
                    }`}
                    style={{ width: `${Math.min(100, pace.pctAvance)}%` }}
                  />
                </div>
                <p className="mt-2 mb-0 text-xs text-navy/65">
                  Faltan <strong>{pace.faltan}</strong> · {p.semanasRestantes}{" "}
                  sem restantes · ritmo actual {p.ritmoActualPorSemana}/sem
                  (necesita ~{p.ritmoNecesarioPorSemana}) · proyección{" "}
                  {pace.proyeccion}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Costs row */}
      <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">
          Costos · CAC / visita / matrícula
        </h2>
        <p className="mt-1 text-xs text-navy/55">{pf.nota}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-cream p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/45">
              CAC EJEMPLO
            </div>
            <div className="mt-1 text-2xl font-bold">
              {formatMillones(pf.cacCop)}
            </div>
            <div className="text-xs text-navy/55">COP / matrícula</div>
          </div>
          <div className="rounded-lg bg-cream p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/45">
              Costo por visita / desayuno
            </div>
            <div className="mt-1 text-2xl font-bold">
              ~{formatMillones(pf.costoPorVisitaCop)}
            </div>
          </div>
          <div className="rounded-lg bg-cream p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/45">
              Costo por matrícula
            </div>
            <div className="mt-1 text-2xl font-bold">
              {formatMillones(pf.costoPorMatriculaCop)}
            </div>
          </div>
        </div>
      </section>

      {/* Gran torta */}
      <section className="mb-4 rounded-[12px] border border-navy/15 bg-navy px-4 py-4 text-white">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-gold">
          Historia de mercado
        </div>
        <h2 className="m-0 mt-1 text-xl font-bold">{TORTA_MERCADO.titulo}</h2>
        <p className="m-0 mt-1 text-sm text-white/75">{TORTA_MERCADO.nota}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {TORTA_MERCADO.segmentos.map((s) => (
            <div key={s.id} className="rounded-lg bg-white/10 px-3 py-3">
              <div className="text-[10px] uppercase tracking-wide text-white/55">
                {s.rol === "financiador" ? "Financiador" : "Interesado"}
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
            </div>
          ))}
        </div>
      </section>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">Abordados de la torta</h2>
          <p className="mt-1 text-xs text-navy/55">
            Qué % / N ya se tocó · por segmento · EJEMPLO
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {TORTA_MERCADO.abordados.map((a) => (
              <div key={a.segmento}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{a.segmento}</span>
                  <span>
                    {a.tocados.toLocaleString("es-CO")} /{" "}
                    {a.universo.toLocaleString("es-CO")}{" "}
                    <span className="text-navy/50">({a.pct}%)</span>
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream">
                  <div
                    className="h-full rounded-full bg-navy"
                    style={{ width: `${Math.min(100, a.pct * 12)}%` }}
                  />
                </div>
                <div className="mt-0.5 text-[11px] text-navy/50">{a.semana}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">Qué se hizo · toques</h2>
          <p className="mt-1 text-xs text-navy/55">
            Por canal · últimos 30 días · EJEMPLO
          </p>
          <ul className="mt-3 space-y-2">
            {TORTA_MERCADO.toquesCanal.map((t) => (
              <li
                key={t.canal}
                className="flex items-center justify-between rounded-lg bg-cream px-3 py-2 text-sm"
              >
                <span>{t.canal}</span>
                <strong>{t.n}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Dual funnels */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">
            1. Embudo financiadores
          </h2>
          <p className="mt-1 text-xs text-navy/55">
            Contactados → negociación → cupos → equilibrio · primero
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {TORTA_MERCADO.embudoFinanciadores.map((f) => (
              <div
                key={f.etapa}
                className="grid grid-cols-[140px_1fr_40px] items-center gap-2 text-sm"
              >
                <span className={f.meta ? "font-semibold text-warn" : ""}>
                  {f.etapa}
                </span>
                <div className="h-7 overflow-hidden rounded bg-cream">
                  <div
                    className="flex h-full items-center px-2 text-xs font-semibold text-white"
                    style={{
                      width: `${Math.max(8, (f.valor / maxFin) * 100)}%`,
                      background: f.meta
                        ? "linear-gradient(90deg,#c4a35a,#d4b86a)"
                        : "var(--navy)",
                      color: f.meta ? "#1a2b4a" : undefined,
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
          <p className="mt-3 mb-0 text-xs text-navy/60">
            Hoy (rebanada): Neiva{" "}
            <strong>
              {SEMANA_MERCADO.cuposFinanciados}/{SEMANA_MERCADO.cuposEquilibrio}
            </strong>{" "}
            · ver{" "}
            <Link href="/hoy" className="underline">
              Hoy Mercadeo
            </Link>
          </p>
        </section>

        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">
            2. Embudo interesados
          </h2>
          <p className="mt-1 text-xs text-navy/55">
            Contactados → respondieron → desayuno → post-visita → matrícula
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {TORTA_MERCADO.embudoEstudiantes.map((f) => (
              <div
                key={f.etapa}
                className="grid grid-cols-[130px_1fr_36px] items-center gap-2 text-sm"
              >
                <span>{f.etapa}</span>
                <div className="h-7 overflow-hidden rounded bg-cream">
                  <div
                    className="flex h-full items-center px-2 text-xs font-semibold text-white"
                    style={{
                      width: `${Math.max(6, (f.valor / maxEst) * 100)}%`,
                      background:
                        f.etapa === "Matrícula"
                          ? "linear-gradient(90deg,#c4a35a,#d4b86a)"
                          : "var(--navy)",
                      color: f.etapa === "Matrícula" ? "#1a2b4a" : undefined,
                    }}
                  >
                    {f.valor}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mb-4 rounded-[10px] border border-border bg-[#eef2f8] px-4 py-3 text-sm leading-relaxed">
        <strong>Tu rol:</strong> mirar equilibrio vs interesados, avance por
        programa y $ vs presupuesto. La ejecución semanal vive en{" "}
        <Link href="/hoy" className="underline">
          Hoy
        </Link>
        . Equipo y accesos en{" "}
        <Link href="/equipo" className="underline">
          Equipo
        </Link>
        .
      </div>

      <CanalesPanel
        compact
        status={status}
        demoMode={demoMode}
        onOpenOutlook={() => setOutlookOpen(true)}
        onOpenAgenda={() => setAgendaOpen(true)}
        onOpenWhatsApp={() => setWaOpen(true)}
      />

      <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">
          Potencial del sistema · canales
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-navy/50">
                <th className="py-2 pr-2 font-semibold">Canal</th>
                <th className="py-2 pr-2 font-semibold">Estado</th>
                <th className="py-2 pr-2 font-semibold">Contactos</th>
                <th className="py-2 pr-2 font-semibold">Visitas</th>
                <th className="py-2 font-semibold">Matrículas</th>
              </tr>
            </thead>
            <tbody>
              {CANAL_FUNNEL_POTENCIAL.map((r) => (
                <tr key={r.canal} className="border-b border-border/70">
                  <td className="py-2 pr-2 font-medium">{r.canal}</td>
                  <td className="py-2 pr-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        r.estado === "live"
                          ? "border-ok/30 bg-[#e8f5ee] text-ok"
                          : r.estado === "piloto" || r.estado === "drafts"
                            ? "border-gold/40 bg-[#f8f1de] text-warn"
                            : "border-border bg-cream text-navy/65"
                      }`}
                    >
                      {r.estadoLabel}
                    </span>
                  </td>
                  <td className="py-2 pr-2">{r.contactos}</td>
                  <td className="py-2 pr-2">{r.visitas}</td>
                  <td className="py-2">{r.matriculas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mb-4 flex flex-wrap gap-2">
        {wow.map((w) => (
          <span
            key={w.label}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              w.tone === "ok"
                ? "border-ok/30 bg-[#e8f5ee] text-ok"
                : w.tone === "warn"
                  ? "border-warn/30 bg-[#f5e6c8] text-warn"
                  : "border-border bg-cream-card text-navy/70"
            }`}
          >
            {w.label}
          </span>
        ))}
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">Embudo cohorte (legado)</h2>
          <p className="mt-1 text-xs text-navy/55">
            Volúmenes EJEMPLO · {Number(metrica?.colegiosContactados ?? 86)}{" "}
            colegios contactados
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {funnel.map((f) => (
              <div
                key={f.etapa}
                className="grid grid-cols-[110px_1fr_56px] items-center gap-2 text-sm"
              >
                <span className="text-navy/75">{f.etapa}</span>
                <div className="h-7 overflow-hidden rounded bg-cream">
                  <div
                    className="flex h-full items-center px-2 text-xs font-semibold text-white"
                    style={{
                      width: `${Math.max(4, (f.valor / maxFunnel) * 100)}%`,
                      background:
                        f.etapa === "Matrículas"
                          ? "linear-gradient(90deg,#c4a35a,#d4b86a)"
                          : "var(--navy)",
                      color: f.etapa === "Matrículas" ? "#1a2b4a" : undefined,
                    }}
                  >
                    {f.valor}
                  </div>
                </div>
                <span className="text-right text-xs text-navy/50">
                  {f.conv || "—"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">Ingresos vs meta</h2>
          <p className="mt-1 text-xs text-navy/55">
            EJEMPLO · ticket {revenue.ticketPromedio}
          </p>
          <div className="mt-4 flex justify-between text-sm font-medium">
            <span>Pagado ~$165M</span>
            <span>Meta $1.100M</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-cream">
            <span
              className="block h-full rounded-full bg-gold"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between border-b border-border/60 py-1">
              <span>Matrículas pagadas ({revenue.matriculas})</span>
              <span>~$165M</span>
            </li>
            <li className="flex justify-between py-1 font-semibold">
              <span>Gap vs meta</span>
              <span>{revenue.gap}</span>
            </li>
          </ul>
        </section>
      </div>

      <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">Mix por programa</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-navy/50">
                <th className="py-2 pr-2 font-semibold">Programa</th>
                <th className="py-2 pr-2 font-semibold">Matrículas</th>
                <th className="py-2 pr-2 font-semibold">Pipeline fuerte</th>
                <th className="py-2 font-semibold">Prioridad</th>
              </tr>
            </thead>
            <tbody>
              {mix.map((m) => (
                <tr key={m.programa} className="border-b border-border/70">
                  <td className="py-2 pr-2">{m.programa}</td>
                  <td className="py-2 pr-2">{m.matriculas}</td>
                  <td className="py-2 pr-2">{m.pipeline}</td>
                  <td className="py-2">{m.prioridad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[10px] border border-border bg-cream-card p-4">
        <h2 className="m-0 text-base font-semibold">Estrategia 30 días</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {estrategia.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-4 text-sm">
          <Link href="/hoy" className="underline">
            Abrir Hoy (semana de mercado)
          </Link>
          {" · "}
          <Link href="/equipo" className="underline">
            Equipo
          </Link>
          {" · "}
          <Link href="/agentes" className="underline">
            Agentes
          </Link>
        </p>
      </section>

      <OutlookConnectModal
        open={outlookOpen}
        onClose={() => setOutlookOpen(false)}
        status={status}
        onChanged={refresh}
      />
      <AgendaConnectModal
        open={agendaOpen}
        onClose={() => setAgendaOpen(false)}
        status={status}
        onChanged={refresh}
      />
      <WhatsAppConnectModal
        open={waOpen}
        onClose={() => setWaOpen(false)}
        status={status}
        onChanged={refresh}
      />
    </>
  );
}

function BigStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "ok" | "warn" | "neutral";
}) {
  return (
    <div
      className={`rounded-[10px] border p-4 ${
        tone === "ok"
          ? "border-ok/30 bg-[#e8f5ee]"
          : tone === "warn"
            ? "border-warn/30 bg-[#f8f1de]"
            : "border-border bg-cream-card"
      }`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/55">
        {label}
      </div>
      <div className="mt-1 text-[28px] font-bold leading-none text-navy">
        {value}
      </div>
      <div className="mt-2 text-[11px] leading-snug text-navy/60">{hint}</div>
    </div>
  );
}

function Semaforo({
  tone,
  label,
}: {
  tone: "ok" | "warn" | "crit";
  label: string;
}) {
  const cls =
    tone === "ok"
      ? "border-ok/30 bg-[#e8f5ee] text-ok"
      : tone === "warn"
        ? "border-warn/30 bg-[#f5e6c8] text-warn"
        : "border-[#9b2c2c]/40 bg-[#fdecea] text-[#9b2c2c]";
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${cls}`}
    >
      {label}
    </span>
  );
}
