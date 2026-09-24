"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BIBLIOTECA_OFERTAS } from "@/lib/admissions-data";
import { toast } from "./Toast";

type BrochureMeta = {
  url: string;
  pathname: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy?: string;
};

type ProgramaRow = {
  programa: string;
  brochure: BrochureMeta | null;
};

const PROGRAMAS = [
  "Maestría en Educación",
  "Maestría en Pedagogía",
  "Maestría en Dirección y Gestión",
  "Maestría en Desarrollo Infantil",
] as const;

function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-CO", {
      timeZone: "America/Bogota",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function BibliotecaClient() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [rows, setRows] = useState<ProgramaRow[]>(
    PROGRAMAS.map((programa) => ({ programa, brochure: null }))
  );
  const [loadingMat, setLoadingMat] = useState(true);
  const [busyPrograma, setBusyPrograma] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadMateriales = useCallback(async () => {
    try {
      const res = await fetch("/api/materiales", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data.error || "No se pudieron cargar los brochures", "err");
        return;
      }
      if (Array.isArray(data.programas)) {
        setRows(data.programas as ProgramaRow[]);
      }
    } catch {
      toast("Error de red al cargar materiales", "err");
    } finally {
      setLoadingMat(false);
    }
  }, []);

  useEffect(() => {
    void loadMateriales();
  }, [loadMateriales]);

  async function copiar(md: string, titulo: string) {
    try {
      await navigator.clipboard.writeText(md);
      toast(`Copiado: ${titulo}`, "ok");
    } catch {
      toast("No se pudo copiar al portapapeles", "err");
    }
  }

  async function onUpload(programa: string, file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toast("Solo PDF, por favor", "err");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast("Máximo 12 MB", "err");
      return;
    }
    setBusyPrograma(programa);
    try {
      const fd = new FormData();
      fd.set("programa", programa);
      fd.set("file", file);
      const res = await fetch("/api/materiales", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data.error || "No se pudo subir", "err");
        return;
      }
      toast(`Brochure listo · ${programa}`, "ok");
      if (Array.isArray(data.programas)) {
        setRows(data.programas as ProgramaRow[]);
      } else {
        await loadMateriales();
      }
    } catch {
      toast("Error de red al subir", "err");
    } finally {
      setBusyPrograma(null);
      const input = fileRefs.current[programa];
      if (input) input.value = "";
    }
  }

  async function onDelete(programa: string) {
    if (!confirm(`¿Quitar el brochure de ${programa}?`)) return;
    setBusyPrograma(programa);
    try {
      const res = await fetch(
        `/api/materiales?programa=${encodeURIComponent(programa)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data.error || "No se pudo quitar", "err");
        return;
      }
      toast("Brochure quitado", "ok");
      await loadMateriales();
    } catch {
      toast("Error de red al quitar", "err");
    } finally {
      setBusyPrograma(null);
    }
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="m-0 text-2xl font-bold">Biblioteca de ofertas</h1>
        <p className="mt-1 text-sm text-navy/65">
          Brochures PDF + one-pagers · Natalia aprueba envíos en Mi día
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

      <section className="mb-8" aria-labelledby="materiales-brochures">
        <div className="mb-3">
          <h2
            id="materiales-brochures"
            className="m-0 text-lg font-bold text-navy"
          >
            Materiales · Brochures
          </h2>
          <p className="mt-1 text-sm text-navy/60">
            Sube un PDF por maestría. El link queda en los borradores de Mi día
            (primer contacto). Solo PDF · máx. 12 MB.
          </p>
        </div>

        {loadingMat ? (
          <p className="rounded-xl border border-dashed border-border bg-cream-card px-4 py-5 text-sm text-navy/60">
            Cargando brochures…
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {rows.map(({ programa, brochure }) => {
              const busy = busyPrograma === programa;
              return (
                <article
                  key={programa}
                  className="flex flex-col rounded-[10px] border border-border bg-cream-card p-4"
                >
                  <h3 className="m-0 text-base font-semibold leading-snug">
                    {programa}
                  </h3>
                  <p className="mt-1.5 text-xs text-navy/60">
                    {brochure ? (
                      <>
                        <span className="font-medium text-ok">Con brochure</span>
                        {" · "}
                        {brochure.fileName}
                        {" · "}
                        {formatFecha(brochure.uploadedAt)}
                        {brochure.uploadedBy
                          ? ` · ${brochure.uploadedBy}`
                          : ""}
                      </>
                    ) : (
                      <span className="text-warn font-medium">Sin brochure</span>
                    )}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <input
                      ref={(el) => {
                        fileRefs.current[programa] = el;
                      }}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) =>
                        void onUpload(programa, e.target.files?.[0])
                      }
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => fileRefs.current[programa]?.click()}
                      className="min-h-10 rounded-lg bg-navy px-3 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {busy
                        ? "Subiendo…"
                        : brochure
                          ? "Reemplazar PDF"
                          : "Subir PDF"}
                    </button>
                    {brochure && (
                      <>
                        <a
                          href={brochure.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-sm font-medium text-navy"
                        >
                          Abrir / ver
                        </a>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void onDelete(programa)}
                          className="min-h-10 rounded-lg border border-border px-3 text-sm text-navy/70 disabled:opacity-50"
                        >
                          Quitar
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="mb-3">
        <h2 className="m-0 text-lg font-bold text-navy">One-pagers</h2>
        <p className="mt-1 text-sm text-navy/60">
          Piezas aprobadas por Dirección · copiar markdown
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
