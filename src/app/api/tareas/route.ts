import { NextResponse } from "next/server";
import { listTareas } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const tareas = await listTareas();
  return NextResponse.json({ tareas });
}
