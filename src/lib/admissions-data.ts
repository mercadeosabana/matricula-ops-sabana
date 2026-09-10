/** Datos demo · equipo de admisiones (sin Azure) */

export const COSTOS_EJEMPLO = {
  inversionMercadeoCop: 48_000_000,
  visitasRealizadas: 36,
  matriculas: 6,
  cacCop: 8_000_000, // inversión / matrículas
  costoPorVisitaCop: 1_333_333,
  costoPorMatriculaCop: 8_000_000,
  nota: "Cifras EJEMPLO · últimos 30 días · cohorte 2027-1",
};

export const CAPACIDAD_PROGRAMAS = [
  {
    programa: "Maestría en Educación",
    chiaCupos: 25,
    chiaOcupados: 18,
    neivaCupos: 20,
    neivaOcupados: 6,
    minimoRegional: 15,
  },
  {
    programa: "Pedagogía",
    chiaCupos: 25,
    chiaOcupados: 14,
    neivaCupos: 18,
    neivaOcupados: 4,
    minimoRegional: 12,
  },
  {
    programa: "Dirección y Gestión Educativa",
    chiaCupos: 20,
    chiaOcupados: 16,
    neivaCupos: 15,
    neivaOcupados: 3,
    minimoRegional: 12,
  },
  {
    programa: "Desarrollo Infantil",
    chiaCupos: 20,
    chiaOcupados: 11,
    neivaCupos: 16,
    neivaOcupados: 5,
    minimoRegional: 12,
  },
];

export const BIBLIOTECA_OFERTAS = [
  {
    id: "o-edu",
    titulo: "One-pager · Maestría en Educación",
    programa: "Educación",
    tipo: "one-pager",
    aprobada: true,
    markdown: `# Maestría en Educación · Unisabana
**Cohorte 2027-1 · Campus Chía**

Formación avanzada para docentes y líderes escolares.

- Visitas campus: sábados [CONFIRMAR: 20 y 27 sep], 9:00–11:00
- Early bird [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct 2026]
- Inversión referencial [CONFIRMAR: $28.500.000]

**Aprobada por Dirección** · Facultad de Educación
`,
  },
  {
    id: "o-ped",
    titulo: "One-pager · Pedagogía",
    programa: "Pedagogía",
    tipo: "one-pager",
    aprobada: true,
    markdown: `# Maestría en Pedagogía · Unisabana
**Cohorte 2027-1 · Foco Cajicá / sabana norte**

Innovación pedagógica para coordinadores y docentes.

- Visita campus Chía · 2 h
- Early bird [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct]
- Inversión [CONFIRMAR: $28.500.000]

**Aprobada por Dirección**
`,
  },
  {
    id: "o-dir",
    titulo: "One-pager · Dirección y Gestión Educativa",
    programa: "Dirección y Gestión",
    tipo: "one-pager",
    aprobada: true,
    markdown: `# Maestría en Dirección y Gestión Educativa
**Para quienes lideran colegios · Cohorte 2027-1**

Liderazgo, equipos y gestión de instituciones educativas.

- Visitas sábados Chía [CONFIRMAR]
- Early bird institucional [CONFIRMAR: 15%]
- Inversión [CONFIRMAR: $29.200.000]

**Aprobada por Dirección**
`,
  },
  {
    id: "o-di",
    titulo: "One-pager · Desarrollo Infantil",
    programa: "Desarrollo Infantil",
    tipo: "one-pager",
    aprobada: true,
    markdown: `# Maestría en Desarrollo Infantil · Unisabana
**Preescolar y primera infancia · Cohorte 2027-1**

Pensada para coordinación de preescolar y equipos de primera infancia.

- Visita campus 2 h
- Early bird [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct]
- Inversión [CONFIRMAR: $28.800.000]

**Aprobada por Dirección**
`,
  },
  {
    id: "o-eb",
    titulo: "Early bird · pie de pieza",
    programa: "Todos",
    tipo: "promo",
    aprobada: true,
    markdown: `# Early bird cohorte 2027-1
**[CONFIRMAR: 15%] de descuento hasta [CONFIRMAR: 15 oct 2026]**

Válido para las 4 maestrías · Facultad de Educación · Unisabana.
Sujeto a cupos y aprobación de Dirección.

**Aprobada por Dirección**
`,
  },
  {
    id: "o-conv",
    titulo: "Convenio regional · entidad territorial",
    programa: "Cohortes regionales",
    tipo: "convenio",
    aprobada: true,
    markdown: `# Convenio territorial · Maestrías Unisabana
**Alcaldías · Secretarías de Educación · Gobernaciones**

La entidad cofinancia / financia maestrías de docentes de su jurisdicción.

- Cupos preferentes planta y provisionales
- Early bird institucional [CONFIRMAR: 15%]
- Inversión [CONFIRMAR: $28.5M–$29.2M] · pago entidad [CONFIRMAR]
- Sedes ejemplo: Chía (campus) + Neiva (cohorte regional)

**Aprobada por Dirección** · Agente Región
`,
  },
  {
    id: "o-vis",
    titulo: "Visita campus 2 h · agenda",
    programa: "Todos",
    tipo: "visita",
    aprobada: true,
    markdown: `# Visita campus Chía · 2 horas
**Sábados [CONFIRMAR: 20 y 27 sep 2026] · 9:00–11:00**

09:00 Bienvenida  
09:20 Programas (4 maestrías)  
09:50 Admisiones + early bird  
10:20 Recorrido campus  
10:45 Preguntas e inscripción  

Punto de encuentro: [CONFIRMAR: portería / edificio]

**Aprobada por Dirección** · Agente Admisiones
`,
  },
];

export const SALA_GUERRA_ACCIONES = [
  "Cerrar WA follow-up Vermont (caliente) antes de viernes 12:00",
  "Confirmar cupos visita sáb 20 sep — meta 12 show-up",
  "Enviar carta Secretaría (Región) tras OK Dirección",
  "Reactivar 6 fríos Bogotá norte con secuencia D+3",
  "Agendar 3 líderes Nueva Granada / Nogales (Dirección y Gestión)",
  "Empujar early bird en toda pieza hasta 15 oct (CONFIRMAR)",
  "Completar checklist post-visita · Marymount + San Jorge",
  "Validar cupos Neiva: faltan inscritos para abrir cohorte regional",
  "Guardian: revisar craft Región (tono institucional)",
  "Brief Lucía: gap $550–605M · semáforo amarillo",
];

export const TERRITORIOS = [
  { zona: "Bogotá norte", colegios: 42, leadsCalientes: 8, owner: "Laura Natalia" },
  { zona: "Chía–Cajicá", colegios: 18, leadsCalientes: 11, owner: "Laura Natalia" },
  { zona: "Sabana occidente", colegios: 12, leadsCalientes: 3, owner: "Laura Natalia" },
  { zona: "Neiva / Huila (regional)", colegios: 9, leadsCalientes: 4, owner: "Agente Región" },
];

export function briefSemanaTexto(): string {
  return `Brief de la semana · Orquestadora · Facultad de Educación · Unisabana
Semana 8–14 sep 2026 · Cohorte 2027-1 · EJEMPLO

Hola Natalia, hola Lucía —

1) Embudo: 420→126→48→36→14→6 (meta 40). Semáforo amarillo. Gap ~$550–605M.
2) Movimiento: +12% contactos WoW; interés→agenda 38% (meta 45%); show-up 75%.
3) Top acciones: (a) cerrar Vermont caliente, (b) cupos sáb 20 sep, (c) carta Secretaría, (d) post-visita Marymount/San Jorge, (e) Neiva — faltan cupos para abrir cohorte.
4) Territorios: priorizar Chía–Cajicá (calientes) y Bogotá norte (volumen frío→tibio).
5) Costo por matrícula EJEMPLO: ~$8M COP · CAC alineado · costo/visita ~$1.3M.
6) Guardian: pasar craft Región y early bird antes de envío masivo.
7) Nada sale sin OK humano. Yo priorizo la cola; ustedes aprueban.

— Agente Orquestadora`;
}
