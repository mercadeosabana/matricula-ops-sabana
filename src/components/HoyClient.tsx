"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ActividadItem, TareaHoy } from "@/lib/types";
import { CANAL_LABEL, ESTADO_LABEL } from "@/lib/types";
import { highlightConfirm, hasUnresolvedConfirm } from "@/lib/utils";
import { Modal } from "./Modal";
import { toast } from "./Toast";
import Link from "next/link";
import {
  OutlookConnectModal,
  StatusBadge,
  WhatsAppConnectModal,
  useConnections,
} from "./ConnectModals";

const FUNNEL = [
  { n: 420, l: "Contactos" },
  { n: 126, l: "Interés", pct: "30%" },
  { n: 48, l: "Agendadas", pct: "38%" },
  { n: 36, l: "Visitaron", pct: "75%" },
  { n: 14, l: "Apps" },
  { n: 6, l: "Matrículas", pct: "meta 40" },
];

export function HoyClient({
  initialTareas,
  initialFeed,
  showConnections = true,
}: {
  initialTareas: TareaHoy[];
  initialFeed: ActividadItem[];
  showConnections?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tareas, setTareas] = useState(initialTareas);
  const [feed, setFeed] = useState(initialFeed);
  const [editId, setEditId] = useState<string | null>(null);
  const [sendId, setSendId] = useState<string | null>(null);
  const [asunto, setAsunto] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [busy, setBusy] = useState(false);
  const [outlookOpen, setOutlookOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const { status, refresh: refreshConnections } = useConnections();

  useEffect(() => {
    const outlook = searchParams.get("outlook");
    if (!outlook) return;
    if (outlook === "connected") {
      toast("Outlook conectado", "ok");
      refreshConnections();
    } else if (outlook === "setup") {
      setOutlookOpen(true);
      toast("Faltan credenciales de Azure", "warn");
    } else if (outlook === "error") {
      const msg = searchParams.get("msg") || "Error OAuth";
      toast(msg, "err");
      setOutlookOpen(true);
    }
    router.replace("/hoy");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = useMemo(
    () =>
      tareas.filter((t) =>
        ["pendiente", "aprobada", "editada", "agendada"].includes(t.estado)
      ).length,
    [tareas]
  );

  const editTask = editId ? tareas.find((t) => t.id === editId) : null;
  const sendTask = sendId ? tareas.find((t) => t.id === sendId) : null;

  async function refresh() {
    const [tRes, aRes] = await Promise.all([
      fetch("/api/tareas").then((r) => r.json()),
      fetch("/api/actividad").then((r) => r.json()),
    ]);
    setTareas(tRes.tareas);
    setFeed(aRes.items);
    router.refresh();
  }

  async function act(id: string, action: string, extra?: Record<string, string>) {
    setBusy(true);
    try {
      const res = await fetch(`/api/tareas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Error", "err");
        if (data.code === "OUTLOOK_NOT_CONNECTED") setOutlookOpen(true);
        if (data.code === "WHATSAPP_NOT_CONNECTED") setWaOpen(true);
        return false;
      }
      return data;
    } finally {
      setBusy(false);
    }
  }

  async function onAprobar(id: string) {
    const data = await act(id, "aprobar");
    if (data) {
      toast("Tarea aprobada", "ok");
      await refresh();
    }
  }

  function openEdit(t: TareaHoy) {
    setEditId(t.id);
    setAsunto(t.asunto);
    setCuerpo(t.cuerpo);
  }

  async function saveEdit() {
    if (!editId) return;
    const data = await act(editId, "editar", { asunto, cuerpo });
    if (data) {
      toast("Tarea guardada como Editada", "ok");
      setEditId(null);
      await refresh();
    }
  }

  function openSend(t: TareaHoy) {
    const check = `${t.asunto}\n${t.cuerpo}`;
    if (hasUnresolvedConfirm(check)) {
      toast(
        "Hay [CONFIRMAR] sin resolver. Edita la tarea antes de enviar.",
        "warn"
      );
      return;
    }
    if (
      showConnections &&
      !status?.forceMockSend &&
      (t.canal === "email" || t.canal === "email_wa") &&
      !status?.outlook.connected
    ) {
      toast("Conecta Outlook primero", "warn");
      setOutlookOpen(true);
      return;
    }
    if (
      showConnections &&
      !status?.forceMockSend &&
      t.canal === "whatsapp" &&
      !status?.whatsapp.connected
    ) {
      toast("Conecta WhatsApp primero", "warn");
      setWaOpen(true);
      return;
    }
    setSendId(t.id);
  }

  async function confirmSend() {
    if (!sendId) return;
    const data = await act(sendId, "enviar");
    if (data) {
      toast(data.message || "Envío registrado", "ok");
      setSendId(null);
      await refresh();
    }
  }

  async function onAgendar(id: string) {
    const data = await act(id, "agendar");
    if (data) {
      toast("Visita agendada", "ok");
      await refresh();
    }
  }

  async function resetDemo() {
    setBusy(true);
    await fetch("/api/reset", { method: "POST" });
    toast("Demo reiniciada", "ok");
    await refresh();
    setBusy(false);
  }

  function sendHint(canal: string) {
    if (canal === "telefono") {
      return "No hay carrier: se marca la llamada como lista / usada.";
    }
    if (status?.forceMockSend) {
      return "FORCE_MOCK_SEND=1 · se registrará como mock sin llamar a Graph/Meta.";
    }
    if (canal === "email" || canal === "email_wa") {
      return status?.outlook.connected
        ? "Se intentará enviar vía Microsoft Graph (o encolar si no hay email real en el destino)."
        : "Conecta Outlook primero.";
    }
    if (canal === "whatsapp") {
      return status?.whatsapp.connected
        ? "Se intentará enviar vía WhatsApp Cloud API (o encolar si no hay teléfono en el destino)."
        : "Conecta WhatsApp primero.";
    }
    return "";
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold">Hoy</h1>
          <p className="mt-1 text-sm text-navy/65">
            jueves 10 sep 2026 · Semana 8–14 sep · Cohorte 2027-1
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-cream-card px-3 py-1 text-xs font-medium">
            {pending} por resolver
          </span>
          <span className="rounded-full border border-warn/30 bg-[#f5e6c8] px-3 py-1 text-xs font-medium text-warn">
            Validar [CONFIRMAR] antes de enviar
          </span>
        </div>
      </div>

      {showConnections && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <StatusBadge
            connected={Boolean(status?.outlook.connected)}
            label="Outlook"
          />
          <StatusBadge
            connected={Boolean(status?.whatsapp.connected)}
            label="WhatsApp"
          />
          <button
            type="button"
            onClick={() => setOutlookOpen(true)}
            className="text-xs underline text-navy/60 hover:text-navy"
          >
            Gestionar Outlook
          </button>
          <button
            type="button"
            onClick={() => setWaOpen(true)}
            className="text-xs underline text-navy/60 hover:text-navy"
          >
            Gestionar WhatsApp
          </button>
        </div>
      )}

      <div className="mb-4 rounded-[10px] border border-border bg-[#eef2f8] px-4 py-3 text-sm leading-relaxed">
        <strong>Modo ops:</strong> los agentes ya prepararon el craft. Tú solo{" "}
        <strong>Apruebas · Editas · Envías · Agendas visita</strong>. Nada sale
        sin tu OK. Email requiere Outlook conectado; WhatsApp requiere Cloud API.
        {status?.forceMockSend ? " Mock forzado (FORCE_MOCK_SEND=1)." : ""}
      </div>

      <div
        className="mb-5 flex gap-2 overflow-x-auto rounded-[10px] border border-border bg-cream-card p-3"
        title="Embudo EJEMPLO — últimos 30 días"
      >
        {FUNNEL.map((s) => (
          <div
            key={s.l}
            className="min-w-[88px] flex-1 rounded-lg bg-cream px-2 py-2 text-center"
          >
            <div className="text-lg font-bold text-navy">{s.n}</div>
            <div className="text-[11px] text-navy/60">{s.l}</div>
            {s.pct && (
              <div className="text-[10px] font-medium text-gold">{s.pct}</div>
            )}
          </div>
        ))}
      </div>

      {tareas.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-border bg-cream-card p-8 text-center">
          <strong className="block text-base">No hay tareas pendientes</strong>
          <p className="mt-2 text-sm text-navy/60">
            Los agentes publican cada mañana a las 7:00.
          </p>
          <Link href="/actividad" className="mt-3 inline-block text-sm underline">
            Ver Actividad
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tareas.map((t) => {
            const previewHtml = highlightConfirm(
              (t.asunto ? `Asunto: ${t.asunto}\n\n` : "") + t.cuerpo
            );
            const done = t.estado === "enviada";
            return (
              <article
                key={t.id}
                className={`rounded-[10px] border bg-cream-card p-4 ${
                  t.estado === "aprobada" || t.estado === "agendada"
                    ? "border-ok/40"
                    : t.estado === "enviada"
                      ? "border-border opacity-70"
                      : "border-border"
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                    {t.orden}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="m-0 text-base font-semibold">{t.titulo}</h3>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge>{CANAL_LABEL[t.canal] || t.canal}</Badge>
                      <Badge>{t.programaFoco}</Badge>
                      <Badge tone={t.estado}>{ESTADO_LABEL[t.estado]}</Badge>
                      <Badge>{t.creadoPorAgente}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm">
                  <div className="mb-2 text-navy/70">
                    Para: <strong>{t.dest}</strong>
                  </div>
                  <pre
                    className="max-h-36 overflow-auto whitespace-pre-wrap rounded-lg bg-cream p-3 text-[13px] leading-relaxed text-navy/85"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {done ? (
                    <span className="rounded-full border border-ok/30 bg-[#e8f5ee] px-3 py-1 text-xs font-medium text-ok">
                      Completada
                    </span>
                  ) : (
                    <>
                      {t.acciones.includes("aprobar") && (
                        <Btn
                          primary
                          disabled={busy}
                          onClick={() => onAprobar(t.id)}
                        >
                          Aprobar
                        </Btn>
                      )}
                      {t.acciones.includes("editar") && (
                        <Btn disabled={busy} onClick={() => openEdit(t)}>
                          Editar
                        </Btn>
                      )}
                      {t.acciones.includes("enviar") && (
                        <Btn ok disabled={busy} onClick={() => openSend(t)}>
                          {t.canal === "telefono" ? "Marcar lista" : "Enviar"}
                        </Btn>
                      )}
                      {t.acciones.includes("agendar") && (
                        <Btn disabled={busy} onClick={() => onAgendar(t.id)}>
                          Agendar visita
                        </Btn>
                      )}
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <h2 className="mb-2 mt-8 text-lg font-semibold">
        Lo que hicieron los agentes hoy{" "}
        <span className="text-sm font-normal text-navy/50">
          actualizado 07:28
        </span>
      </h2>
      <div className="rounded-[10px] border border-border bg-cream-card p-3">
        {feed.slice(0, 8).map((f) => (
          <div
            key={f.id}
            className={`flex gap-3 border-b border-border/70 py-2.5 text-sm last:border-0 ${
              f.kind === "human" ? "bg-[#f3faf6]/ -mx-1 px-1 rounded" : ""
            }`}
          >
            <div className="w-12 shrink-0 font-mono text-xs text-navy/50">
              {f.time}
            </div>
            <div>
              <strong>{f.actor}</strong> — {f.text}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-navy/70">
        <Link href="/direccion" className="underline">
          Ver dashboard Dirección →
        </Link>
        {" · "}
        <button
          type="button"
          disabled={busy}
          onClick={resetDemo}
          className="underline disabled:opacity-50"
        >
          Reiniciar demo
        </button>
      </p>

      <Modal
        open={!!editTask}
        title="Editar tarea"
        onClose={() => setEditId(null)}
        footer={
          <>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-border px-4 text-sm"
              onClick={() => setEditId(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={busy}
              className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white disabled:opacity-50"
              onClick={saveEdit}
            >
              Guardar
            </button>
          </>
        }
      >
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">
          Asunto
        </label>
        <input
          className="mb-3 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
        />
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">
          Cuerpo / mensaje
        </label>
        <textarea
          className="min-h-[200px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-relaxed"
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
        />
        <p className="mt-2 text-xs text-navy/60">
          Resuelve los <span className="confirm-tag">[CONFIRMAR: …]</span> antes
          de enviar. Al guardar queda como «Editada».
        </p>
      </Modal>

      <Modal
        open={!!sendTask}
        title="Confirmar envío"
        size="sm"
        onClose={() => setSendId(null)}
        footer={
          <>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-border px-4 text-sm"
              onClick={() => setSendId(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={busy}
              className="min-h-11 rounded-lg bg-ok px-4 text-sm font-medium text-white disabled:opacity-50"
              onClick={confirmSend}
            >
              Confirmar envío
            </button>
          </>
        }
      >
        {sendTask && (
          <>
            <p className="m-0 text-sm">
              <strong>{sendTask.titulo}</strong>
              <br />
              Canal: {CANAL_LABEL[sendTask.canal]} · Para: {sendTask.dest}
            </p>
            <p className="mt-3 text-xs text-navy/60">{sendHint(sendTask.canal)}</p>
          </>
        )}
      </Modal>

      {showConnections && (
        <>
          <OutlookConnectModal
            open={outlookOpen}
            onClose={() => setOutlookOpen(false)}
            status={status}
            onChanged={refreshConnections}
          />
          <WhatsAppConnectModal
            open={waOpen}
            onClose={() => setWaOpen(false)}
            status={status}
            onChanged={refreshConnections}
          />
        </>
      )}
    </>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  const cls =
    tone === "aprobada" || tone === "agendada"
      ? "border-ok/30 bg-[#e8f5ee] text-ok"
      : tone === "enviada"
        ? "border-navy/20 bg-navy/5 text-navy/70"
        : tone === "editada"
          ? "border-gold/40 bg-[#f8f1de] text-warn"
          : "border-border bg-cream text-navy/75";
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      {children}
    </span>
  );
}

function Btn({
  children,
  onClick,
  primary,
  ok,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  ok?: boolean;
  disabled?: boolean;
}) {
  const base =
    "min-h-11 rounded-lg px-3 text-sm font-medium disabled:opacity-50";
  const style = primary
    ? "bg-navy text-white hover:bg-navy-mid"
    : ok
      ? "bg-ok text-white hover:opacity-90"
      : "border border-border bg-cream-card text-navy hover:bg-cream";
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`${base} ${style}`}>
      {children}
    </button>
  );
}
