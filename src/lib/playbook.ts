/**
 * Playbook comercial Ivan · golden rule del producto (demo-quality, ES).
 * Embudo dual: Financiador vs Interesado · mismos stages; nextStep distinto.
 */

import type { Audiencia } from "./types";

/** Etapas CRM alineadas al playbook */
export type EtapaPlaybook =
  | "barrido_nuevo"
  | "primer_acercamiento"
  | "esperando_respuesta"
  | "respondio"
  | "siguiente_paso"
  | "propuesta_brochure"
  | "seguimiento"
  | "cerrado_ganado"
  | "cerrado_frio";

export type NextStepPlaybook =
  | "visita_financiador"
  | "video_llamada"
  | "desayuno_campus"
  | "enviar_brochure"
  | "enviar_propuesta"
  | "ninguno";

export const ETAPAS_PLAYBOOK: EtapaPlaybook[] = [
  "barrido_nuevo",
  "primer_acercamiento",
  "esperando_respuesta",
  "respondio",
  "siguiente_paso",
  "propuesta_brochure",
  "seguimiento",
  "cerrado_ganado",
  "cerrado_frio",
];

export const ETAPA_LABEL: Record<EtapaPlaybook, string> = {
  barrido_nuevo: "Barrido nuevo",
  primer_acercamiento: "Primer acercamiento",
  esperando_respuesta: "Esperando respuesta",
  respondio: "Respondió",
  siguiente_paso: "Siguiente paso",
  propuesta_brochure: "Propuesta / brochure",
  seguimiento: "Seguimiento",
  cerrado_ganado: "Cerrado ganado",
  cerrado_frio: "Cerrado frío",
};

export const NEXT_STEPS: NextStepPlaybook[] = [
  "visita_financiador",
  "video_llamada",
  "desayuno_campus",
  "enviar_brochure",
  "enviar_propuesta",
  "ninguno",
];

export const NEXT_STEP_LABEL: Record<NextStepPlaybook, string> = {
  visita_financiador: "Visita financiador",
  video_llamada: "Video llamada",
  desayuno_campus: "Desayuno campus",
  enviar_brochure: "Enviar brochure",
  enviar_propuesta: "Enviar propuesta",
  ninguno: "Ninguno",
};

/** Regla de oro UI: visita_financiador solo financiadores; interesados → video o desayuno */
export const REGLA_NEXT_STEP =
  "visita_financiador solo para financiadores; interesados usan video_llamada o desayuno_campus.";

export const REGLA_DUAL_FUNNEL =
  "Embudo dual: Financiador (cupos / secretarías) vs Interesado (docente). Mismos stages del playbook; el siguiente paso cambia según rol.";

export const REGLA_EQUILIBRIO =
  "S1–S2 priorizan financiadores hasta equilibrio (~10 cupos/programa). S2–S4 abren docentes/interesados.";

export const COLA_NUEVOS_CAP_DIA = 15;

/** Canales: barrido (encontrar) vs toque (contactar) */
export const CANALES_BARRIDO =
  "Barrido: LinkedIn search · correos en sitios de colegio/secretaría/gobernación · landings form/pauta · base facultad.";

export const CANALES_TOQUE =
  "Toque: Outlook email · borrador LinkedIn · WhatsApp. Llamada IA = solo soporte. Visita financiador / desayuno campus = pasos posteriores (no barrido).";

export const CANALES_PLAYBOOK_RESUMEN =
  "Barrido encuentra; toque contacta. Visita financiador y desayuno van después de responder.";


export const COLA_CAP_COPY = `Cola demo · tope ~${COLA_NUEVOS_CAP_DIA} nuevos fríos/día (no saturar). Respondieron van primero.`;

/** Legacy → playbook etapa */
const LEGACY_ETAPA: Record<string, EtapaPlaybook> = {
  contacto: "barrido_nuevo",
  interes: "respondio",
  interés: "respondio",
  agendada: "siguiente_paso",
  visita: "siguiente_paso",
  "post-visita": "seguimiento",
  aplicacion: "propuesta_brochure",
  matricula: "cerrado_ganado",
  matrícula: "cerrado_ganado",
  barrido_nuevo: "barrido_nuevo",
  primer_acercamiento: "primer_acercamiento",
  esperando_respuesta: "esperando_respuesta",
  respondio: "respondio",
  siguiente_paso: "siguiente_paso",
  propuesta_brochure: "propuesta_brochure",
  seguimiento: "seguimiento",
  cerrado_ganado: "cerrado_ganado",
  cerrado_frio: "cerrado_frio",
};

export function isEtapaPlaybook(v: unknown): v is EtapaPlaybook {
  return typeof v === "string" && (ETAPAS_PLAYBOOK as string[]).includes(v);
}

export function normalizeEtapa(raw?: string | null): EtapaPlaybook {
  if (!raw) return "barrido_nuevo";
  const key = raw.toLowerCase().trim();
  if (LEGACY_ETAPA[key]) return LEGACY_ETAPA[key];
  if (isEtapaPlaybook(key)) return key;
  return "barrido_nuevo";
}

export function labelEtapa(raw?: string | null): string {
  const e = normalizeEtapa(raw);
  return ETAPA_LABEL[e];
}

export function isNextStep(v: unknown): v is NextStepPlaybook {
  return typeof v === "string" && (NEXT_STEPS as string[]).includes(v);
}

export function normalizeNextStep(
  raw?: string | null,
  audiencia?: Audiencia | string | null
): NextStepPlaybook {
  if (isNextStep(raw)) {
    if (raw === "visita_financiador" && audiencia === "estudiante") {
      return "desayuno_campus";
    }
    return raw;
  }
  return "ninguno";
}

export function nextStepsForAudiencia(
  audiencia: Audiencia | string | null | undefined
): NextStepPlaybook[] {
  if (audiencia === "financiador") {
    return [
      "visita_financiador",
      "enviar_propuesta",
      "enviar_brochure",
      "video_llamada",
      "ninguno",
    ];
  }
  // interesado / estudiante
  return [
    "video_llamada",
    "desayuno_campus",
    "enviar_brochure",
    "enviar_propuesta",
    "ninguno",
  ];
}

export function audienciaLabel(a?: Audiencia | string | null): string {
  return a === "financiador" ? "Financiador" : "Interesado";
}

/** Plan 4 semanas · zona activa (Neiva / Huila) */
export type SemanaZonaEstado = "hecho" | "activa" | "planeada" | "bloqueada";

export type SemanaZona = {
  semana: 1 | 2 | 3 | 4;
  etiqueta: string;
  rango: string;
  foco: string;
  audienciaPrioritaria: "financiador" | "mixto" | "interesado";
  meta: string;
  estado: SemanaZonaEstado;
  nota?: string;
};

export const ZONA_ACTIVA = {
  id: "neiva-huila",
  nombre: "Neiva / Huila",
  equilibrioPorPrograma: 10,
  cuposActuales: 12,
  cuposEquilibrioPortfolio: 40,
} as const;

export const PLAN_4_SEMANAS_ZONA: SemanaZona[] = [
  {
    semana: 1,
    etiqueta: "S1",
    rango: "1–7 sep 2026",
    foco: "Barrido financiadores · cartas Secretaría / Normal",
    audienciaPrioritaria: "financiador",
    meta: "Abrir 6 financiadores · 0 docentes fríos masivos",
    estado: "hecho",
    nota: "Lock: solo financiadores hasta avanzar equilibrio",
  },
  {
    semana: 2,
    etiqueta: "S2",
    rango: "8–14 sep 2026",
    foco: "Cerrar cupos financiados → umbral ~10/programa",
    audienciaPrioritaria: "mixto",
    meta: "Llevar cupos a ≥10/programa · abrir 1ª ola docentes",
    estado: "activa",
    nota: "Equilibrio lock: docentes solo si cupos rumbo a 10/programa",
  },
  {
    semana: 3,
    etiqueta: "S3",
    rango: "15–21 sep 2026",
    foco: "Docentes / interesados · video + desayuno campus",
    audienciaPrioritaria: "interesado",
    meta: "25 conversaciones · 8 desayunos/video",
    estado: "planeada",
  },
  {
    semana: 4,
    etiqueta: "S4",
    rango: "22–28 sep 2026",
    foco: "Brochure / propuesta · seguimiento · cierre frío",
    audienciaPrioritaria: "interesado",
    meta: "Pipeline caliente + reactivar fríos D+14",
    estado: "planeada",
  },
];

export const SEMANA_ZONA_ACTIVA =
  PLAN_4_SEMANAS_ZONA.find((s) => s.estado === "activa")!;

export type ColaPlaybookItem = {
  id: string;
  leadId: string;
  leadNombre: string;
  colegio: string;
  zona: string;
  audiencia: Audiencia;
  origen: string;
  origenLabel: string;
  agente: string;
  mensajeSugerido: string;
  etapa: EtapaPlaybook;
  nextStep: NextStepPlaybook;
  nextStepFecha: string;
};

export type RespondioHoyItem = {
  id: string;
  leadId: string;
  leadNombre: string;
  colegio: string;
  audiencia: Audiencia;
  origen: string;
  origenLabel: string;
  resumenAgente: string;
  etapa: EtapaPlaybook;
  nextStep: NextStepPlaybook;
  nextStepFecha: string;
  botones: NextStepPlaybook[];
};

/** Cola del playbook · nuevos / fríos (cap ~15/día en copy) */
export const COLA_PLAYBOOK_DEMO: ColaPlaybookItem[] = [
  {
    id: "cola-1",
    leadId: "l13",
    leadNombre: "Secretaría Educación · Huila",
    colegio: "Secretaría de Educación Huila",
    zona: "Neiva",
    audiencia: "financiador",
    origen: "convenio_region",
    origenLabel: "Convenio / región",
    agente: "Agente Región",
    mensajeSugerido:
      "Estimada Secretaría: retomo cupos cohorte 2027-1 Neiva. ¿Agendamos visita financiador esta semana para cerrar los 8 cupos en negociación?",
    etapa: "esperando_respuesta",
    nextStep: "visita_financiador",
    nextStepFecha: "2026-09-12",
  },
  {
    id: "cola-2",
    leadId: "l14",
    leadNombre: "Docente · Normal Superior Neiva",
    colegio: "IE Normal Superior de Neiva",
    zona: "Neiva",
    audiencia: "estudiante",
    origen: "base_facultad",
    origenLabel: "Base facultad",
    agente: "Agente Captación",
    mensajeSugerido:
      "Hola, soy de Facultad de Educación Unisabana. ¿Le parece un desayuno campus Chía o una video llamada de 20 min sobre Maestría en Educación 2027-1?",
    etapa: "barrido_nuevo",
    nextStep: "desayuno_campus",
    nextStepFecha: "2026-09-13",
  },
  {
    id: "cola-3",
    leadId: "l15",
    leadNombre: "Coordinación · colegio Neiva",
    colegio: "Colegio demo Neiva",
    zona: "Neiva",
    audiencia: "estudiante",
    origen: "pauta_meta",
    origenLabel: "Pauta Meta",
    agente: "Agente Captación",
    mensajeSugerido:
      "Vimos su interés en Pedagogía (pauta). ¿Le envío el brochure 2027-1 y agendamos video llamada?",
    etapa: "primer_acercamiento",
    nextStep: "enviar_brochure",
    nextStepFecha: "2026-09-11",
  },
  {
    id: "cola-4",
    leadId: "l8",
    leadNombre: "Dirección Tilatá",
    colegio: "Colegio Tilatá",
    zona: "La Calera",
    audiencia: "estudiante",
    origen: "base_facultad",
    origenLabel: "Base facultad",
    agente: "Agente Orquestadora",
    mensajeSugerido:
      "Primer acercamiento Dirección y Gestión · La Calera. Mensaje corto + brochure; sin visita financiador.",
    etapa: "barrido_nuevo",
    nextStep: "enviar_brochure",
    nextStepFecha: "2026-09-15",
  },
  {
    id: "cola-5",
    leadId: "l1",
    leadNombre: "Rectoría San Viator",
    colegio: "Colegio San Viator",
    zona: "Usaquén",
    audiencia: "financiador",
    origen: "linkedin",
    origenLabel: "LinkedIn orgánico",
    agente: "Agente Captación",
    mensajeSugerido:
      "LinkedIn → mismo playbook. Email frío rectoría: cupos docentes colegio + posible visita financiador si hay interés de becas internas.",
    etapa: "barrido_nuevo",
    nextStep: "visita_financiador",
    nextStepFecha: "2026-09-11",
  },
];

/** Respondieron hoy · van ARRIBA de la cola de nuevos */
export const RESPONDIERON_HOY_DEMO: RespondioHoyItem[] = [
  {
    id: "resp-1",
    leadId: "l13",
    leadNombre: "Secretaría Educación · Huila",
    colegio: "Secretaría de Educación Huila",
    audiencia: "financiador",
    origen: "convenio_region",
    origenLabel: "Convenio / región",
    resumenAgente:
      "Respondió: disponible jueves AM para visita. Cupos 8 en negociación. Orquestadora sugiere visita_financiador.",
    etapa: "respondio",
    nextStep: "visita_financiador",
    nextStepFecha: "2026-09-11",
    botones: ["visita_financiador", "enviar_propuesta", "ninguno"],
  },
  {
    id: "resp-2",
    leadId: "l14",
    leadNombre: "Docente · Normal Superior Neiva",
    colegio: "IE Normal Superior de Neiva",
    audiencia: "estudiante",
    origen: "base_facultad",
    origenLabel: "Base facultad",
    resumenAgente:
      "Respondió por WA: quiere conocer campus. Admisiones sugiere desayuno_campus (no visita_financiador).",
    etapa: "respondio",
    nextStep: "desayuno_campus",
    nextStepFecha: "2026-09-13",
    botones: ["desayuno_campus", "video_llamada", "enviar_brochure"],
  },
  {
    id: "resp-3",
    leadId: "l15",
    leadNombre: "Coordinación · colegio Neiva",
    colegio: "Colegio demo Neiva",
    audiencia: "estudiante",
    origen: "pauta_meta",
    origenLabel: "Pauta Meta",
    resumenAgente:
      "Lead pauta Meta · pidió brochure Pedagogía. Misma etapa playbook que base/LinkedIn.",
    etapa: "propuesta_brochure",
    nextStep: "enviar_brochure",
    nextStepFecha: "2026-09-10",
    botones: ["enviar_brochure", "video_llamada", "ninguno"],
  },
];

export function estadoZonaPill(estado: SemanaZonaEstado): string {
  switch (estado) {
    case "hecho":
      return "Hecho";
    case "activa":
      return "Activa";
    case "bloqueada":
      return "Bloqueada";
    default:
      return "Planeada";
  }
}
