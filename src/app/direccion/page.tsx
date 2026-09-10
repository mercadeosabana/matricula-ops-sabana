import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getMetricas } from "@/lib/db";
import { FUNNEL_EJEMPLO } from "@/lib/seed-data";
import { AppShell } from "@/components/AppShell";
import { DireccionClient } from "@/components/DireccionClient";

export const dynamic = "force-dynamic";

export default async function DireccionPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");

  const metrica = await getMetricas();

  return (
    <AppShell rol={session.rol} userName={session.displayName} rolLabel={session.rolLabel}>
      <DireccionClient
        metrica={metrica as Record<string, unknown> | null}
        funnel={FUNNEL_EJEMPLO}
        revenue={{
          metaCop: 1_100_000_000,
          pagadoCop: 165_000_000,
          proyeccionEarlyBird: "~$495–550M",
          gap: "~$550–605M",
          semaforo: "amarillo",
          ticketPromedio: "~$27.5M COP",
          metaMatriculas: 40,
          matriculas: 6,
        }}
        mix={[
          {
            programa: "Maestría en Educación",
            matriculas: 2,
            pipeline: 5,
            prioridad: "Media",
          },
          {
            programa: "Pedagogía",
            matriculas: 1,
            pipeline: 4,
            prioridad: "Media-alta (Cajicá / Vermont)",
          },
          {
            programa: "Dirección y Gestión",
            matriculas: 2,
            pipeline: 5,
            prioridad: "Alta (líderes colegio)",
          },
          {
            programa: "Desarrollo Infantil",
            matriculas: 1,
            pipeline: 2,
            prioridad: "Alta (preescolar fuerte)",
          },
        ]}
        estrategia={[
          "Doblar visitas Chía en sábados — 2 fechas/mes (20 y 27 sep; luego oct). Meta ≥12 visitas realizadas / mes.",
          "Cerrar gap interés→agenda — WA D+3 + guion 90 s. Meta conversión 45% (hoy 38% EJEMPLO).",
          "Empujar early bird — toda pieza con 15% hasta 15 oct (CONFIRMAR). Contador en Hoy.",
          "Segmentar por programa — Educación/Dirección: Bogotá norte; Pedagogía: Cajicá; DI: preescolares fuertes.",
          "Secuencia D+3 / D+7 / D+14 — un «Aprobar» programa los tres toques.",
          "Reactivar fríos a día 14 — oferta contacto noviembre; no perder lead del CRM.",
          "Reporte semanal — este dashboard: funnel, $ vs meta, semáforo, top 3 tareas.",
          "Calidad show-up — recordatorio WA 24 h antes; meta ≥80% (hoy 75% EJEMPLO).",
        ]}
        wow={[
          { label: "WoW contactos ↑ 12%", tone: "ok" },
          { label: "WoW show-up visitas 75% → meta 80%", tone: "ok" },
          { label: "WoW interés→agenda 38% (meta 45%)", tone: "warn" },
          {
            label: "Cuello: interés → visita y app → matrícula",
            tone: "neutral",
          },
        ]}
      />
    </AppShell>
  );
}
