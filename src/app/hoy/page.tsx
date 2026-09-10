import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionRol, personaForRol } from "@/lib/auth";
import { listActividad, listTareas } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import { HoyClient } from "@/components/HoyClient";

export const dynamic = "force-dynamic";

export default async function HoyPage() {
  const rol = await getSessionRol();
  if (!rol) redirect("/");
  const persona = personaForRol(rol);

  const [tareas, feed] = await Promise.all([listTareas(), listActividad()]);

  return (
    <AppShell
      rol={rol}
      userName={persona.nombre}
      rolLabel={persona.rolLabel}
      narrow
    >
      <Suspense fallback={<p className="text-sm text-navy/60">Cargando Hoy…</p>}>
        <HoyClient
          initialTareas={tareas}
          initialFeed={feed}
          showConnections={rol === "mercadeo"}
        />
      </Suspense>
    </AppShell>
  );
}
