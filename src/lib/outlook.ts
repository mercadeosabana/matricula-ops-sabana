import {
  appBaseUrl,
  azureEnvConfigured,
  azureTenant,
  getOutlookTokens,
  outlookRedirectUri,
  setOutlookTokens,
  type OutlookTokens,
} from "./connections";

const SCOPES = ["openid", "profile", "email", "offline_access", "User.Read", "Mail.Send"].join(
  " "
);

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

  const tokens: OutlookTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    scope: data.scope,
    accountEmail,
    connectedAt: new Date().toISOString(),
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
  const next: OutlookTokens = {
    ...tokens,
    accessToken: data.access_token,
    refreshToken: data.refresh_token || tokens.refreshToken,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    scope: data.scope || tokens.scope,
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

  // Extract a plausible email from dest string if present
  const emailMatch = opts.to.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const toAddress = emailMatch?.[0];
  if (!toAddress) {
    // No real recipient email in demo dest — queue instead of failing Graph
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

export function outlookSetupChecklist() {
  return {
    title: "Faltan credenciales de Azure — pedir a TI / Ivan",
    items: [
      "Crear App registration en Azure AD (Entra ID)",
      "Redirect URI: https://matricula-ops-sabana.vercel.app/api/oauth/outlook/callback",
      "Permisos API: Mail.Send + offline_access + User.Read (delegated)",
      "Crear Client secret y anotar Client ID / Tenant ID",
      "En Vercel: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID (o common), NEXT_PUBLIC_APP_URL",
    ],
    redirectUri: outlookRedirectUri(),
    appUrl: appBaseUrl(),
  };
}
