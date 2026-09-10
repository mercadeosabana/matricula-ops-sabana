"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { toast } from "./Toast";
import {
  LINKEDIN_DRAFTS,
  LLAMADA_SCRIPT_90S,
  VISITA_SLOTS,
  REGION_CARTA,
} from "@/lib/demo";
import { highlightConfirm } from "@/lib/utils";
import type { ConnectionStatusPayload } from "./ConnectModals";

type Props = {
  compact?: boolean;
  status: ConnectionStatusPayload | null;
  demoMode: boolean;
  onOpenOutlook: () => void;
  onOpenWhatsApp: () => void;
  onSimularLlamada?: (resultado: string) => Promise<void>;
  onConfirmarVisita?: (slotLabel: string) => Promise<void>;
};

export function CanalesPanel({
  compact = false,
  status,
  demoMode,
  onOpenOutlook,
  onOpenWhatsApp,
  onSimularLlamada,
  onConfirmarVisita,
}: Props) {
  const [liOpen, setLiOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [visitaOpen, setVisitaOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const outlookOk = Boolean(status?.outlook.connected);
  const waOk = Boolean(status?.whatsapp.connected);

  async function simular(resultado: string) {
    if (!onSimularLlamada) return;
    setBusy(true);
    try {
      await onSimularLlamada(resultado);
      setCallOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function confirmarSlot(label: string) {
    if (!onConfirmarVisita) {
      toast(`Cupo marcado para confirmar: ${label}`, "ok");
      return;
    }
    setBusy(true);
    try {
      await onConfirmarVisita(label);
      setVisitaOpen(false);
    } finally {
      setBusy(false);
    }
  }

  const cards = [
    {
      id: "outlook",
      title: "Outlook",
      subtitle: "Email",
      status: outlookOk ? "Conectado" : "Conectar",
      tone: outlookOk ? "ok" : "neutral",
      badge: outlookOk ? null : demoMode ? "DEMO" : null,
      onClick: onOpenOutlook,
    },
    {
      id: "whatsapp",
      title: "WhatsApp Business",
      subtitle: "Cloud API",
      status: waOk ? "Conectado" : "Conectar",
      tone: waOk ? "ok" : "neutral",
      badge: waOk ? null : demoMode ? "DEMO" : null,
      onClick: onOpenWhatsApp,
    },
    {
      id: "linkedin",
      title: "LinkedIn",
      subtitle: "Sin auto-envío",
      status: "Borradores listos",
      tone: "draft",
      badge: null,
      onClick: () => setLiOpen(true),
    },
    {
      id: "llamada",
      title: "Llamada IA",
      subtitle: "90 s · sin telefonía",
      status: "Piloto",
      tone: "piloto",
      badge: "Piloto",
      onClick: () => setCallOpen(true),
    },
    {
      id: "visita",
      title: "Visita campus",
      subtitle: "Agenda 2 h · Chía",
      status: "Cupos sábados",
      tone: "ok",
      badge: null,
      onClick: () => setVisitaOpen(true),
    },
    {
      id: "region",
      title: "Región / Convenios",
      subtitle: "Alcaldías · SE · Gobernaciones",
      status: "Carta lista",
      tone: "piloto",
      badge: "Piloto",
      onClick: () => setRegionOpen(true),
    },
  ];

  return (
    <>
      <section
        className={`mb-4 rounded-[10px] border border-border bg-cream-card ${
          compact ? "p-3" : "p-4"
        }`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2
              className={`m-0 font-semibold ${compact ? "text-sm" : "text-base"}`}
            >
              Canales
            </h2>
            {!compact && (
              <p className="mt-0.5 text-xs text-navy/55">
                Outlook / WA · LinkedIn · Llamada IA · Visitas · Región/Convenios
              </p>
            )}
          </div>
          {demoMode && (
            <span className="rounded-full border border-gold/50 bg-[#f8f1de] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warn">
              Modo DEMO
            </span>
          )}
        </div>
        <div
          className={`grid gap-2 ${
            compact
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          }`}
        >
          {cards.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={c.onClick}
              className={`rounded-lg border p-3 text-left transition hover:border-navy/35 hover:shadow-sm ${
                c.tone === "ok"
                  ? "border-ok/30 bg-[#e8f5ee]"
                  : c.tone === "piloto"
                    ? "border-gold/40 bg-[#f8f1de]"
                    : c.tone === "draft"
                      ? "border-navy/15 bg-[#eef2f8]"
                      : "border-border bg-cream"
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <div
                  className={`font-semibold text-navy ${
                    compact ? "text-xs" : "text-sm"
                  }`}
                >
                  {c.title}
                </div>
                {c.badge && (
                  <span className="shrink-0 rounded-full bg-gold/90 px-1.5 py-0.5 text-[9px] font-bold uppercase text-navy">
                    {c.badge}
                  </span>
                )}
              </div>
              {!compact && (
                <div className="mt-0.5 text-[11px] text-navy/55">{c.subtitle}</div>
              )}
              <div
                className={`mt-2 font-medium ${
                  compact ? "text-[11px]" : "text-xs"
                } ${
                  c.tone === "ok"
                    ? "text-ok"
                    : c.tone === "piloto"
                      ? "text-warn"
                      : "text-navy/70"
                }`}
              >
                {c.status}
              </div>
            </button>
          ))}
        </div>
      </section>

      <Modal
        open={liOpen}
        onClose={() => setLiOpen(false)}
        title="LinkedIn · borradores listos"
        size="md"
        footer={
          <button
            type="button"
            className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white"
            onClick={() => setLiOpen(false)}
          >
            Entendido
          </button>
        }
      >
        <p className="m-0 text-sm text-navy/70">
          No hay auto-envío a LinkedIn. Los agentes preparan borradores de
          conexión / InMail; Mercadeo copia y pega tras aprobar.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {LINKEDIN_DRAFTS.map((d) => (
            <div
              key={d.id}
              className="rounded-lg border border-border bg-cream p-3"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-navy/50">
                {d.tipo}
              </div>
              <div className="mt-1 text-sm font-semibold">{d.destinatario}</div>
              <pre
                className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-[12px] leading-relaxed text-navy/80"
                dangerouslySetInnerHTML={{
                  __html: highlightConfirm(d.texto),
                }}
              />
              <button
                type="button"
                className="mt-2 text-xs underline text-navy/60 hover:text-navy"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(d.texto);
                    toast("Borrador copiado (DEMO)", "ok");
                  } catch {
                    toast("No se pudo copiar", "warn");
                  }
                }}
              >
                Copiar borrador
              </button>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        title="Llamada IA · piloto"
        size="md"
        footer={
          <button
            type="button"
            className="min-h-11 rounded-lg border border-border px-4 text-sm"
            onClick={() => setCallOpen(false)}
          >
            Cerrar
          </button>
        }
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-gold/50 bg-[#f8f1de] px-2.5 py-0.5 text-[10px] font-bold uppercase text-warn">
            Piloto
          </span>
          <span className="rounded-full border border-border bg-cream px-2.5 py-0.5 text-[10px] font-medium text-navy/60">
            Sin telefonía real
          </span>
        </div>
        <p className="m-0 text-sm text-navy/70">
          Guion de voz ~90 s. En demo, «Simular llamada» registra actividad y un
          resultado sin llamar a ningún carrier.
        </p>
        <pre
          className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-cream p-3 text-[12px] leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: highlightConfirm(LLAMADA_SCRIPT_90S),
          }}
        />
        <p className="mt-3 mb-2 text-xs font-semibold uppercase tracking-wide text-navy/50">
          Simular llamada (DEMO)
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "agendo", label: "Agendó visita" },
            { id: "callback", label: "Callback" },
            { id: "no_contesta", label: "No contesta" },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              disabled={busy}
              onClick={() => simular(r.label)}
              className="min-h-11 rounded-lg bg-navy px-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {r.label}
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        open={visitaOpen}
        onClose={() => setVisitaOpen(false)}
        title="Visita campus · cupos sábados"
        size="sm"
        footer={
          <button
            type="button"
            className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white"
            onClick={() => setVisitaOpen(false)}
          >
            Cerrar
          </button>
        }
      >
        <p className="m-0 text-sm text-navy/70">
          Agenda plantilla 2 h en Chía. Próximos sábados abiertos — fechas con{" "}
          <span className="confirm-tag">[CONFIRMAR]</span> hasta validar con
          Dirección.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {VISITA_SLOTS.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-cream p-3"
            >
              <div>
                <div
                  className="text-sm font-medium"
                  dangerouslySetInnerHTML={{
                    __html: highlightConfirm(s.label),
                  }}
                />
                <div className="text-xs text-navy/55">{s.cupos}</div>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => confirmarSlot(s.label)}
                className="min-h-11 rounded-lg border border-ok/40 bg-[#e8f5ee] px-3 text-xs font-semibold text-ok disabled:opacity-50"
              >
                CONFIRMAR
              </button>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={regionOpen}
        onClose={() => setRegionOpen(false)}
        title="Región · convenios territoriales"
        size="md"
        footer={
          <button
            type="button"
            className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white"
            onClick={() => setRegionOpen(false)}
          >
            Entendido
          </button>
        }
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-gold/50 bg-[#f8f1de] px-2.5 py-0.5 text-[10px] font-bold uppercase text-warn">
            Piloto
          </span>
          <span className="rounded-full border border-border bg-cream px-2.5 py-0.5 text-[10px] font-medium text-navy/60">
            Agente Región
          </span>
        </div>
        <p className="m-0 text-sm text-navy/70">
          Convenios con alcaldías, secretarías de educación y gobernaciones para
          que la entidad territorial financie maestrías de docentes en la región
          (cohortes regionales).
        </p>
        <div className="mt-3 rounded-lg border border-border bg-cream p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-navy/50">
            Carta a Secretaría
          </div>
          <div className="mt-1 text-sm font-semibold">
            {REGION_CARTA.destinatario}
          </div>
          <div className="mt-1 text-xs text-navy/60">
            Asunto: {REGION_CARTA.asunto}
          </div>
          <pre
            className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-[12px] leading-relaxed text-navy/80"
            dangerouslySetInnerHTML={{
              __html: highlightConfirm(REGION_CARTA.cuerpo),
            }}
          />
          <button
            type="button"
            className="mt-2 text-xs underline text-navy/60 hover:text-navy"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(REGION_CARTA.cuerpo);
                toast("Carta copiada (DEMO)", "ok");
              } catch {
                toast("No se pudo copiar", "warn");
              }
            }}
          >
            Copiar carta
          </button>
        </div>
      </Modal>
    </>
  );
}
