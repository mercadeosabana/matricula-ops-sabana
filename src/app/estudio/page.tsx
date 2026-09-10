import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getMetasCohorte, listLeads, totalesMetas } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import { EstudioClient } from "@/components/EstudioClient";

export const dynamic = "force-dynamic";

export default async function EstudioPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");

  const metas = await getMetasCohorte();
  const metasTotales = totalesMetas(metas);
  const leads = await listLeads();

  return (
    <AppShell
      rol={session.rol}
      userName={session.displayName}
      rolLabel={session.rolLabel}
    >
      <EstudioClient metas={metas} metasTotales={metasTotales} leads={leads} />
    </AppShell>
  );
}
