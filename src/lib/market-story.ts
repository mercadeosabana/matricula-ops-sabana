/**
 * Modelo operativo de mercado (semana + panel gerencial).
 * Estudio completo con fuentes oficiales / ESTIMADO: src/lib/estudio-mercado.ts
 * - Hoy = rebanada semanal (ejecución Mercadeo)
 * - Dirección = KPIs + torta + link al estudio
 * Palabras planas: programa, cohorte, sede, financiador, interesado.
 */

export type Audiencia = "financiador" | "estudiante";

/** Semana activa en Hoy */
export const SEMANA_MERCADO = {
  etiqueta: "Semana de mercado",
  rango: "8–14 sep 2026",
  programa: "Maestrías Facultad de Educación",
  cohorte: "2027-1",
  sedeFoco: "Neiva / Huila",
  zonaSegmento: "Colegios + 1 secretaría",
  metaTexto: "equilibrio + 25 conversaciones",
  conversacionesMeta: 25,
  conversacionesHechas: 14,
  cuposFinanciados: 12,
  cuposEquilibrio: 20,
  financiadoresActivos: [
    {
      id: "f-se-huila",
      nombre: "Secretaría de Educación · Huila",
      tipo: "secretaría",
      cupos: 8,
      estado: "negociación",
    },
    {
      id: "f-normal-neiva",
      nombre: "IE Normal Superior de Neiva",
      tipo: "colegio",
      cupos: 3,
      estado: "cupos cerrados",
    },
    {
      id: "f-alcaldia-neiva",
      nombre: "Alcaldía de Neiva (piloto)",
      tipo: "alcaldía",
      cupos: 1,
      estado: "contacto",
    },
  ],
  interesadosDemo: [
    {
      id: "e-1",
      nombre: "Docente · Normal Superior Neiva",
      programa: "Maestría en Educación",
      estado: "interesado",
    },
    {
      id: "e-2",
      nombre: "Coordinadora · colegio Neiva",
      programa: "Pedagogía",
      estado: "conversación",
    },
  ],
  listosDesayuno: [
    {
      id: "d-vermont",
      nombre: "Coordinadora · Gimnasio Vermont",
      sede: "Cajicá",
      programa: "Pedagogía",
      tareaId: "t5",
    },
    {
      id: "d-nogales",
      nombre: "Rectoría · Los Nogales",
      sede: "Bogotá norte",
      programa: "Dirección y Gestión",
      tareaId: "t5",
    },
    {
      id: "d-rochester",
      nombre: "Coordinación · Rochester",
      sede: "Bogotá norte",
      programa: "Maestría en Educación",
      tareaId: "t5",
    },
  ],
} as const;

/** Panel gerencial por programa (Dirección) — EJEMPLO */
export const PROGRAMAS_GERENCIA = [
  {
    programa: "Maestría en Educación",
    metaInscritos: 20,
    realInscritos: 2,
    semanasRestantes: 10,
    ritmoActualPorSemana: 0.2,
    ritmoNecesarioPorSemana: 1.8,
  },
  {
    programa: "Pedagogía",
    metaInscritos: 20,
    realInscritos: 1,
    semanasRestantes: 10,
    ritmoActualPorSemana: 0.15,
    ritmoNecesarioPorSemana: 1.9,
  },
  {
    programa: "Dirección y Gestión Educativa",
    metaInscritos: 20,
    realInscritos: 2,
    semanasRestantes: 10,
    ritmoActualPorSemana: 0.25,
    ritmoNecesarioPorSemana: 1.8,
  },
  {
    programa: "Desarrollo Infantil",
    metaInscritos: 20,
    realInscritos: 1,
    semanasRestantes: 10,
    ritmoActualPorSemana: 0.12,
    ritmoNecesarioPorSemana: 1.9,
  },
] as const;

export type SemaforoPace = "ok" | "atrasado" | "critico";

export function paceDePrograma(p: {
  metaInscritos: number;
  realInscritos: number;
  semanasRestantes: number;
  ritmoActualPorSemana: number;
  ritmoNecesarioPorSemana: number;
}): {
  faltan: number;
  pctAvance: number;
  proyeccion: number;
  pace: SemaforoPace;
  paceLabel: string;
} {
  const faltan = Math.max(0, p.metaInscritos - p.realInscritos);
  const pctAvance = Math.round(
    (p.realInscritos / Math.max(1, p.metaInscritos)) * 100
  );
  const proyeccion = Math.round(
    p.realInscritos + p.ritmoActualPorSemana * p.semanasRestantes
  );
  let pace: SemaforoPace = "ok";
  let paceLabel = "Al día";
  if (proyeccion < p.metaInscritos * 0.7) {
    pace = "critico";
    paceLabel = "Muy atrasado";
  } else if (proyeccion < p.metaInscritos || p.ritmoActualPorSemana < p.ritmoNecesarioPorSemana * 0.85) {
    pace = "atrasado";
    paceLabel = "Atrasado";
  }
  return { faltan, pctAvance, proyeccion, pace, paceLabel };
}

/** Portfolio gerencial */
export const PORTFOLIO_GERENCIA = {
  metaInscritosTotal: 80,
  realInscritosTotal: 6,
  campanaInicio: "2026-08-01",
  campanaInicioLabel: "1 ago 2026",
  semanasCampana: 6,
  semanasRestantes: 10,
  horasEquipo: 186,
  horasPresupuesto: 240,
  spendCop: 48_000_000,
  presupuestoCop: 80_000_000,
  cacCop: 8_000_000,
  costoPorVisitaCop: 1_333_333,
  costoPorMatriculaCop: 8_000_000,
  cuposFinanciados: 12,
  cuposEquilibrio: 40,
  nota: "Cifras EJEMPLO · cohorte 2027-1 · Facultad de Educación · meta 80 inscritos / 40 cupos equilibrio",
} as const;

/**
 * Torta alineada al SAM del estudio (ESTIMADO).
 * Fuente canónica: estudio-mercado.ts — no inventar % sin etiqueta.
 */
export const TORTA_MERCADO = {
  titulo: "SAM estimado · maestrías Educación Colombia",
  nota: "ESTIMADO · ver /estudio para DANE/SNIES y plan 12 semanas",
  programa: "Facultad de Educación · Unisabana",
  cohorte: "2027-1",
  segmentos: [
    {
      id: "docentes",
      label: "Docentes SAM (Educación / Pedagogía / DI)",
      n: 48_000,
      rol: "estudiante" as const,
    },
    {
      id: "directivos",
      label: "Directivos / coordinadores",
      n: 9_500,
      rol: "estudiante" as const,
    },
    {
      id: "colegios",
      label: "Colegios financiadores (cupos)",
      n: 3_200,
      rol: "financiador" as const,
    },
    {
      id: "secretarias",
      label: "Secretarías / alcaldías con cupos",
      n: 280,
      rol: "financiador" as const,
    },
  ],
  abordados: [
    {
      segmento: "Docentes / interesados SAM",
      universo: 48_000,
      tocados: 420,
      pct: 0.9,
      semana: "Semana 8–14 sep · +48",
    },
    {
      segmento: "Directivos SAM",
      universo: 9_500,
      tocados: 86,
      pct: 0.9,
      semana: "Semana 8–14 sep · +12",
    },
    {
      segmento: "Colegios financiadores",
      universo: 3_200,
      tocados: 86,
      pct: 2.7,
      semana: "Semana 8–14 sep · +12",
    },
    {
      segmento: "Secretarías / alcaldías",
      universo: 280,
      tocados: 9,
      pct: 3.2,
      semana: "Semana 8–14 sep · +2 (Huila)",
    },
  ],
  toquesCanal: [
    { canal: "Correo (Outlook)", n: 210, plain: "mail" },
    { canal: "WhatsApp", n: 156, plain: "WA" },
    { canal: "Invitación a desayuno", n: 48, plain: "desayuno" },
    { canal: "Carta convenio (financiador)", n: 11, plain: "carta" },
    { canal: "LinkedIn (solo borradores)", n: 60, plain: "linkedin" },
  ],
  embudoEstudiantes: [
    { etapa: "Contactados", valor: 420 },
    { etapa: "Respondieron", valor: 126 },
    { etapa: "Desayuno / visita", valor: 48 },
    { etapa: "Post-visita", valor: 36 },
    { etapa: "Matrícula", valor: 6 },
  ],
  embudoFinanciadores: [
    { etapa: "Contactados", valor: 24, meta: false },
    { etapa: "En negociación", valor: 8, meta: false },
    { etapa: "Cupos cerrados", valor: 12, meta: false },
    { etapa: "Punto de equilibrio", valor: 20, meta: true },
  ],
  inversion: {
    spendCop: 48_000_000,
    cacCop: 8_000_000,
    costoPorVisitaCop: 1_333_333,
    costoPorMatriculaCop: 8_000_000,
    nota: "EJEMPLO · últimos 30 días · cohorte 2027-1",
  },
} as const;

export function equilibrioMetido(financiados: number, equilibrio: number) {
  const pct = Math.min(
    100,
    Math.round((financiados / Math.max(1, equilibrio)) * 100)
  );
  const met = financiados >= equilibrio;
  const faltan = Math.max(0, equilibrio - financiados);
  return { pct, met, faltan };
}

export function audienciaDeTarea(t: {
  audiencia?: Audiencia | null;
  canal?: string;
  tipo?: string;
}): Audiencia {
  if (t.audiencia === "financiador" || t.audiencia === "estudiante") {
    return t.audiencia;
  }
  if (
    t.canal === "region" ||
    t.tipo === "carta_secretaria" ||
    t.tipo === "convenio_region"
  ) {
    return "financiador";
  }
  if (t.tipo === "email_frio" || t.tipo === "email_segmento") {
    return "financiador";
  }
  if (t.canal === "linkedin" && t.tipo === "linkedin_borrador") {
    return "financiador";
  }
  return "estudiante";
}

export function formatMillones(cop: number): string {
  return `$${(cop / 1_000_000).toFixed(cop >= 10_000_000 ? 0 : 1)}M`;
}
