"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { Modal } from "./Modal";
import { ToastHost } from "./Toast";
import type { Rol } from "@/lib/types";

export function AppShell({
  rol,
  children,
  narrow,
}: {
  rol: Rol;
  children: ReactNode;
  narrow?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [outlookOpen, setOutlookOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const isMercadeo = rol === "mercadeo";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 bg-navy px-4 py-3 text-white">
        <Link href={isMercadeo ? "/hoy" : "/direccion"} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold font-bold text-navy">
            M
          </div>
          <div className="leading-tight">
            <strong className="block text-sm">Matrícula Ops</strong>
            <span className="text-xs text-white/70">
              Facultad de Educación · Unisabana
            </span>
          </div>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            {isMercadeo ? "Mercadeo" : "Dirección"}
          </span>
          {isMercadeo && (
            <>
              <button
                type="button"
                onClick={() => setOutlookOpen(true)}
                className="min-h-11 rounded-lg border border-white/30 px-3 text-sm hover:bg-white/10"
              >
                Conectar Outlook
              </button>
              <button
                type="button"
                onClick={() => setWaOpen(true)}
                className="min-h-11 rounded-lg border border-white/30 px-3 text-sm hover:bg-white/10"
              >
                Conectar WhatsApp
              </button>
            </>
          )}
          {!isMercadeo && (
            <Link
              href="/actividad"
              className="min-h-11 inline-flex items-center rounded-lg border border-white/30 px-3 text-sm hover:bg-white/10"
            >
              Log de actividad
            </Link>
          )}
          <button
            type="button"
            onClick={logout}
            className="min-h-11 rounded-lg px-3 text-sm text-white/80 hover:bg-white/10"
          >
            Salir
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1200px] flex-1 gap-0 md:gap-4">
        <nav className="hidden w-[200px] shrink-0 border-r border-border bg-cream-card p-4 md:block">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-navy/50">
            {isMercadeo ? "Operación" : "Dirección"}
          </div>
          {isMercadeo ? (
            <>
              <NavLink href="/hoy" active={pathname === "/hoy"}>
                Hoy
              </NavLink>
              <NavLink href="/actividad" active={pathname === "/actividad"}>
                Actividad
              </NavLink>
              <span className="block cursor-not-allowed rounded-lg px-3 py-2 text-sm text-navy/35">
                Colegios
              </span>
              <span className="block cursor-not-allowed rounded-lg px-3 py-2 text-sm text-navy/35">
                Ajustes
              </span>
            </>
          ) : (
            <>
              <NavLink href="/direccion" active={pathname === "/direccion"}>
                Dashboard
              </NavLink>
              <NavLink href="/actividad" active={pathname === "/actividad"}>
                Actividad
              </NavLink>
              <NavLink href="/hoy" active={pathname === "/hoy"}>
                Vista Hoy
              </NavLink>
            </>
          )}
        </nav>

        {/* mobile tabs */}
        <div className="flex w-full gap-1 border-b border-border bg-cream-card px-2 py-2 md:hidden">
          {isMercadeo ? (
            <>
              <MobileTab href="/hoy" active={pathname === "/hoy"}>
                Hoy
              </MobileTab>
              <MobileTab href="/actividad" active={pathname === "/actividad"}>
                Actividad
              </MobileTab>
            </>
          ) : (
            <>
              <MobileTab href="/direccion" active={pathname === "/direccion"}>
                Dashboard
              </MobileTab>
              <MobileTab href="/actividad" active={pathname === "/actividad"}>
                Actividad
              </MobileTab>
              <MobileTab href="/hoy" active={pathname === "/hoy"}>
                Hoy
              </MobileTab>
            </>
          )}
        </div>

        <main
          className={`flex-1 px-4 py-5 ${
            narrow ? "max-w-[960px]" : "max-w-[1100px]"
          }`}
        >
          {children}
        </main>
      </div>

      <Modal
        open={outlookOpen}
        onClose={() => setOutlookOpen(false)}
        title="Conectar Outlook"
        size="sm"
        footer={
          <button
            type="button"
            className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white"
            onClick={() => setOutlookOpen(false)}
          >
            Entendido
          </button>
        }
      >
        <p className="mb-2 text-sm font-semibold">Próximamente · OAuth Microsoft 365</p>
        <p className="m-0 text-sm text-navy/70">
          La conexión usará OAuth de Microsoft 365. En v1 el envío se registra
          como mock / cola local. No se almacenan credenciales en este MVP.
        </p>
      </Modal>

      <Modal
        open={waOpen}
        onClose={() => setWaOpen(false)}
        title="Conectar WhatsApp Business"
        size="sm"
        footer={
          <button
            type="button"
            className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white"
            onClick={() => setWaOpen(false)}
          >
            Entendido
          </button>
        }
      >
        <p className="mb-2 text-sm font-semibold">
          Próximamente · WhatsApp Business (Meta)
        </p>
        <p className="m-0 text-sm text-navy/70">
          Integración vía WhatsApp Business Platform (Meta OAuth). En v1 es un
          stub: el craft queda listo y el envío se marca como mock hasta
          conectar.
        </p>
      </Modal>

      <ToastHost />
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`mb-1 block rounded-lg px-3 py-2 text-sm font-medium ${
        active
          ? "bg-navy text-white"
          : "text-navy/80 hover:bg-cream"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`min-h-11 flex-1 rounded-lg px-2 py-2 text-center text-sm font-medium ${
        active ? "bg-navy text-white" : "text-navy/70"
      }`}
    >
      {children}
    </Link>
  );
}
