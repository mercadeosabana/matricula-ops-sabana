import { redirect } from "next/navigation";
import { getSessionRol, personaForRol } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { BibliotecaClient } from "@/components/BibliotecaClient";

export const dynamic = "force-dynamic";

export default async function BibliotecaPage() {
  const rol = await getSessionRol();
  if (!rol) redirect("/");
  const persona = personaForRol(rol);
  return (
    <AppShell rol={rol} userName={persona.nombre} rolLabel={persona.rolLabel}>
      <BibliotecaClient />
    </AppShell>
  );
}
