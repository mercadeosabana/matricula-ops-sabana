"use client";

import { useMemo, useState } from "react";
import {
  CIUDADES_CHIP,
  ZONAS_MAPA,
  prioridadColor,
  prioridadLabel,
  type ZonaMapa,
} from "@/lib/estudio-mercado";

/** Mapa estilizado Colombia: regiones clickeables + chips de ciudades (v1 sin topojson). */
export function MapaMercadoColombia({
  compact = false,
  initialZonaId = "huila",
}: {
  compact?: boolean;
  initialZonaId?: string;
}) {
  const [zonaId, setZonaId] = useState(initialZonaId);
  const zona = useMemo(
    () => ZONAS_MAPA.find((z) => z.id === zonaId) ?? ZONAS_MAPA[0],
    [zonaId]
  );

  return (
    <div
      className={`grid gap-4 ${compact ? "" : "lg:grid-cols-[1.1fr_1fr]"}`}
    >
      <div>
        <div
          className="mb-2 flex flex-wrap gap-1.5"
          role="group"
          aria-label="Ciudades ancla"
        >
          {CIUDADES_CHIP.map((c) => {
            const selected = zonaId === c.zonaId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setZonaId(c.zonaId)}
                aria-pressed={selected}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-shadow ${
                  selected
                    ? "border-navy bg-navy shadow-[0_0_0_2px_rgba(26,43,74,0.25)]"
                    : "border-border bg-cream-card hover:bg-cream"
                }`}
                /* Explicit colors: global `a { color: inherit }` / inheritance
                   can make text-white invisible on navy. */
                style={
                  selected
                    ? {
                        background: "#1a2b4a",
                        color: "#ffffff",
                        borderColor: "#1a2b4a",
                      }
                    : {
                        color: "rgba(26, 43, 74, 0.8)",
                        background: "#fffdf8",
                        borderColor: "#e2d9c8",
                      }
                }
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div
          className={`relative overflow-hidden rounded-[12px] border border-border bg-gradient-to-b from-[#e8eef6] to-[#f7f3ea] ${
            compact ? "p-2" : "p-3"
          }`}
        >
          <svg
            viewBox="0 0 320 400"
            className="mx-auto h-auto w-full max-w-[340px]"
            role="img"
            aria-label={`Mapa comercial Colombia. Zona seleccionada: ${zona.nombre}`}
          >
            <title>Mapa comercial Colombia</title>
            <defs>
              <filter id="mapa-selected-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="2.5"
                  floodColor="#1a2b4a"
                  floodOpacity="0.55"
                />
              </filter>
            </defs>
            {/* Caribe · Guajira (norte) */}
            <RegionPath
              d="M158 10 L208 8 L232 32 L218 52 L175 48 L155 28 Z"
              zona={ZONAS_MAPA.find((z) => z.svgId === "caribe-guajira")!}
              active={zona.svgId === "caribe-guajira"}
              onSelect={setZonaId}
            />
            {/* Caribe · Atlántico / Barranquilla */}
            <RegionPath
              d="M100 34 L155 28 L165 55 L142 78 L108 74 L95 52 Z"
              zona={ZONAS_MAPA.find((z) => z.svgId === "caribe-atlantico")!}
              active={zona.svgId === "caribe-atlantico"}
              onSelect={setZonaId}
            />
            {/* Caribe · Cesar / Valledupar (este) */}
            <RegionPath
              d="M168 52 L218 52 L228 78 L200 98 L158 92 L152 68 Z"
              zona={ZONAS_MAPA.find((z) => z.svgId === "caribe-cesar")!}
              active={zona.svgId === "caribe-cesar"}
              onSelect={setZonaId}
            />
            {/* Andina norte (Antioquia) */}
            <RegionPath
              d="M95 88 L155 80 L175 120 L150 155 L100 150 L85 115 Z"
              zona={ZONAS_MAPA.find((z) => z.svgId === "andina-norte")!}
              active={zona.svgId === "andina-norte"}
              onSelect={setZonaId}
            />
            {/* Eje */}
            <RegionPath
              d="M100 155 L148 158 L155 190 L120 205 L95 185 Z"
              zona={ZONAS_MAPA.find((z) => z.svgId === "eje")!}
              active={zona.svgId === "eje"}
              onSelect={setZonaId}
            />
            {/* Andina oriente (Santander) */}
            <RegionPath
              d="M175 95 L215 90 L235 130 L210 160 L170 145 Z"
              zona={ZONAS_MAPA.find((z) => z.svgId === "andina-oriente")!}
              active={zona.svgId === "andina-oriente"}
              onSelect={setZonaId}
            />
            {/* Andina centro (Bogotá/Cundinamarca) */}
            <RegionPath
              d="M145 175 L195 165 L210 210 L175 235 L140 220 Z"
              zona={ZONAS_MAPA.find((z) => z.svgId === "andina-centro")!}
              active={zona.svgId === "andina-centro"}
              onSelect={setZonaId}
            />
            {/* Pacífico / Valle */}
            <RegionPath
              d="M70 175 L110 190 L115 240 L80 255 L55 220 Z"
              zona={ZONAS_MAPA.find((z) => z.svgId === "pacifico")!}
              active={zona.svgId === "pacifico"}
              onSelect={setZonaId}
            />
            {/* Andina sur (Huila) */}
            <RegionPath
              d="M140 235 L175 240 L180 280 L145 295 L125 265 Z"
              zona={ZONAS_MAPA.find((z) => z.svgId === "andina-sur")!}
              active={zona.svgId === "andina-sur"}
              onSelect={setZonaId}
            />
            {/* Orinoquía */}
            <RegionPath
              d="M210 170 L280 160 L300 230 L240 250 L200 220 Z"
              zona={ZONAS_MAPA.find((z) => z.svgId === "orinoquia")!}
              active={zona.svgId === "orinoquia"}
              onSelect={setZonaId}
            />
            {/* Amazonía */}
            <RegionPath
              d="M150 295 L210 280 L260 320 L220 370 L140 360 L120 320 Z"
              zona={ZONAS_MAPA.find((z) => z.svgId === "amazonia")!}
              active={zona.svgId === "amazonia"}
              onSelect={setZonaId}
            />

            {/* City pins / labels */}
            <CityPin x={168} y={198} label="Bogotá" />
            <CityPin x={160} y={188} label="Chía" r={3} />
            <CityPin x={120} y={118} label="Medellín" />
            <CityPin x={85} y={215} label="Cali" />
            <CityPin x={132} y={48} label="Baq" />
            <CityPin x={185} y={28} label="Guajira" r={3} />
            <CityPin x={195} y={72} label="Valledupar" r={3} />
            <CityPin x={200} y={120} label="BGA" />
            <CityPin x={155} y={265} label="Neiva" />
          </svg>

          <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-navy/60">
            <LegendDot color="#2d6a4f" label="Prioridad alta" />
            <LegendDot color="#c4a35a" label="Media" />
            <LegendDot color="#8a9bb0" label="Baja" />
          </div>
        </div>
      </div>

      <PanelZona zona={zona} compact={compact} />
    </div>
  );
}

function RegionPath({
  d,
  zona,
  active,
  onSelect,
}: {
  d: string;
  zona: ZonaMapa;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const fill = prioridadColor(zona.prioridad);
  return (
    <path
      d={d}
      fill={fill}
      fillOpacity={active ? 0.95 : 0.52}
      stroke={active ? "#1a2b4a" : "#ffffff"}
      strokeWidth={active ? 3 : 1.2}
      filter={active ? "url(#mapa-selected-glow)" : undefined}
      className={`cursor-pointer outline-none transition-[fill-opacity,stroke-width] duration-200 hover:fill-opacity-90 focus-visible:stroke-[#1a2b4a] focus-visible:stroke-[3] ${
        active ? "mapa-region-pulse" : ""
      }`}
      style={{ cursor: "pointer" }}
      onClick={() => onSelect(zona.id)}
      role="button"
      tabIndex={0}
      aria-label={`${zona.nombre}, prioridad ${prioridadLabel(zona.prioridad)}${
        active ? ", seleccionada" : ""
      }`}
      aria-pressed={active}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(zona.id);
        }
      }}
    >
      <title>
        {zona.nombre} · prioridad {prioridadLabel(zona.prioridad)}
      </title>
    </path>
  );
}

function CityPin({
  x,
  y,
  label,
  r = 4,
}: {
  x: number;
  y: number;
  label: string;
  r?: number;
}) {
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r={r} fill="#1a2b4a" stroke="#fff" strokeWidth={1} />
      <text
        x={x + 6}
        y={y + 3}
        fontSize="8"
        fill="#1a2b4a"
        fontWeight={600}
      >
        {label}
      </text>
    </g>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block h-2.5 w-2.5 rounded-sm"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function fmtN(n: number | null): string {
  if (n == null) return "N/D";
  return `~${n.toLocaleString("es-CO")}`;
}

function EstimadoBadge() {
  return (
    <span
      className="ml-1 inline-block rounded px-1 text-[9px] font-bold uppercase tracking-wide"
      style={{ background: "#f5e6c8", color: "#9a6b1a" }}
    >
      ESTIMADO
    </span>
  );
}

function MetricCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-cream px-3 py-2">
      <div className="flex flex-wrap items-center gap-1 text-[10px] uppercase tracking-wide text-navy/45">
        <span>{title}</span>
        <EstimadoBadge />
      </div>
      <div className="text-xl font-bold tabular-nums text-navy">{value}</div>
      <div className="text-[11px] leading-snug text-navy/55">{note}</div>
    </div>
  );
}

function PanelZona({ zona, compact }: { zona: ZonaMapa; compact?: boolean }) {
  return (
    <div
      className={`rounded-[10px] border border-border bg-cream-card ${
        compact ? "p-3" : "p-4"
      }`}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-navy/45">
            {zona.tipo === "departamento" ? "Departamento / zona" : "Región"}
          </div>
          <h3 className="m-0 text-lg font-bold text-navy">{zona.nombre}</h3>
          {zona.ciudadesAncla.length > 0 && (
            <div className="mt-0.5 text-xs text-navy/60">
              Ancla: {zona.ciudadesAncla.join(" · ")}
            </div>
          )}
        </div>
        <span
          className="rounded-full border px-2.5 py-0.5 text-[11px] font-bold"
          style={{
            background: prioridadColor(zona.prioridad),
            color: "#ffffff",
            borderColor: prioridadColor(zona.prioridad),
          }}
        >
          Prioridad {prioridadLabel(zona.prioridad)}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <MetricCard
          title="Alumnos / docentes potenciales"
          value={fmtN(zona.alumnosPotenciales)}
          note={zona.alumnosNota}
        />
        <MetricCard
          title="Directivos interesados"
          value={fmtN(zona.directivosInteresados)}
          note={zona.directivosNota}
        />
      </div>

      <div className="mt-2 rounded-lg border border-border/70 bg-cream px-3 py-2">
        <div className="flex flex-wrap items-center gap-1 text-[10px] uppercase tracking-wide text-navy/45">
          <span>Financiadores</span>
          <EstimadoBadge />
        </div>
        <div className="mt-1 flex flex-wrap gap-3">
          <div>
            <div className="text-lg font-bold tabular-nums text-navy">
              {fmtN(zona.financiadoresColegios)}
            </div>
            <div className="text-[11px] text-navy/60">Colegios que pagan</div>
          </div>
          <div className="text-navy/25">|</div>
          <div>
            <div className="text-lg font-bold tabular-nums text-navy">
              {fmtN(zona.financiadoresPublicos)}
            </div>
            <div className="text-[11px] text-navy/60">
              Secretarías / alcaldías
            </div>
          </div>
        </div>
        <div className="mt-1 text-[11px] leading-snug text-navy/55">
          {zona.financiadoresNota}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[10px] font-bold uppercase tracking-wide text-navy/45">
          Ofertas Unisabana para financiadores
        </div>
        <ul className="mt-1.5 mb-0 list-none space-y-1.5 p-0">
          {zona.ofertasUnisabana.map((o) => (
            <li
              key={o}
              className="rounded-md border border-navy/10 bg-[#eef2f8] px-2.5 py-1.5 text-[12px] leading-snug text-navy/85"
            >
              <span className="mr-1.5 font-bold text-navy" aria-hidden>
                •
              </span>
              {o}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3">
        <div className="text-[10px] font-bold uppercase tracking-wide text-navy/45">
          Principal competencia en la región
        </div>
        <ul className="mt-1.5 mb-0 list-none space-y-1.5 p-0">
          {zona.competenciaPrincipal.map((c) => (
            <li
              key={c.nombre}
              className="rounded-md border border-border/80 bg-white/70 px-2.5 py-1.5"
            >
              <div className="text-sm font-semibold text-navy">{c.nombre}</div>
              <div className="text-[11px] leading-snug text-navy/60">
                {c.nota}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {zona.docentesEstimado != null && (
        <div className="mt-3 text-[11px] text-navy/50">
          Universo docente regional: ~{zona.docentesEstimado.toLocaleString("es-CO")}{" "}
          <span className="font-medium">· {zona.docentesNota}</span>
        </div>
      )}

      <p className="mt-3 mb-0 rounded-lg border border-navy/10 bg-[#eef2f8] px-3 py-2 text-sm leading-relaxed text-navy">
        <strong>Cómo comemos aquí:</strong> {zona.mensajeComercial}
      </p>
    </div>
  );
}
