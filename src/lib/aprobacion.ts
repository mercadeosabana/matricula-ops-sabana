/**
 * Cards de aprobación para /mi-dia (live + demo).
 * Los agentes preparan; Natalia aprueba — no hay envío real desde aquí.
 */
import type { CanalDemo, CardAprobar } from "./demo-aprobacion";
import type { Lead } from "./types";

export type EstadoAprobacion = "pendiente" | "aprobada" | "programado";

export type EtiquetaAprobacion =
  | "Primer contacto"
  | "Follow-up D+3"
  | "Follow-up D+7"
  | string;

/** Card persistida en el store (live). Compatible con CardAprobar de demo. */
export type AprobacionCard = CardAprobar & {
  leadId?: string | null;
  estado: EstadoAprobacion;
  /** YYYY-MM-DD cuando el follow-up queda activo */
  scheduledFor?: string | null;
  etiqueta?: EtiquetaAprobacion;
  createdAt: string;
  approvedAt?: string | null;
  source: "live" | "demo";
};

function bogotaDatePlus(days: number, fromIso?: string): string {
  const base = fromIso ? new Date(fromIso) : new Date();
  // Work in America/Bogota calendar day
  const bogota = new Date(
    base.toLocaleString("en-US", { timeZone: "America/Bogota" })
  );
  bogota.setDate(bogota.getDate() + days);
  const y = bogota.getFullYear();
  const m = String(bogota.getMonth() + 1).padStart(2, "0");
  const d = String(bogota.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayBogota(): string {
  return bogotaDatePlus(0);
}

function canalForLead(lead: Lead): CanalDemo {
  if (lead.email) return "Correo";
  if (lead.telefonoWa) return "WA";
  return "Correo";
}

function programaCorto(programa: string | null): string {
  if (!programa) return "maestría";
  if (programa.includes("Pedagogía")) return "Pedagogía";
  if (programa.includes("Dirección") || programa.includes("Gestión"))
    return "Dir. y Gestión";
  if (programa.includes("Infantil")) return "Des. Infantil";
  if (programa.includes("Educación")) return "Educación";
  return programa;
}

function isStand(lead: Lead): boolean {
  return (lead.origen || "").toLowerCase() === "stand_evento";
}

function standWhy(lead: Lead): string {
  const prog = programaCorto(lead.programaInteres);
  if (isStand(lead)) {
    return `Lead del stand ASOCOPI Bucaramanga. Interés en ${prog}. Brochure + video/llamada antes de que baje el interés.`;
  }
  return `Lead caliente inbound (${lead.origen || "pauta"}). Brochure + video antes de que baje el interés.`;
}

/** Appends brochure URL line if present and not already in the preview. */
export function appendBrochureLine(
  preview: string,
  brochureUrl?: string | null
): string {
  const url = (brochureUrl || "").trim();
  if (!url) return preview;
  if (preview.includes(url)) return preview;
  return `${preview.trimEnd()}\n\nBrochure: ${url}`;
}

function firstContactPreview(
  lead: Lead,
  brochureUrl?: string | null
): string {
  const prog = programaCorto(lead.programaInteres);
  const name = lead.nombre.split(" ")[0] || lead.nombre;
  let body: string;
  if (isStand(lead)) {
    body = `Hola ${name}: gracias por acercarte al stand Unisabana en ASOCOPI Bucaramanga. Te comparto el brochure de ${prog} 2027-1. ¿Agendamos un video corto o una llamada esta semana?\n\n— Laura Natalia · Mercadeo (laura.bobadilla@unisabana.edu.co)`;
  } else {
    body = `Hola ${name}: vimos tu interés en ${prog}. Te adjunto brochure 2027-1. ¿Agendamos video de 20 min esta semana?`;
  }
  return appendBrochureLine(body, brochureUrl);
}

function followUpD3Preview(lead: Lead, brochureUrl?: string | null): string {
  const name = lead.nombre.split(" ")[0] || lead.nombre;
  const prog = programaCorto(lead.programaInteres);
  const body = `Hola ${name} 👋 Retomo ${prog} 2027-1 (Unisabana Educación). ¿Pudiste revisar el brochure? ¿Te queda mejor un video esta semana o la próxima?`;
  return appendBrochureLine(body, brochureUrl);
}

function followUpD7Preview(lead: Lead): string {
  const name = lead.nombre.split(" ")[0] || lead.nombre;
  const prog = programaCorto(lead.programaInteres);
  if (isStand(lead)) {
    return `Estimado/a ${name}: hace una semana te enviamos información de ${prog} · Unisabana (stand ASOCOPI). ¿Agendamos 15 min para resolver dudas de admisión y financiación?\n\n— Laura Natalia · Mercadeo (laura.bobadilla@unisabana.edu.co)`;
  }
  return `Estimado/a ${name}: hace una semana te enviamos información de ${prog} · Unisabana. ¿Agendamos 15 min para resolver dudas de admisión y financiación?`;
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export type BuildPlaybookOptions = {
  brochureUrl?: string | null;
};

/** Construye las 3 cards del playbook inbound (primer contacto + D+3 + D+7). */
export function buildInboundPlaybookCards(
  lead: Lead,
  opts?: BuildPlaybookOptions
): AprobacionCard[] {
  const brochureUrl = opts?.brochureUrl ?? null;
  const createdAt = lead.createdAt || new Date().toISOString();
  const d0 = todayBogota();
  const d3 = bogotaDatePlus(3, createdAt);
  const d7 = bogotaDatePlus(7, createdAt);
  const prog = programaCorto(lead.programaInteres);
  const rolOrg = isStand(lead)
    ? `Interesado · ${prog} · Stand ASOCOPI`
    : `Interesado · ${prog} · inbound`;

  const firstCanal = canalForLead(lead);

  const primer: AprobacionCard = {
    id: uid("ap-c0"),
    leadId: lead.id,
    nombre: lead.nombre,
    rolOrg,
    canal: firstCanal,
    why: standWhy(lead),
    preview: firstContactPreview(lead, brochureUrl),
    agente: "Agente Captación",
    estado: "pendiente",
    scheduledFor: d0,
    etiqueta: "Primer contacto",
    createdAt,
    approvedAt: null,
    source: "live",
  };

  const d3Card: AprobacionCard = {
    id: uid("ap-d3"),
    leadId: lead.id,
    nombre: lead.nombre,
    rolOrg,
    canal: "WA",
    why: `Follow-up D+3 (${d3}). Guardian: riesgo de enfriamiento si no se toca.`,
    preview: followUpD3Preview(lead, brochureUrl),
    agente: "Agente Guardian",
    estado: "programado",
    scheduledFor: d3,
    etiqueta: "Follow-up D+3",
    createdAt,
    approvedAt: null,
    source: "live",
  };

  const d7Card: AprobacionCard = {
    id: uid("ap-d7"),
    leadId: lead.id,
    nombre: lead.nombre,
    rolOrg,
    canal: "Correo",
    why: `Follow-up D+7 (${d7}). Toque formal por correo si no hubo respuesta.`,
    preview: followUpD7Preview(lead),
    agente: "Agente Captación",
    estado: "programado",
    scheduledFor: d7,
    etiqueta: "Follow-up D+7",
    createdAt,
    approvedAt: null,
    source: "live",
  };

  return [primer, d3Card, d7Card];
}

/** ¿La card programada ya venció / es de hoy? */
export function isAprobacionDue(card: AprobacionCard, today = todayBogota()): boolean {
  if (card.estado === "aprobada") return false;
  if (card.estado === "pendiente") return true;
  if (!card.scheduledFor) return true;
  return card.scheduledFor <= today;
}
