import { AGENTS, getAgent, type AgentId } from "./agents";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const DEMO_NOTE = "(modo demo local · sin LLM)";

/** Process / workflow questions — answer in prose BEFORE any draft. */
function isProcessQuestion(message: string): boolean {
  const m = message.toLowerCase();
  return /empezamos|empezamos\?|buscas|busc[aá]s\?|env[ií]as|envias|env[ií]as vos|envias vos|c[oó]mo|qui[eé]n|puedo|apruebo|ok\b|vale\b|proceso|flujo|workflow|t[uú] (buscas|env[ií]as|mandas)|vos (buscas|env[ií]as)|auto-?env[ií]o|solo env[ií]as|qui[eé]n env[ií]a|qui[eé]n busca|aprobaci[oó]n|human.?in.?the.?loop|sin (api|llm|clave)/.test(
    m
  );
}

function wantsDraftOnly(message: string): boolean {
  const m = message.toLowerCase();
  return /dame el borrador|dame (un |el )?borrador|redacta|escribe|arma(me)? (un |el )?|prep[aá]rame|borrador (de |para )?|guion|plantilla|craft/.test(
    m
  );
}

function wantsCraftWithQuestion(message: string): boolean {
  const m = message.toLowerCase();
  return (
    wantsDraftOnly(m) ||
    /y (el |un )?borrador|incluye (el )?borrador|tambi[eé]n (el )?borrador|dame (un )?ejemplo/.test(
      m
    )
  );
}

function mentionsChannel(message: string): {
  linkedin: boolean;
  whatsapp: boolean;
  llamada: boolean;
  email: boolean;
} {
  const m = message.toLowerCase();
  return {
    linkedin: /linkedin/.test(m),
    whatsapp: /whatsapp|wa\b/.test(m),
    llamada: /llamada|guion|90\s*s/.test(m),
    email: /email|correo|carta|fr[ií]o/.test(m),
  };
}

function formatDraftBlock(title: string, body: string): string {
  return `---\n**${title}**\n\n${body.trim()}\n---`;
}

function heuristicDraft(agentId: AgentId, message: string): string | null {
  const m = message.toLowerCase();
  const ch = mentionsChannel(message);
  const wantsEmail =
    /email|correo|carta|borrador|whatsapp|wa\b|guion|llamada|linkedin|plan|secuencia|visita|convenio|secretar/.test(
      m
    );

  if (agentId === "captacion") {
    if (ch.whatsapp) {
      return formatDraftBlock(
        "Borrador WhatsApp (listo para Hoy)",
        `Hola [Nombre], buen día 👋

Soy del equipo de la Facultad de Educación · Unisabana. Retomamos la maestría que conversamos:

📅 Visita campus Chía: [CONFIRMAR: sáb 20 o 27 sep], 9:00–11:00
💰 Early bird [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct]

¿Le agendo la visita o le llamo 90 segundos?

— Facultad de Educación

Marca [CONFIRMAR] antes de enviar. Yo no envío: lo aprueba Mercadeo.`
      );
    }
    if (ch.linkedin) {
      return formatDraftBlock(
        "Borrador LinkedIn (sin auto-envío)",
        `**Asunto / nota de conexión**

Estimada/o Rector/a,

Me gustaría conectar desde la Facultad de Educación (Unisabana) para compartir la Maestría en Educación · cohorte 2027-1 y visitas sábados [CONFIRMAR: 20 y 27 sep].

¿Le parece una nota breve o visita 2 h en Chía?

— Unisabana Educación

Solo copiar/pegar tras aprobar en Hoy.`
      );
    }
    if (ch.llamada) {
      return formatDraftBlock(
        "Guion llamada 90 s",
        `[0:00] ¿Hablo con [Nombre]? Facultad de Educación · Unisabana, ¿90 segundos?
[0:15] Cohorte 2027-1: Educación, Pedagogía, Dirección y Gestión, Desarrollo Infantil.
[0:35] Visita Chía [CONFIRMAR: sáb 20/27 sep] o brochure WA. Early bird [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct].
[0:55] ¿Agenda visita o le mando info ahora?

En piloto Llamada IA puedes «Simular llamada» en Canales.`
      );
    }
    if (wantsEmail || ch.email || /borrador|redacta|email|correo/.test(m)) {
      return formatDraftBlock(
        "Email frío propuesto",
        `**Asunto:** Invitación Maestría · Facultad de Educación · Unisabana

**Cuerpo:**

Estimada/o [Nombre / Rectoría],

Escribimos desde marketing de la Facultad de Educación (Universidad de La Sabana) para colegios como el suyo.

• Visitas campus: sábados [CONFIRMAR: 20 y 27 sep 2026], 9:00–11:00
• Early bird [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct]
• Inversión referencial [CONFIRMAR: $28.500.000]

¿Agendamos 15 minutos?

Facultad de Educación · Unisabana

Siguiente paso: Laura Natalia aprueba/edita en Hoy.`
      );
    }
    return null;
  }

  if (agentId === "admisiones") {
    if (/recordatorio|show/.test(m)) {
      return formatDraftBlock(
        "Recordatorio WA −24 h",
        `Hola [Nombre], mañana lo/la esperamos en campus Unisabana (Chía) 9:00–11:00 · visita maestrías. Punto de encuentro: [CONFIRMAR: portería / edificio]. ¿Confirma asistencia? Responda SÍ o REAGENDAR.

— Admisiones · Facultad de Educación`
      );
    }
    if (wantsEmail || /agenda|visita|invitaci[oó]n|cupo/.test(m)) {
      return formatDraftBlock(
        "Agenda visita 2 h (Chía)",
        `09:00 Bienvenida
09:20 Programas (4 maestrías)
09:50 Admisiones + early bird [CONFIRMAR: 15% hasta 15 oct]
10:20 Recorrido campus
10:45 Preguntas e inscripción

Cupos abiertos: [CONFIRMAR: sáb 20 sep], [CONFIRMAR: sáb 27 sep], [CONFIRMAR: sáb 4 oct].
Inversión [CONFIRMAR: $28.5M–$29.2M].

Puedo armar la invitación email/WA cuando quieras.`
      );
    }
    return null;
  }

  if (agentId === "inteligencia") {
    return `**Insight EJEMPLO (últimos 30 d)**

• Embudo 420 contactos → 126 interés (30%) → 48 agendadas (38%) → 36 visitaron (75%) → 14 apps → 6 matrículas (meta 40).
• Prioridad Hoy: (1) warm Cajicá/Vermont Pedagogía, (2) líderes Chía Dirección y Gestión, (3) preescolares DI, (4) fríos Bogotá norte Educación.
• Cuello: interés→visita y app→matrícula. Empujar WA D+3 + guion 90 s + early bird.
• Semáforo: amarillo · gap ~$550–605M vs meta $1.100M.

¿Quieres un corte por zona o por programa?`;
  }

  if (agentId === "orquestadora") {
    return `**Plan cola Hoy (propuesta)**

1. Email frío San Viator (Captación)
2. WA follow-up Vermont (Captación)
3. Llamada IA piloto Vermont
4. LinkedIn borradores rectores
5. Visita campus — confirmar cupos sábados (Admisiones)
6. Email líderes Chía (Inteligencia→Captación)
7. Secuencia D+3/7/14 (un Aprobar = 3 toques)
8. WA Desarrollo Infantil
9. Región — carta Secretaría (convenio)

Nada sale sin OK de Mercadeo. Early bird cierra [CONFIRMAR: 15 oct] — priorizar warm + visitas.`;
  }

  if (agentId === "guardian") {
    if (/bloquear|riesgo|precio sin|sin confirmar|garantiz/.test(m)) {
      return `**Veredicto: BLOQUEAR** (demo)

• Hay claims o precios sin [CONFIRMAR] / promesa de admisión.
• Ajusta tono a institucional y marca cifras con [CONFIRMAR: …].
• Reenvía a Guardian antes de Hoy → Enviar.`;
    }
    if (/ok|revisa|revisar|guardian|craft|email|whatsapp|carta/.test(m) || wantsEmail) {
      return `**Veredicto: OK** (demo)

• Tono profesional · Facultad de Educación.
• [CONFIRMAR] presentes donde aplica.
• Sin promesas de admisión garantizada.

Puedes proceder a Aprobar / Enviar en Hoy. Guardian no envía.`;
    }
    return `Soy Guardian. Pégame el craft (asunto + cuerpo) y te doy **OK** o **BLOQUEAR** con motivo.

Reviso: tono, [CONFIRMAR], claims, riesgo reputacional.`;
  }

  // region
  if (/carta|secretar|convenio|alcald|gobern/.test(m) || wantsEmail) {
    return formatDraftBlock(
      "Carta a Secretaría (borrador)",
      `**Asunto:** Convenio territorial · Maestrías Facultad de Educación · Unisabana

**Cuerpo:**

Estimada/o Secretaria/o [Nombre],

Proponemos un convenio para que docentes de su jurisdicción cursen maestrías (Educación, Pedagogía, Dirección y Gestión, Desarrollo Infantil) con apoyo de la entidad territorial.

• Cohortes regionales 2027-1 — fechas [CONFIRMAR]
• Cupos preferentes planta/provisionales
• Early bird institucional [CONFIRMAR: 15%] hasta [CONFIRMAR: 15 oct]
• Inversión [CONFIRMAR: $28.5M–$29.2M] · pago entidad [CONFIRMAR]

Agenda: reunión 30 min o visita Chía [CONFIRMAR: sáb 20/27 sep].

Facultad de Educación · Unisabana · Agente Región

Laura Natalia aprueba el envío; Dirección valida excepciones.`
    );
  }
  return `Puedo preparar: (1) carta a Secretaría/alcaldía, (2) one-pager del convenio, (3) agenda reunión 30 min, (4) estimación de cupos regionales EJEMPLO.

Dime municipio/departamento [CONFIRMAR] y si el pago es 100% entidad o cofinanciado.`;
}

function processAnswer(agentId: AgentId, message: string): string {
  const ch = mentionsChannel(message);
  const m = message.toLowerCase();

  if (agentId === "captacion") {
    if (ch.linkedin || /mensaje.?s?.?en.?fr[ií]o|outreach|contacto.?fr[ií]o/.test(m)) {
      return `Sí, podemos arrancar outreach en frío por LinkedIn — con el flujo correcto:

1. **Yo BUSCO** perfiles (rectoría / coordinación) y **preparo borradores**.
2. Esos borradores aparecen en **Hoy** → *Estrategia de esta semana* / cola de Captación.
3. **TÚ (Natalia / Mercadeo) apruebas** y luego **pegas/envías** en LinkedIn.

**NUNCA envío solo.** No hay auto-envío LinkedIn ni API de publicación: el humano siempre hace el último clic.

Si quieres, te dejo un borrador corto debajo o lo generamos cuando digas «dame el borrador».`;
    }
    if (ch.whatsapp) {
      return `Flujo WhatsApp:

1. Yo preparo el borrador y lo dejo en **Hoy** (cola / Estrategia de esta semana).
2. **Tú apruebas**, editas [CONFIRMAR] y envías desde el canal (o pegas en WA).
3. Yo **no** envío solo.

¿Quieres que arme ya el texto? Di «dame el borrador».`;
    }
    if (ch.llamada) {
      return `Flujo llamada 90 s:

1. Yo preparo el **guion** y lo dejo en Hoy.
2. Tú (o el piloto Llamada IA en Canales) ejecutas la llamada.
3. Yo no marco el teléfono solo.

¿Te preparo el guion ahora?`;
    }
    return `Así trabajamos en Captación:

• Yo **busco** leads y **preparo** emails / WA / LinkedIn / guiones.
• Todo pasa por **Hoy** (Estrategia de esta semana / cola) para tu OK.
• **Tú apruebas y envías.** Nunca hay auto-envío.

Dime el canal (email, WA, LinkedIn, llamada) o pide «dame el borrador» cuando quieras el craft.`;
  }

  if (agentId === "admisiones") {
    return `En Admisiones el flujo es el mismo human-in-the-loop:

• Yo armo agendas, invitaciones y recordatorios show-up.
• Aparecen en **Hoy** para que **tú apruebes** antes de enviar.
• Yo no confirmo cupos ni envío solo.

¿Quieres la agenda 2 h o el recordatorio −24 h? Di «dame el borrador» si lo necesitas ya.`;
  }

  if (agentId === "inteligencia") {
    return `En Inteligencia priorizo segmentos y explico el embudo con números **EJEMPLO**.

No envío mensajes: alimento a Captación/Admisiones con foco. Tú decides qué craft pedirles y qué apruebas en Hoy.

¿Quieres el insight de la semana o un corte por zona/programa?`;
  }

  if (agentId === "orquestadora") {
    return `Como Orquestadora ordeno la cola de Hoy y las secuencias D+3/D+7/D+14.

Nada sale sin tu OK. Yo propongo el orden; Captación/Admisiones preparan craft; **tú apruebas**.

¿Quieres el plan de cola de hoy?`;
  }

  if (agentId === "guardian") {
    return `Guardian revisa riesgo y da **OK** o **BLOQUEAR**. No envío.

Pégame el craft o pide revisar la cola de Hoy.`;
  }

  // region
  return `En Región preparo cartas a Secretaría/alcaldía y one-pagers de convenio.

Todo pasa por tu aprobación en Hoy (y Dirección en excepciones). Yo no envío solo.

¿Municipio/departamento [CONFIRMAR] y si quieres ya el borrador de carta?`;
}

export function demoRespond(
  agentId: AgentId,
  message: string,
  history: ChatMessage[] = []
): string {
  const agent = getAgent(agentId);
  const name = agent?.name || agentId;
  const prior = history.filter((h) => h.role === "user").length;
  const processQ = isProcessQuestion(message);
  const draftWanted =
    wantsDraftOnly(message) ||
    (processQ && wantsCraftWithQuestion(message)) ||
    (!processQ &&
      /email|correo|carta|borrador|whatsapp|wa\b|guion|llamada|linkedin|plan|secuencia|visita|convenio|secretar|redacta|agenda|insight|cola|prioridad|embudo/.test(
        message.toLowerCase()
      ));

  const parts: string[] = [];

  // Demo note once, at the top — not mixed into the greeting awkwardly
  if (prior === 0) {
    parts.push(DEMO_NOTE);
    parts.push("");
    parts.push(`Hola, soy el Agente ${name}.`);
    parts.push("");
  } else {
    parts.push(`De acuerdo (Agente ${name}).`);
    parts.push("");
  }

  if (processQ) {
    parts.push(processAnswer(agentId, message));
    if (draftWanted || /dame el borrador|incluye|ejemplo|y el borrador/.test(message.toLowerCase())) {
      const draft = heuristicDraft(agentId, message);
      if (draft) {
        parts.push("");
        parts.push(draft);
      }
    }
  } else if (draftWanted) {
    const draft = heuristicDraft(agentId, message);
    if (draft) {
      parts.push(draft);
    } else {
      parts.push(
        processAnswer(agentId, message) ||
          `¿Qué craft necesitas? Puedo preparar email, WA, LinkedIn o guion 90 s.`
      );
    }
  } else {
    // Soft default: answer process briefly rather than dumping a template
    parts.push(processAnswer(agentId, message));
  }

  return parts.join("\n").trim();
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
