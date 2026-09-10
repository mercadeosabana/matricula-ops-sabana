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
  /** ESTIMADO · docentes/alumnos potenciales interesados en maestría */
  alumnosPotenciales: number | null;
  alumnosNota: string;
  /** ESTIMADO · rectores / coordinadores con agenda de posgrado */
  directivosInteresados: number | null;
  directivosNota: string;
  /** ESTIMADO · colegios que pueden pagar / cofinanciar cupos */
  financiadoresColegios: number | null;
  /** ESTIMADO · secretarías certificadas + alcaldías con cupos */
  financiadoresPublicos: number | null;
  financiadoresNota: string;
  /** Ofertas Unisabana para presentarse a financiadores (ángulo biblioteca) */
  ofertasUnisabana: string[];
  /** Competencia principal nombrada (desde COMPETENCIA / competenciaLocal) */
  competenciaPrincipal: { nombre: string; nota: string }[];
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
    alumnosPotenciales: 11_000,
    alumnosNota:
      "ESTIMADO · ~11–12% del pool docente regional con potencial de maestría Educación/Pedagogía/DI en 3 años.",
    directivosInteresados: 2_400,
    directivosNota:
      "ESTIMADO · rectores y coordinadores Bogotá norte + sabana (Chía/Cajicá/Zipa) con agenda de gestión.",
    financiadoresColegios: 920,
    financiadoresPublicos: 38,
    financiadoresNota:
      "ESTIMADO · colegios privados/alianzas que compran cupos + SED Bogotá, Secretaría Cundinamarca y alcaldías ancla.",
    ofertasUnisabana: [
      "Convenio de cupos institucionales con colegios sabana y Bogotá norte (biblioteca · convenio territorial).",
      "Early bird institucional [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct 2026] para paquetes de cupos.",
      "Desayuno / visita campus Chía 2 h · sábados [CONFIRMAR: 20 y 27 sep] 9:00–11:00.",
      "Cohorte presencial campus Chía · puerta de entrada natural para financiadores de la región capital.",
      "One-pagers de las 4 maestrías (Educación, Pedagogía, Dirección y Gestión, DI) · copiar desde /biblioteca.",
    ],
    competenciaPrincipal: [
      {
        nombre: "Universidad de los Andes",
        nota: "Semipresencial · marca premium y red alumni; Sabana compite con cercanía a colegios de sabana.",
      },
      {
        nombre: "Universidad Libre",
        nota: "Modalidad por confirmar · presencia amplia en Bogotá; Sabana diferencia calidad y acompañamiento.",
      },
      {
        nombre: "Universidad Cooperativa de Colombia (UCC)",
        nota: "Por confirmar · red multi-sede; Sabana apuesta por selectividad y colegios premium.",
      },
      {
        nombre: "Universidad de La Sabana",
        nota: "Presencial Chía · nosotros; ancla de marca y desayunos con colegios.",
      },
    ],
    ciudadesAncla: ["Bogotá", "Chía", "Cajicá", "Zipaquirá"],
    competenciaLocal: ["Uniandes", "Unilibre", "UCC", "Unisabana (nosotros)"],
    mensajeComercial: "Corazón de la cohorte · campus Chía + colegios sabana + directivos Bogotá norte.",
    svgId: "andina-centro",
  },
  {
    id: "huila",
    nombre: "Huila / Neiva",
    tipo: "departamento",
    prioridad: "alta",
    docentesEstimado: 12_000,
    docentesNota: "ESTIMADO · docentes departamento; foco comercial Neiva + Secretaría.",
    alumnosPotenciales: 1_800,
    alumnosNota:
      "ESTIMADO · docentes Neiva/Huila con interés real en cohorte regional 2027-1 (semana activa).",
    directivosInteresados: 420,
    directivosNota:
      "ESTIMADO · rectores y coordinadores Neiva + municipios cercanos; pipeline corto pero caliente.",
    financiadoresColegios: 85,
    financiadoresPublicos: 6,
    financiadoresNota:
      "ESTIMADO · colegios Neiva con presupuesto de formación + Secretaría de Educación Huila / Alcaldía Neiva (foco cupos).",
    ofertasUnisabana: [
      "Presencia regional Unisabana · Neiva · convenio territorial Secretaría Huila / Alcaldía · cupos preferentes planta y provisionales.",
      "Early bird institucional [CONFIRMAR: 15%] en paquetes de cupos financiados hacia equilibrio 20.",
      "Desayuno / visita campus Chía para líderes Neiva · o reunión 30 min en territorio [CONFIRMAR].",
      "Cohorte regional Neiva 2027-1 · sede ejemplo en biblioteca (Chía + Neiva).",
      "One-pager Educación / Pedagogía / Dirección · pieza de carta a financiador (Agente Región).",
    ],
    competenciaPrincipal: [
      {
        nombre: "UNAD",
        nota: "Virtual / distancia · alcance masivo y precio; Sabana diferencia presencialidad y networking.",
      },
      {
        nombre: "UNIMINUTO",
        nota: "Híbrida / multi-sede · asequibilidad; Sabana se posiciona medio-alto y liderazgos escolares.",
      },
      {
        nombre: "IES regionales (verificar SNIES)",
        nota: "Por confirmar · validar oferta vigente de maestría en educación antes del pitch.",
      },
    ],
    ciudadesAncla: ["Neiva"],
    competenciaLocal: ["IES regionales (verificar SNIES)", "Oferta virtual UNAD/UNIMINUTO"],
    mensajeComercial:
      "Presencia regional Unisabana · Neiva. Semana activa · cupos financiados hacia equilibrio antes de escalar docentes.",
    svgId: "andina-sur",
  },
  {
    id: "antioquia",
    nombre: "Antioquia",
    tipo: "departamento",
    prioridad: "media",
    docentesEstimado: 55_000,
    docentesNota: "ESTIMADO · orden de magnitud regional.",
    alumnosPotenciales: 5_500,
    alumnosNota: "ESTIMADO · ~10% del pool docente regional con potencial de maestría en horizonte 3 años.",
    directivosInteresados: 1_100,
    directivosNota: "ESTIMADO · directivos Medellín / Envigado / Rionegro; ola 2 tras Andina centro y Huila.",
    financiadoresColegios: 420,
    financiadoresPublicos: 22,
    financiadoresNota:
      "ESTIMADO · colegios privados Aburrá + Secretaría Antioquia / alcaldías ancla; abrir solo con 1 financiador.",
    ofertasUnisabana: [
      "Convenio de cupos con 1 colegio ancla o Secretaría antes de abrir lista masiva.",
      "Early bird institucional [CONFIRMAR: 15%] para paquetes · sin inventar tarifa fuera de [CONFIRMAR].",
      "Desayuno campus Chía para rectores selectos (viaje justificado) · agenda 2 h biblioteca.",
      "One-pagers Dirección y Gestión + Educación · mensaje calidad Sabana vs IES locales.",
      "No abrir cohorte regional Antioquia en 2027-1 sin lista corta y financiador cerrado.",
    ],
    competenciaPrincipal: [
      {
        nombre: "U. de Antioquia / EAFIT / UPB",
        nota: "Verificar maestrías educación vigentes · competencia local de prestigio; no pelear solo precio.",
      },
      {
        nombre: "UNAD",
        nota: "Virtual · cobertura; Sabana diferencia campus y relación con colegios.",
      },
    ],
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
    alumnosPotenciales: 3_500,
    alumnosNota: "ESTIMADO · docentes Cali/Palmira con potencial de posgrado Educación.",
    directivosInteresados: 700,
    directivosNota: "ESTIMADO · líderes de colegios privados Cali; entrada selectiva.",
    financiadoresColegios: 280,
    financiadoresPublicos: 16,
    financiadoresNota:
      "ESTIMADO · colegios que cofinancian + Secretaría Valle / Alcaldía Cali (pocos contactos iniciales).",
    ofertasUnisabana: [
      "Convenio colegios privados Cali · cupos institucionales (biblioteca convenio).",
      "Early bird institucional [CONFIRMAR: 15%] · inversión referencial solo con etiqueta [CONFIRMAR].",
      "Visita / desayuno campus Chía para directivos calientes · no abrir sede sin SNIES competencia clara.",
      "One-pagers Educación y Pedagogía · confirmar Univalle/USC vigentes antes del pitch.",
    ],
    competenciaPrincipal: [
      {
        nombre: "Universidad del Valle",
        nota: "Por confirmar · pública de alto prestigio; Sabana compite en servicio y convenios privados.",
      },
      {
        nombre: "Universidad Santiago de Cali",
        nota: "Por confirmar · verificar SNIES activo de maestría en educación.",
      },
      {
        nombre: "UNAD",
        nota: "Virtual · precio/alcance; Sabana diferencia presencialidad y marca.",
      },
    ],
    ciudadesAncla: ["Cali", "Palmira"],
    competenciaLocal: ["Univalle", "Santiago de Cali (verificar)", "UNAD"],
    mensajeComercial: "Entrada selectiva · convenios colegios; confirmar competencia SNIES antes del pitch.",
    svgId: "pacifico",
  },
  {
    id: "atlantico",
    nombre: "Atlántico / Barranquilla",
    tipo: "departamento",
    prioridad: "media",
    docentesEstimado: 28_000,
    docentesNota:
      "ESTIMADO · Atlántico + área metropolitana Barranquilla. El pie Caribe Unisabana también incluye Guajira y Valledupar (zonas separadas en el mapa).",
    alumnosPotenciales: 2_800,
    alumnosNota: "ESTIMADO · docentes área Barranquilla con potencial cohorte digital/híbrida de contacto.",
    directivosInteresados: 560,
    directivosNota: "ESTIMADO · directivos Caribe Atlántico; semana 9 del plan · lista corta.",
    financiadoresColegios: 210,
    financiadoresPublicos: 12,
    financiadoresNota:
      "ESTIMADO · colegios Barranquilla + Secretaría Atlántico / Alcaldía; meta 1 financiador ancla.",
    ofertasUnisabana: [
      "Convenio territorial suave · 1 financiador Caribe (carta biblioteca Región).",
      "Early bird institucional [CONFIRMAR: 15%] en pie de pieza hasta [CONFIRMAR: 15 oct].",
      "Invitación a desayuno campus Chía para 4–6 líderes (viaje selectivo).",
      "One-pagers Educación + Dirección · mensaje marca nacional vs ancla CUC.",
    ],
    competenciaPrincipal: [
      {
        nombre: "Universidad de la Costa (CUC)",
        nota: "Por confirmar · ancla Caribe; Sabana llega con marca nacional y convenios.",
      },
      {
        nombre: "UNAD",
        nota: "Virtual · masivo; no pelear solo precio.",
      },
      {
        nombre: "UNIMINUTO",
        nota: "Híbrida · cobertura; Sabana segmento medio-alto.",
      },
    ],
    ciudadesAncla: ["Barranquilla"],
    competenciaLocal: ["CUC", "UNAD", "UNIMINUTO"],
    mensajeComercial:
      "Semana 9 del plan · lista corta + 1 financiador; no saturar sin equilibrio en Huila. Caribe Unisabana también cubre Guajira y Valledupar (ver zonas vecinas).",
    svgId: "caribe-atlantico",
  },
  {
    id: "guajira",
    nombre: "La Guajira",
    tipo: "departamento",
    prioridad: "media",
    docentesEstimado: 9_500,
    docentesNota: "ESTIMADO · docentes departamento La Guajira; ancla Riohacha (+ Maicao / Uribia si útil).",
    alumnosPotenciales: 950,
    alumnosNota:
      "ESTIMADO · ~10% del pool docente departamental con potencial de maestría Educación/Pedagogía/DI en horizonte 3 años.",
    directivosInteresados: 190,
    directivosNota:
      "ESTIMADO · rectores y coordinadores Riohacha y municipios ancla; pipeline selectivo.",
    financiadoresColegios: 55,
    financiadoresPublicos: 5,
    financiadoresNota:
      "ESTIMADO · colegios Riohacha/Maicao + Secretaría de Educación Guajira / Alcaldía Riohacha.",
    ofertasUnisabana: [
      "Convenio territorial Secretaría Guajira / Alcaldía Riohacha · cupos preferentes (biblioteca Región).",
      "Early bird institucional [CONFIRMAR: 15%] en paquetes de cupos · sin inventar tarifa fuera de [CONFIRMAR].",
      "Invitación selectiva a desayuno / visita campus Chía para 3–5 líderes (viaje justificado).",
      "One-pagers Educación + Pedagogía + Dirección · pie de presencia regional Unisabana en Caribe oriente.",
      "Mensaje de marca nacional + acompañamiento; no pelear solo precio vs oferta virtual.",
    ],
    competenciaPrincipal: [
      {
        nombre: "UNAD",
        nota: "ESTIMADO · virtual / distancia dominante por geografía; Sabana diferencia presencialidad y networking.",
      },
      {
        nombre: "UNIMINUTO",
        nota: "ESTIMADO · híbrida / cobertura; Sabana segmento medio-alto y liderazgos escolares.",
      },
      {
        nombre: "IES regionales / CUC (Caribe)",
        nota: "ESTIMADO · verificar SNIES vigentes; Unisabana llega con pie regional confirmado en Guajira.",
      },
    ],
    ciudadesAncla: ["Riohacha", "Maicao"],
    competenciaLocal: ["UNAD", "UNIMINUTO", "IES regionales / CUC (verificar)"],
    mensajeComercial:
      "Pie regional Unisabana confirmado en La Guajira · lista corta Riohacha + 1 financiador; coordinar con Atlántico/Valledupar sin saturar el mismo mes.",
    svgId: "caribe-guajira",
  },
  {
    id: "cesar",
    nombre: "Cesar / Valledupar",
    tipo: "departamento",
    prioridad: "media",
    docentesEstimado: 11_000,
    docentesNota: "ESTIMADO · docentes Cesar; foco comercial Valledupar.",
    alumnosPotenciales: 1_100,
    alumnosNota:
      "ESTIMADO · docentes Valledupar y municipios cercanos con potencial de maestría en horizonte 3 años.",
    directivosInteresados: 220,
    directivosNota:
      "ESTIMADO · rectores y coordinadores Valledupar; entrada selectiva vía pie regional Unisabana.",
    financiadoresColegios: 70,
    financiadoresPublicos: 6,
    financiadoresNota:
      "ESTIMADO · colegios Valledupar + Secretaría de Educación Cesar / Alcaldía Valledupar.",
    ofertasUnisabana: [
      "Convenio territorial Secretaría Cesar / Alcaldía Valledupar · cupos institucionales (biblioteca Región).",
      "Early bird institucional [CONFIRMAR: 15%] para paquetes hacia cupos financiados.",
      "Desayuno / visita campus Chía para líderes Valledupar · o reunión 30 min en territorio [CONFIRMAR].",
      "One-pagers Educación / Pedagogía / Dirección · mensaje pie regional Unisabana Caribe oriente.",
      "Verificar oferta UPC / IES locales vigentes antes de claims en pitch.",
    ],
    competenciaPrincipal: [
      {
        nombre: "Universidad Popular del Cesar (UPC)",
        nota: "ESTIMADO · marca local Valledupar; verificar maestrías educación vigentes antes del pitch.",
      },
      {
        nombre: "UNAD",
        nota: "ESTIMADO · virtual · alcance; Sabana diferencia campus y relación con colegios.",
      },
      {
        nombre: "UNIMINUTO / IES Caribe",
        nota: "ESTIMADO · cobertura e híbrida; Unisabana con pie regional confirmado en Valledupar.",
      },
    ],
    ciudadesAncla: ["Valledupar"],
    competenciaLocal: ["UPC (verificar)", "UNAD", "UNIMINUTO"],
    mensajeComercial:
      "Pie regional Unisabana confirmado en Valledupar (Cesar) · abrir con 1 financiador ancla y lista corta de directivos; alinear timing con Guajira/Atlántico.",
    svgId: "caribe-cesar",
  },
  {
    id: "santander",
    nombre: "Santander",
    tipo: "departamento",
    prioridad: "media",
    docentesEstimado: 22_000,
    docentesNota: "ESTIMADO.",
    alumnosPotenciales: 2_200,
    alumnosNota: "ESTIMADO · docentes Bucaramanga/Floridablanca con potencial de maestría.",
    directivosInteresados: 440,
    directivosNota: "ESTIMADO · semana 11 · 20 directivos meta de contacto.",
    financiadoresColegios: 160,
    financiadoresPublicos: 10,
    financiadoresNota:
      "ESTIMADO · colegios área metropolitana + Secretaría Santander; meta 2 colegios financiadores.",
    ofertasUnisabana: [
      "Convenio 2 colegios ancla · cupos Dirección y Gestión / Educación.",
      "Early bird institucional [CONFIRMAR: 15%] · mensaje calidad Sabana vs red multi-sede.",
      "Desayuno campus Chía para rectores BGA · agenda biblioteca visita 2 h.",
      "One-pagers · verificar oferta UNAB vigente antes de claims comerciales.",
    ],
    competenciaPrincipal: [
      {
        nombre: "Universidad Cooperativa de Colombia (UCC)",
        nota: "Por confirmar · competencia local de red; oportunidad vía directivos.",
      },
      {
        nombre: "Universidad Autónoma de Bucaramanga (UNAB)",
        nota: "Por confirmar · marca regional; verificar maestría educación vigente.",
      },
      {
        nombre: "UNAD",
        nota: "Virtual · cobertura nacional.",
      },
    ],
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
    alumnosPotenciales: 1_500,
    alumnosNota: "ESTIMADO · pool agregado; cola del elefante si sobra capacidad.",
    directivosInteresados: 300,
    directivosNota: "ESTIMADO · Pereira/Manizales/Armenia; no priorizar cohorte actual.",
    financiadoresColegios: 110,
    financiadoresPublicos: 9,
    financiadoresNota:
      "ESTIMADO · pocos contactos iniciales; solo si sobra capacidad tras Andina/Caribe.",
    ofertasUnisabana: [
      "One-pagers genéricos de biblioteca · sin abrir convenio regional aún.",
      "Early bird [CONFIRMAR: 15%] en piezas digitales si hay inbound espontáneo.",
      "Visita campus Chía bajo demanda · no planificar desayunos masivos aquí.",
    ],
    competenciaPrincipal: [
      {
        nombre: "U. locales + virtuales",
        nota: "Por confirmar · oferta local dispersa; UNAD/UNIMINUTO cubren distancia.",
      },
      {
        nombre: "UNAD",
        nota: "Virtual · principal alternativa de alcance.",
      },
    ],
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
    alumnosPotenciales: 600,
    alumnosNota: "ESTIMADO exploratorio · Villavicencio y municipios; sin pipeline 2027-1.",
    directivosInteresados: 80,
    directivosNota: "ESTIMADO · muy bajo volumen comercial actual.",
    financiadoresColegios: 25,
    financiadoresPublicos: 4,
    financiadoresNota: "ESTIMADO · exploratorio; no priorizar secretarías en cohorte actual.",
    ofertasUnisabana: [
      "One-pager Educación (biblioteca) solo si hay inbound · sin promesa de cohorte regional.",
      "Early bird genérico [CONFIRMAR: 15%] en pieza digital · sin tarifa inventada.",
    ],
    competenciaPrincipal: [
      {
        nombre: "UNAD",
        nota: "Virtual · oferta dominante por distancia.",
      },
      {
        nombre: "Oferta virtual (otras IES)",
        nota: "Por confirmar · no abrir frente comercial sin lista.",
      },
    ],
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
    alumnosPotenciales: null,
    alumnosNota: "N/D · fuera de foco cohorte 2027-1.",
    directivosInteresados: null,
    directivosNota: "N/D.",
    financiadoresColegios: null,
    financiadoresPublicos: null,
    financiadoresNota: "N/D · sin abordaje comercial previsto.",
    ofertasUnisabana: [
      "Sin oferta activa · redirigir a canales digitales nacionales solo si hay inbound.",
    ],
    competenciaPrincipal: [
      {
        nombre: "UNAD",
        nota: "Virtual · única referencia práctica de alcance.",
      },
    ],
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
  { id: "guajira", label: "Guajira", zonaId: "guajira" },
  { id: "valledupar", label: "Valledupar", zonaId: "cesar" },
  { id: "bucaramanga", label: "Bucaramanga", zonaId: "santander" },
  { id: "neiva", label: "Neiva · regional", zonaId: "huila" },
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
