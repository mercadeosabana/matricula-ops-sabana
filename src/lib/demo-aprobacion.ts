/**
 * Datos demo para /mi-dia y /como-vamos (aprobación producto, sin Azure/WA).
 * Basado en ESTRATEGIA_SEMANA_DEMO · Neiva / Huila.
 */

export type CanalDemo = "Correo" | "WA" | "LinkedIn";

export type CardAprobar = {
  id: string;
  nombre: string;
  rolOrg: string;
  canal: CanalDemo;
  why: string;
  preview: string;
  agente: string;
};

export type CardRespondio = {
  id: string;
  nombre: string;
  rolOrg: string;
  canal: CanalDemo;
  resumen: string;
  nextStep: string;
  nextStepDetail: string;
};

/** Section A — Para aprobar hoy (agentes prepararon) */
export const MI_DIA_APROBAR: CardAprobar[] = [
  {
    id: "a1",
    nombre: "Secretaría de Educación · Huila",
    rolOrg: "Financiador · Neiva",
    canal: "Correo",
    why: "8 cupos en negociación. Región prioriza cierre S2 hacia equilibrio (10).",
    preview:
      "Estimada Secretaría: retomo cupos cohorte 2027-1 Neiva. ¿Agendamos visita financiador esta semana (jue–vie AM)?",
    agente: "Agente Región",
  },
  {
    id: "a2",
    nombre: "Alcaldía de Neiva · Educación",
    rolOrg: "Financiador · piloto cupos",
    canal: "LinkedIn",
    why: "Piloto municipal sin respuesta. Captación sugiere toque corto 15 min.",
    preview:
      "Hola — piloto cupos docentes Neiva 2027-1. ¿15 min esta semana?",
    agente: "Agente Captación",
  },
  {
    id: "a3",
    nombre: "Colegio Santa Librada · Rectoría",
    rolOrg: "Financiador · Neiva",
    canal: "Correo",
    why: "Follow-up D+3. Guardian marca riesgo de enfriamiento si no se toca hoy.",
    preview:
      "Estimada Rectoría: hace tres días enviamos la carta de cupos docentes. ¿Pudieron revisarla? Quedo atenta para visita corta o propuesta.",
    agente: "Agente Guardian",
  },
  {
    id: "a4",
    nombre: "Coordinación · Colegio demo Neiva",
    rolOrg: "Interesado · Pedagogía (pauta Meta)",
    canal: "Correo",
    why: "Lead caliente de pauta. Brochure + video antes de que baje el interés.",
    preview:
      "Vimos su interés en Pedagogía. Le adjunto brochure 2027-1. ¿Agendamos video de 20 min esta semana?",
    agente: "Agente Captación",
  },
  {
    id: "a5",
    nombre: "Docente · INEM Julián Motta Salas",
    rolOrg: "Interesado · Educación · Neiva",
    canal: "LinkedIn",
    why: "Perfil alineado a Maestría en Educación. Primera ola docentes S2.",
    preview:
      "Hola, vi su perfil en educación en Neiva. Abrimos cohorte 2027-1 con opciones de cupo. ¿Video corta esta semana?",
    agente: "Agente Captación",
  },
  {
    id: "a6",
    nombre: "IE Normal Superior · Extensión",
    rolOrg: "Financiador · cupos adicionales",
    canal: "Correo",
    why: "Ya cerraron 3 cupos; Región propone 2 más en Educación.",
    preview:
      "Estimada Extensión: gracias por los 3 cupos. ¿Revisamos 2 adicionales Maestría en Educación el jueves AM?",
    agente: "Agente Región",
  },
  {
    id: "a7",
    nombre: "Gobernación del Huila · Educación",
    rolOrg: "Financiador regional",
    canal: "Correo",
    why: "Convenio territorial en radar. Orquestadora pidió carta corta hoy.",
    preview:
      "Estimada Dirección: retomo convenio territorial maestrías Facultad de Educación · Unisabana. ¿Conversamos 20 min sobre cupos 2027-1?",
    agente: "Agente Región",
  },
  {
    id: "a8",
    nombre: "Coordinadora académica · Champagnat",
    rolOrg: "Interesado · Pedagogía · Neiva",
    canal: "WA",
    why: "Abrió WA hace 2 días sin confirmar horario. Toque suave de cierre.",
    preview:
      "Hola 👋 Retomo Pedagogía 2027-1. ¿Le queda mejor video jueves 4 pm o viernes AM?",
    agente: "Agente Captación",
  },
];

/** Section B — Respondieron · siguiente paso */
export const MI_DIA_RESPONDIERON: CardRespondio[] = [
  {
    id: "r1",
    nombre: "IE Normal Superior de Neiva · Rectoría",
    rolOrg: "Financiador · 3 cupos cerrados",
    canal: "Correo",
    resumen: "Respondió: disponible jueves AM para visita. Cupos adicionales en mesa.",
    nextStep: "Visita financiador · 30–45 min",
    nextStepDetail: "Jueves AM · Normal Superior Neiva",
  },
  {
    id: "r2",
    nombre: "Docente · Normal Superior Neiva",
    rolOrg: "Interesado · Maestría en Educación",
    canal: "WA",
    resumen: "Quiere conocer campus. Admisiones sugiere desayuno (no visita financiador).",
    nextStep: "Desayuno campus · Chía",
    nextStepDetail: "Sábado sugerido · 9:00–11:00",
  },
  {
    id: "r3",
    nombre: "Coordinadora · Champagnat Neiva",
    rolOrg: "Interesado · Pedagogía",
    canal: "Correo",
    resumen: "Aceptó conversar. Propone video; Captación ya armó agenda.",
    nextStep: "Video 15 min",
    nextStepDetail: "Jueves 16:00 · Pedagogía 2027-1",
  },
];

export type ProgramaProgreso = {
  corto: string;
  programa: string;
  inscritos: number;
  meta: number;
  equilibrio: number;
};

/** Lucía · ¿Cómo vamos? (números demo Neiva / cohorte) */
export const COMO_VAMOS_PROGRAMAS: ProgramaProgreso[] = [
  {
    corto: "Educación",
    programa: "Maestría en Educación",
    inscritos: 5,
    meta: 20,
    equilibrio: 10,
  },
  {
    corto: "Pedagogía",
    programa: "Maestría en Pedagogía",
    inscritos: 3,
    meta: 20,
    equilibrio: 10,
  },
  {
    corto: "Dir. y Gestión",
    programa: "Maestría en Dirección y Gestión",
    inscritos: 4,
    meta: 20,
    equilibrio: 10,
  },
  {
    corto: "Des. Infantil",
    programa: "Maestría en Desarrollo Infantil",
    inscritos: 2,
    meta: 20,
    equilibrio: 10,
  },
];

export const COMO_VAMOS_TOTAL = {
  inscritos: 14,
  meta: 80, // 20 × 4
  equilibrioPortfolio: 40, // 10 × 4
  equilibrioPorPrograma: 10,
  territorio: "Neiva / Huila",
  semana: "S2 · 8–14 sep 2026",
  /** Spend demo vs avance inscritos */
  spendCop: 4_200_000,
  spendBudgetCop: 12_000_000,
  progressPct: 18, // 14/80
};

export const COMO_VAMOS_ALERTA = {
  titulo: "Riesgo esta semana: Uniandes corte / Uniminuto subsidio",
  cuerpo:
    "Competencia en Neiva puede robar cupos docentes. Captación ya tiene campaña de respuesta (correo + WA) lista para aprobar en Mi día.",
  agente: "Agente Captación",
};
