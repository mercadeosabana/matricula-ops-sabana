import { redirect } from "next/navigation";
import { getSessionRol, personaForRol } from "@/lib/auth";
import { listActividad } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import { ActividadClient } from "@/components/ActividadClient";

export const dynamic = "force-dynamic";

export default async function ActividadPage() {
  const rol = await getSessionRol();
  if (!rol) redirect("/");
  const persona = personaForRol(rol);

  const items = await listActividad();

  return (
    <AppShell
      rol={rol}
      userName={persona.nombre}
      rolLabel={persona.rolLabel}
      narrow
    >
      <ActividadClient initialItems={items} />
    </AppShell>
  );
}
