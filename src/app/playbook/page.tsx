import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { PlaybookClient } from "@/components/PlaybookClient";

export const dynamic = "force-dynamic";

export default async function PlaybookPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");

  return (
    <AppShell
      rol={session.rol}
      userName={session.displayName}
      rolLabel={session.rolLabel}
    >
      <PlaybookClient />
    </AppShell>
  );
}
