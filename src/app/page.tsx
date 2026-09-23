"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo entrar");
        return;
      }
      router.push(data.rol === "mercadeo" ? "/hoy" : "/direccion");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function demoRapido(demoUserId: string, rol: "mercadeo" | "direccion") {
    setDemoLoading(demoUserId);
    setError(null);
    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoUserId, rol }),
      });
      router.push(rol === "mercadeo" ? "/hoy" : "/direccion");
      router.refresh();
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-[440px]">
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

        {/* Demo aprobación producto — sin login */}
        <div className="mb-5 rounded-[12px] border-2 border-navy bg-cream-card p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-gold">
            Demo aprobación · sin login
          </div>
          <p className="mt-1 text-xs leading-relaxed text-navy/65">
            Para Laura Natalia y Laura Lucía · una pantalla cada una. Sin
            Azure / WhatsApp.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href="/mi-dia"
              className="flex min-h-12 items-center justify-between rounded-lg bg-navy px-4 text-sm font-semibold text-white"
              style={{ color: "#fff" }}
            >
              <span>Ver demo Natalia (Mi día)</span>
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/como-vamos"
              className="flex min-h-12 items-center justify-between rounded-lg border-2 border-navy bg-white px-4 text-sm font-semibold text-navy"
            >
              <span>Ver demo Lucía (Cómo vamos)</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
          <p className="mt-2 text-center text-[11px] text-navy/45">
            También:{" "}
            <a href="/demo-aprobacion.html" className="underline">
              /demo-aprobacion.html
            </a>{" "}
            (fallback HTML)
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-[12px] border border-border bg-cream-card p-5 shadow-sm"
        >
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/55">
            Correo
          </label>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@unisabana.edu.co"
            className="mb-3 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
          />
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/55">
            Contraseña
          </label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mb-3 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
          />
          {error && (
            <p className="mb-3 rounded-lg border border-[#9b2c2c]/30 bg-[#fdecea] px-3 py-2 text-xs text-[#9b2c2c]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="min-h-11 w-full rounded-lg bg-navy text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
          <p className="mt-3 text-center text-[11px] text-navy/50">
            Demo: laura.natalia@ · laura.lucia@ · ivan.auli@ · clave{" "}
            <strong>sabana2027</strong>
          </p>
        </form>

        <div className="mt-5 rounded-[10px] border border-dashed border-border bg-cream-card/80 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-navy/50">
            Entrar demo rápido (UI completa)
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <button
              type="button"
              disabled={!!demoLoading}
              onClick={() => demoRapido("u-mercadeo", "mercadeo")}
              className="min-h-11 rounded-lg border border-border bg-white px-3 text-left text-sm hover:border-navy/40 disabled:opacity-60"
            >
              {demoLoading === "u-mercadeo"
                ? "Entrando…"
                : "Laura Natalia · Mercadeo (/hoy)"}
            </button>
            <button
              type="button"
              disabled={!!demoLoading}
              onClick={() => demoRapido("u-direccion", "direccion")}
              className="min-h-11 rounded-lg border border-border bg-white px-3 text-left text-sm disabled:opacity-60"
            >
              {demoLoading === "u-direccion"
                ? "Entrando…"
                : "Laura Lucía · Dirección (/direccion)"}
            </button>
            <button
              type="button"
              disabled={!!demoLoading}
              onClick={() => demoRapido("u-ivan", "direccion")}
              className="min-h-11 rounded-lg border border-border bg-white px-3 text-left text-sm disabled:opacity-60"
            >
              {demoLoading === "u-ivan"
                ? "Entrando…"
                : "Ivan Auli · Dirección / admin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
