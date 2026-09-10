"use client";

import Link from "next/link";

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
  const kpis = [
    {
      label: "Colegios contactados",
      value: Number(metrica?.colegiosContactados ?? 86),
      hint: "EJEMPLO · mix Bogotá N / Chía–Cajicá",
      delta: "↑ 12% vs sem. ant.",
      up: true,
    },
    {
      label: "Respuestas",
      value: Number(metrica?.respuestas ?? 126),
      hint: "EJEMPLO · interés calificado",
      delta: "↑ 8% vs sem. ant.",
      up: true,
    },
    {
      label: "Visitas",
      value: Number(metrica?.visitasRealizadas ?? 36),
      hint: "EJEMPLO · realizadas (de 48 agendadas)",
      delta: "↑ 15% vs sem. ant.",
      up: true,
    },
    {
      label: "Inscritos / apps",
      value: Number(metrica?.inscritos ?? 14),
      hint: "EJEMPLO · aplicaciones enviadas",
      delta: "↑ 2 vs sem. ant.",
      up: true,
    },
    {
      label: "Matrículas",
      value: Number(metrica?.matriculas ?? 6),
      hint: "EJEMPLO · meta cohorte 40",
      delta: "Gap: 34 cupos",
      up: false,
    },
  ];

  const maxFunnel = funnel[0]?.valor || 420;
  const progressPct = Math.round(
    (revenue.pagadoCop / revenue.metaCop) * 100
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold">Dashboard Dirección</h1>
          <p className="mt-1 text-sm text-navy/65">
            Últimos 30 días · Cohorte 2027-1 · Todos los números son{" "}
            <strong>EJEMPLO</strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-warn/30 bg-[#f5e6c8] px-3 py-1 text-xs font-medium text-warn">
            Semáforo: Amarillo
          </span>
          <span className="rounded-full border border-border bg-cream-card px-3 py-1 text-xs font-medium">
            Early bird → 15 oct (CONFIRMAR)
          </span>
        </div>
      </div>

      <div className="mb-4 rounded-[10px] border border-border bg-[#eef2f8] px-4 py-3 text-sm leading-relaxed">
        <strong>Tu rol:</strong> mirar embudo + $ vs meta, aprobar excepciones de
        descuento y desbloquear fechas de visita. No redactas emails: eso vive
        en{" "}
        <Link href="/hoy" className="underline">
          Hoy
        </Link>
        .
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-[10px] border border-border bg-cream-card p-4"
          >
            <div className="text-xs font-medium uppercase tracking-wide text-navy/55">
              {k.label}
            </div>
            <div className="mt-1 text-[32px] font-bold leading-none text-navy">
              {k.value}
            </div>
            <div className="mt-2 text-[11px] text-navy/55">{k.hint}</div>
            <div
              className={`mt-1 text-xs font-semibold ${
                k.up ? "text-ok" : "text-warn"
              }`}
            >
              {k.delta}
            </div>
          </div>
        ))}
      </div>

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
          <h2 className="m-0 text-base font-semibold">Embudo cohorte 2027-1</h2>
          <p className="mt-1 text-xs text-navy/55">
            Volúmenes EJEMPLO · conversión vs etapa anterior
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {funnel.map((f) => (
              <div key={f.etapa} className="grid grid-cols-[110px_1fr_56px] items-center gap-2 text-sm">
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
          <svg
            viewBox="0 0 320 48"
            width="100%"
            height="48"
            className="mt-4"
            aria-hidden="true"
          >
            <polyline
              fill="none"
              stroke="#1a2b4a"
              strokeWidth="2"
              points="0,4 45,8 90,18 135,22 180,28 225,32 270,36 320,40"
            />
            <circle cx="320" cy="40" r="3.5" fill="#c4a35a" />
          </svg>
        </section>

        <section className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-base font-semibold">Ingresos vs meta</h2>
          <p className="mt-1 text-xs text-navy/55">
            EJEMPLO · ticket {revenue.ticketPromedio} post-descuento
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
          <p className="mt-3 text-sm font-semibold text-warn">
            Amarillo — visitas OK; matrícula bajo plan
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between border-b border-border/60 py-1">
              <span>Matrículas pagadas ({revenue.matriculas})</span>
              <span>~$165M</span>
            </li>
            <li className="flex justify-between border-b border-border/60 py-1">
              <span>Pipeline alta prob. (+6–7)</span>
              <span>~$165–190M</span>
            </li>
            <li className="flex justify-between border-b border-border/60 py-1">
              <span>Proyección early bird</span>
              <span>{revenue.proyeccionEarlyBird}</span>
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
        <p className="mt-1 text-xs text-navy/55">
          Matrículas + pipeline fuerte · EJEMPLO
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-navy/50">
                <th className="py-2 pr-2 font-semibold">Programa</th>
                <th className="py-2 pr-2 font-semibold">Matrículas</th>
                <th className="py-2 pr-2 font-semibold">Pipeline fuerte</th>
                <th className="py-2 font-semibold">Prioridad agente</th>
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
        <p className="mt-1 text-xs text-navy/55">
          Los agentes operan · Mercadeo aprueba · Dirección mira estos frentes
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {estrategia.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-4 text-sm">
          <Link href="/actividad" className="underline">
            Ver log de actividad →
          </Link>
          {" · "}
          <Link href="/hoy" className="underline">
            Abrir cola de Mercadeo (Hoy)
          </Link>
        </p>
      </section>
    </>
  );
}
