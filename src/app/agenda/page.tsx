import { redirect } from "next/navigation";
import { getSessionRol, personaForRol } from "@/lib/auth";
import { listAgendaEvents } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import { AgendaClient } from "@/components/AgendaClient";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const rol = await getSessionRol();
  if (!rol) redirect("/");
  const persona = personaForRol(rol);
  const events = await listAgendaEvents();

  return (
    <AppShell
      rol={rol}
      userName={persona.nombre}
      rolLabel={persona.rolLabel}
      narrow
    >
      <AgendaClient initialEvents={events} />
    </AppShell>
  );
}

