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
        <div className="mb-2 flex flex-wrap gap-1.5">
          {CIUDADES_CHIP.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setZonaId(c.zonaId)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                zonaId === c.zonaId
                  ? "border-navy bg-navy text-white"
                  : "border-border bg-cream-card text-navy/75 hover:bg-cream"
              }`}
            >
              {c.label}
            </button>
          ))}
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
            aria-label="Mapa comercial Colombia por regiones"
          >
            <title>Mapa comercial Colombia</title>
            {/* Caribe */}
            <RegionPath
              d="M110 28 L175 22 L210 48 L195 78 L140 85 L105 60 Z"
              zona={ZONAS_MAPA.find((z) => z.svgId === "caribe")!}
              active={zona.svgId === "caribe"}
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

            {/* City pins */}
            <CityPin x={168} y={198} label="Bogotá" />
            <CityPin x={160} y={188} label="Chía" r={3} />
            <CityPin x={120} y={118} label="Medellín" />
            <CityPin x={85} y={215} label="Cali" />
            <CityPin x={155} y={48} label="Baq" />
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
      fillOpacity={active ? 0.92 : 0.55}
      stroke={active ? "#1a2b4a" : "#fff"}
      strokeWidth={active ? 2.5 : 1.2}
      className="cursor-pointer transition-opacity hover:opacity-100"
      onClick={() => onSelect(zona.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(zona.id);
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
    <g>
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

function PanelZona({ zona, compact }: { zona: ZonaMapa; compact?: boolean }) {
  return (
    <div
      className={`rounded-[10px] border border-border bg-cream-card ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-navy/45">
            {zona.tipo === "departamento" ? "Departamento / zona" : "Región"}
          </div>
          <h3 className="m-0 text-lg font-bold">{zona.nombre}</h3>
        </div>
        <span
          className="rounded-full border px-2.5 py-0.5 text-[11px] font-bold text-white"
          style={{ background: prioridadColor(zona.prioridad) }}
        >
          Prioridad {prioridadLabel(zona.prioridad)}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-cream px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-navy/45">
            Docentes
          </div>
          <div className="text-xl font-bold">
            {zona.docentesEstimado != null
              ? `~${zona.docentesEstimado.toLocaleString("es-CO")}`
              : "N/D"}
          </div>
          <div className="text-[11px] leading-snug text-navy/55">
            {zona.docentesNota}
          </div>
        </div>
        <div className="rounded-lg bg-cream px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-navy/45">
            Ciudades ancla
          </div>
          <div className="mt-1 text-sm font-medium">
            {zona.ciudadesAncla.length
              ? zona.ciudadesAncla.join(" · ")
              : "—"}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[10px] font-bold uppercase tracking-wide text-navy/45">
          Competencia local
        </div>
        <ul className="mt-1 mb-0 list-disc space-y-0.5 pl-4 text-sm text-navy/80">
          {zona.competenciaLocal.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <p className="mt-3 mb-0 rounded-lg border border-navy/10 bg-[#eef2f8] px-3 py-2 text-sm leading-relaxed">
        <strong>Cómo comemos aquí:</strong> {zona.mensajeComercial}
      </p>
    </div>
  );
}
