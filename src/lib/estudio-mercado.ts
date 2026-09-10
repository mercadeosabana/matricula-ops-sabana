/**
 * Estudio de mercadeo — fuente única de verdad
 * Maestrías Facultad de Educación · Unisabana (Chía)
 * Cifras oficiales con fuente; resto marcado ESTIMADO.
 */

export type PrioridadComercial = "alta" | "media" | "baja";
export type Modalidad = "presencial" | "semipresencial" | "virtual" | "híbrida" | "por confirmar";

export type Fuente = {
  id: string;
  label: string;
  detalle: string;
  año?: string;
};

export const FUENTES: Fuente[] = [
  {
    id: "dane-educ-2023",
    label: "DANE EDUC 2023",
    detalle:
      "Docentes con asignación académica en Colombia (~453.540; ~321k oficiales / ~132k no oficiales).",
    año: "2023",
  },
  {
    id: "snies-men-2025",
    label: "SNIES / MEN",
    detalle:
      "Matrícula posgrado educación superior 2025: 226.710 (+9,63% vs 2024).",
    año: "2025",
  },
  {
    id: "contexto-ies",
    label: "Contexto IES",
    detalle:
      "Oferta de posgrados fuerte en IES privadas (competencia regional). Listado cualitativo; sin % de share inventados.",
  },
];

/** Hechos oficiales / citados */
export const HECHOS_OFICIALES = {
  docentesAsignacionAcademica: {
    total: 453_540,
    oficiales: 321_000,
    noOficiales: 132_000,
    fuenteId: "dane-educ-2023",
    nota: "Aprox. DANE EDUC 2023 · docentes con asignación académica Colombia",
  },
  matriculaPosgradoES2025: {
    total: 226_710,
    varYoYPct: 9.63,
    fuenteId: "snies-men-2025",
    nota: "Matrícula posgrado educación superior 2025 vs 2024",
  },
  ofertaPrivadaFuerte: {
    fuenteId: "contexto-ies",
    nota: "La oferta de maestrías en educación es densa en IES privadas; Sabana compite por calidad, campus Chía y convenios.",
  },
} as const;

/** SAM y segmentos — ESTIMADO (no oficial) */
export const SAM_ESTIMADO = {
  titulo: "Mercado abordable (SAM) · maestrías Educación / Pedagogía / Dirección / DI",
  nota: "ESTIMADO · estrecha el universo DANE hacia docentes, directivos y financiadores con potencial de cohorte 2027-1.",
  segmentos: [
    {
      id: "docentes-sam",
      label: "Docentes con potencial de maestría (Educación / Pedagogía / DI)",
      n: 48_000,
      rol: "estudiante" as const,
      criterio:
        "ESTIMADO · ~10–12% del universo DANE con título de pregrado, interés en posgrado y capacidad de pago/convenio en horizonte 3 años.",
    },
    {
      id: "directivos-sam",
      label: "Directivos / coordinadores (Dirección y Gestión)",
      n: 9_500,
      rol: "estudiante" as const,
      criterio:
        "ESTIMADO · rectores, coordinadores y líderes de colegio con agenda de gestión educativa.",
    },
    {
      id: "colegios-fin",
      label: "Colegios que pueden pagar / cofinanciar cupos",
      n: 3_200,
      rol: "financiador" as const,
      criterio:
        "ESTIMADO · subset de colegios privados y algunos oficiales con presupuesto de formación docente.",
    },
    {
      id: "secretarias-fin",
      label: "Secretarías certificadas + alcaldías con cupos",
      n: 280,
      rol: "financiador" as const,
      criterio:
        "ESTIMADO · secretarías certificadas (~95–100) + alcaldías/gobernaciones con líneas de becas o cupos institucionales.",
    },
  ],
  /** Abordaje comercial actual (demo operativa) */
  abordados: [
    {
      segmento: "Docentes / interesados SAM",
      universo: 48_000,
      tocados: 420,
      pct: 0.9,
      semana: "Semana 8–14 sep 2026 · +48",
      etiqueta: "ESTIMADO",
    },
    {
      segmento: "Directivos SAM",
      universo: 9_500,
      tocados: 86,
      pct: 0.9,
      semana: "Semana 8–14 sep · +12",
      etiqueta: "ESTIMADO",
    },
    {
      segmento: "Colegios financiadores",
      universo: 3_200,
      tocados: 86,
      pct: 2.7,
      semana: "Semana 8–14 sep · +12",
      etiqueta: "ESTIMADO",
    },
    {
      segmento: "Secretarías / alcaldías",
      universo: 280,
      tocados: 9,
      pct: 3.2,
      semana: "Semana 8–14 sep · +2 (Huila)",
      etiqueta: "ESTIMADO",
    },
  ],
} as const;

export const PROGRAMA_FOCO = {
  facultad: "Facultad de Educación · Universidad de La Sabana",
  campus: "Chía (Cundinamarca)",
  cohorte: "2027-1",
  programas: [
    "Maestría en Educación",
    "Pedagogía",
    "Dirección y Gestión Educativa",
    "Desarrollo Infantil",
  ],
} as const;

/** Financiadores y equilibrio — ESTIMADO operativo */
export const FINANCIADORES_ESTIMADO = {
  tipos: [
    "Secretarías de Educación certificadas",
    "Alcaldías con presupuesto de formación docente",
    "Colegios (privados / alianzas) que compran cupos",
  ],
  puntoEquilibrioCohorte: 20,
  cuposFinanciadosActual: 12,
  nota: "ESTIMADO · punto de equilibrio por cohorte demo (cupos pagados por terceros antes de escalar outreach a docentes del territorio).",
} as const;

/** Dual embudo — etapas ESTIMADO (volúmenes demo) */
export const EMBUDO_ESTUDIANTES = [
  { etapa: "Contactados", valor: 420 },
  { etapa: "Respondieron", valor: 126 },
  { etapa: "Desayuno / visita", valor: 48 },
  { etapa: "Post-visita", valor: 36 },
  { etapa: "Matrícula", valor: 6 },
] as const;

export const EMBUDO_FINANCIADORES = [
  { etapa: "Contactados", valor: 24, meta: false },
  { etapa: "En negociación", valor: 8, meta: false },
  { etapa: "Cupos cerrados", valor: 12, meta: false },
  { etapa: "Punto de equilibrio", valor: 20, meta: true },
] as const;

export const TOQUES_CANAL = [
  { canal: "Correo (Outlook)", n: 210 },
  { canal: "WhatsApp", n: 156 },
  { canal: "Invitación a desayuno", n: 48 },
  { canal: "Carta convenio (financiador)", n: 11 },
  { canal: "LinkedIn (solo borradores)", n: 60 },
] as const;

/** Inversión / ritmo — ESTIMADO demo */
export const INVERSION_RITMO = {
  spendCop: 48_000_000,
  presupuestoCop: 80_000_000,
  cacCop: 8_000_000,
  costoPorVisitaCop: 1_333_333,
  costoPorMatriculaCop: 8_000_000,
  horasEquipo: 186,
  horasPresupuesto: 240,
  semanasCampana: 6,
  semanasRestantes: 10,
  metaInscritos: 40,
  realInscritos: 6,
  nota: "ESTIMADO · demo cohorte 2027-1 · no es presupuesto oficial Unisabana",
} as const;

/**
 * Cómo comemos el elefante — plan 12 semanas (ejemplo gerencial)
 * Cada semana = rebanada; Natalia ejecuta en /hoy; Lucía ve el % total en /estudio.
 */
export const PLAN_12_SEMANAS = [
  {
    semana: 1,
    rango: "4–10 ago 2026",
    foco: "Mapa + lista fría Bogotá norte / Chía",
    territorio: "Cundinamarca",
    meta: "120 contactos docentes · 15 colegios",
    estado: "hecho" as const,
  },
  {
    semana: 2,
    rango: "11–17 ago",
    foco: "Financiadores piloto · cartas Secretaría",
    territorio: "Cundinamarca + Huila",
    meta: "8 cartas financiador · 2 reuniones",
    estado: "hecho" as const,
  },
  {
    semana: 3,
    rango: "18–24 ago",
    foco: "Desayunos Cajicá / Vermont",
    territorio: "Cajicá",
    meta: "6 desayunos · Pedagogía",
    estado: "hecho" as const,
  },
  {
    semana: 4,
    rango: "25–31 ago",
    foco: "Pipeline Dirección y Gestión",
    territorio: "Bogotá norte",
    meta: "40 directivos contactados",
    estado: "hecho" as const,
  },
  {
    semana: 5,
    rango: "1–7 sep",
    foco: "Apertura Neiva / Huila",
    territorio: "Huila",
    meta: "Secretaría en negociación · 3 colegios",
    estado: "hecho" as const,
  },
  {
    semana: 6,
    rango: "8–14 sep 2026",
    foco: "Neiva · equilibrio cupos + conversaciones",
    territorio: "Neiva / Huila",
    meta: "Cupos 12/20 · 25 conversaciones",
    estado: "activa" as const,
  },
  {
    semana: 7,
    rango: "15–21 sep",
    foco: "Cerrar gap equilibrio Huila",
    territorio: "Huila",
    meta: "Llevar cupos a ≥16/20",
    estado: "planeada" as const,
  },
  {
    semana: 8,
    rango: "22–28 sep",
    foco: "Doblar visitas Chía (sábados)",
    territorio: "Chía",
    meta: "≥12 visitas mes · show-up 80%",
    estado: "planeada" as const,
  },
  {
    semana: 9,
    rango: "29 sep–5 oct",
    foco: "Caribe suave · Barranquilla (CUC contexto)",
    territorio: "Atlántico",
    meta: "Lista 40 leads · 1 financiador",
    estado: "planeada" as const,
  },
  {
    semana: 10,
    rango: "6–12 oct",
    foco: "Early bird 15% · urgencia matrícula",
    territorio: "Nacional (digital)",
    meta: "Push D+3/D+7 a pipeline caliente",
    estado: "planeada" as const,
  },
  {
    semana: 11,
    rango: "13–19 oct",
    foco: "Bucaramanga / Santander (UCC·UNAB)",
    territorio: "Santander",
    meta: "20 directivos · 2 colegios",
    estado: "planeada" as const,
  },
  {
    semana: 12,
    rango: "20–26 oct",
    foco: "Cierre cohorte · reactivar fríos D+14",
    territorio: "Mix priorizado",
    meta: "Meta portfolio rumbo 40 inscritos",
    estado: "planeada" as const,
  },
] as const;

export const SEMANA_ACTIVA = PLAN_12_SEMANAS.find((s) => s.estado === "activa")!;

/** Competencia — listado cualitativo; sin matrículas ni share inventados */
export type Competidor = {
  id: string;
  ciudadRegion: string;
  universidad: string;
  programa: string;
  modalidad: Modalidad;
  notaVsSabana: string;
  esSabana?: boolean;
  verificar?: boolean;
};

export const COMPETENCIA: Competidor[] = [
  {
    id: "sabana-chia",
    ciudadRegion: "Chía / Cundinamarca",
    universidad: "Universidad de La Sabana",
    programa: "Maestrías Facultad de Educación (Educación, Pedagogía, Dirección y Gestión, DI)",
    modalidad: "presencial",
    notaVsSabana: "Nosotros · campus Chía, marca calidad, convenios y desayunos con colegios.",
    esSabana: true,
  },
  {
    id: "uniandes-bog",
    ciudadRegion: "Bogotá",
    universidad: "Universidad de los Andes",
    programa: "Maestría en Educación (y afines)",
    modalidad: "semipresencial",
    notaVsSabana:
      "Marca premium y red alumni fuerte · Sabana compite con cercanía a colegios de sabana y experiencia de campus.",
  },
  {
    id: "unilibre-bog",
    ciudadRegion: "Bogotá",
    universidad: "Universidad Libre",
    programa: "Maestría en Educación / afines",
    modalidad: "por confirmar",
    notaVsSabana: "Presencia amplia en Bogotá · precio/accesibilidad percibida; Sabana diferencia calidad y acompañamiento.",
  },
  {
    id: "ucc-bog",
    ciudadRegion: "Bogotá / Cundinamarca",
    universidad: "Universidad Cooperativa de Colombia (UCC)",
    programa: "Maestrías en educación / pedagogía (sedes)",
    modalidad: "por confirmar",
    notaVsSabana: "Red multi-sede · cobertura territorial; Sabana apuesta por selectividad y relación con colegios premium.",
  },
  {
    id: "cuc-baq",
    ciudadRegion: "Barranquilla / Caribe",
    universidad: "Universidad de la Costa (CUC)",
    programa: "Maestría en Educación (y afines)",
    modalidad: "por confirmar",
    notaVsSabana: "Ancla Caribe · Sabana llega con marca nacional y convenios; no pelear solo precio.",
  },
  {
    id: "ucc-bga",
    ciudadRegion: "Bucaramanga / Santander",
    universidad: "Universidad Cooperativa de Colombia (UCC)",
    programa: "Maestrías educación (sede)",
    modalidad: "por confirmar",
    notaVsSabana: "Competencia local de red · oportunidad Sabana vía directivos y colegios de Santander.",
  },
  {
    id: "unab-bga",
    ciudadRegion: "Bucaramanga",
    universidad: "Universidad Autónoma de Bucaramanga (UNAB)",
    programa: "Posgrados educación / afines",
    modalidad: "por confirmar",
    notaVsSabana: "Marca regional sólida · verificar oferta vigente de maestría en educación antes de claim comercial.",
    verificar: true,
  },
  {
    id: "univalle-cali",
    ciudadRegion: "Cali / Valle",
    universidad: "Universidad del Valle",
    programa: "Maestrías en educación / pedagogía",
    modalidad: "por confirmar",
    notaVsSabana: "Pública de alto prestigio · Sabana no compite head-to-head en precio; sí en servicio y convenios privados.",
    verificar: true,
  },
  {
    id: "usc-cali",
    ciudadRegion: "Cali",
    universidad: "Universidad Santiago de Cali",
    programa: "Maestría en Educación (verificar vigencia)",
    modalidad: "por confirmar",
    notaVsSabana: "Presencia local · confirmar SNIES activo antes de usarlo en pitch.",
    verificar: true,
  },
  {
    id: "unad-nac",
    ciudadRegion: "Nacional / virtual",
    universidad: "UNAD",
    programa: "Maestrías en educación (modalidad distancia/virtual)",
    modalidad: "virtual",
    notaVsSabana: "Alcance masivo y precio · Sabana diferencia presencialidad, networking de colegios y marca.",
  },
  {
    id: "uniminuto-nac",
    ciudadRegion: "Nacional / multi-sede",
    universidad: "UNIMINUTO",
    programa: "Maestrías / especializaciones educación",
    modalidad: "híbrida",
    notaVsSabana: "Cobertura y asequibilidad · Sabana se posiciona en segmento medio-alto y liderazgos escolares.",
  },
];

/** Mapa comercial Colombia — regiones + ciudades ancla */
export type ZonaMapa = {
  id: string;
  nombre: string;
  tipo: "region" | "ciudad" | "departamento";
  prioridad: PrioridadComercial;
  docentesEstimado: number | null;
  docentesNota: string;
  ciudadesAncla: string[];
  competenciaLocal: string[];
  mensajeComercial: string;
  /** rough SVG region key */
  svgId: string;
};

export const ZONAS_MAPA: ZonaMapa[] = [
  {
    id: "cundinamarca-bog",
    nombre: "Bogotá / Cundinamarca",
    tipo: "departamento",
    prioridad: "alta",
    docentesEstimado: 95_000,
    docentesNota: "ESTIMADO · subset del universo DANE concentrado en región capital (orden de magnitud).",
    ciudadesAncla: ["Bogotá", "Chía", "Cajicá", "Zipaquirá"],
    competenciaLocal: ["Uniandes", "Unilibre", "UCC", "Unisabana (nosotros)"],
    mensajeComercial: "Corazón de la cohorte · campus Chía + colegios sabana + directivos Bogotá norte.",
    svgId: "andina-centro",
  },
  {
    id: "huila",
    nombre: "Huila",
    tipo: "departamento",
    prioridad: "alta",
    docentesEstimado: 12_000,
    docentesNota: "ESTIMADO · docentes departamento; foco comercial Neiva + Secretaría.",
    ciudadesAncla: ["Neiva"],
    competenciaLocal: ["IES regionales (verificar SNIES)", "Oferta virtual UNAD/UNIMINUTO"],
    mensajeComercial: "Semana activa · cupos financiados hacia equilibrio antes de escalar docentes.",
    svgId: "andina-sur",
  },
  {
    id: "antioquia",
    nombre: "Antioquia",
    tipo: "departamento",
    prioridad: "media",
    docentesEstimado: 55_000,
    docentesNota: "ESTIMADO · orden de magnitud regional.",
    ciudadesAncla: ["Medellín", "Envigado", "Rionegro"],
    competenciaLocal: ["U. de Antioquia / EAFIT / UPB (verificar maestrías educación)", "UNAD"],
    mensajeComercial: "Ola 2 · directivos y colegios privados; no abrir sin lista y 1 financiador ancla.",
    svgId: "andina-norte",
  },
  {
    id: "valle",
    nombre: "Valle del Cauca",
    tipo: "departamento",
    prioridad: "media",
    docentesEstimado: 35_000,
    docentesNota: "ESTIMADO.",
    ciudadesAncla: ["Cali", "Palmira"],
    competenciaLocal: ["Univalle", "Santiago de Cali (verificar)", "UNAD"],
    mensajeComercial: "Entrada selectiva · convenios colegios; confirmar competencia SNIES antes del pitch.",
    svgId: "pacifico",
  },
  {
    id: "atlantico",
    nombre: "Atlántico / Caribe",
    tipo: "departamento",
    prioridad: "media",
    docentesEstimado: 28_000,
    docentesNota: "ESTIMADO · Atlántico + área metropolitana Barranquilla.",
    ciudadesAncla: ["Barranquilla"],
    competenciaLocal: ["CUC", "UNAD", "UNIMINUTO"],
    mensajeComercial: "Semana 9 del plan · lista corta + 1 financiador; no saturar sin equilibrio en Huila.",
    svgId: "caribe",
  },
  {
    id: "santander",
    nombre: "Santander",
    tipo: "departamento",
    prioridad: "media",
    docentesEstimado: 22_000,
    docentesNota: "ESTIMADO.",
    ciudadesAncla: ["Bucaramanga", "Floridablanca"],
    competenciaLocal: ["UCC", "UNAB (verificar)", "UNAD"],
    mensajeComercial: "Semana 11 · directivos y colegios; mensaje calidad Sabana vs red multi-sede.",
    svgId: "andina-oriente",
  },
  {
    id: "eje-cafetero",
    nombre: "Eje cafetero",
    tipo: "region",
    prioridad: "baja",
    docentesEstimado: 18_000,
    docentesNota: "ESTIMADO · Caldas / Risaralda / Quindío agregado.",
    ciudadesAncla: ["Pereira", "Manizales", "Armenia"],
    competenciaLocal: ["U. locales + virtuales"],
    mensajeComercial: "Cola del elefante · solo si sobra capacidad tras Andina/Caribe.",
    svgId: "eje",
  },
  {
    id: "orinoquia",
    nombre: "Orinoquía",
    tipo: "region",
    prioridad: "baja",
    docentesEstimado: null,
    docentesNota: "N/D · sin estimación comercial firme aún.",
    ciudadesAncla: ["Villavicencio"],
    competenciaLocal: ["UNAD", "oferta virtual"],
    mensajeComercial: "Exploratorio · no priorizar en cohorte 2027-1.",
    svgId: "orinoquia",
  },
  {
    id: "amazonia",
    nombre: "Amazonía",
    tipo: "region",
    prioridad: "baja",
    docentesEstimado: null,
    docentesNota: "N/D.",
    ciudadesAncla: [],
    competenciaLocal: ["UNAD"],
    mensajeComercial: "Fuera de foco cohorte actual.",
    svgId: "amazonia",
  },
];

export const CIUDADES_CHIP = [
  { id: "bogota", label: "Bogotá", zonaId: "cundinamarca-bog" },
  { id: "chia", label: "Chía", zonaId: "cundinamarca-bog" },
  { id: "medellin", label: "Medellín", zonaId: "antioquia" },
  { id: "cali", label: "Cali", zonaId: "valle" },
  { id: "barranquilla", label: "Barranquilla", zonaId: "atlantico" },
  { id: "bucaramanga", label: "Bucaramanga", zonaId: "santander" },
  { id: "neiva", label: "Neiva", zonaId: "huila" },
] as const;

export function pctAbordadoGlobal(): {
  tocados: number;
  universo: number;
  pct: number;
} {
  const tocados = SAM_ESTIMADO.abordados.reduce((s, a) => s + a.tocados, 0);
  const universo = SAM_ESTIMADO.segmentos.reduce((s, a) => s + a.n, 0);
  const pct = Math.round((tocados / Math.max(1, universo)) * 1000) / 10;
  return { tocados, universo, pct };
}

export function semanaDelPlan(n: number) {
  return PLAN_12_SEMANAS.find((s) => s.semana === n);
}

export function formatMillonesEstudio(cop: number): string {
  return `$${(cop / 1_000_000).toFixed(cop >= 10_000_000 ? 0 : 1)}M`;
}

export function prioridadColor(p: PrioridadComercial): string {
  if (p === "alta") return "#2d6a4f";
  if (p === "media") return "#c4a35a";
  return "#8a9bb0";
}

export function prioridadLabel(p: PrioridadComercial): string {
  if (p === "alta") return "Alta";
  if (p === "media") return "Media";
  return "Baja";
}

/** Resumen para cards Hoy / Dirección */
export const RESUMEN_VISION = {
  titulo: "Visión global del mercado",
  elefante:
    "El elefante es el SAM de maestrías Educación en Colombia: docentes + directivos + financiadores. Lo comemos en 12 semanas, territorio por territorio.",
  tortaLabels: SAM_ESTIMADO.segmentos.map((s) => ({
    label: s.label,
    n: s.n,
    rol: s.rol,
  })),
} as const;
