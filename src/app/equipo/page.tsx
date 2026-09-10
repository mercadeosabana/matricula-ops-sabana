import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listUsers } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import { EquipoClient } from "@/components/EquipoClient";

export const dynamic = "force-dynamic";

export default async function EquipoPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");
  if (session.rol !== "direccion") redirect("/hoy");

  const users = await listUsers();

  return (
    <AppShell
      rol={session.rol}
      userName={session.displayName}
      rolLabel={session.rolLabel}
    >
      <EquipoClient initialUsers={users} selfId={session.id} />
    </AppShell>
  );
}
