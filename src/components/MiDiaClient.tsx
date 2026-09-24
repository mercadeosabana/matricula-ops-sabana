"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MI_DIA_APROBAR,
  MI_DIA_RESPONDIERON,
  type CanalDemo,
  type CardAprobar,
  type CardRespondio,
} from "@/lib/demo-aprobacion";
import type { AprobacionCard } from "@/lib/aprobacion";
import { toast } from "./Toast";

function canalBadgeClass(canal: CanalDemo) {
  if (canal === "WA") return "bg-[#e8f5ee] text-ok border-ok/25";
  if (canal === "LinkedIn") return "bg-[#e8eef8] text-navy border-navy/20";
  return "bg-[#f5e6c8] text-warn border-warn/30";
}

function CardShell({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border border-border bg-cream-card p-4 shadow-sm ${
        muted ? "opacity-70" : ""
      }`}
    >
      {children}
    </article>
  );
}

function EditPanel({
  preview,
  onCancel,
  onSave,
}: {
  preview: string;
  onCancel: () => void;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState(preview);
  return (
    <div className="mt-3 rounded-lg border border-border bg-white p-3">
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-navy/50">
        Editar mensaje (demo · no se envía)
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm leading-relaxed text-navy"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => onSave(text)}
          className="min-h-11 flex-1 rounded-lg bg-navy px-3 text-sm font-semibold text-white"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-lg border border-border px-3 text-sm text-navy"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

type UiCard = AprobacionCard | (CardAprobar & { source: "demo"; estado?: string; etiqueta?: string; scheduledFor?: string | null });

function isLive(card: UiCard): card is AprobacionCard {
  return card.source === "live";
}

export function MiDiaClient() {
  const [livePendientes, setLivePendientes] = useState<AprobacionCard[]>([]);
  const [liveAprobadas, setLiveAprobadas] = useState<AprobacionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoDismissed, setDemoDismissed] = useState<Set<string>>(new Set());
  const [enviadosDemo, setEnviadosDemo] = useState<CardAprobar[]>([]);
  const [respondieron, setRespondieron] =
    useState<CardRespondio[]>(MI_DIA_RESPONDIERON);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [demoOpen, setDemoOpen] = useState(false);

  const loadLive = useCallback(async () => {
    try {
      const res = await fetch("/api/aprobaciones", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const pendientes = (data.pendientes || []) as AprobacionCard[];
      const aprobadas = (data.aprobadas || []) as AprobacionCard[];
      setLivePendientes(pendientes);
      setLiveAprobadas(aprobadas);
      setPreviews((prev) => {
        const next = { ...prev };
        for (const c of [...pendientes, ...aprobadas]) {
          if (next[c.id] === undefined) next[c.id] = c.preview;
        }
        return next;
      });
    } catch {
      // ignore — keep demo
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLive();
  }, [loadLive]);

  useEffect(() => {
    setPreviews((prev) => {
      const next = { ...prev };
      for (const c of MI_DIA_APROBAR) {
        if (next[c.id] === undefined) next[c.id] = c.preview;
      }
      return next;
    });
  }, []);

  const demoPendientes = useMemo(
    () =>
      MI_DIA_APROBAR.filter((c) => !demoDismissed.has(c.id)).map((c) => ({
        ...c,
        source: "demo" as const,
        etiqueta: "Demo Neiva",
      })),
    [demoDismissed]
  );

  const metaLine = useMemo(
    () =>
      livePendientes.length > 0
        ? "Cola real (stand / pauta) + playbook D+3/D+7 · agentes no envían solos"
        : "Meta: acercar cupos financiados hacia equilibrio (10)",
    [livePendientes.length]
  );

  async function aprobarLive(card: AprobacionCard) {
    const preview = previews[card.id] || card.preview;
    try {
      const res = await fetch("/api/aprobaciones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: card.id,
          action: "aprobar",
          preview,
        }),
      });
      if (!res.ok) {
        toast("No se pudo guardar la aprobación", "err");
        return;
      }
      setEditingId(null);
      toast("Listo · guardado (no se envía de verdad)", "ok");
      await loadLive();
    } catch {
      toast("Error de red al aprobar", "err");
    }
  }

  async function guardarLive(card: AprobacionCard, text: string) {
    try {
      const res = await fetch("/api/aprobaciones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: card.id,
          action: "editar",
          preview: text,
        }),
      });
      if (!res.ok) {
        toast("No se pudo guardar el borrador", "err");
        return;
      }
      setPreviews((p) => ({ ...p, [card.id]: text }));
      setEditingId(null);
      toast("Borrador actualizado", "ok");
      await loadLive();
    } catch {
      toast("Error de red al editar", "err");
    }
  }

  function aprobarDemo(card: CardAprobar) {
    setDemoDismissed((prev) => new Set(prev).add(card.id));
    setEnviadosDemo((prev) => [
      { ...card, preview: previews[card.id] || card.preview },
      ...prev,
    ]);
    setEditingId(null);
    toast("Listo · en demo no se envía de verdad", "ok");
  }

  function aprobarNext(card: CardRespondio) {
    setRespondieron((prev) => prev.filter((c) => c.id !== card.id));
    toast("Listo · en demo no se envía de verdad", "ok");
  }

  function renderCard(card: UiCard, opts: { demo?: boolean } = {}) {
    const programado =
      isLive(card) && card.estado === "programado";
    const etiqueta =
      (isLive(card) ? card.etiqueta : card.etiqueta) ||
      (opts.demo ? "Demo Neiva" : null);

    return (
      <CardShell key={card.id} muted={programado}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="font-semibold leading-snug">{card.nombre}</div>
              {etiqueta && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    opts.demo || card.source === "demo"
                      ? "bg-navy/10 text-navy/60"
                      : programado
                        ? "bg-gold/20 text-warn"
                        : "bg-ok/15 text-ok"
                  }`}
                >
                  {etiqueta}
                  {isLive(card) && card.scheduledFor
                    ? ` · ${card.scheduledFor}`
                    : ""}
                </span>
              )}
            </div>
            <div className="mt-0.5 text-xs text-navy/55">{card.rolOrg}</div>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${canalBadgeClass(
              card.canal
            )}`}
          >
            {card.canal}
          </span>
        </div>
        <p className="mt-2 text-sm leading-snug text-navy/80">{card.why}</p>
        <div className="mt-2 whitespace-pre-wrap rounded-lg border border-border/80 bg-white/80 px-3 py-2 text-sm leading-relaxed text-navy/75">
          {previews[card.id] || card.preview}
        </div>
        {(() => {
          const text = previews[card.id] || card.preview || "";
          const m = text.match(/https?:\/\/\S+/);
          if (!m) return null;
          return (
            <a
              href={m[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[11px] font-semibold text-ok underline"
            >
              Brochure listo
            </a>
          );
        })()}
        <div className="mt-1 text-[11px] text-navy/45">
          Preparado por {card.agente}
          {programado ? " · programado (aparece en Mi día cuando vence)" : ""}
        </div>
        {editingId === card.id ? (
          <EditPanel
            preview={previews[card.id] || card.preview}
            onCancel={() => setEditingId(null)}
            onSave={(text) => {
              if (isLive(card)) {
                void guardarLive(card, text);
              } else {
                setPreviews((p) => ({ ...p, [card.id]: text }));
                setEditingId(null);
                toast("Borrador actualizado (demo)", "ok");
              }
            }}
          />
        ) : (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (isLive(card)) void aprobarLive(card);
                else aprobarDemo(card);
              }}
              className="min-h-11 flex-1 rounded-lg bg-navy text-sm font-semibold text-white"
            >
              {programado ? "Aprobar ya" : "Aprobar"}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(card.id)}
              className="min-h-11 rounded-lg border border-border bg-white px-4 text-sm font-medium text-navy"
            >
              Editar
            </button>
          </div>
        )}
      </CardShell>
    );
  }

  const liveCount = livePendientes.length;
  const enviadosCount = liveAprobadas.length + enviadosDemo.length;

  return (
    <div className="text-navy">
      <div className="mb-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/50">
          Mi día
        </div>
        <h1 className="m-0 mt-0.5 text-xl font-bold leading-tight text-navy">
          {liveCount > 0 ? "Cola en vivo · stand y pauta" : "Neiva · esta semana"}
        </h1>
        <p className="mt-1 text-sm text-navy/65">{metaLine}</p>
      </div>

      <div className="max-w-lg pb-8">
        <section aria-labelledby="aprobar-hoy">
          <div className="mb-3 flex items-end justify-between gap-2">
            <h2 id="aprobar-hoy" className="m-0 text-base font-bold">
              Para aprobar
            </h2>
            <span className="rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-semibold text-navy">
              {loading ? "…" : liveCount}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {loading && (
              <p className="rounded-xl border border-dashed border-border bg-cream-card px-4 py-5 text-center text-sm text-navy/60">
                Cargando cola…
              </p>
            )}
            {!loading && livePendientes.length === 0 && (
              <p className="rounded-xl border border-dashed border-border bg-cream-card px-4 py-6 text-center text-sm text-navy/60">
                Sin leads live pendientes. Los del stand ASOCOPI aparecen aquí
                al capturar el QR.
                <span className="mt-2 block text-navy/45">
                  Sube brochures en{" "}
                  <a href="/biblioteca" className="underline text-navy/70">
                    Biblioteca → Materiales
                  </a>
                  .
                </span>
              </p>
            )}
            {livePendientes.map((card) => renderCard(card))}
          </div>
        </section>

        {/* Demo Neiva — collapsed teaching examples */}
        <section className="mt-6" aria-labelledby="demo-neiva">
          <button
            type="button"
            id="demo-neiva"
            onClick={() => setDemoOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-cream-card px-3 py-2.5 text-left text-sm font-semibold text-navy/80"
          >
            <span>Ejemplos · Demo Neiva</span>
            <span className="text-xs font-normal text-navy/50">
              {demoOpen ? "Ocultar" : `Ver (${demoPendientes.length})`}
            </span>
          </button>
          {demoOpen && (
            <div className="mt-3 flex flex-col gap-3">
              {demoPendientes.length === 0 && (
                <p className="text-center text-sm text-navy/55">
                  Ejemplos demo ya repasados.
                </p>
              )}
              {demoPendientes.map((card) => renderCard(card, { demo: true }))}
            </div>
          )}
        </section>

        {enviadosCount > 0 && (
          <section className="mt-8" aria-labelledby="enviados-hoy">
            <h2 id="enviados-hoy" className="mb-3 m-0 text-base font-bold">
              Aprobados
              <span className="ml-2 text-sm font-normal text-navy/50">
                ({enviadosCount}) · sin envío real
              </span>
            </h2>
            <div className="flex flex-col gap-2">
              {liveAprobadas.map((card) => (
                <CardShell key={card.id} muted>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{card.nombre}</div>
                    <span className="text-[11px] font-semibold text-ok">
                      ✓ {card.etiqueta || "Aprobado"}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-navy/50">
                    {card.canal} · {card.rolOrg}
                  </div>
                </CardShell>
              ))}
              {enviadosDemo.map((card) => (
                <CardShell key={card.id} muted>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{card.nombre}</div>
                    <span className="text-[11px] font-semibold text-ok">
                      ✓ Demo Neiva
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-navy/50">
                    {card.canal} · {card.rolOrg}
                  </div>
                </CardShell>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8" aria-labelledby="respondieron">
          <div className="mb-3 flex items-end justify-between gap-2">
            <h2 id="respondieron" className="m-0 text-base font-bold">
              Respondieron — siguiente paso
            </h2>
            <span className="rounded-full bg-gold/25 px-2.5 py-0.5 text-xs font-semibold text-navy">
              {respondieron.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {respondieron.length === 0 && (
              <p className="rounded-xl border border-dashed border-border bg-cream-card px-4 py-5 text-center text-sm text-navy/60">
                Sin respuestas pendientes de siguiente paso.
              </p>
            )}
            {respondieron.map((card) => (
              <CardShell key={card.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold leading-snug">{card.nombre}</div>
                    <div className="mt-0.5 text-xs text-navy/55">{card.rolOrg}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${canalBadgeClass(
                      card.canal
                    )}`}
                  >
                    {card.canal}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-snug text-navy/80">
                  {card.resumen}
                </p>
                <div className="mt-2 rounded-lg border border-gold/40 bg-[#fbf6ea] px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/50">
                    Siguiente paso sugerido
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-navy">
                    {card.nextStep}
                  </div>
                  <div className="text-xs text-navy/60">{card.nextStepDetail}</div>
                </div>
                <button
                  type="button"
                  onClick={() => aprobarNext(card)}
                  className="mt-3 min-h-11 w-full rounded-lg bg-navy text-sm font-semibold text-white"
                >
                  Aprobar
                </button>
              </CardShell>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-[11px] leading-relaxed text-navy/45">
          Los agentes (Captación, Región, Guardian) preparan borradores. Tú
          apruebas — no hay envío automático.
        </p>
      </div>
    </div>
  );
}
