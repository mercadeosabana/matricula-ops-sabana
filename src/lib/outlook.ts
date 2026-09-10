import {
  appBaseUrl,
  azureEnvConfigured,
  azureTenant,
  getOutlookTokens,
  outlookRedirectUri,
  scopeHasCalendar,
  setOutlookTokens,
  type OutlookTokens,
} from "./connections";

const SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "User.Read",
  "Mail.Send",
  "Calendars.ReadWrite",
].join(" ");

export function buildOutlookAuthUrl(state: string): string | null {
  if (!azureEnvConfigured()) return null;
  const tenant = azureTenant();
  const params = new URLSearchParams({
    client_id: process.env.AZURE_CLIENT_ID!,
    response_type: "code",
    redirect_uri: outlookRedirectUri(),
    response_mode: "query",
    scope: SCOPES,
    state,
  });
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeOutlookCode(code: string): Promise<OutlookTokens> {
  if (!azureEnvConfigured()) {
    throw new Error("Azure no configurado");
  }
  const tenant = azureTenant();
  const body = new URLSearchParams({
    client_id: process.env.AZURE_CLIENT_ID!,
    client_secret: process.env.AZURE_CLIENT_SECRET!,
    code,
    redirect_uri: outlookRedirectUri(),
    grant_type: "authorization_code",
    scope: SCOPES,
  });
  const res = await fetch(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "Token exchange failed");
  }

  let accountEmail: string | undefined;
  try {
    const me = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    if (me.ok) {
      const profile = await me.json();
      accountEmail = profile.mail || profile.userPrincipalName;
    }
  } catch {
    // ignore profile fetch errors
  }

  const scope = data.scope || SCOPES;
  const tokens: OutlookTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    scope,
    accountEmail,
    connectedAt: new Date().toISOString(),
    calendarConnected: scopeHasCalendar(scope),
  };
  setOutlookTokens(tokens);
  return tokens;
}

async function refreshIfNeeded(): Promise<string | null> {
  const tokens = getOutlookTokens();
  if (!tokens?.accessToken) return null;
  if (tokens.expiresAt && tokens.expiresAt > Date.now() + 60_000) {
    return tokens.accessToken;
  }
  if (!tokens.refreshToken || !azureEnvConfigured()) {
    return tokens.accessToken;
  }
  const tenant = azureTenant();
  const body = new URLSearchParams({
    client_id: process.env.AZURE_CLIENT_ID!,
    client_secret: process.env.AZURE_CLIENT_SECRET!,
    refresh_token: tokens.refreshToken,
    grant_type: "refresh_token",
    scope: SCOPES,
  });
  const res = await fetch(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );
  const data = await res.json();
  if (!res.ok) {
    return tokens.accessToken;
  }
  const scope = data.scope || tokens.scope;
  const next: OutlookTokens = {
    ...tokens,
    accessToken: data.access_token,
    refreshToken: data.refresh_token || tokens.refreshToken,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    scope,
    calendarConnected:
      scopeHasCalendar(scope) || Boolean(tokens.calendarConnected),
  };
  setOutlookTokens(next);
  return next.accessToken;
}

export type SendMailResult =
  | { ok: true; mode: "graph" | "queued" | "mock" }
  | { ok: false; error: string; code: string };

/** Attempt Microsoft Graph sendMail. Queues if GRAPH_QUEUE_ONLY=1. */
export async function sendViaOutlook(opts: {
  to: string;
  subject: string;
  body: string;
}): Promise<SendMailResult> {
  if (process.env.FORCE_MOCK_SEND === "1") {
    return { ok: true, mode: "mock" };
  }
  const accessToken = await refreshIfNeeded();
  if (!accessToken) {
    return { ok: false, error: "Conecta Outlook primero", code: "OUTLOOK_NOT_CONNECTED" };
  }
  if (process.env.GRAPH_QUEUE_ONLY === "1") {
    return { ok: true, mode: "queued" };
  }

  const emailMatch = opts.to.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const toAddress = emailMatch?.[0];
  if (!toAddress) {
    return { ok: true, mode: "queued" };
  }

  const res = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject: opts.subject,
        body: { contentType: "Text", content: opts.body },
        toRecipients: [{ emailAddress: { address: toAddress } }],
      },
      saveToSentItems: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return {
      ok: false,
      error: `Graph sendMail falló (${res.status}). ${errText.slice(0, 200)}`,
      code: "GRAPH_SEND_FAILED",
    };
  }
  return { ok: true, mode: "graph" };
}

export type CalendarEventInput = {
  subject: string;
  body?: string;
  startIso: string;
  endIso?: string;
  location?: string;
  attendeeEmail?: string | null;
  attendeeName?: string | null;
};

export type CalendarEventResult =
  | {
      ok: true;
      mode: "graph" | "demo" | "queued";
      eventId: string;
      subject: string;
      startIso: string;
      endIso: string;
      webLink?: string;
    }
  | { ok: false; error: string; code: string };

/** Next Saturday 09:00–11:00 America/Bogota (campus Chía template). */
export function defaultCampusVisitWindow(from = new Date()): {
  startIso: string;
  endIso: string;
  label: string;
} {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(from).map((p) => [p.type, p.value])
  );
  const y = Number(parts.year);
  const m = Number(parts.month);
  const d = Number(parts.day);
  let cursor = new Date(Date.UTC(y, m - 1, d, 17, 0, 0));
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const wd = weekdayMap[parts.weekday as string] ?? cursor.getUTCDay();
  let daysAhead = (6 - wd + 7) % 7;
  const hourBogota = Number(parts.hour);
  if (daysAhead === 0 && hourBogota >= 11) {
    daysAhead = 7;
  }
  cursor = new Date(cursor.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const yy = cursor.getUTCFullYear();
  const mm = String(cursor.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(cursor.getUTCDate()).padStart(2, "0");
  const startLocal = `${yy}-${mm}-${dd}T09:00:00`;
  const endLocal = `${yy}-${mm}-${dd}T11:00:00`;
  const label = `Sábado ${dd}/${mm}/${yy} · 9:00–11:00 · Campus Chía`;
  return { startIso: startLocal, endIso: endLocal, label };
}

export async function createOutlookCalendarEvent(
  opts: CalendarEventInput
): Promise<CalendarEventResult> {
  if (process.env.FORCE_MOCK_SEND === "1") {
    const end = opts.endIso || opts.startIso;
    return {
      ok: true,
      mode: "demo",
      eventId: `demo-${Date.now()}`,
      subject: opts.subject,
      startIso: opts.startIso,
      endIso: end,
    };
  }

  const accessToken = await refreshIfNeeded();
  if (!accessToken) {
    return {
      ok: false,
      error: "Conecta Agenda Outlook primero",
      code: "CALENDAR_NOT_CONNECTED",
    };
  }

  const tokens = getOutlookTokens();
  if (!scopeHasCalendar(tokens?.scope) && !tokens?.calendarConnected) {
    return {
      ok: false,
      error: "Falta permiso Calendars.ReadWrite — reconecta Outlook",
      code: "CALENDAR_NOT_CONNECTED",
    };
  }

  if (process.env.GRAPH_QUEUE_ONLY === "1") {
    return {
      ok: true,
      mode: "queued",
      eventId: `queued-${Date.now()}`,
      subject: opts.subject,
      startIso: opts.startIso,
      endIso: opts.endIso || opts.startIso,
    };
  }

  let endIso = opts.endIso;
  if (!endIso) {
    const m = opts.startIso.match(/^(\d{4}-\d{2}-\d{2}T)(\d{2}):(\d{2}):(\d{2})/);
    if (m) {
      const h = String((Number(m[2]) + 2) % 24).padStart(2, "0");
      endIso = `${m[1]}${h}:${m[3]}:${m[4]}`;
    } else {
      const d = new Date(opts.startIso);
      d.setTime(d.getTime() + 2 * 60 * 60 * 1000);
      endIso = d.toISOString();
    }
  }

  const attendees = opts.attendeeEmail
    ? [
        {
          emailAddress: {
            address: opts.attendeeEmail,
            name: opts.attendeeName || opts.attendeeEmail,
          },
          type: "required",
        },
      ]
    : [];

  const payload = {
    subject: opts.subject,
    body: {
      contentType: "HTML",
      content: (opts.body || "Visita campus · Facultad de Educación · Unisabana").replace(
        /\n/g,
        "<br/>"
      ),
    },
    start: {
      dateTime: opts.startIso.replace(/Z$/, ""),
      timeZone: "America/Bogota",
    },
    end: {
      dateTime: endIso.replace(/Z$/, ""),
      timeZone: "America/Bogota",
    },
    location: {
      displayName: opts.location || "Campus Unisabana · Chía",
    },
    attendees,
    isOnlineMeeting: false,
  };

  const res = await fetch("https://graph.microsoft.com/v1.0/me/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return {
      ok: false,
      error: `Graph calendar falló (${res.status}). ${errText.slice(0, 200)}`,
      code: "GRAPH_CALENDAR_FAILED",
    };
  }

  const created = await res.json();
  return {
    ok: true,
    mode: "graph",
    eventId: created.id || `graph-${Date.now()}`,
    subject: created.subject || opts.subject,
    startIso: opts.startIso,
    endIso,
    webLink: created.webLink,
  };
}

export function outlookSetupChecklist() {
  return {
    title: "Faltan credenciales de Azure — pedir a TI / Ivan",
    items: [
      "Crear App registration en Azure AD (Entra ID)",
      "Redirect URI: https://matricula-ops-sabana.vercel.app/api/oauth/outlook/callback",
      "Permisos API: Mail.Send + Calendars.ReadWrite + offline_access + User.Read (delegated)",
      "Crear Client secret y anotar Client ID / Tenant ID",
      "En Vercel: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID (o common), NEXT_PUBLIC_APP_URL",
    ],
    redirectUri: outlookRedirectUri(),
    appUrl: appBaseUrl(),
  };
}
