import { redirect } from "next/navigation";
import { getSessionRol } from "@/lib/auth";
import { listActividad, listTareas } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import { HoyClient } from "@/components/HoyClient";

export const dynamic = "force-dynamic";

export default async function HoyPage() {
  const rol = await getSessionRol();
  if (!rol) redirect("/");

  const [tareas, feed] = await Promise.all([listTareas(), listActividad()]);

  return (
    <AppShell rol={rol} narrow>
      <HoyClient initialTareas={tareas} initialFeed={feed} />
    </AppShell>
  );
}
