"use client";

import { useMemo, useState } from "react";
import { AGENTS, type AgentId } from "@/lib/agents";

type Msg = { role: "user" | "assistant"; content: string; demo?: boolean };

export function AgentesClient() {
  const [agentId, setAgentId] = useState<AgentId>("captacion");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [threads, setThreads] = useState<Record<string, Msg[]>>({});

  const agent = useMemo(
    () => AGENTS.find((a) => a.id === agentId)!,
    [agentId]
  );
  const messages = threads[agentId] || [];

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setInput("");
    const history = [...messages, { role: "user" as const, content: text }];
    setThreads((t) => ({ ...t, [agentId]: history }));
    try {
      const res = await fetch("/api/agentes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          message: text,
          history: history.slice(0, -1),
        }),
      });
      const data = await res.json();
      const reply =
        data.reply ||
        data.error ||
        "No pude responder ahora. Intenta de nuevo.";
      setThreads((t) => ({
        ...t,
        [agentId]: [
          ...(t[agentId] || history),
          { role: "assistant", content: reply, demo: Boolean(data.demo) },
        ],
      }));
    } catch {
      setThreads((t) => ({
        ...t,
        [agentId]: [
          ...(t[agentId] || history),
          {
            role: "assistant",
            content: "Error de red. Revisa la conexión.",
            demo: true,
          },
        ],
      }));
    } finally {
      setBusy(false);
    }
  }

  const suggestions: Record<AgentId, string[]> = {
    captacion: [
      "Redacta un email frío a rectoría Bogotá norte",
      "Borrador WhatsApp follow-up Pedagogía",
      "Guion de llamada 90 segundos",
    ],
    admisiones: [
      "Armar agenda visita 2 h Chía",
      "Recordatorio show-up 24 h antes",
      "Invitación a sábado [CONFIRMAR]",
    ],
    inteligencia: [
      "Prioridades de segmentación esta semana",
      "Explica el embudo EJEMPLO",
      "Mix por programa vs meta",
    ],
    orquestadora: [
      "Ordena la cola de Hoy",
      "Plan secuencia D+3/D+7/D+14",
      "Qué desbloquear antes del early bird",
    ],
    region: [
      "Carta a Secretaría de Educación (convenio)",
      "One-pager cohortes regionales",
      "Agenda reunión 30 min con alcaldía",
    ],
    guardian: [
      "Revisa riesgos de la cola de Hoy",
      "Checklist cumplimiento [CONFIRMAR]",
      "Alerta si hay envío sin aprobación",
    ],
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="m-0 text-2xl font-bold">Agentes</h1>
        <p className="mt-1 text-sm text-navy/65">
          Los agentes proponen craft e insights. Tú apruebas — nada se envía
          solo. Chat en la voz de cada uno.
        </p>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {AGENTS.map((a) => {
          const active = a.id === agentId;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setAgentId(a.id)}
              className={`rounded-[10px] border p-3 text-left transition ${
                active
                  ? "border-navy bg-navy text-white shadow"
                  : "border-border bg-cream-card hover:border-navy/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: active ? "#c4a35a" : a.color }}
                />
                <strong className="text-sm">{a.name}</strong>
              </div>
              <div
                className={`mt-1 text-[11px] ${
                  active ? "text-white/75" : "text-navy/55"
                }`}
              >
                {a.short}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mb-4 rounded-[10px] border border-border bg-[#eef2f8] px-4 py-3 text-sm leading-relaxed">
        <strong>Agente {agent.name}</strong> — {agent.role}. {agent.description}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <section className="flex min-h-[420px] flex-col rounded-[10px] border border-border bg-cream-card">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-navy/55">
                Escribe una petición o usa una sugerencia. El agente responde con
                borradores listos para Hoy (con [CONFIRMAR] donde aplique).
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[92%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "ml-auto bg-navy text-white"
                    : "mr-auto border border-border bg-cream text-navy"
                }`}
              >
                {msg.content}
                {msg.role === "assistant" && msg.demo && (
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-navy/40">
                    (demo local)
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="text-xs text-navy/50">Agente escribiendo…</div>
            )}
          </div>
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                className="min-h-11 flex-1 rounded-lg border border-border bg-white px-3 text-sm"
                placeholder={`Mensaje para Agente ${agent.name}…`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={busy}
              />
              <button
                type="button"
                disabled={busy || !input.trim()}
                onClick={send}
                className="min-h-11 rounded-lg bg-navy px-4 text-sm font-medium text-white disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-[10px] border border-border bg-cream-card p-4">
          <h2 className="m-0 text-sm font-semibold">Sugerencias</h2>
          <ul className="mt-3 space-y-2">
            {suggestions[agentId].map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="w-full rounded-lg border border-border bg-cream px-3 py-2 text-left text-xs leading-snug text-navy/80 hover:border-navy/30"
                  onClick={() => setInput(s)}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] text-navy/50">
            Con OPENAI_API_KEY, XAI_API_KEY o GROQ_API_KEY el chat usa LLM real.
            Sin clave, responde con plantillas demo locales.
          </p>
        </aside>
      </div>
    </>
  );
}
