import {
  getWhatsAppConnection,
  setWhatsAppConnection,
  type WhatsAppConnection,
} from "./connections";

export type SendWaResult =
  | { ok: true; mode: "cloud" | "queued" | "mock" }
  | { ok: false; error: string; code: string };

export function saveWhatsAppFromUi(input: {
  token: string;
  phoneNumberId: string;
  businessAccountId?: string;
}): WhatsAppConnection {
  const conn: WhatsAppConnection = {
    token: input.token.trim(),
    phoneNumberId: input.phoneNumberId.trim(),
    businessAccountId: input.businessAccountId?.trim() || undefined,
    connectedAt: new Date().toISOString(),
    source: "ui",
  };
  setWhatsAppConnection(conn);
  return conn;
}

export async function sendViaWhatsApp(opts: {
  to: string;
  body: string;
}): Promise<SendWaResult> {
  if (process.env.FORCE_MOCK_SEND === "1") {
    return { ok: true, mode: "mock" };
  }
  const conn = getWhatsAppConnection();
  if (!conn?.token || !conn.phoneNumberId) {
    return {
      ok: false,
      error: "Conecta WhatsApp primero",
      code: "WHATSAPP_NOT_CONNECTED",
    };
  }

  const phoneMatch = opts.to.match(/\+?\d{10,15}/);
  if (!phoneMatch || process.env.WA_QUEUE_ONLY === "1") {
    return { ok: true, mode: "queued" };
  }

  const to = phoneMatch[0].replace(/\D/g, "");
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${conn.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${conn.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: opts.body },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return {
      ok: false,
      error: `WhatsApp Cloud API falló (${res.status}). ${errText.slice(0, 200)}`,
      code: "WA_SEND_FAILED",
    };
  }
  return { ok: true, mode: "cloud" };
}

export function whatsappSetupChecklist() {
  return {
    title: "Falta WhatsApp Business Cloud API — pedir a TI / Ivan",
    items: [
      "Crear / usar Meta Business Manager de la Facultad (no cuenta personal)",
      "WhatsApp Business Cloud API · número de la facultad",
      "Obtener Permanent Access Token (o System User token)",
      "Anotar Phone Number ID y WhatsApp Business Account ID",
      "En Vercel o en esta UI: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_BUSINESS_ACCOUNT_ID",
    ],
  };
}
