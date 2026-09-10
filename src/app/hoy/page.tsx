import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listActividad, listTareas } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import { HoyClient } from "@/components/HoyClient";

export const dynamic = "force-dynamic";

export default async function HoyPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");

  const [tareas, feed] = await Promise.all([listTareas(), listActividad()]);

  return (
    <AppShell
      rol={session.rol}
      userName={session.displayName}
      rolLabel={session.rolLabel}
      narrow
    >
      <Suspense fallback={<p className="text-sm text-navy/60">Cargando Hoy…</p>}>
        <HoyClient
          initialTareas={tareas}
          initialFeed={feed}
          showConnections={session.rol === "mercadeo"}
        />
      </Suspense>
    </AppShell>
  );
}
