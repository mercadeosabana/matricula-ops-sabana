import { NextResponse } from "next/server";
import { getSessionRol } from "@/lib/auth";
import { getAgent, type AgentId } from "@/lib/agents";
import { demoRespond, llmRespond, type ChatMessage } from "@/lib/agent-chat";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rol = await getSessionRol();
  if (!rol) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const agentId = body.agentId as string;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const history = Array.isArray(body.history)
    ? (body.history as ChatMessage[]).filter(
        (h) =>
          h &&
          (h.role === "user" || h.role === "assistant") &&
          typeof h.content === "string"
      )
    : [];

  if (!agentId || !getAgent(agentId)) {
    return NextResponse.json({ error: "Agente inválido" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  const llm = await llmRespond(agentId as AgentId, message, history);
  if (llm) {
    return NextResponse.json({
      reply: llm.reply,
      demo: false,
      provider: llm.provider,
      agentId,
    });
  }

  const reply = demoRespond(agentId as AgentId, message, history);
  return NextResponse.json({
    reply,
    demo: true,
    provider: "local",
    agentId,
  });
}
