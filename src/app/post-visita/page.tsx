import { redirect } from "next/navigation";
import { getSessionRol, personaForRol } from "@/lib/auth";
import { listColegios, listLeads } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import { PostVisitaClient } from "@/components/PostVisitaClient";

export const dynamic = "force-dynamic";

export default async function PostVisitaPage() {
  const rol = await getSessionRol();
  if (!rol) redirect("/");
  const persona = personaForRol(rol);
  const [colegios, leads] = await Promise.all([listColegios(), listLeads()]);
  const byId = new Map(colegios.map((c) => [c.id, c]));
  const initial = leads
    .filter((l) => l.postVisita && (l.etapaFunnel === "seguimiento" || l.etapaFunnel === "post-visita"))
    .map((lead) => ({ lead, colegio: byId.get(lead.colegioId) }));

  return (
    <AppShell rol={rol} userName={persona.nombre} rolLabel={persona.rolLabel}>
      <PostVisitaClient initial={initial} />
    </AppShell>
  );
}
