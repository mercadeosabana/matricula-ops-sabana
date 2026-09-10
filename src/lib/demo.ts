/** Demo mode helpers — cookie `demo=1` or query `?demo=1` */

export const DEMO_COOKIE = "matricula_demo";

export function isDemoFromCookieHeader(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return /(?:^|;\s*)matricula_demo=1(?:;|$)/.test(cookieHeader);
}

export function parseDemoQuery(url: string | URL): boolean {
  try {
    const u = typeof url === "string" ? new URL(url) : url;
    return u.searchParams.get("demo") === "1";
  } catch {
    return false;
  }
}

/** Client-side: read demo flag from cookie or URL */
export function readDemoClient(): boolean {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).get("demo") === "1") {
    return true;
  }
  return document.cookie.split(";").some((c) => c.trim() === `${DEMO_COOKIE}=1`);
}

export function setDemoCookie(on: boolean) {
  if (typeof document === "undefined") return;
  if (on) {
    document.cookie = `${DEMO_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  } else {
    document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export const LINKEDIN_DRAFTS = [
  {
    id: "li-1",
    destinatario: "Rectoría · Colegio San Viator (Usaquén)",
    tipo: "Conexión + nota",
    texto:
      "Estimada/o Rector/a,\n\nSoy del equipo de la Facultad de Educación de la Universidad de La Sabana. Me gustaría conectar para compartir la Maestría en Educación (cohorte 2027-1) y las visitas de campus los sábados [CONFIRMAR: 20 y 27 sep].\n\n¿Le parece bien una nota breve o una visita de 2 h en Chía?\n\n— Facultad de Educación · Unisabana",
  },
  {
    id: "li-2",
    destinatario: "Dirección académica · Colegio Nueva Granada (Chía)",
    tipo: "InMail · líderes",
    texto:
      "Hola [Nombre],\n\nEscribo desde la Facultad de Educación (Unisabana) sobre la Maestría en Dirección y Gestión Educativa. Está pensada para quienes lideran colegios del corredor Chía–Cajicá–Bogotá norte.\n\nInvitación: visita campus [CONFIRMAR: sáb 27 sep], 9:00–11:00 · Early bird [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct].\n\n¿Le envío la agenda o preferimos 90 segundos por llamada?\n\nFacultad de Educación · Universidad de La Sabana",
  },
  {
    id: "li-3",
    destinatario: "Coordinación preescolar · Colegio Marymount",
    tipo: "Conexión · Desarrollo Infantil",
    texto:
      "Hola [Nombre],\n\nVimos que en Marymount el área de primera infancia es muy fuerte. Queríamos compartir la Maestría en Desarrollo Infantil (cohorte 2027-1).\n\n• Visita campus Chía — [CONFIRMAR: sáb 20 o 27 sep], 9:00–11:00\n• Early bird [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct]\n• Inversión referencial [CONFIRMAR: $28.800.000]\n\n¿Le agendo la visita?\n\n— Facultad de Educación · Unisabana",
  },
];

export const LLAMADA_SCRIPT_90S = `[0:00–0:15] Hola, ¿hablo con [Nombre]? Soy [Tu nombre] de la Facultad de Educación de la Universidad de La Sabana. ¿Le tomo 90 segundos?

[0:15–0:35] Estamos abriendo la cohorte 2027-1: Educación, Pedagogía, Dirección y Gestión, y Desarrollo Infantil.

[0:35–0:55] Dos caminos: (1) visita campus Chía [CONFIRMAR: sáb 20 o 27 sep], o (2) brochure por WhatsApp. Early bird [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct].

[0:55–1:15] ¿Le agendo la visita o le mando la info por WhatsApp ahora?

— Guion piloto Llamada IA · sin telefonía real en demo`;

export const VISITA_SLOTS = [
  {
    id: "vs-1",
    label: "Sábado [CONFIRMAR: 20 sep 2026] · 9:00–11:00",
    cupos: "8 cupos abiertos",
  },
  {
    id: "vs-2",
    label: "Sábado [CONFIRMAR: 27 sep 2026] · 9:00–11:00",
    cupos: "12 cupos abiertos",
  },
  {
    id: "vs-3",
    label: "Sábado [CONFIRMAR: 4 oct 2026] · 9:00–11:00",
    cupos: "15 cupos abiertos",
  },
];


export const REGION_CARTA = {
  destinatario: "Secretaría de Educación · [CONFIRMAR: municipio / departamento]",
  asunto: "Convenio territorial · Maestrías Facultad de Educación · Unisabana",
  cuerpo: `Estimada/o Secretaria/o [Nombre],

Desde la Facultad de Educación de la Universidad de La Sabana queremos proponer un convenio territorial para que docentes de su jurisdicción cursen maestrías (Educación, Pedagogía, Dirección y Gestión, Desarrollo Infantil) con apoyo de la entidad territorial.

• Cohortes regionales 2027-1 (presencial / híbrido según sede) — fechas [CONFIRMAR]
• Cupos preferentes para docentes de planta y provisionales
• Early bird institucional [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct 2026]
• Inversión referencial por estudiante [CONFIRMAR: $28.5M–$29.2M] · modalidad de pago entidad [CONFIRMAR]

Agenda sugerida: reunión 30 min o visita campus Chía [CONFIRMAR: sáb 20 o 27 sep].

Quedamos atentos para avanzar el convenio.

Facultad de Educación · Universidad de La Sabana
Agente Región · convenios territoriales`,
};

export const CANAL_FUNNEL_POTENCIAL = [
  {
    canal: "Outlook (email)",
    estado: "live_pending" as const,
    estadoLabel: "Requiere TI · Azure",
    contactos: 180,
    visitas: 22,
    matriculas: 3,
  },
  {
    canal: "WhatsApp Business",
    estado: "live_pending" as const,
    estadoLabel: "Requiere TI · Meta",
    contactos: 140,
    visitas: 18,
    matriculas: 2,
  },
  {
    canal: "LinkedIn",
    estado: "drafts" as const,
    estadoLabel: "Borradores (sin auto-envío)",
    contactos: 60,
    visitas: 6,
    matriculas: 1,
  },
  {
    canal: "Llamada IA",
    estado: "piloto" as const,
    estadoLabel: "Piloto · simulación",
    contactos: 40,
    visitas: 8,
    matriculas: 1,
  },
  {
    canal: "Visita campus",
    estado: "live" as const,
    estadoLabel: "Agenda 2 h activa",
    contactos: 48,
    visitas: 36,
    matriculas: 6,
  },
  {
    canal: "Región / Convenios",
    estado: "piloto" as const,
    estadoLabel: "Piloto · alcaldías / SE",
    contactos: 24,
    visitas: 4,
    matriculas: 2,
  },
];
