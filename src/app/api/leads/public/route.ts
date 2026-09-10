import { NextResponse } from "next/server";
import {
  bogotaNow,
  createLead,
  pushActividad,
  PROGRAMAS_META_CANONICOS,
} from "@/lib/db";
import { isOrigen, labelOrigen, type Origen } from "@/lib/origen";

export const dynamic = "force-dynamic";

const PROGRAMAS = new Set<string>(PROGRAMAS_META_CANONICOS);
const ROLES = new Set(["docente", "directivo", "otro"]);

/** Simple in-memory rate limit (per instance) · ~8 submits / 10 min / IP */
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const prev = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (prev.length >= MAX_HITS) {
    hits.set(ip, prev);
    return true;
  }
  prev.push(now);
  hits.set(ip, prev);
  return false;
}

function bogotaDate(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Bogota",
  });
}

function normalizeTelefono(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  return t.slice(0, 40);
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiados envíos. Intenta en unos minutos." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields
  if (typeof body.empresa_web === "string" && body.empresa_web.trim()) {
    return NextResponse.json({ ok: true, leadId: "ok" });
  }

  const nombre = String(body.nombre || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const telefonoWa = normalizeTelefono(body.telefono);
  const programaInteres = String(body.programa || "").trim();
  const rol = String(body.rol || "").trim().toLowerCase();
  const ciudad = String(body.ciudad || "").trim();
  const consentimiento = Boolean(body.consentimiento);

  if (!nombre || nombre.length < 2) {
    return NextResponse.json({ error: "Indica tu nombre" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Correo no válido" }, { status: 400 });
  }
  if (!PROGRAMAS.has(programaInteres)) {
    return NextResponse.json(
      { error: "Selecciona un programa de interés" },
      { status: 400 }
    );
  }
  if (!ROLES.has(rol)) {
    return NextResponse.json({ error: "Selecciona tu rol" }, { status: 400 });
  }
  if (!ciudad || ciudad.length < 2) {
    return NextResponse.json({ error: "Indica tu ciudad" }, { status: 400 });
  }
  if (!consentimiento) {
    return NextResponse.json(
      { error: "Necesitamos tu consentimiento para contactarte" },
      { status: 400 }
    );
  }

  let origen: Origen = "pauta_meta";
  const canalRaw = String(body.canal || body.origen || "")
    .trim()
    .toLowerCase();
  if (canalRaw === "linkedin" || canalRaw === "pauta_linkedin") {
    origen = "pauta_linkedin";
  } else if (
    isOrigen(canalRaw) &&
    (canalRaw === "pauta_meta" ||
      canalRaw === "pauta_linkedin" ||
      canalRaw === "web")
  ) {
    origen = canalRaw;
  }

  const utmCampaign =
    typeof body.utm_campaign === "string"
      ? body.utm_campaign.trim().slice(0, 80)
      : "";
  const utmSource =
    typeof body.utm_source === "string"
      ? body.utm_source.trim().slice(0, 80)
      : "";
  const utmMedium =
    typeof body.utm_medium === "string"
      ? body.utm_medium.trim().slice(0, 80)
      : "";

  const cargoLabel =
    rol === "docente" ? "Docente" : rol === "directivo" ? "Directivo" : "Otro";

  const tags = ["pauta", `rol:${rol}`, `ciudad:${ciudad}`, origen];
  if (utmCampaign) tags.push(`utm_campaign:${utmCampaign}`);
  if (utmSource) tags.push(`utm_source:${utmSource}`);
  if (utmMedium) tags.push(`utm_medium:${utmMedium}`);

  const lead = await createLead({
    nombre,
    email,
    telefonoWa,
    cargo: cargoLabel,
    programaInteres,
    colegioId: "c-pauta",
    etapaFunnel: "primer_acercamiento",
    owner: "Laura Natalia",
    nextTouch: "Primer contacto · Natalia",
    origen,
    canalOrigen: "web",
    audiencia: "estudiante",
    nextStep: "enviar_brochure",
    nextStepFecha: bogotaDate(),
    tags,
    opened: false,
    visitado: false,
  });

  const { time, iso } = bogotaNow();
  await pushActividad({
    time,
    actor: "Landing pauta",
    text: `Nuevo lead ${labelOrigen(origen)}: ${nombre} · ${programaInteres} · ${ciudad} → cola Natalia (primer_acercamiento)`,
    kind: "agente",
    createdAt: iso,
  });

  return NextResponse.json({
    ok: true,
    leadId: lead.id,
    origen: lead.origen,
  });
}
