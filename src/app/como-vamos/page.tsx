import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { ComoVamosClient } from "@/components/ComoVamosClient";

export const dynamic = "force-dynamic";

export default async function ComoVamosPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");

  return (
    <AppShell
      rol={session.rol}
      userName={session.displayName}
      rolLabel={session.rolLabel}
      narrow
    >
      <ComoVamosClient />
    </AppShell>
  );
}
