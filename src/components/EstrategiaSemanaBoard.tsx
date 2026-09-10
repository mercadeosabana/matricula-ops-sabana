"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CANAL_SEMANA_LABEL,
  ESTRATEGIA_SEMANA_DEMO,
  ESTRATEGIA_SEMANA_META,
  ESTADO_RESPUESTA_LABEL,
  conteoCanalesSemana,
  type EstadoRespuestaSemana,
  type EstrategiaSemanaRow,
} from "@/lib/playbook";
import { Modal } from "./Modal";
import { toast } from "./Toast";

function estadoTone(e: EstadoRespuestaSemana) {
  if (e === "respondio") return "border-ok/35 bg-[#e8f5ee] text-ok";
  if (e === "proxima_accion") return "border-gold/40 bg-[#f8f1de] text-warn";
  return "border-border bg-cream text-navy/70";
}

/** Tablero operativo UP TOP en Hoy: territorio + filas + estados live */
export function EstrategiaSemanaBoard() {
  const [rows, setRows] = useState<EstrategiaSemanaRow[]>(ESTRATEGIA_SEMANA_DEMO);
  const [verId, setVerId] = useState<string | null>(null);
  const ver = verId ? rows.find((r) => r.id === verId) : null;
  const counts = useMemo(() => conteoCanalesSemana(rows), [rows]);

  const sinResp = rows.filter((r) => r.estadoRespuesta === "sin_respuesta").length;
  const resp = rows.filter((r) => r.estadoRespuesta === "respondio").length;
  const prox = rows.filter((r) => r.estadoRespuesta === "proxima_accion").length;

  function aprobar(id: string) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.estadoRespuesta === "sin_respuesta") {
          return {
            ...r,
            estadoRespuesta: "proxima_accion" as const,
            proximaAccion:
              r.canal === "linkedin"
                ? "Copiar borrador LI y enviar"
                : r.canal === "whatsapp"
                  ? "Enviar WA aprobado"
                  : "Enviar correo aprobado",
          };
        }
        if (r.estadoRespuesta === "proxima_accion") {
          return {
            ...r,
            estadoRespuesta: "respondio" as const,
            proximaAccion: "Esperar respuesta · marcar si contestan",
          };
        }
        return {
          ...r,
          proximaAccion: "Acción confirmada · seguir en Respondieron",
        };
      })
    );
    toast("Aprobado · fila actualizada", "ok");
  }

  function marcarRespondio(id: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              estadoRespuesta: "respondio" as const,
              proximaAccion:
                r.tipo === "financiador"
                  ? "Definir visita financiador"
                  : "Definir video o desayuno",
            }
          : r
      )
    );
    toast("Marcado: respondió · próxima acción lista", "ok");
  }

  return (
    <section className="mb-4 rounded-[12px] border border-navy/25 bg-cream-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-navy/55">
            Empieza aquí
          </div>
          <h2 className="m-0 mt-0.5 text-xl font-bold text-navy">
            Estrategia de esta semana
          </h2>
          <p className="mt-1 mb-0 text-sm text-navy/70">
            Territorio:{" "}
            <strong className="text-navy">{ESTRATEGIA_SEMANA_META.territorio}</strong>
            {" · "}
            {ESTRATEGIA_SEMANA_META.rango}
            {" · "}
            {ESTRATEGIA_SEMANA_META.semanaLabel}
          </p>
        </div>
        <Link
          href={ESTRATEGIA_SEMANA_META.playbookHref}
          className="text-xs font-semibold underline"
          style={{ color: "#1a2b4a" }}
        >
          Marco 4 semanas → /playbook
        </Link>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-cream px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-navy/50">
            Con quién arrancar
          </div>
          <ul className="mt-1 mb-0 list-disc space-y-0.5 pl-4 text-xs leading-snug text-navy/85">
            {ESTRATEGIA_SEMANA_META.colegiosArranque.slice(0, 4).map((c) => (
              <li key={c}>{c}</li>
            ))}
            <li className="list-none pl-0 text-navy/55">
              +{ESTRATEGIA_SEMANA_META.colegiosArranque.length - 4} en el tablero
            </li>
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-cream px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-navy/50">
            Mensajes de la semana
          </div>
          <p className="mt-1 mb-0 text-sm font-semibold text-navy">
            {counts.correos} correos · {counts.linkedin} LinkedIn ·{" "}
            {counts.whatsapp} WA
          </p>
          <p className="mt-0.5 mb-0 text-xs text-navy/60">
            {counts.total} toques en el tablero · aprueba antes de enviar
          </p>
        </div>
        <div className="rounded-lg border border-border bg-cream px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-navy/50">
            Respuestas (live)
          </div>
          <p className="mt-1 mb-0 text-sm font-semibold text-navy">
            {sinResp} sin resp. · {resp} respondió · {prox} próxima acción
          </p>
          <p className="mt-0.5 mb-0 text-xs text-navy/60">
            Al aprobar o marcar, la fila cambia al instante
          </p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-navy/50">
              <th className="pb-2 pr-2 font-semibold">Colegio / contacto</th>
              <th className="pb-2 pr-2 font-semibold">Tipo</th>
              <th className="pb-2 pr-2 font-semibold">Canal</th>
              <th className="pb-2 pr-2 font-semibold">Mensaje</th>
              <th className="pb-2 pr-2 font-semibold">Estado</th>
              <th className="pb-2 pr-2 font-semibold">Próxima acción</th>
              <th className="pb-2 font-semibold"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/70 align-top">
                <td className="py-2.5 pr-2 font-medium text-navy">
                  {r.colegioContacto}
                </td>
                <td className="py-2.5 pr-2">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      r.tipo === "financiador"
                        ? "border-ok/30 bg-[#e8f5ee] text-ok"
                        : "border-gold/40 bg-[#f8f1de] text-warn"
                    }`}
                  >
                    {r.tipo === "financiador" ? "Financiador" : "Interesado"}
                  </span>
                </td>
                <td className="py-2.5 pr-2 text-xs text-navy/75">
                  {CANAL_SEMANA_LABEL[r.canal]}
                </td>
                <td className="max-w-[220px] py-2.5 pr-2 text-xs leading-snug text-navy/80">
                  {r.mensajePreview}
                </td>
                <td className="py-2.5 pr-2">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${estadoTone(
                      r.estadoRespuesta
                    )}`}
                  >
                    {ESTADO_RESPUESTA_LABEL[r.estadoRespuesta]}
                  </span>
                </td>
                <td className="py-2.5 pr-2 text-xs font-medium text-navy/85">
                  {r.proximaAccion}
                </td>
                <td className="py-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => aprobar(r.id)}
                      className="min-h-9 rounded-lg bg-navy px-2.5 text-xs font-semibold text-white"
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerId(r.id)}
                      className="min-h-9 rounded-lg border border-border bg-cream px-2.5 text-xs font-semibold"
                    >
                      Ver
                    </button>
                    {r.estadoRespuesta !== "respondio" && (
                      <button
                        type="button"
                        onClick={() => marcarRespondio(r.id)}
                        className="min-h-9 rounded-lg border border-ok/40 bg-[#e8f5ee] px-2.5 text-xs font-semibold text-ok"
                      >
                        Respondió
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-3 space-y-3 md:hidden">
        {rows.map((r) => (
          <article
            key={r.id}
            className="rounded-lg border border-border bg-white p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <strong className="text-sm">{r.colegioContacto}</strong>
              <span
                className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${estadoTone(
                  r.estadoRespuesta
                )}`}
              >
                {ESTADO_RESPUESTA_LABEL[r.estadoRespuesta]}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
              <span
                className={`rounded-full border px-2 py-0.5 font-medium ${
                  r.tipo === "financiador"
                    ? "border-ok/30 bg-[#e8f5ee] text-ok"
                    : "border-gold/40 bg-[#f8f1de] text-warn"
                }`}
              >
                {r.tipo === "financiador" ? "Financiador" : "Interesado"}
              </span>
              <span className="rounded-full border border-border bg-cream px-2 py-0.5 text-navy/70">
                {CANAL_SEMANA_LABEL[r.canal]}
              </span>
            </div>
            <p className="mt-2 mb-1 text-xs leading-relaxed text-navy/80">
              {r.mensajePreview}
            </p>
            <p className="m-0 text-xs font-semibold text-navy">
              → {r.proximaAccion}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => aprobar(r.id)}
                className="min-h-9 rounded-lg bg-navy px-3 text-xs font-semibold text-white"
              >
                Aprobar
              </button>
              <button
                type="button"
                onClick={() => setVerId(r.id)}
                className="min-h-9 rounded-lg border border-border bg-cream px-3 text-xs font-semibold"
              >
                Ver
              </button>
              {r.estadoRespuesta !== "respondio" && (
                <button
                  type="button"
                  onClick={() => marcarRespondio(r.id)}
                  className="min-h-9 rounded-lg border border-ok/40 bg-[#e8f5ee] px-3 text-xs font-semibold text-ok"
                >
                  Respondió
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={!!ver}
        title={ver ? ver.colegioContacto : "Mensaje"}
        onClose={() => setVerId(null)}
        footer={
          ver ? (
            <>
              <button
                type="button"
                className="min-h-11 rounded-lg border border-border px-4 text-sm"
                onClick={() => setVerId(null)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white"
                onClick={() => {
                  aprobar(ver.id);
                  setVerId(null);
                }}
              >
                Aprobar
              </button>
            </>
          ) : null
        }
      >
        {ver && (
          <>
            <p className="m-0 text-xs text-navy/60">
              {ver.tipo === "financiador" ? "Financiador" : "Interesado"} ·{" "}
              {CANAL_SEMANA_LABEL[ver.canal]} ·{" "}
              {ESTADO_RESPUESTA_LABEL[ver.estadoRespuesta]}
            </p>
            <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-cream p-3 text-sm leading-relaxed text-navy/90">
              {ver.mensajeFull}
            </pre>
            <p className="mt-2 mb-0 text-sm font-medium">
              Próxima acción: {ver.proximaAccion}
            </p>
          </>
        )}
      </Modal>
    </section>
  );
}
