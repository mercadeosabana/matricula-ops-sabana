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
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-[420px] rounded-[10px] border border-border bg-cream-card p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-xl font-bold text-gold">
          M
        </div>
        <h1 className="m-0 text-center text-2xl font-bold text-navy">
          Matrícula Ops
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-navy/70">
          Facultad de Educación · Universidad de La Sabana
          <br />
          Cohorte 2027-1 · Demo
        </p>
        <p className="mt-4 text-center text-sm font-medium text-navy">
          Los agentes proponen. Tú apruebas.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            disabled={!!loading}
            onClick={() => enter("mercadeo")}
            className="min-h-12 w-full rounded-lg bg-navy px-4 text-base font-semibold text-white hover:bg-navy-mid disabled:opacity-60"
          >
            {loading === "mercadeo" ? "Entrando…" : "Entrar como Mercadeo"}
          </button>
          <button
            type="button"
            disabled={!!loading}
            onClick={() => enter("direccion")}
            className="min-h-12 w-full rounded-lg border-2 border-navy bg-transparent px-4 text-base font-semibold text-navy hover:bg-cream disabled:opacity-60"
          >
            {loading === "direccion" ? "Entrando…" : "Entrar como Dirección"}
          </button>
        </div>
        <p className="mt-6 text-center text-xs text-navy/50">
          Demo sin autenticación real · Cohorte 2027-1
        </p>
      </div>
    </div>
  );
}
