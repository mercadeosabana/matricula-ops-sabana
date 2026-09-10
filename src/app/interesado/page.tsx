import { Suspense } from "react";
import type { Metadata } from "next";
import { InteresadoLanding } from "@/components/InteresadoLanding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quiero información · Unisabana Educación",
  description:
    "Formulario de interés en maestrías · Facultad de Educación · Universidad de La Sabana",
};

export default function InteresadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-navy/60">
          Cargando…
        </div>
      }
    >
      <InteresadoLanding />
    </Suspense>
  );
}
