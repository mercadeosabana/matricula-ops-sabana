import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getMetasCohorte, listActividad, listTareas, totalesMetas } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import { HoyClient } from "@/components/HoyClient";

export const dynamic = "force-dynamic";

export default async function HoyPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");

  const [tareas, feed, metas] = await Promise.all([
    listTareas(),
    listActividad(),
    getMetasCohorte(),
  ]);
  const metasTotales = totalesMetas(metas);

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
          metas={metas}
          metasTotales={metasTotales}
        />
      </Suspense>
    </AppShell>
  );
}
