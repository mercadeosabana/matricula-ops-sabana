"use client";

import { CAPACIDAD_PROGRAMAS } from "@/lib/admissions-data";

export function CapacidadClient() {
  return (
    <>
      <div className="mb-4">
        <h1 className="m-0 text-2xl font-bold">Capacidad · cupos</h1>
        <p className="mt-1 text-sm text-navy/65">
          Asientos por programa y sede/región · Chía + Neiva (EJEMPLO)
        </p>
      </div>

      <div className="mb-4 rounded-[10px] border border-border bg-[#eef2f8] px-4 py-3 text-sm">
        <strong>Regla regional:</strong> si inscritos en Neiva &lt; mínimo de
        cohorte, mostramos «Faltan N para abrir cohorte regional».
      </div>

      <div className="overflow-x-auto rounded-[10px] border border-border bg-cream-card">
        <table className="w-full min-w-[700px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-navy/50">
              <th className="px-3 py-2">Programa</th>
              <th className="px-3 py-2">Chía cupos</th>
              <th className="px-3 py-2">Chía ocupados</th>
              <th className="px-3 py-2">Neiva cupos</th>
              <th className="px-3 py-2">Neiva ocupados</th>
              <th className="px-3 py-2">Cohorte regional</th>
            </tr>
          </thead>
          <tbody>
            {CAPACIDAD_PROGRAMAS.map((p) => {
              const faltan = Math.max(0, p.minimoRegional - p.neivaOcupados);
              const chiaLibre = p.chiaCupos - p.chiaOcupados;
              return (
                <tr key={p.programa} className="border-b border-border/70">
                  <td className="px-3 py-3 font-semibold">{p.programa}</td>
                  <td className="px-3 py-3">{p.chiaCupos}</td>
                  <td className="px-3 py-3">
                    {p.chiaOcupados}{" "}
                    <span className="text-xs text-navy/50">
                      ({chiaLibre} libres)
                    </span>
                  </td>
                  <td className="px-3 py-3">{p.neivaCupos}</td>
                  <td className="px-3 py-3">{p.neivaOcupados}</td>
                  <td className="px-3 py-3">
                    {faltan > 0 ? (
                      <span className="rounded-full border border-warn/30 bg-[#f5e6c8] px-2.5 py-1 text-xs font-semibold text-warn">
                        Faltan {faltan} para abrir cohorte regional
                      </span>
                    ) : (
                      <span className="rounded-full border border-ok/30 bg-[#e8f5ee] px-2.5 py-1 text-xs font-semibold text-ok">
                        Mínimo regional alcanzado
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-sm font-semibold">Sede Chía (campus)</h2>
          <p className="mt-2 text-sm text-navy/70">
            Visitas sábados 9:00–11:00 · cohorte presencial principal.
            Capacidad total EJEMPLO:{" "}
            {CAPACIDAD_PROGRAMAS.reduce((s, p) => s + p.chiaCupos, 0)} cupos ·
            ocupados{" "}
            {CAPACIDAD_PROGRAMAS.reduce((s, p) => s + p.chiaOcupados, 0)}.
          </p>
        </div>
        <div className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-sm font-semibold">Región Neiva / Huila</h2>
          <p className="mt-2 text-sm text-navy/70">
            Cohorte regional vía Agente Región + convenios. Mínimos por programa
            para abrir; si no se llega, se difiere o se concentra en Chía.
          </p>
        </div>
      </div>
    </>
  );
}
