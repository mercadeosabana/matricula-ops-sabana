"use client";

import { useState } from "react";
import { BIBLIOTECA_OFERTAS } from "@/lib/admissions-data";
import { toast } from "./Toast";

export function BibliotecaClient() {
  const [openId, setOpenId] = useState<string | null>(null);

  async function copiar(md: string, titulo: string) {
    try {
      await navigator.clipboard.writeText(md);
      toast(`Copiado: ${titulo}`, "ok");
    } catch {
      toast("No se pudo copiar al portapapeles", "err");
    }
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="m-0 text-2xl font-bold">Biblioteca de ofertas</h1>
        <p className="mt-1 text-sm text-navy/65">
          One-pagers y piezas aprobadas por Dirección · copiar markdown
        </p>
        <p className="mt-2 text-sm">
          <a
            href="/interesado"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-navy/80"
          >
            Landing pauta (demo)
          </a>
          <span className="text-navy/45">
            {" "}
            · formulario público Meta / LinkedIn → CRM Natalia
          </span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BIBLIOTECA_OFERTAS.map((o) => (
          <article
            key={o.id}
            className="flex flex-col rounded-[10px] border border-border bg-cream-card p-4"
          >
            <div className="mb-2 flex flex-wrap gap-1.5">
              <span className="rounded-full border border-ok/30 bg-[#e8f5ee] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ok">
                Aprobada por Dirección
              </span>
              <span className="rounded-full border border-border bg-cream px-2 py-0.5 text-[10px] font-medium text-navy/60">
                {o.tipo}
              </span>
            </div>
            <h2 className="m-0 text-base font-semibold">{o.titulo}</h2>
            <p className="mt-1 text-xs text-navy/55">{o.programa}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              <button
                type="button"
                onClick={() => setOpenId(openId === o.id ? null : o.id)}
                className="min-h-10 rounded-lg border border-border px-3 text-sm"
              >
                {openId === o.id ? "Ocultar" : "Ver"}
              </button>
              <button
                type="button"
                onClick={() => copiar(o.markdown, o.titulo)}
                className="min-h-10 rounded-lg bg-navy px-3 text-sm font-medium text-white"
              >
                Copiar markdown
              </button>
            </div>
            {openId === o.id && (
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-cream p-3 text-[12px] leading-relaxed">
                {o.markdown}
              </pre>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
