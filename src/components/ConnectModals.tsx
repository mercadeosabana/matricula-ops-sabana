"use client";

import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { toast } from "./Toast";

export type ConnectionStatusPayload = {
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
  setup?: {
    outlook: { title: string; items: string[]; redirectUri?: string };
    whatsapp: { title: string; items: string[] };
  };
};

export function useConnections() {
  const [status, setStatus] = useState<ConnectionStatusPayload | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetch("/api/connections");
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return { status, loading, refresh, setStatus };
}

export function StatusBadge({
  connected,
  label,
}: {
  connected: boolean;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        connected
          ? "border-ok/30 bg-[#e8f5ee] text-ok"
          : "border-border bg-cream text-navy/65"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          connected ? "bg-ok" : "bg-navy/35"
        }`}
      />
      {label}: {connected ? "Conectado" : "No conectado"}
    </span>
  );
}

export function OutlookConnectModal({
  open,
  onClose,
  status,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  status: ConnectionStatusPayload | null;
  onChanged: () => void;
}) {
  const configured = status?.outlook.configured;
  const connected = status?.outlook.connected;
  const setup = status?.setup?.outlook;

  async function disconnect() {
    const res = await fetch("/api/connections/outlook/disconnect", {
      method: "POST",
    });
    if (res.ok) {
      toast("Outlook desconectado", "ok");
      onChanged();
    } else {
      toast("No se pudo desconectar", "err");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Conectar Outlook"
      size="sm"
      footer={
        connected ? (
          <>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-border px-4 text-sm"
              onClick={disconnect}
            >
              Desconectar
            </button>
            <button
              type="button"
              className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white"
              onClick={onClose}
            >
              Listo
            </button>
          </>
        ) : configured ? (
          <>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-border px-4 text-sm"
              onClick={onClose}
            >
              Cancelar
            </button>
            <a
              href="/api/oauth/outlook/start"
              className="inline-flex min-h-11 items-center rounded-lg bg-navy px-4 text-sm font-medium text-white"
            >
              Iniciar Microsoft OAuth
            </a>
          </>
        ) : (
          <button
            type="button"
            className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white"
            onClick={onClose}
          >
            Entendido
          </button>
        )
      }
    >
      {connected ? (
        <div className="text-sm">
          <p className="m-0 font-semibold text-ok">Outlook conectado</p>
          {status?.outlook.accountEmail && (
            <p className="mt-2 m-0 text-navy/70">
              Cuenta: <strong>{status.outlook.accountEmail}</strong>
            </p>
          )}
          <p className="mt-2 m-0 text-xs text-navy/55">
            Email (Mail.Send) y Agenda (Calendars.ReadWrite) usan Microsoft
            Graph. Si la agenda no aparece conectada, vuelve a iniciar OAuth.
          </p>
        </div>
      ) : configured ? (
        <div className="text-sm">
          <p className="m-0 font-semibold">Conectar con Microsoft 365</p>
          <p className="mt-2 m-0 text-navy/70">
            Se abrirá el consentimiento de Azure AD con permisos{" "}
            <code className="text-xs">Mail.Send</code>,{" "}
            <code className="text-xs">Calendars.ReadWrite</code>,{" "}
            <code className="text-xs">offline_access</code> y{" "}
            <code className="text-xs">User.Read</code>. Mismo OAuth para
            correo y agenda.
          </p>
        </div>
      ) : (
        <div className="text-sm">
          <p className="m-0 font-semibold text-warn">
            {setup?.title ||
              "Faltan credenciales de Azure — pedir a TI / Ivan"}
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-navy/75">
            {(
              setup?.items || [
                "App registration en Azure AD",
                "Redirect URI https://matricula-ops-sabana.vercel.app/api/oauth/outlook/callback",
                "Mail.Send + Calendars.ReadWrite + offline_access + User.Read",
              ]
            ).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 m-0 text-xs text-navy/55">
            Sin estas variables no se puede autenticar ni enviar correo real.
            Ver <code className="text-[11px]">docs/SETUP-OAUTH.md</code>.
          </p>
        </div>
      )}
    </Modal>
  );
}

export function WhatsAppConnectModal({
  open,
  onClose,
  status,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  status: ConnectionStatusPayload | null;
  onChanged: () => void;
}) {
  const connected = status?.whatsapp.connected;
  const setup = status?.setup?.whatsapp;
  const [token, setToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const res = await fetch("/api/connections/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, phoneNumberId, businessAccountId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error al guardar", "err");
        return;
      }
      toast("WhatsApp conectado", "ok");
      setToken("");
      setPhoneNumberId("");
      setBusinessAccountId("");
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    const res = await fetch("/api/connections/whatsapp", { method: "DELETE" });
    if (res.ok) {
      toast("WhatsApp desconectado", "ok");
      onChanged();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Conectar WhatsApp Business"
      size="sm"
      footer={
        connected ? (
          <>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-border px-4 text-sm"
              onClick={disconnect}
            >
              Desconectar
            </button>
            <button
              type="button"
              className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white"
              onClick={onClose}
            >
              Listo
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-border px-4 text-sm"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={busy || !token || !phoneNumberId}
              className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white disabled:opacity-50"
              onClick={save}
            >
              Guardar conexión
            </button>
          </>
        )
      }
    >
      {connected ? (
        <div className="text-sm">
          <p className="m-0 font-semibold text-ok">WhatsApp conectado</p>
          {status?.whatsapp.phoneNumberId && (
            <p className="mt-2 m-0 text-navy/70">
              Phone Number ID:{" "}
              <strong>{status.whatsapp.phoneNumberId}</strong>
            </p>
          )}
          <p className="mt-2 m-0 text-xs text-navy/55">
            Origen: {status?.whatsapp.source === "env" ? "variables de entorno" : "UI"}.
            Número de la facultad (Cloud API), no personal.
          </p>
        </div>
      ) : (
        <div className="text-sm">
          <p className="m-0 font-semibold">
            WhatsApp Business Cloud API
          </p>
          <p className="mt-2 m-0 text-navy/70">
            Pega las credenciales de Meta (número de la facultad). También
            puedes fijarlas en Vercel:{" "}
            <code className="text-[11px]">WHATSAPP_TOKEN</code>,{" "}
            <code className="text-[11px]">WHATSAPP_PHONE_NUMBER_ID</code>,{" "}
            <code className="text-[11px]">WHATSAPP_BUSINESS_ACCOUNT_ID</code>.
          </p>
          <label className="mb-1 mt-3 block text-xs font-semibold uppercase tracking-wide text-navy/60">
            Access Token
          </label>
          <input
            className="mb-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="EAAG…"
            autoComplete="off"
          />
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">
            Phone Number ID
          </label>
          <input
            className="mb-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            placeholder="1234567890"
          />
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">
            Business Account ID (opcional)
          </label>
          <input
            className="mb-3 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            value={businessAccountId}
            onChange={(e) => setBusinessAccountId(e.target.value)}
            placeholder="WABA ID"
          />
          <p className="m-0 font-semibold text-warn text-xs">
            {setup?.title ||
              "Si no tienes credenciales — checklist para TI / Ivan"}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-navy/70">
            {(
              setup?.items || [
                "Meta Business de la Facultad (no personal)",
                "Número WhatsApp Business de la facultad",
                "Token + Phone Number ID + WABA ID",
              ]
            ).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}

export function AgendaConnectModal({
  open,
  onClose,
  status,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  status: ConnectionStatusPayload | null;
  onChanged: () => void;
}) {
  const configured = status?.outlook.configured;
  const calendarConnected = Boolean(status?.outlook.calendarConnected);
  const emailConnected = Boolean(status?.outlook.connected);
  const setup = status?.setup?.outlook;

  async function disconnect() {
    const res = await fetch("/api/connections/outlook/disconnect", {
      method: "POST",
    });
    if (res.ok) {
      toast("Outlook / Agenda desconectado", "ok");
      onChanged();
    } else {
      toast("No se pudo desconectar", "err");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Conectar Agenda Outlook"
      size="sm"
      footer={
        calendarConnected ? (
          <>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-border px-4 text-sm"
              onClick={disconnect}
            >
              Desconectar
            </button>
            <button
              type="button"
              className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white"
              onClick={onClose}
            >
              Listo
            </button>
          </>
        ) : configured ? (
          <>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-border px-4 text-sm"
              onClick={onClose}
            >
              Cancelar
            </button>
            <a
              href="/api/oauth/outlook/start"
              className="inline-flex min-h-11 items-center rounded-lg bg-navy px-4 text-sm font-medium text-white"
            >
              {emailConnected ? "Reconectar con calendario" : "Conectar agenda"}
            </a>
          </>
        ) : (
          <button
            type="button"
            className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white"
            onClick={onClose}
          >
            Entendido
          </button>
        )
      }
    >
      {calendarConnected ? (
        <div className="text-sm">
          <p className="m-0 font-semibold text-ok">Agenda Outlook conectada</p>
          {status?.outlook.accountEmail && (
            <p className="mt-2 m-0 text-navy/70">
              Cuenta: <strong>{status.outlook.accountEmail}</strong>
            </p>
          )}
          <p className="mt-2 m-0 text-xs text-navy/55">
            «Agendar visita» crea eventos en Graph (plantilla 2 h campus Chía).
            Ver{" "}
            <a href="/agenda" className="underline">
              /agenda
            </a>
            .
          </p>
        </div>
      ) : configured ? (
        <div className="text-sm">
          <p className="m-0 font-semibold">Agenda con Microsoft 365</p>
          <p className="mt-2 m-0 text-navy/70">
            Misma app Azure. OAuth pide{" "}
            <code className="text-xs">Calendars.ReadWrite</code> además de
            Mail.Send. Si ya conectaste solo correo, reconecta.
          </p>
          {emailConnected && !calendarConnected && (
            <p className="mt-2 m-0 rounded-lg border border-gold/40 bg-[#f8f1de] px-3 py-2 text-xs text-warn">
              Correo conectado, pero falta permiso de agenda — reconecta.
            </p>
          )}
        </div>
      ) : (
        <div className="text-sm">
          <p className="m-0 font-semibold text-warn">
            {setup?.title ||
              "Faltan credenciales de Azure — pedir a TI / Ivan"}
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-navy/75">
            {(
              setup?.items || [
                "App registration en Azure AD",
                "Calendars.ReadWrite + Mail.Send + offline_access + User.Read",
              ]
            ).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 m-0 text-xs text-navy/55">
            Sin Azure puedes usar <strong>modo DEMO</strong>: «Agendar visita»
            simula el bloqueo. Ver{" "}
            <code className="text-[11px]">docs/SETUP-OAUTH.md</code>.
          </p>
        </div>
      )}
    </Modal>
  );
}
