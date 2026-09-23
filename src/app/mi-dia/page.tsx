import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { MiDiaClient } from "@/components/MiDiaClient";

export const dynamic = "force-dynamic";

export default async function MiDiaPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");

  return (
    <AppShell
      rol={session.rol}
      userName={session.displayName}
      rolLabel={session.rolLabel}
      narrow
    >
      <MiDiaClient />
    </AppShell>
  );
}
