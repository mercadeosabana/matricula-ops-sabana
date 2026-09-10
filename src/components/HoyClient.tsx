"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ActividadItem, TareaHoy } from "@/lib/types";
import { CANAL_LABEL, ESTADO_LABEL } from "@/lib/types";
import { highlightConfirm, hasUnresolvedConfirm } from "@/lib/utils";
import { readDemoClient, setDemoCookie } from "@/lib/demo";
import {
  SEMANA_MERCADO,
  audienciaDeTarea,
  equilibrioMetido,
} from "@/lib/market-story";
import { VisionGlobalCard } from "./VisionGlobalCard";
import { MetasCohortePanel } from "./MetasCohortePanel";
import type { MetasCohorte } from "@/lib/types";
import { Modal } from "./Modal";
import { toast } from "./Toast";
import Link from "next/link";
import {
  AgendaConnectModal,
  OutlookConnectModal,
  StatusBadge,
  WhatsAppConnectModal,
  useConnections,
} from "./ConnectModals";
import { CanalesPanel } from "./CanalesPanel";
import { ScoreBadge } from "./ScoreBadge";
import { scoreFromTareaText } from "@/lib/scoring";
import { reviewCraft } from "@/lib/guardian";

export function HoyClient({
  initialTareas,
  initialFeed,
  showConnections = true,
  metas,
  metasTotales,
}: {
  initialTareas: TareaHoy[];
  initialFeed: ActividadItem[];
  showConnections?: boolean;
  metas: MetasCohorte;
  metasTotales: {
    metaInscritosTotal: number;
    metaIngresosCop: number;
    puntoEquilibrioCupos: number;
  };
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
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [pasarGuardian, setPasarGuardian] = useState(true);
  const [guardianNote, setGuardianNote] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const { status, refresh: refreshConnections } = useConnections();

  const eq = equilibrioMetido(
    SEMANA_MERCADO.cuposFinanciados,
    SEMANA_MERCADO.cuposEquilibrio
  );

  useEffect(() => {
    const q = searchParams.get("demo");
    if (q === "1") {
      setDemoCookie(true);
      setDemoMode(true);
    } else if (q === "0") {
      setDemoCookie(false);
      setDemoMode(false);
    } else {
      setDemoMode(readDemoClient());
    }
  }, [searchParams]);

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
      const msg = searchParams.get("msg") || "Error de conexión";
      toast(msg, "err");
      setOutlookOpen(true);
    }
    router.replace(demoMode ? "/hoy?demo=1" : "/hoy");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = useMemo(
    () =>
      tareas.filter((t) =>
        ["pendiente", "aprobada", "editada", "agendada"].includes(t.estado)
      ).length,
    [tareas]
  );

  const financiadorTasks = useMemo(
    () =>
      tareas
        .filter((t) => audienciaDeTarea(t) === "financiador")
        .sort((a, b) => a.orden - b.orden),
    [tareas]
  );
  const estudianteTasks = useMemo(
    () =>
      tareas
        .filter((t) => audienciaDeTarea(t) === "estudiante")
        .sort((a, b) => a.orden - b.orden),
    [tareas]
  );

  const editTask = editId ? tareas.find((t) => t.id === editId) : null;
  const sendTask = sendId ? tareas.find((t) => t.id === sendId) : null;

  const needsDemoOffer = useMemo(() => {
    if (!sendTask) return false;
    if (status?.forceMockSend || demoMode) return false;
    if (
      (sendTask.canal === "email" ||
        sendTask.canal === "email_wa" ||
        sendTask.canal === "region") &&
      !status?.outlook.connected
    )
      return true;
    if (sendTask.canal === "whatsapp" && !status?.whatsapp.connected)
      return true;
    if (sendTask.canal === "telefono") return true;
    return false;
  }, [sendTask, status, demoMode]);

  async function refresh() {
    const [tRes, aRes] = await Promise.all([
      fetch("/api/tareas").then((r) => r.json()),
      fetch("/api/actividad").then((r) => r.json()),
    ]);
    setTareas(tRes.tareas);
    setFeed(aRes.items);
    router.refresh();
  }

  async function act(
    id: string,
    action: string,
    extra?: Record<string, string | boolean>
  ) {
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
        if (data.code === "CALENDAR_NOT_CONNECTED") setAgendaOpen(true);
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
    setGuardianNote(null);
    const check = `${t.asunto}\n${t.cuerpo}`;
    if (hasUnresolvedConfirm(check) && t.canal !== "linkedin") {
      if (!demoMode && !status?.forceMockSend) {
        toast(
          "Hay [CONFIRMAR] sin resolver. Edita la tarea antes de enviar.",
          "warn"
        );
        return;
      }
      toast(
        "Hay [CONFIRMAR] — en DEMO puedes simular; en real, edita antes.",
        "warn"
      );
    }
    if (t.canal === "linkedin") {
      toast("LinkedIn: solo borradores — ábrelos en «Cómo toco hoy»", "warn");
      return;
    }
    setSendId(t.id);
  }

  async function confirmSend(asDemo = false) {
    if (!sendId) return;
    const useDemo = asDemo || demoMode || Boolean(status?.forceMockSend);
    if (!useDemo && sendTask) {
      const check = `${sendTask.asunto}\n${sendTask.cuerpo}`;
      if (hasUnresolvedConfirm(check)) {
        toast("Resuelve [CONFIRMAR] antes del envío real", "warn");
        return;
      }
    }
    if (pasarGuardian && sendTask) {
      const verdict = reviewCraft(sendTask.asunto, sendTask.cuerpo);
      setGuardianNote(`${verdict.summary} — ${verdict.detail}`);
      if (verdict.status === "BLOQUEAR" && !useDemo) {
        toast(verdict.summary, "err");
        return;
      }
      if (verdict.status === "BLOQUEAR" && useDemo) {
        toast(`${verdict.summary} · DEMO continúa`, "warn");
      } else if (verdict.status === "OK") {
        toast(verdict.summary, "ok");
      }
    }
    const data = await act(sendId, "enviar", useDemo ? { demo: true } : {});
    if (data) {
      toast(
        (data.message || "Envío registrado") +
          (pasarGuardian ? " · Guardian revisó" : ""),
        useDemo ? "warn" : "ok"
      );
      setSendId(null);
      setGuardianNote(null);
      await refresh();
    }
  }

  async function onAgendar(id: string) {
    const calOk = Boolean(status?.outlook.calendarConnected);
    const demoOn = demoMode || Boolean(status?.forceMockSend);
    if (!calOk && !demoOn) {
      setAgendaOpen(true);
      toast("Conecta Agenda o activa Demo", "warn");
      return;
    }
    const extra =
      calOk && !demoOn ? {} : ({ demo: true } as Record<string, boolean>);
    const data = await act(id, "agendar", extra);
    if (!data) return;
    const isDemoMsg =
      typeof data.message === "string" &&
      String(data.message).includes("DEMO");
    toast(
      data.message ||
        (isDemoMsg ? "DEMO: bloqueado en agenda" : "Desayuno agendado"),
      isDemoMsg ? "warn" : "ok"
    );
    await refresh();
  }

  async function resetDemo() {
    setBusy(true);
    await fetch("/api/reset", { method: "POST" });
    toast("Demo reiniciada", "ok");
    await refresh();
    setBusy(false);
  }

  function toggleDemo() {
    const next = !demoMode;
    setDemoCookie(next);
    setDemoMode(next);
    toast(next ? "Modo DEMO activado" : "Modo DEMO desactivado", "ok");
    router.replace(next ? "/hoy?demo=1" : "/hoy");
  }

  async function onSimularLlamada(resultado: string) {
    const res = await fetch("/api/demo/simular-llamada", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resultado }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast(data.error || "Error", "err");
      return;
    }
    toast(data.message || `Simulado: ${resultado}`, "warn");
    await refresh();
  }

  function sendHint(canal: string) {
    if (demoMode || status?.forceMockSend) {
      return "DEMO · se registrará como simulación (no envía de verdad).";
    }
    if (canal === "telefono") {
      return "Llamada IA (soporte): usa Simular envío (demo).";
    }
    if (canal === "region") {
      return status?.outlook.connected
        ? "Carta a financiador vía Outlook (o simular en DEMO)."
        : "Sin Outlook: usa «Simular envío (demo)».";
    }
    if (canal === "email" || canal === "email_wa") {
      return status?.outlook.connected
        ? "Se intentará enviar por correo."
        : "Sin Outlook: conecta o usa «Simular envío (demo)».";
    }
    if (canal === "whatsapp") {
      return status?.whatsapp.connected
        ? "Se intentará enviar por WhatsApp."
        : "Sin WhatsApp: conecta o usa «Simular envío (demo)».";
    }
    return "";
  }

  function renderTaskCard(t: TareaHoy) {
    const previewHtml = highlightConfirm(
      (t.asunto ? `Asunto: ${t.asunto}\n\n` : "") + t.cuerpo
    );
    const done = t.estado === "enviada";
    const aud = audienciaDeTarea(t);
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
              <Badge tone={aud === "financiador" ? "fin" : "est"}>
                {aud === "financiador" ? "Financiador" : "Interesado"}
              </Badge>
              <Badge>{CANAL_LABEL[t.canal] || t.canal}</Badge>
              <Badge>{t.programaFoco}</Badge>
              <Badge tone={t.estado}>{ESTADO_LABEL[t.estado]}</Badge>
              <Badge>{t.creadoPorAgente}</Badge>
              <ScoreBadge
                score={scoreFromTareaText(
                  `${t.titulo} ${t.dest} ${t.programaFoco}`
                )}
              />
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
                <Btn primary disabled={busy} onClick={() => onAprobar(t.id)}>
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
                  {t.canal === "telefono" ? "Simular / marcar" : "Enviar"}
                </Btn>
              )}
              {t.acciones.includes("agendar") && (
                <Btn disabled={busy} onClick={() => onAgendar(t.id)}>
                  Agendar desayuno
                </Btn>
              )}
              {t.acciones.includes("simular_llamada") && (
                <Btn
                  disabled={busy}
                  onClick={() =>
                    onSimularLlamada("Agendó desayuno").then(refresh)
                  }
                >
                  Simular llamada
                </Btn>
              )}
            </>
          )}
        </div>
      </article>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold">Hoy</h1>
          <p className="mt-1 text-sm text-navy/65">
            jueves 10 sep 2026 · {SEMANA_MERCADO.rango} · Cohorte{" "}
            {SEMANA_MERCADO.cohorte}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-cream-card px-3 py-1 text-xs font-medium">
            {pending} por resolver
          </span>
          <span className="rounded-full border border-warn/30 bg-[#f5e6c8] px-3 py-1 text-xs font-medium text-warn">
            Validar [CONFIRMAR] antes de enviar
          </span>
          <button
            type="button"
            onClick={toggleDemo}
            className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              demoMode
                ? "border-gold/50 bg-[#f8f1de] text-warn"
                : "border-border bg-cream-card text-navy/60"
            }`}
          >
            {demoMode ? "DEMO ON" : "Demo"}
          </button>
        </div>
      </div>

      <VisionGlobalCard variant="hoy" />

      <MetasCohortePanel
        initialMetas={metas}
        initialTotales={metasTotales}
        canEdit={false}
        variant="compact"
      />

      {/* Hero: Semana de mercado — la rebanada */}
      <section className="mb-4 rounded-[12px] border border-navy/20 bg-navy px-4 py-4 text-white shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-gold">
          {SEMANA_MERCADO.etiqueta}
        </div>
        <h2 className="m-0 mt-1 text-xl font-bold leading-snug">
          {SEMANA_MERCADO.sedeFoco} · {SEMANA_MERCADO.zonaSegmento}
        </h2>
        <p className="m-0 mt-1 text-sm text-white/80">
          Meta de la semana:{" "}
          <strong className="text-white">{SEMANA_MERCADO.metaTexto}</strong>
          {" · "}
          Programa {SEMANA_MERCADO.programa} · sede foco{" "}
          {SEMANA_MERCADO.sedeFoco}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-white/10 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-white/55">
              Cupos financiados
            </div>
            <div className="text-2xl font-bold">
              {SEMANA_MERCADO.cuposFinanciados}
              <span className="text-base font-medium text-white/60">
                /{SEMANA_MERCADO.cuposEquilibrio}
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-white/10 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-white/55">
              Conversaciones
            </div>
            <div className="text-2xl font-bold">
              {SEMANA_MERCADO.conversacionesHechas}
              <span className="text-base font-medium text-white/60">
                /{SEMANA_MERCADO.conversacionesMeta}
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-white/10 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-white/55">
              Orden del día
            </div>
            <div className="text-sm font-semibold leading-snug">
              1. Financiadores → 2. Interesados
            </div>
          </div>
        </div>
      </section>

      {/* Región / equilibrio */}
      <section className="mb-4 rounded-[10px] border border-border bg-cream-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="m-0 text-base font-semibold">
              Región / equilibrio · {SEMANA_MERCADO.sedeFoco}
            </h2>
            <p className="mt-0.5 text-xs text-navy/55">
              Primero cerrar cupos con quien paga · después buscar docentes
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
              eq.met
                ? "border-ok/30 bg-[#e8f5ee] text-ok"
                : "border-warn/30 bg-[#f5e6c8] text-warn"
            }`}
          >
            {eq.met
              ? "Equilibrio alcanzado"
              : `Faltan ${eq.faltan} cupos`}
          </span>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs font-medium text-navy/70">
            <span>
              Cupos financiados {SEMANA_MERCADO.cuposFinanciados} /{" "}
              {SEMANA_MERCADO.cuposEquilibrio} (punto de equilibrio)
            </span>
            <span>{eq.pct}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-cream">
            <div
              className={`h-full rounded-full ${
                eq.met ? "bg-ok" : "bg-gold"
              }`}
              style={{ width: `${eq.pct}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-medium text-navy/80">
            {eq.met
              ? "Siguiente: buscar estudiantes (interesados) en este territorio."
              : "Aún no: el outreach a docentes en esta zona queda en segundo plano hasta el equilibrio."}
          </p>
        </div>
      </section>

      {showConnections && (
        <CanalesPanel
          status={status}
          demoMode={demoMode}
          onOpenOutlook={() => setOutlookOpen(true)}
          onOpenAgenda={() => setAgendaOpen(true)}
          onOpenWhatsApp={() => setWaOpen(true)}
          onSimularLlamada={onSimularLlamada}
          onAgendarDesayuno={(tareaId) => onAgendar(tareaId)}
        />
      )}

      {showConnections && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <StatusBadge
            connected={Boolean(status?.outlook.connected)}
            label="Correo"
          />
          <StatusBadge
            connected={Boolean(status?.outlook.calendarConnected)}
            label="Agenda"
          />
          <StatusBadge
            connected={Boolean(status?.whatsapp.connected)}
            label="WhatsApp"
          />
          <Link href="/agenda" className="text-xs underline text-navy/60">
            Ver agenda →
          </Link>
          <Link href="/agentes" className="text-xs underline text-navy/60">
            Hablar con agentes →
          </Link>
        </div>
      )}

      <div className="mb-4 rounded-[10px] border border-border bg-[#eef2f8] px-4 py-3 text-sm leading-relaxed">
        <strong>Tu trabajo hoy:</strong> los agentes ya prepararon el craft. Tú{" "}
        <strong>Apruebas · Editas · Envías · Agendas desayuno</strong>. Orden
        fijo: <strong>financiadores primero</strong>, luego interesados. Nada
        sale sin tu OK.
        {demoMode
          ? " · Modo DEMO: puedes simular sin Azure/Meta."
          : " Correo/WA requieren conexión (o activa Demo)."}
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
        <div className="grid gap-4 lg:grid-cols-2">
          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="m-0 text-lg font-semibold">1. Financiadores</h2>
              <span className="text-xs text-navy/50">
                Colegios / alcaldías / secretarías
              </span>
            </div>
            <p className="mb-3 mt-0 text-xs text-navy/55">
              Quienes pagan cupos · prioridad hasta el equilibrio
            </p>
            <div className="flex flex-col gap-3">
              {financiadorTasks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-cream-card p-4 text-sm text-navy/60">
                  Sin tareas de financiador hoy.
                </p>
              ) : (
                financiadorTasks.map(renderTaskCard)
              )}
            </div>
          </section>

          <section
            className={
              eq.met ? "" : "opacity-80 [&>div]:relative"
            }
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="m-0 text-lg font-semibold">2. Estudiantes</h2>
              <span className="text-xs text-navy/50">Docentes interesados</span>
            </div>
            <p className="mb-3 mt-0 text-xs text-navy/55">
              {eq.met
                ? "Equilibrio OK · ahora sí prioriza interesados del territorio."
                : "Secundario en este territorio hasta cupos X / Y."}
            </p>
            {!eq.met && (
              <div className="mb-3 rounded-lg border border-gold/40 bg-[#f8f1de] px-3 py-2 text-xs font-medium text-warn">
                Visualmente en segundo plano · Neiva aún en{" "}
                {SEMANA_MERCADO.cuposFinanciados}/{SEMANA_MERCADO.cuposEquilibrio}
              </div>
            )}
            <div className="flex flex-col gap-3">
              {estudianteTasks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-cream-card p-4 text-sm text-navy/60">
                  Sin tareas de interesados hoy.
                </p>
              ) : (
                estudianteTasks.map(renderTaskCard)
              )}
            </div>
          </section>
        </div>
      )}

      <h2 className="mb-2 mt-8 text-lg font-semibold">
        Lo que hicieron los agentes hoy{" "}
        <span className="text-sm font-normal text-navy/50">
          actualizado 07:30
        </span>
      </h2>
      <div className="rounded-[10px] border border-border bg-cream-card p-3">
        {feed.slice(0, 10).map((f) => (
          <div
            key={f.id}
            className={`flex gap-3 border-b border-border/70 py-2.5 text-sm last:border-0 ${
              f.kind === "human" ? "bg-[#f3faf6] -mx-1 px-1 rounded" : ""
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
        <Link href="/estudio" className="underline">
          Estudio de mercadeo →
        </Link>
        {" · "}
        <Link href="/direccion" className="underline">
          Dirección →
        </Link>
        {" · "}
        <Link href="/agentes" className="underline">
          Agentes
        </Link>
        {" · "}
        <Link
          href="/interesado"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Landing pauta (demo)
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
        title={
          needsDemoOffer || demoMode
            ? "Envío / simulación DEMO"
            : "Confirmar envío"
        }
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
            {(needsDemoOffer ||
              demoMode ||
              sendTask?.canal === "telefono") && (
              <button
                type="button"
                disabled={busy}
                className="min-h-11 rounded-lg border border-gold/50 bg-[#f8f1de] px-4 text-sm font-bold text-warn disabled:opacity-50"
                onClick={() => confirmSend(true)}
              >
                Simular envío (DEMO)
              </button>
            )}
            {!needsDemoOffer &&
              !demoMode &&
              sendTask?.canal !== "telefono" && (
                <button
                  type="button"
                  disabled={busy}
                  className="min-h-11 rounded-lg bg-ok px-4 text-sm font-medium text-white disabled:opacity-50"
                  onClick={() => confirmSend(false)}
                >
                  Confirmar envío
                </button>
              )}
            {needsDemoOffer && (
              <button
                type="button"
                className="min-h-11 rounded-lg border border-border px-3 text-sm"
                onClick={() => {
                  if (sendTask?.canal === "whatsapp") setWaOpen(true);
                  else setOutlookOpen(true);
                }}
              >
                Conectar canal
              </button>
            )}
          </>
        }
      >
        {sendTask && (
          <>
            {(needsDemoOffer || demoMode) && (
              <div className="mb-3 rounded-lg border border-gold/40 bg-[#f8f1de] px-3 py-2 text-xs font-semibold text-warn">
                DEMO — no se enviará correo/WA/llamada real
              </div>
            )}
            <p className="m-0 text-sm">
              <strong>{sendTask.titulo}</strong>
              <br />
              Canal: {CANAL_LABEL[sendTask.canal]} · Para: {sendTask.dest}
            </p>
            <label className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-cream px-3 py-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={pasarGuardian}
                onChange={(e) => setPasarGuardian(e.target.checked)}
              />
              <span>
                <strong>Pasar por Guardian</strong>
                <span className="block text-xs text-navy/55">
                  Revisión demo OK / BLOQUEAR antes de enviar o simular.
                </span>
              </span>
            </label>
            {guardianNote && (
              <p className="mt-2 rounded-lg border border-border bg-[#eef2f8] px-3 py-2 text-xs leading-relaxed">
                {guardianNote}
              </p>
            )}
            <p className="mt-3 text-xs text-navy/60">
              {sendHint(sendTask.canal)}
            </p>
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
          <AgendaConnectModal
            open={agendaOpen}
            onClose={() => setAgendaOpen(false)}
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
    tone === "aprobada" || tone === "agendada" || tone === "fin"
      ? "border-ok/30 bg-[#e8f5ee] text-ok"
      : tone === "enviada"
        ? "border-navy/20 bg-navy/5 text-navy/70"
        : tone === "editada" || tone === "est"
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
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${style}`}
    >
      {children}
    </button>
  );
}
