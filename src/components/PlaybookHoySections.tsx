"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CANALES_BARRIDO,
  CANALES_TOQUE,
  COLA_CAP_COPY,
  COLA_NUEVOS_CAP_DIA,
  COLA_PLAYBOOK_DEMO,
  NEXT_STEP_LABEL,
  REGLA_NEXT_STEP,
  RESPONDIERON_HOY_DEMO,
  audienciaLabel,
  type NextStepPlaybook,
} from "@/lib/playbook";
import { Plan4SemanasZona } from "./Plan4SemanasZona";
import { toast } from "./Toast";

/** Respondieron hoy (arriba) + Cola del playbook (nuevos fríos, cap ~15/día) */
export function PlaybookHoySections() {
  const [cola, setCola] = useState(COLA_PLAYBOOK_DEMO);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  function aprobar(id: string) {
    setCola((prev) => prev.filter((c) => c.id !== id));
    toast("Mensaje aprobado (demo) · listo para toque", "ok");
  }

  function openEdit(id: string, msg: string) {
    setEditId(id);
    setEditText(msg);
  }

  function saveEdit() {
    if (!editId) return;
    setCola((prev) =>
      prev.map((c) =>
        c.id === editId ? { ...c, mensajeSugerido: editText } : c
      )
    );
    setEditId(null);
    toast("Mensaje editado (demo)", "ok");
  }

  function pickNext(leadNombre: string, step: NextStepPlaybook) {
    toast(
      `${leadNombre}: próxima acción → ${NEXT_STEP_LABEL[step]}`,
      "ok"
    );
  }

  return (
    <div className="mb-4 space-y-4">
      {/* 1) Respondieron hoy — ABOVE nuevos fríos */}
      <section className="rounded-[10px] border border-ok/35 bg-[#f4faf6] p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="m-0 text-base font-semibold">Respondieron hoy</h2>
            <p className="mt-0.5 text-xs text-navy/60">
              Van primero. Una próxima acción + fecha por lead.{" "}
              {REGLA_NEXT_STEP}
            </p>
          </div>
          <Link
            href="/playbook"
            className="text-xs font-semibold underline"
            style={{ color: "#1a2b4a" }}
          >
            Playbook →
          </Link>
        </div>

        <div className="mt-3 space-y-3">
          {RESPONDIERON_HOY_DEMO.map((r) => (
            <article
              key={r.id}
              className="rounded-lg border border-border bg-white p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <strong className="block">{r.leadNombre}</strong>
                  <span className="text-xs text-navy/55">
                    {r.colegio} · {audienciaLabel(r.audiencia)} · {r.origenLabel}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-navy">
                    {NEXT_STEP_LABEL[r.nextStep]}
                  </div>
                  <div className="text-navy/55">{r.nextStepFecha}</div>
                </div>
              </div>
              <p className="mt-2 mb-2 text-sm leading-relaxed text-navy/80">
                {r.resumenAgente}
              </p>
              <div className="flex flex-wrap gap-2">
                {r.botones.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => pickNext(r.leadNombre, b)}
                    className={`min-h-9 rounded-lg border px-3 text-xs font-semibold ${
                      b === r.nextStep
                        ? "border-navy bg-navy text-white"
                        : "border-border bg-cream text-navy/80"
                    }`}
                  >
                    {NEXT_STEP_LABEL[b]}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2) Cola del playbook — nuevos / fríos */}
      <section className="rounded-[10px] border border-border bg-cream-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="m-0 text-base font-semibold">Cola del playbook</h2>
            <p className="mt-0.5 text-xs text-navy/60">{COLA_CAP_COPY}</p>
          </div>
          <span className="rounded-full border border-border bg-cream px-2.5 py-0.5 text-[11px] font-bold">
            {cola.length}/{COLA_NUEVOS_CAP_DIA} demo
          </span>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <p className="m-0 rounded-lg border border-dashed border-border bg-cream px-2.5 py-2 text-[11px] leading-relaxed text-navy/70">
            <strong>Barrido</strong> · {CANALES_BARRIDO}
          </p>
          <p className="m-0 rounded-lg border border-dashed border-border bg-cream px-2.5 py-2 text-[11px] leading-relaxed text-navy/70">
            <strong>Toque</strong> · {CANALES_TOQUE}
          </p>
        </div>

        <div className="mt-3 space-y-3">
          {cola.length === 0 && (
            <p className="text-sm text-navy/55">Cola vacía · demo.</p>
          )}
          {cola.map((c) => (
            <article
              key={c.id}
              className="rounded-lg border border-border bg-white p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <strong className="block">{c.leadNombre}</strong>
                  <span className="text-xs text-navy/55">
                    {c.colegio} · {c.zona} · {audienciaLabel(c.audiencia)} ·{" "}
                    {c.origenLabel}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <div className="font-medium text-navy/70">{c.agente}</div>
                  <div className="font-bold text-navy">
                    {NEXT_STEP_LABEL[c.nextStep]} · {c.nextStepFecha}
                  </div>
                </div>
              </div>
              {editId === c.id ? (
                <div className="mt-2">
                  <textarea
                    className="min-h-24 w-full rounded-lg border border-border bg-cream p-2 text-sm"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="min-h-9 rounded-lg bg-navy px-3 text-xs font-semibold text-white"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="min-h-9 rounded-lg border border-border px-3 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="mt-2 mb-0 max-h-28 overflow-auto whitespace-pre-wrap rounded-lg bg-cream p-2 text-[13px] leading-relaxed text-navy/85">
                  {c.mensajeSugerido}
                </pre>
              )}
              {editId !== c.id && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => aprobar(c.id)}
                    className="min-h-9 rounded-lg bg-navy px-3 text-xs font-semibold text-white"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(c.id, c.mensajeSugerido)}
                    className="min-h-9 rounded-lg border border-border bg-cream px-3 text-xs font-semibold"
                  >
                    Editar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <Plan4SemanasZona variant="compact" showChannels={false} />
    </div>
  );
}
