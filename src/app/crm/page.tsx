import { redirect } from "next/navigation";
import { getSessionRol, personaForRol } from "@/lib/auth";
import { listColegios, listLeads } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import { CrmClient } from "@/components/CrmClient";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const rol = await getSessionRol();
  if (!rol) redirect("/");
  const persona = personaForRol(rol);
  const [colegios, leads] = await Promise.all([listColegios(), listLeads()]);

  return (
    <AppShell rol={rol} userName={persona.nombre} rolLabel={persona.rolLabel}>
      <CrmClient colegios={colegios} leads={leads} />
    </AppShell>
  );
}
