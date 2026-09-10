"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const PROGRAMAS = [
  "Maestría en Educación",
  "Maestría en Pedagogía",
  "Maestría en Dirección y Gestión",
  "Maestría en Desarrollo Infantil",
] as const;

const fieldClass =
  "w-full min-h-11 rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy focus:outline focus:outline-2 focus:outline-gold focus:outline-offset-1";

type FormState = {
  nombre: string;
  email: string;
  telefono: string;
  programa: string;
  rol: string;
  ciudad: string;
  consentimiento: boolean;
  empresa_web: string;
};

const INITIAL: FormState = {
  nombre: "",
  email: "",
  telefono: "",
  programa: "",
  rol: "",
  ciudad: "",
  consentimiento: false,
  empresa_web: "",
};

export function InteresadoLanding() {
  const search = useSearchParams();
  const canal = (search.get("canal") || "").toLowerCase();
  const utm_campaign =
    search.get("utm_campaign") || search.get("campaign") || "";
  const utm_source = search.get("utm_source") || search.get("source") || "";
  const utm_medium = search.get("utm_medium") || "";

  const origenLabel = useMemo(() => {
    if (canal === "linkedin") return "Pauta LinkedIn";
    return "Pauta Meta";
  }, [canal]);

  const [form, setForm] = useState<FormState>(INITIAL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/leads/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          canal: canal === "linkedin" ? "linkedin" : "meta",
          utm_campaign,
          utm_source,
          utm_medium,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          (data as { error?: string }).error ||
            "No se pudo enviar. Intenta de nuevo."
        );
        return;
      }
      setDone(true);
    } catch {
      setError("Error de red. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream text-navy">
      <header className="border-b border-border bg-navy text-white">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold font-bold text-navy">
            U
          </div>
          <div className="leading-tight">
            <strong className="block text-sm sm:text-base">
              Unisabana Educación
            </strong>
            <span className="text-xs text-white/70">
              Maestrías · Cohorte 2027-1 · {origenLabel}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8">
        {done ? (
          <section className="rounded-[12px] border border-ok/30 bg-cream-card p-6 shadow-sm">
            <p className="m-0 text-xs font-bold uppercase tracking-wide text-ok">
              Listo
            </p>
            <h1 className="mt-2 text-2xl font-bold">Gracias por tu interés</h1>
            <p className="mt-3 text-sm leading-relaxed text-navy/75">
              Recibimos tus datos. El equipo de admisiones de la Facultad de
              Educación (Unisabana) te contactará pronto para contarte sobre el
              programa y resolver dudas.
            </p>
            <p className="mt-4 text-sm text-navy/60">
              Si quieres escribirnos antes:{" "}
              <span className="font-medium text-navy">
                facultad.educacion@unisabana.edu.co
              </span>
            </p>
            <button
              type="button"
              className="mt-6 min-h-11 rounded-lg border border-border bg-white px-4 text-sm font-medium"
              onClick={() => {
                setDone(false);
                setForm(INITIAL);
              }}
            >
              Enviar otro interés
            </button>
          </section>
        ) : (
          <section className="rounded-[12px] border border-border bg-cream-card p-5 shadow-sm sm:p-6">
            <h1 className="m-0 text-2xl font-bold leading-snug">
              Quiero información de una maestría
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-navy/70">
              Déjanos tus datos y te contactamos. Facultad de Educación ·
              Universidad de La Sabana.
            </p>

            <form className="relative mt-5 space-y-4" onSubmit={onSubmit} noValidate>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">
                  Nombre completo *
                </span>
                <input
                  className={fieldClass}
                  autoComplete="name"
                  value={form.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">
                  Correo *
                </span>
                <input
                  className={fieldClass}
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">
                  Teléfono / WhatsApp (opcional)
                </span>
                <input
                  className={fieldClass}
                  type="tel"
                  autoComplete="tel"
                  placeholder="+57…"
                  value={form.telefono}
                  onChange={(e) => setField("telefono", e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">
                  Programa de interés *
                </span>
                <select
                  className={fieldClass}
                  value={form.programa}
                  onChange={(e) => setField("programa", e.target.value)}
                  required
                >
                  <option value="">Selecciona…</option>
                  {PROGRAMAS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">
                  Tu rol *
                </span>
                <select
                  className={fieldClass}
                  value={form.rol}
                  onChange={(e) => setField("rol", e.target.value)}
                  required
                >
                  <option value="">Selecciona…</option>
                  <option value="docente">Docente</option>
                  <option value="directivo">Directivo</option>
                  <option value="otro">Otro</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">
                  Ciudad *
                </span>
                <input
                  className={fieldClass}
                  autoComplete="address-level2"
                  value={form.ciudad}
                  onChange={(e) => setField("ciudad", e.target.value)}
                  required
                />
              </label>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
              >
                <label>
                  Empresa web
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.empresa_web}
                    onChange={(e) => setField("empresa_web", e.target.value)}
                  />
                </label>
              </div>

              <label className="flex items-start gap-2 text-sm text-navy/80">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.consentimiento}
                  onChange={(e) => setField("consentimiento", e.target.checked)}
                  required
                />
                <span>
                  Autorizo a Unisabana Educación a contactarme sobre programas
                  de posgrado.{" "}
                  <span className="text-navy/50">(obligatorio)</span>
                </span>
              </label>

              {error && (
                <p className="rounded-lg border border-[#9b2c2c]/30 bg-[#fdf0f0] px-3 py-2 text-sm text-[#9b2c2c]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="min-h-12 w-full rounded-lg bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-mid disabled:opacity-60"
              >
                {busy ? "Enviando…" : "Quiero que me contacten"}
              </button>

              <p className="text-center text-[11px] text-navy/45">
                Demo Matrícula Ops · no es el sitio oficial de admisiones
              </p>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
