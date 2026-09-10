import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "matricula-ops-data")
  : path.join(process.cwd(), "data");
const CONNECTIONS_PATH = path.join(DATA_DIR, "connections.json");

export type OutlookTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
  accountEmail?: string;
  connectedAt: string;
  /** True when granted scopes include Calendars.ReadWrite */
  calendarConnected?: boolean;
};

export type WhatsAppConnection = {
  token: string;
  phoneNumberId: string;
  businessAccountId?: string;
  connectedAt: string;
  source: "env" | "ui";
};

type ConnectionsStore = {
  outlook: OutlookTokens | null;
  whatsapp: WhatsAppConnection | null;
};

let cache: ConnectionsStore | null = null;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getSecret(): string {
  return (
    process.env.CONNECTIONS_SECRET ||
    process.env.AZURE_CLIENT_SECRET ||
    "matricula-ops-local-dev-secret"
  );
}

function encrypt(plain: string): string {
  const key = crypto.createHash("sha256").update(getSecret()).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

function decrypt(payload: string): string {
  if (!payload.startsWith("enc:")) return payload;
  const [, ivB64, tagB64, dataB64] = payload.split(":");
  const key = crypto.createHash("sha256").update(getSecret()).digest();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivB64, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

function emptyStore(): ConnectionsStore {
  return { outlook: null, whatsapp: null };
}

function loadStore(): ConnectionsStore {
  if (cache) return cache;
  ensureDir();
  if (fs.existsSync(CONNECTIONS_PATH)) {
    try {
      const raw = fs.readFileSync(CONNECTIONS_PATH, "utf8");
      const parsed = JSON.parse(raw) as {
        outlook?: OutlookTokens | null | string;
        whatsapp?: WhatsAppConnection | null | string;
      };
      const store: ConnectionsStore = emptyStore();
      if (parsed.outlook) {
        if (typeof parsed.outlook === "string") {
          store.outlook = JSON.parse(decrypt(parsed.outlook)) as OutlookTokens;
        } else {
          store.outlook = parsed.outlook;
        }
      }
      if (parsed.whatsapp) {
        if (typeof parsed.whatsapp === "string") {
          store.whatsapp = JSON.parse(
            decrypt(parsed.whatsapp)
          ) as WhatsAppConnection;
        } else {
          store.whatsapp = parsed.whatsapp;
        }
      }
      cache = store;
      return cache;
    } catch {
      // fall through
    }
  }
  cache = emptyStore();
  return cache;
}

function persist(store: ConnectionsStore) {
  ensureDir();
  const payload = {
    outlook: store.outlook ? encrypt(JSON.stringify(store.outlook)) : null,
    whatsapp: store.whatsapp ? encrypt(JSON.stringify(store.whatsapp)) : null,
  };
  fs.writeFileSync(CONNECTIONS_PATH, JSON.stringify(payload, null, 2), "utf8");
}

function saveStore(store: ConnectionsStore) {
  cache = store;
  persist(store);
}

export function azureEnvConfigured(): boolean {
  return Boolean(
    process.env.AZURE_CLIENT_ID &&
      process.env.AZURE_CLIENT_SECRET &&
      process.env.NEXT_PUBLIC_APP_URL
  );
}

export function azureTenant(): string {
  return process.env.AZURE_TENANT_ID || "common";
}

export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export function outlookRedirectUri(): string {
  return `${appBaseUrl()}/api/oauth/outlook/callback`;
}

export function getOutlookTokens(): OutlookTokens | null {
  return loadStore().outlook;
}

export function setOutlookTokens(tokens: OutlookTokens | null) {
  const store = loadStore();
  store.outlook = tokens;
  saveStore(store);
}

export function isOutlookConnected(): boolean {
  return Boolean(getOutlookTokens()?.accessToken);
}

export function whatsappEnvConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
  );
}

export function getWhatsAppConnection(): WhatsAppConnection | null {
  const stored = loadStore().whatsapp;
  if (stored?.token && stored?.phoneNumberId) return stored;
  if (whatsappEnvConfigured()) {
    return {
      token: process.env.WHATSAPP_TOKEN!,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || undefined,
      connectedAt: new Date().toISOString(),
      source: "env",
    };
  }
  return null;
}

export function setWhatsAppConnection(conn: WhatsAppConnection | null) {
  const store = loadStore();
  store.whatsapp = conn;
  saveStore(store);
}

export function isWhatsAppConnected(): boolean {
  return Boolean(getWhatsAppConnection()?.token);
}

export function scopeHasCalendar(scope?: string | null): boolean {
  if (!scope) return false;
  return /Calendars\.(ReadWrite|Read)(\s|$)/i.test(scope);
}

export function isOutlookCalendarConnected(): boolean {
  const tokens = getOutlookTokens();
  if (!tokens?.accessToken) return false;
  if (tokens.calendarConnected === true) return true;
  return scopeHasCalendar(tokens.scope);
}

export type ConnectionStatus = {
  outlook: {
    connected: boolean;
    calendarConnected: boolean;
    configured: boolean;
    accountEmail?: string | null;
    connectedAt?: string | null;
  };
  whatsapp: {
    connected: boolean;
    configured: boolean;
    phoneNumberId?: string | null;
    businessAccountId?: string | null;
    source?: "env" | "ui" | null;
    connectedAt?: string | null;
  };
  forceMockSend: boolean;
};

export function getConnectionStatus(): ConnectionStatus {
  const outlook = getOutlookTokens();
  const wa = getWhatsAppConnection();
  return {
    outlook: {
      connected: Boolean(outlook?.accessToken),
      calendarConnected: isOutlookCalendarConnected(),
      configured: azureEnvConfigured(),
      accountEmail: outlook?.accountEmail || null,
      connectedAt: outlook?.connectedAt || null,
    },
    whatsapp: {
      connected: Boolean(wa?.token && wa?.phoneNumberId),
      configured: whatsappEnvConfigured() || Boolean(wa?.token),
      phoneNumberId: wa?.phoneNumberId || null,
      businessAccountId: wa?.businessAccountId || null,
      source: wa?.source || null,
      connectedAt: wa?.connectedAt || null,
    },
    forceMockSend: process.env.FORCE_MOCK_SEND === "1",
  };
}
