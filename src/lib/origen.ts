import type { Lead } from "./types";

/** Adquisición / attribution — de dónde viene el lead */
export type Origen =
  | "base_facultad"
  | "linkedin"
  | "pauta_meta"
  | "pauta_linkedin"
  | "referido"
  | "convenio_region"
  | "web"
  | "otro";

export const ORIGENES: Origen[] = [
  "base_facultad",
  "linkedin",
  "pauta_meta",
  "pauta_linkedin",
  "referido",
  "convenio_region",
  "web",
  "otro",
];

export const ORIGEN_LABEL: Record<Origen, string> = {
  base_facultad: "Base facultad",
  linkedin: "LinkedIn orgánico",
  pauta_meta: "Pauta Meta",
  pauta_linkedin: "Pauta LinkedIn",
  referido: "Referido",
  convenio_region: "Convenio / región",
  web: "Web / formulario",
  otro: "Otro",
};

export const ORIGEN_BADGE_CLASS: Record<Origen, string> = {
  base_facultad: "border-navy/25 bg-[#eef2f8] text-navy/80",
  linkedin: "border-[#0a66c2]/30 bg-[#e8f1fa] text-[#0a66c2]",
  pauta_meta: "border-[#1877f2]/30 bg-[#e7f0fe] text-[#1877f2]",
  pauta_linkedin: "border-[#0a66c2]/35 bg-[#dceaf8] text-[#084d92]",
  referido: "border-ok/30 bg-[#e8f5ee] text-ok",
  convenio_region: "border-gold/45 bg-[#f8f1de] text-warn",
  web: "border-border bg-cream text-navy/70",
  otro: "border-border bg-[#f3f3f3] text-navy/55",
};

/** Base existente vs demanda nueva (LinkedIn + pauta) */
export const ORIGEN_BASE: Origen[] = ["base_facultad", "referido", "convenio_region", "web", "otro"];
export const ORIGEN_DEMANDA_NUEVA: Origen[] = ["linkedin", "pauta_meta", "pauta_linkedin"];

/** Gasto EJEMPLO (COP) por canal de pauta — sin Ads API */
export const SPEND_EJEMPLO: Record<"pauta_meta" | "pauta_linkedin", number> = {
  pauta_meta: 12_500_000,
  pauta_linkedin: 8_200_000,
};

const LEGACY_CANAL_TO_ORIGEN: Record<string, Origen> = {
  email: "base_facultad",
  whatsapp: "base_facultad",
  telefono: "base_facultad",
  visita: "base_facultad",
  linkedin: "linkedin",
  region: "convenio_region",
  web: "web",
  referido: "referido",
  pauta_meta: "pauta_meta",
  pauta_linkedin: "pauta_linkedin",
  base_facultad: "base_facultad",
  convenio_region: "convenio_region",
  otro: "otro",
};

export function isOrigen(v: unknown): v is Origen {
  return typeof v === "string" && (ORIGENES as string[]).includes(v);
}

export function normalizeOrigen(
  raw?: string | null,
  canalOrigen?: string | null
): Origen {
  if (isOrigen(raw)) return raw;
  if (raw && LEGACY_CANAL_TO_ORIGEN[raw]) return LEGACY_CANAL_TO_ORIGEN[raw];
  if (canalOrigen && LEGACY_CANAL_TO_ORIGEN[canalOrigen]) {
    return LEGACY_CANAL_TO_ORIGEN[canalOrigen];
  }
  return "otro";
}

export function labelOrigen(o: string): string {
  return isOrigen(o) ? ORIGEN_LABEL[o] : o;
}

type FunnelMini = {
  contactados: number;
  respondieron: number;
  visita: number;
  matricula: number;
};

export type OrigenRow = {
  origen: Origen;
  label: string;
  count: number;
  funnel: FunnelMini;
};

export type AttributionSnapshot = {
  total: number;
  byOrigen: OrigenRow[];
  baseExistente: { count: number; pct: number; matriculas: number };
  demandaNueva: { count: number; pct: number; matriculas: number };
  spendEjemplo: {
    pauta_meta: number;
    pauta_linkedin: number;
    total: number;
  };
  cacEjemplo: {
    pauta_meta: number | null;
    pauta_linkedin: number | null;
  };
};

const RESPONDIO = new Set([
  "interes",
  "interés",
  "agendada",
  "visita",
  "post-visita",
  "aplicacion",
  "matrícula",
  "matricula",
]);
const VISITA = new Set([
  "agendada",
  "visita",
  "post-visita",
  "aplicacion",
  "matrícula",
  "matricula",
]);
const MATRICULA = new Set(["matricula", "matrícula", "aplicacion"]);

function funnelFromLeads(leads: Lead[]): FunnelMini {
  const contactados = leads.length;
  let respondieron = 0;
  let visita = 0;
  let matricula = 0;
  for (const l of leads) {
    const etapa = (l.etapaFunnel || "").toLowerCase();
    if (RESPONDIO.has(etapa) || l.opened) respondieron += 1;
    if (VISITA.has(etapa) || l.visitado) visita += 1;
    if (MATRICULA.has(etapa)) matricula += 1;
  }
  return { contactados, respondieron, visita, matricula };
}

/** Deriva atribución desde leads del store; spend/CAC son EJEMPLO. */
export function buildAttribution(leads: Lead[]): AttributionSnapshot {
  const groups = new Map<Origen, Lead[]>();
  for (const o of ORIGENES) groups.set(o, []);
  for (const l of leads) {
    const o = normalizeOrigen(l.origen, l.canalOrigen);
    groups.get(o)!.push(l);
  }

  const byOrigen: OrigenRow[] = ORIGENES.map((origen) => {
    const list = groups.get(origen) || [];
    return {
      origen,
      label: ORIGEN_LABEL[origen],
      count: list.length,
      funnel: funnelFromLeads(list),
    };
  }).filter((r) => r.count > 0 || ORIGEN_DEMANDA_NUEVA.includes(r.origen) || r.origen === "base_facultad");

  const total = leads.length || 1;
  const baseLeads = leads.filter((l) =>
    ORIGEN_BASE.includes(normalizeOrigen(l.origen, l.canalOrigen))
  );
  const demandaLeads = leads.filter((l) =>
    ORIGEN_DEMANDA_NUEVA.includes(normalizeOrigen(l.origen, l.canalOrigen))
  );
  const baseFunnel = funnelFromLeads(baseLeads);
  const demandaFunnel = funnelFromLeads(demandaLeads);

  const matMeta =
    byOrigen.find((r) => r.origen === "pauta_meta")?.funnel.matricula || 0;
  const matLi =
    byOrigen.find((r) => r.origen === "pauta_linkedin")?.funnel.matricula || 0;

  return {
    total: leads.length,
    byOrigen,
    baseExistente: {
      count: baseLeads.length,
      pct: Math.round((baseLeads.length / total) * 100),
      matriculas: baseFunnel.matricula,
    },
    demandaNueva: {
      count: demandaLeads.length,
      pct: Math.round((demandaLeads.length / total) * 100),
      matriculas: demandaFunnel.matricula,
    },
    spendEjemplo: {
      pauta_meta: SPEND_EJEMPLO.pauta_meta,
      pauta_linkedin: SPEND_EJEMPLO.pauta_linkedin,
      total: SPEND_EJEMPLO.pauta_meta + SPEND_EJEMPLO.pauta_linkedin,
    },
    cacEjemplo: {
      pauta_meta: matMeta > 0 ? Math.round(SPEND_EJEMPLO.pauta_meta / matMeta) : null,
      pauta_linkedin:
        matLi > 0 ? Math.round(SPEND_EJEMPLO.pauta_linkedin / matLi) : null,
    },
  };
}

export function formatCopCorto(cop: number): string {
  if (cop >= 1_000_000) {
    const m = cop / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  return `$${cop.toLocaleString("es-CO")}`;
}
