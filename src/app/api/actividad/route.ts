import { NextResponse } from "next/server";
import { listActividad } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kind = (searchParams.get("kind") || "all") as
    | "all"
    | "agente"
    | "human";
  const items = await listActividad(kind);
  return NextResponse.json({ items });
}
