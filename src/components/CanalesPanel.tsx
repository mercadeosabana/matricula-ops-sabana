"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { toast } from "./Toast";
import {
  LINKEDIN_DRAFTS,
  LLAMADA_SCRIPT_90S,
} from "@/lib/demo";
import { SEMANA_MERCADO } from "@/lib/market-story";
import { highlightConfirm } from "@/lib/utils";
import type { ConnectionStatusPayload } from "./ConnectModals";

type Props = {
  compact?: boolean;
  status: ConnectionStatusPayload | null;
  demoMode: boolean;
  onOpenOutlook: () => void;
  onOpenAgenda?: () => void;
  onOpenWhatsApp: () => void;
  onSimularLlamada?: (resultado: string) => Promise<void>;
  onConfirmarVisita?: (slotLabel: string) => Promise<void>;
  onAgendarDesayuno?: (leadId: string) => void;
};

export function CanalesPanel({
  compact = false,
  status,
  demoMode,
  onOpenOutlook,
  onOpenAgenda,
  onOpenWhatsApp,
  onSimularLlamada,
  onAgendarDesayuno,
}: Props) {
  const [liOpen, setLiOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [soporteOpen, setSoporteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const outlookOk = Boolean(status?.outlook.connected);
  const agendaOk = Boolean(status?.outlook.calendarConnected);
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
              Cómo toco hoy
            </h2>
            {!compact && (
              <p className="mt-0.5 text-xs text-navy/55">
                Correo y WhatsApp primero · LinkedIn = borradores · desayuno solo
                para calientes
              </p>
            )}
          </div>
          {demoMode && (
            <span className="rounded-full border border-gold/50 bg-[#f8f1de] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warn">
              Modo DEMO
            </span>
          )}
        </div>

        {/* Primary: Outlook + WhatsApp + LinkedIn (borradores) */}
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={onOpenOutlook}
            className={`rounded-lg border p-3 text-left transition hover:border-navy/35 ${
              outlookOk
                ? "border-ok/30 bg-[#e8f5ee]"
                : "border-border bg-cream"
            }`}
          >
            <div className="text-sm font-semibold text-navy">Correo (Outlook)</div>
            <div className="mt-0.5 text-[11px] text-navy/55">
              Cómo escribo a financiadores e interesados
            </div>
            <div
              className={`mt-2 text-xs font-medium ${
                outlookOk ? "text-ok" : "text-navy/70"
              }`}
            >
              {outlookOk
                ? "Listo"
                : demoMode
                  ? "Sin conectar · usa DEMO"
                  : "Conectar"}
            </div>
          </button>
          <button
            type="button"
            onClick={onOpenWhatsApp}
            className={`rounded-lg border p-3 text-left transition hover:border-navy/35 ${
              waOk ? "border-ok/30 bg-[#e8f5ee]" : "border-border bg-cream"
            }`}
          >
            <div className="text-sm font-semibold text-navy">WhatsApp</div>
            <div className="mt-0.5 text-[11px] text-navy/55">
              Seguimiento rápido a interesados
            </div>
            <div
              className={`mt-2 text-xs font-medium ${
                waOk ? "text-ok" : "text-navy/70"
              }`}
            >
              {waOk
                ? "Listo"
                : demoMode
                  ? "Sin conectar · usa DEMO"
                  : "Conectar"}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setLiOpen(true)}
            className="rounded-lg border-2 border-[#0A66C2]/45 bg-[#eef2f8] p-3 text-left transition hover:border-[#0A66C2]/70"
          >
            <div className="text-sm font-semibold text-navy">
              LinkedIn · borradores
            </div>
            <div className="mt-0.5 text-[11px] text-navy/55">
              Ver textos · NO se conecta la cuenta (copiar/pegar en LinkedIn)
            </div>
            <div className="mt-2 text-xs font-medium text-[#0A66C2]">
              Abrir borradores
            </div>
          </button>
        </div>

        {/* Secondary row */}
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => (onOpenAgenda ? onOpenAgenda() : onOpenOutlook())}
            className={`rounded-lg border p-3 text-left hover:border-navy/35 ${
              agendaOk
                ? "border-ok/30 bg-[#e8f5ee]"
                : "border-border bg-cream"
            }`}
          >
            <div className="text-sm font-semibold">Agenda</div>
            <div className="mt-1 text-xs text-navy/60">
              {agendaOk ? "Conectada · desayunos" : "Para agendar desayuno"}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSoporteOpen((v) => !v)}
            className="rounded-lg border border-border bg-cream p-3 text-left hover:border-navy/35"
          >
            <div className="text-sm font-semibold">Soporte</div>
            <div className="mt-1 text-xs text-navy/60">
              {soporteOpen ? "Ocultar · Llamada IA" : "Llamada IA (piloto)"}
            </div>
          </button>
        </div>

        {soporteOpen && (
          <div className="mt-2 rounded-lg border border-gold/40 bg-[#f8f1de] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">Llamada IA · piloto</div>
                <p className="m-0 mt-0.5 text-xs text-navy/65">
                  Guion ~90 s · sin telefonía real · solo simulación DEMO
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCallOpen(true)}
                className="min-h-10 rounded-lg bg-navy px-3 text-xs font-medium text-white"
              >
                Abrir guion
              </button>
            </div>
          </div>
        )}

        {/* Listos para desayuno — warm only */}
        {!compact && (
          <div className="mt-3 rounded-lg border border-ok/25 bg-[#f3faf6] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="m-0 text-sm font-semibold">
                  Listos para desayuno
                </h3>
                <p className="m-0 mt-0.5 text-xs text-navy/55">
                  Solo leads calientes · no es visita genérica de campus
                </p>
              </div>
            </div>
            <ul className="mt-2 flex flex-col gap-2">
              {SEMANA_MERCADO.listosDesayuno.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/80 bg-cream-card px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium">{d.nombre}</div>
                    <div className="text-[11px] text-navy/55">
                      {d.sede} · {d.programa}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (onAgendarDesayuno) onAgendarDesayuno(d.tareaId);
                      else
                        toast(
                          "Usa «Agendar» en la tarea de desayuno de la cola",
                          "ok"
                        );
                    }}
                    className="min-h-10 rounded-lg border border-ok/40 bg-[#e8f5ee] px-3 text-xs font-semibold text-ok disabled:opacity-50"
                  >
                    Agendar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
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
        <div className="rounded-lg border border-[#0A66C2]/25 bg-[#eef2f8] px-3 py-2.5">
          <p className="m-0 text-sm text-navy/80">
            <strong>No hay «Conectar»:</strong> LinkedIn no permite envío
            automático seguro. Natalia aprueba el texto y lo pega ella en
            LinkedIn.
          </p>
        </div>
        <p className="m-0 mt-3 text-sm text-navy/70">
          Los agentes preparan borradores; tú copias y pegas tras aprobar. Sin
          OAuth ni envío desde Matrícula Ops.
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
        title="Llamada IA · soporte / piloto"
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
            Soporte
          </span>
          <span className="rounded-full border border-border bg-cream px-2.5 py-0.5 text-[10px] font-medium text-navy/60">
            Sin telefonía real
          </span>
        </div>
        <p className="m-0 text-sm text-navy/70">
          Guion de voz ~90 s. En demo, «Simular llamada» registra actividad sin
          llamar a ningún carrier.
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
            { id: "agendo", label: "Agendó desayuno" },
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
    </>
  );
}
