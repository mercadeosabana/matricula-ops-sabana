import { AGENTS, getAgent, type AgentId } from "./agents";

export type ChatMessage = { role: "user" | "assistant"; content: string };

function heuristicDraft(agentId: AgentId, message: string): string {
  const m = message.toLowerCase();
  const wantsEmail =
    /email|correo|carta|borrador|whatsapp|wa |guion|llamada|linkedin|plan|secuencia|visita|convenio|secretar/.test(
      m
    );

  if (agentId === "captacion") {
    if (/whatsapp|wa /.test(m)) {
      return `Borrador WhatsApp (listo para Hoy):\n\nHola [Nombre], buen día 👋\nSoy del equipo de la Facultad de Educación · Unisabana. Retomamos la maestría que conversamos:\n📅 Visita campus Chía: [CONFIRMAR: sáb 20 o 27 sep], 9:00–11:00\n💰 Early bird [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct]\n¿Le agendo la visita o le llamo 90 segundos?\n— Facultad de Educación\n\nMarca [CONFIRMAR] antes de enviar. Yo no envío: lo aprueba Mercadeo.`;
    }
    if (/linkedin/.test(m)) {
      return `Borrador LinkedIn (sin auto-envío):\n\nEstimada/o Rector/a,\nMe gustaría conectar desde la Facultad de Educación (Unisabana) para compartir la Maestría en Educación · cohorte 2027-1 y visitas sábados [CONFIRMAR: 20 y 27 sep].\n¿Le parece una nota breve o visita 2 h en Chía?\n— Unisabana Educación\n\nSolo copiar/pegar tras aprobar.`;
    }
    if (/llamada|guion|90/.test(m)) {
      return `Guion 90 s:\n[0:00] ¿Hablo con [Nombre]? Facultad de Educación · Unisabana, ¿90 segundos?\n[0:15] Cohorte 2027-1: Educación, Pedagogía, Dirección y Gestión, Desarrollo Infantil.\n[0:35] Visita Chía [CONFIRMAR: sáb 20/27 sep] o brochure WA. Early bird [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct].\n[0:55] ¿Agenda visita o le mando info ahora?\n\nEn piloto Llamada IA puedes «Simular llamada» en Canales.`;
    }
    return `Email frío propuesto:\n\nAsunto: Invitación Maestría · Facultad de Educación · Unisabana\n\nEstimada/o [Nombre / Rectoría],\nEscribimos desde marketing de la Facultad de Educación (Universidad de La Sabana) para colegios como el suyo.\n• Visitas campus: sábados [CONFIRMAR: 20 y 27 sep 2026], 9:00–11:00\n• Early bird [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct]\n• Inversión referencial [CONFIRMAR: $28.500.000]\n¿Agendamos 15 minutos?\nFacultad de Educación · Unisabana\n\nSiguiente paso: Laura Natalia aprueba/edita en Hoy.`;
  }

  if (agentId === "admisiones") {
    if (/recordatorio|show/.test(m)) {
      return `Recordatorio WA −24 h:\n\nHola [Nombre], mañana lo/la esperamos en campus Unisabana (Chía) 9:00–11:00 · visita maestrías. Punto de encuentro: [CONFIRMAR: portería / edificio]. ¿Confirma asistencia? Responda SÍ o REAGENDAR.\n— Admisiones · Facultad de Educación`;
    }
    return `Agenda visita 2 h (Chía) — plantilla:\n09:00 Bienvenida\n09:20 Programas (4 maestrías)\n09:50 Admisiones + early bird [CONFIRMAR: 15% hasta 15 oct]\n10:20 Recorrido campus\n10:45 Preguntas e inscripción\n\nCupos abiertos: [CONFIRMAR: sáb 20 sep], [CONFIRMAR: sáb 27 sep], [CONFIRMAR: sáb 4 oct].\nInversión [CONFIRMAR: $28.5M–$29.2M].\n\nPuedo armar la invitación email/WA cuando quieras.`;
  }

  if (agentId === "inteligencia") {
    return `Insight EJEMPLO (últimos 30 d):\n• Embudo 420 contactos → 126 interés (30%) → 48 agendadas (38%) → 36 visitaron (75%) → 14 apps → 6 matrículas (meta 40).\n• Prioridad Hoy: (1) warm Cajicá/Vermont Pedagogía, (2) líderes Chía Dirección y Gestión, (3) preescolares DI, (4) fríos Bogotá norte Educación.\n• Cuello: interés→visita y app→matrícula. Empujar WA D+3 + guion 90 s + early bird.\n• Semáforo: amarillo · gap ~$550–605M vs meta $1.100M.\n\n¿Quieres un corte por zona o por programa?`;
  }

  if (agentId === "orquestadora") {
    return `Plan cola Hoy (propuesta):\n1. Email frío San Viator (Captación)\n2. WA follow-up Vermont (Captación)\n3. Llamada IA piloto Vermont\n4. LinkedIn borradores rectores\n5. Visita campus — confirmar cupos sábados (Admisiones)\n6. Email líderes Chía (Inteligencia→Captación)\n7. Secuencia D+3/7/14 (un Aprobar = 3 toques)\n8. WA Desarrollo Infantil\n9. Región — carta Secretaría (convenio)\n\nNada sale sin OK de Mercadeo. Early bird cierra [CONFIRMAR: 15 oct] — priorizar warm + visitas.`;
  }

  // region
  if (/carta|secretar|convenio|alcald|gobern/.test(m) || wantsEmail) {
    return `Carta a Secretaría (borrador):\n\nAsunto: Convenio territorial · Maestrías Facultad de Educación · Unisabana\n\nEstimada/o Secretaria/o [Nombre],\nProponemos un convenio para que docentes de su jurisdicción cursen maestrías (Educación, Pedagogía, Dirección y Gestión, Desarrollo Infantil) con apoyo de la entidad territorial.\n• Cohortes regionales 2027-1 — fechas [CONFIRMAR]\n• Cupos preferentes planta/provisionales\n• Early bird institucional [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct]\n• Inversión [CONFIRMAR: $28.5M–$29.2M] · pago entidad [CONFIRMAR]\nAgenda: reunión 30 min o visita Chía [CONFIRMAR: sáb 20/27 sep].\nFacultad de Educación · Unisabana · Agente Región\n\nLaura Natalia aprueba el envío; Dirección valida excepciones.`;
  }
  return `Puedo preparar: (1) carta a Secretaría/alcaldía, (2) one-pager del convenio, (3) agenda reunión 30 min, (4) estimación de cupos regionales EJEMPLO.\nDime municipio/departamento [CONFIRMAR] y si el pago es 100% entidad o cofinanciado.`;
}

export function demoRespond(
  agentId: AgentId,
  message: string,
  history: ChatMessage[] = []
): string {
  const agent = getAgent(agentId);
  const name = agent?.name || agentId;
  const draft = heuristicDraft(agentId, message);
  const prior = history.filter((h) => h.role === "user").length;
  const opener =
    prior === 0
      ? `Hola, soy el Agente ${name}. `
      : `De acuerdo (Agente ${name}). `;
  return `${opener}${draft}`;
}

export async function llmRespond(
  agentId: AgentId,
  message: string,
  history: ChatMessage[] = []
): Promise<{ reply: string; provider: string } | null> {
  const agent = getAgent(agentId);
  if (!agent) return null;

  const openaiKey = process.env.OPENAI_API_KEY;
  const xaiKey = process.env.XAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  type Provider = {
    name: string;
    url: string;
    key: string;
    model: string;
  };

  let provider: Provider | null = null;
  if (xaiKey) {
    provider = {
      name: "xai",
      url: "https://api.x.ai/v1/chat/completions",
      key: xaiKey,
      model: process.env.XAI_MODEL || "grok-2-latest",
    };
  } else if (openaiKey) {
    provider = {
      name: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      key: openaiKey,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  } else if (groqKey) {
    provider = {
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: groqKey,
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    };
  }

  if (!provider) return null;

  const messages = [
    { role: "system", content: agent.systemPrompt },
    ...history.slice(-8).map((h) => ({
      role: h.role,
      content: h.content,
    })),
    { role: "user", content: message },
  ];

  const res = await fetch(provider.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      temperature: 0.6,
      max_tokens: 900,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("LLM error", provider.name, res.status, errText.slice(0, 200));
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) return null;
  return { reply, provider: provider.name };
}

export { AGENTS };
