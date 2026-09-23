"use client";

import { useMemo, useState } from "react";
import {
  MI_DIA_APROBAR,
  MI_DIA_RESPONDIERON,
  type CanalDemo,
  type CardAprobar,
  type CardRespondio,
} from "@/lib/demo-aprobacion";
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
        Editar mensaje (demo)
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

export function MiDiaClient() {
  const [pendientes, setPendientes] = useState<CardAprobar[]>(MI_DIA_APROBAR);
  const [enviados, setEnviados] = useState<CardAprobar[]>([]);
  const [respondieron, setRespondieron] =
    useState<CardRespondio[]>(MI_DIA_RESPONDIERON);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>(() =>
    Object.fromEntries(MI_DIA_APROBAR.map((c) => [c.id, c.preview]))
  );

  const metaLine = useMemo(
    () => "Meta: acercar cupos financiados hacia equilibrio (10)",
    []
  );

  function aprobar(card: CardAprobar) {
    setPendientes((prev) => prev.filter((c) => c.id !== card.id));
    setEnviados((prev) => [{ ...card, preview: previews[card.id] || card.preview }, ...prev]);
    setEditingId(null);
    toast("Listo · en demo no se envía de verdad", "ok");
  }

  function aprobarNext(card: CardRespondio) {
    setRespondieron((prev) => prev.filter((c) => c.id !== card.id));
    toast("Listo · en demo no se envía de verdad", "ok");
  }

  return (
    <div className="text-navy">
      <div className="mb-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/50">
          Mi día
        </div>
        <h1 className="m-0 mt-0.5 text-xl font-bold leading-tight text-navy">
          Neiva · esta semana
        </h1>
        <p className="mt-1 text-sm text-navy/65">{metaLine}</p>
      </div>

      <div className="max-w-lg pb-8">
        <section aria-labelledby="aprobar-hoy">
          <div className="mb-3 flex items-end justify-between gap-2">
            <h2 id="aprobar-hoy" className="m-0 text-base font-bold">
              Para aprobar hoy
            </h2>
            <span className="rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-semibold text-navy">
              {pendientes.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {pendientes.length === 0 && (
              <p className="rounded-xl border border-dashed border-border bg-cream-card px-4 py-6 text-center text-sm text-navy/60">
                Nada pendiente. Todo pasó a Enviados hoy.
              </p>
            )}
            {pendientes.map((card) => (
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
                <p className="mt-2 text-sm leading-snug text-navy/80">{card.why}</p>
                <div className="mt-2 rounded-lg border border-border/80 bg-white/80 px-3 py-2 text-sm leading-relaxed text-navy/75">
                  {previews[card.id] || card.preview}
                </div>
                <div className="mt-1 text-[11px] text-navy/45">
                  Preparado por {card.agente}
                </div>
                {editingId === card.id ? (
                  <EditPanel
                    preview={previews[card.id] || card.preview}
                    onCancel={() => setEditingId(null)}
                    onSave={(text) => {
                      setPreviews((p) => ({ ...p, [card.id]: text }));
                      setEditingId(null);
                      toast("Borrador actualizado (demo)", "ok");
                    }}
                  />
                ) : (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => aprobar(card)}
                      className="min-h-11 flex-1 rounded-lg bg-navy text-sm font-semibold text-white"
                    >
                      Aprobar
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
            ))}
          </div>
        </section>

        {enviados.length > 0 && (
          <section className="mt-8" aria-labelledby="enviados-hoy">
            <h2 id="enviados-hoy" className="mb-3 m-0 text-base font-bold">
              Enviados hoy
              <span className="ml-2 text-sm font-normal text-navy/50">
                ({enviados.length})
              </span>
            </h2>
            <div className="flex flex-col gap-2">
              {enviados.map((card) => (
                <CardShell key={card.id} muted>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{card.nombre}</div>
                    <span className="text-[11px] font-semibold text-ok">✓ Demo</span>
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
          Los agentes (Captación, Región, Guardian) prepararon esto. Tú solo
          decides.
        </p>
      </div>
    </div>
  );
}
