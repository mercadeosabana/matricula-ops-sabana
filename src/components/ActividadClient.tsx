"use client";

import { useState } from "react";
import Link from "next/link";
import type { ActividadItem } from "@/lib/types";

export function ActividadClient({
  initialItems,
}: {
  initialItems: ActividadItem[];
}) {
  const [filter, setFilter] = useState<"all" | "agente" | "human">("all");
  const items = initialItems.filter((f) => {
    if (filter === "all") return true;
    return f.kind === filter;
  });

  return (
    <>
      <div className="mb-4">
        <h1 className="m-0 text-2xl font-bold">Actividad</h1>
        <p className="mt-1 text-sm text-navy/65">
          Lo que hicieron agentes y humanos · jue 10 sep 2026
        </p>
      </div>

      <div className="mb-4 flex gap-2">
        {(
          [
            ["all", "Todos"],
            ["agente", "Agentes"],
            ["human", "Humanos"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`min-h-11 rounded-lg px-3 text-sm font-medium ${
              filter === k
                ? "bg-navy text-white"
                : "border border-border bg-cream-card text-navy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-[10px] border border-border bg-cream-card p-3">
        {items.length === 0 ? (
          <div className="p-6 text-center text-sm text-navy/60">
            <strong className="block text-base text-navy">Sin eventos</strong>
            No hay actividad para este filtro.
          </div>
        ) : (
          items.map((f) => (
            <div
              key={f.id}
              className={`flex gap-3 border-b border-border/70 py-3 text-sm last:border-0 ${
                f.kind === "human" ? "bg-[#f3faf6]/ -mx-1 rounded px-1" : ""
              }`}
            >
              <div className="w-12 shrink-0 font-mono text-xs text-navy/50">
                {f.time}
              </div>
              <div className="min-w-0 flex-1">
                <strong>{f.actor}</strong> — {f.text}
                <div className="mt-1">
                  <Link href="/hoy" className="text-xs text-navy/55 underline">
                    ver en Hoy
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-4 text-sm">
        <Link href="/hoy" className="underline">
          ← Volver a Hoy
        </Link>
        {" · "}
        <Link href="/direccion" className="underline">
          Dashboard Dirección
        </Link>
      </p>
    </>
  );
}
