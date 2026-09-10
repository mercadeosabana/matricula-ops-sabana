"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<"mercadeo" | "direccion" | null>(null);

  async function enter(rol: "mercadeo" | "direccion") {
    setLoading(rol);
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rol }),
    });
    router.push(rol === "mercadeo" ? "/hoy" : "/direccion");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-[520px]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-xl font-bold text-gold">
            M
          </div>
          <h1 className="m-0 text-2xl font-bold text-navy">Matrícula Ops</h1>
          <p className="mt-2 text-sm leading-relaxed text-navy/70">
            Facultad de Educación · Universidad de La Sabana
            <br />
            Cohorte 2027-1
          </p>
          <p className="mt-3 text-sm font-medium text-navy">
            Los agentes proponen. Tú apruebas.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={!!loading}
            onClick={() => enter("mercadeo")}
            className="w-full rounded-[10px] border border-border bg-cream-card p-5 text-left shadow-sm transition hover:border-navy/40 hover:shadow disabled:opacity-60"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-navy/50">
              Mercadeo
            </div>
            <div className="mt-1 text-lg font-bold text-navy">
              {loading === "mercadeo"
                ? "Entrando…"
                : "Entrar como Laura Natalia · Mercadeo"}
            </div>
            <p className="mt-2 m-0 text-sm text-navy/65">
              Cola del día · aprobar, editar, enviar y conectar Outlook / WhatsApp.
            </p>
          </button>

          <button
            type="button"
            disabled={!!loading}
            onClick={() => enter("direccion")}
            className="w-full rounded-[10px] border-2 border-navy bg-cream-card p-5 text-left shadow-sm transition hover:bg-cream disabled:opacity-60"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-navy/50">
              Dirección
            </div>
            <div className="mt-1 text-lg font-bold text-navy">
              {loading === "direccion"
                ? "Entrando…"
                : "Entrar como Laura Lucía · Dirección"}
            </div>
            <p className="mt-2 m-0 text-sm text-navy/65">
              Directora maestrías presenciales · Educación · dashboard y embudo.
            </p>
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-navy/50">
          Demo por persona · roles internos mercadeo / direccion
        </p>
      </div>
    </div>
  );
}
