export type ScoreLabel = "caliente" | "tibio" | "frio";

export type ScoreableLead = {
  cargo: string;
  etapaFunnel: string;
  opened?: boolean;
  visitado?: boolean;
  tags?: string[];
};

/** Reglas simples: cargo + etapa + opened/visita */
export function scoreLead(lead: ScoreableLead): ScoreLabel {
  let pts = 0;
  const cargo = (lead.cargo || "").toLowerCase();
  if (/rector|direcci[oó]n|director/.test(cargo)) pts += 3;
  else if (/coordina|líder|lider/.test(cargo)) pts += 2;
  else pts += 1;

  const etapa = (lead.etapaFunnel || "").toLowerCase();
  if (["matricula", "aplicacion", "post-visita", "visita", "agendada"].includes(etapa))
    pts += 4;
  else if (["interes", "interés"].includes(etapa)) pts += 2;

  if (lead.visitado) pts += 3;
  if (lead.opened) pts += 1;

  const tags = (lead.tags || []).map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes("caliente") || t.includes("hot"))) pts += 2;
  if (tags.some((t) => t.includes("warm") || t.includes("tibio"))) pts += 1;

  if (pts >= 7) return "caliente";
  if (pts >= 4) return "tibio";
  return "frio";
}

export const SCORE_LABEL: Record<ScoreLabel, string> = {
  caliente: "Caliente",
  tibio: "Tibio",
  frio: "Frío",
};

export const SCORE_CLASS: Record<ScoreLabel, string> = {
  caliente: "border-[#c45c2a]/30 bg-[#fde8dc] text-[#9b3410]",
  tibio: "border-warn/30 bg-[#f5e6c8] text-warn",
  frio: "border-border bg-[#eef2f8] text-navy/60",
};

/** Heurística para tareas Hoy: buscar pistas en dest/titulo */
export function scoreFromTareaText(text: string): ScoreLabel {
  const t = (text || "").toLowerCase();
  if (/vermont|warm|post-visita|visita|agend|nueva granada|matr[ií]cula/.test(t))
    return "caliente";
  if (/follow|interes|líder|lider|cajic[aá]|chia|chía|marymount/.test(t))
    return "tibio";
  return "frio";
}
