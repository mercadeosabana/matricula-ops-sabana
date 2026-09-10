"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AgendaEvent } from "@/lib/types";
import { readDemoClient } from "@/lib/demo";
import {
  AgendaConnectModal,
  useConnections,
} from "./ConnectModals";

export function AgendaClient({
  initialEvents,
}: {
  initialEvents: AgendaEvent[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [demoMode, setDemoMode] = useState(false);
  const [agendaOpen, setAgendaOpen] = useState(false);
  const { status, refresh } = useConnections();

  useEffect(() => {
    setDemoMode(readDemoClient());
  }, []);

  async function reload() {
    const res = await fetch("/api/agenda");
    if (!res.ok) return;
    const data = await res.json();
    setEvents(data.events || []);
  }

  const calOk = Boolean(status?.outlook.calendarConnected);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold">Agenda</h1>
          <p className="mt-1 text-sm text-navy/65">
            Eventos de visita / reunión · demo o Outlook real
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              calOk
                ? "border-ok/30 bg-[#e8f5ee] text-ok"
                : "border-border bg-cream-card text-navy/65"
            }`}
          >
            {calOk ? "Agenda Outlook conectada" : "Agenda no conectada"}
          </span>
          {demoMode && (
            <span className="rounded-full border border-gold/50 bg-[#f8f1de] px-3 py-1 text-xs font-bold uppercase text-warn">
              DEMO
            </span>
          )}
          <button
            type="button"
            onClick={() => setAgendaOpen(true)}
            className="min-h-11 rounded-lg border border-border bg-cream-card px-3 text-sm font-medium"
          >
            {calOk ? "Estado agenda" : "Conectar agenda"}
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-[10px] border border-border bg-[#eef2f8] px-4 py-3 text-sm leading-relaxed">
        Desde <Link href="/hoy" className="underline">Hoy</Link>, «Agendar
        visita» crea un evento (Graph si hay{" "}
        <code className="text-xs">Calendars.ReadWrite</code>; si no,{" "}
        <strong>DEMO: bloqueado en agenda</strong>). Plantilla: 2 h campus
        Chía, sábados 9:00–11:00.
      </div>

      {events.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-border bg-cream-card p-8 text-center">
          <strong className="block text-base">Sin eventos aún</strong>
          <p className="mt-2 text-sm text-navy/60">
            Usa «Agendar visita» en la tarea de reunión/visita de Hoy
            {demoMode ? " (modo DEMO)" : ""}.
          </p>
          <Link href="/hoy" className="mt-3 inline-block text-sm underline">
            Ir a Hoy
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <article
              key={e.id}
              className="rounded-[10px] border border-border bg-cream-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="m-0 text-base font-semibold">{e.subject}</h3>
                  <p className="mt-1 text-sm text-navy/70">
                    {e.startIso.replace("T", " ").slice(0, 16)} →{" "}
                    {e.endIso.replace("T", " ").slice(0, 16)} · America/Bogota
                  </p>
                  <p className="mt-1 text-xs text-navy/55">{e.location}</p>
                  {(e.attendeeEmail || e.attendeeName) && (
                    <p className="mt-1 text-xs text-navy/60">
                      Invita: {e.attendeeName || ""}{" "}
                      {e.attendeeEmail ? `<${e.attendeeEmail}>` : ""}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    e.mode === "graph"
                      ? "border-ok/30 bg-[#e8f5ee] text-ok"
                      : e.mode === "demo"
                        ? "border-gold/40 bg-[#f8f1de] text-warn"
                        : "border-border bg-cream text-navy/65"
                  }`}
                >
                  {e.mode === "graph"
                    ? "Outlook"
                    : e.mode === "demo"
                      ? "DEMO"
                      : "Cola"}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-navy/45">
                Creado por {e.createdBy}
                {e.webLink ? (
                  <>
                    {" · "}
                    <a
                      href={e.webLink}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Abrir en Outlook
                    </a>
                  </>
                ) : null}
              </p>
            </article>
          ))}
        </div>
      )}

      <p className="mt-5 text-sm">
        <button
          type="button"
          className="underline text-navy/70"
          onClick={reload}
        >
          Actualizar lista
        </button>
        {" · "}
        <Link href="/hoy" className="underline">
          Hoy
        </Link>
      </p>

      <AgendaConnectModal
        open={agendaOpen}
        onClose={() => setAgendaOpen(false)}
        status={status}
        onChanged={() => {
          refresh();
          reload();
        }}
      />
    </>
  );
}
