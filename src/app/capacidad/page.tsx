import { redirect } from "next/navigation";
import { getSessionRol, personaForRol } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { CapacidadClient } from "@/components/CapacidadClient";

export const dynamic = "force-dynamic";

export default async function CapacidadPage() {
  const rol = await getSessionRol();
  if (!rol) redirect("/");
  const persona = personaForRol(rol);
  return (
    <AppShell rol={rol} userName={persona.nombre} rolLabel={persona.rolLabel}>
      <CapacidadClient />
    </AppShell>
  );
}
