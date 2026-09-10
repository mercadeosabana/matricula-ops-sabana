"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { ToastHost } from "./Toast";
import type { Rol } from "@/lib/types";
import {
  OutlookConnectModal,
  WhatsAppConnectModal,
  useConnections,
} from "./ConnectModals";

export function AppShell({
  rol,
  userName,
  rolLabel,
  children,
  narrow,
}: {
  rol: Rol;
  userName: string;
  rolLabel: string;
  children: ReactNode;
  narrow?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [outlookOpen, setOutlookOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const { status, refresh } = useConnections();

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
            {userName} · {rolLabel}
          </span>
          {isMercadeo && (
            <>
              <button
                type="button"
                onClick={() => setOutlookOpen(true)}
                className="min-h-11 rounded-lg border border-white/30 px-3 text-sm hover:bg-white/10"
              >
                {status?.outlook.connected ? "Outlook ✓" : "Conectar Outlook"}
              </button>
              <button
                type="button"
                onClick={() => setWaOpen(true)}
                className="min-h-11 rounded-lg border border-white/30 px-3 text-sm hover:bg-white/10"
              >
                {status?.whatsapp.connected ? "WhatsApp ✓" : "Conectar WhatsApp"}
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
              <button
                type="button"
                onClick={() => setOutlookOpen(true)}
                className="mb-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-navy/80 hover:bg-cream"
              >
                Ajustes · Conexiones
              </button>
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

      {isMercadeo && (
        <>
          <OutlookConnectModal
            open={outlookOpen}
            onClose={() => setOutlookOpen(false)}
            status={status}
            onChanged={refresh}
          />
          <WhatsAppConnectModal
            open={waOpen}
            onClose={() => setWaOpen(false)}
            status={status}
            onChanged={refresh}
          />
        </>
      )}

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
