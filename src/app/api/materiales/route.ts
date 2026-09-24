import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { getSessionUser } from "@/lib/auth";
import {
  PROGRAMAS_META_CANONICOS,
  brochureSlugForPrograma,
  deleteBrochureMeta,
  getMateriales,
  upsertBrochureMeta,
  type BrochureMeta,
} from "@/lib/db";

export const dynamic = "force-dynamic";

const PROGRAMAS = new Set<string>(PROGRAMAS_META_CANONICOS);
const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

function unauthorized() {
  return NextResponse.json({ error: "No autenticado" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json(
    { error: "Solo Mercadeo o Dirección pueden gestionar materiales." },
    { status: 403 }
  );
}

async function requireOpsSession() {
  const session = await getSessionUser();
  if (!session) return { error: unauthorized() as NextResponse };
  if (session.rol !== "mercadeo" && session.rol !== "direccion") {
    return { error: forbidden() as NextResponse };
  }
  return { session };
}

/** Shareable app URL (Blob store is private — proxy serves the PDF). */
function publicBrochureUrl(req: Request, slug: string): string {
  const envBase = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (envBase) return `${envBase}/api/materiales/brochure/${slug}`;
  const origin = new URL(req.url).origin;
  return `${origin}/api/materiales/brochure/${slug}`;
}

export async function GET() {
  const auth = await requireOpsSession();
  if ("error" in auth && auth.error) return auth.error;

  const materiales = await getMateriales();
  const programas = PROGRAMAS_META_CANONICOS.map((programa) => {
    const brochure = materiales.brochures[programa] || null;
    return { programa, brochure };
  });

  return NextResponse.json({
    ok: true,
    programas,
    brochures: materiales.brochures,
  });
}

export async function POST(req: Request) {
  const auth = await requireOpsSession();
  if ("error" in auth && auth.error) return auth.error;
  const session = auth.session!;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Formulario inválido (multipart requerido)" },
      { status: 400 }
    );
  }

  const programa = String(form.get("programa") || "").trim();
  if (!PROGRAMAS.has(programa)) {
    return NextResponse.json(
      {
        error:
          "Programa no válido. Usa uno de los cuatro canónicos (Educación, Pedagogía, Dir. y Gestión, Des. Infantil).",
      },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Adjunta un archivo PDF (campo file)." },
      { status: 400 }
    );
  }

  const fileName = file.name || "brochure.pdf";
  const type = (file.type || "").toLowerCase();
  const looksPdf =
    type === "application/pdf" ||
    type === "application/x-pdf" ||
    fileName.toLowerCase().endsWith(".pdf");
  if (!looksPdf) {
    return NextResponse.json(
      { error: "Solo se aceptan PDF." },
      { status: 400 }
    );
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "El archivo está vacío." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "El PDF supera el límite de 12 MB." },
      { status: 400 }
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.VERCEL) {
    return NextResponse.json(
      {
        error:
          "Blob no configurado (BLOB_READ_WRITE_TOKEN). Configura Storage → Blob en Vercel.",
      },
      { status: 503 }
    );
  }

  const slug = brochureSlugForPrograma(programa);
  const pathname = `materiales/brochure-${slug}.pdf`;
  const bytes = Buffer.from(await file.arrayBuffer());

  // Store is private — cannot put access:'public'. File is served via
  // /api/materiales/brochure/[slug] (marketing asset, shareable link).
  try {
    await put(pathname, bytes, {
      access: "private",
      contentType: "application/pdf",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[materiales] blob put failed:", msg);
    return NextResponse.json(
      { error: `No se pudo subir el PDF: ${msg}` },
      { status: 502 }
    );
  }

  const url = publicBrochureUrl(req, slug);
  const meta: BrochureMeta = {
    url,
    pathname,
    fileName,
    uploadedAt: new Date().toISOString(),
    uploadedBy: session.displayName || session.nombre,
  };

  const materiales = await upsertBrochureMeta(programa, meta);
  const programas = PROGRAMAS_META_CANONICOS.map((p) => ({
    programa: p,
    brochure: materiales.brochures[p] || null,
  }));

  return NextResponse.json({
    ok: true,
    programa,
    brochure: meta,
    brochures: materiales.brochures,
    programas,
  });
}

export async function DELETE(req: Request) {
  const auth = await requireOpsSession();
  if ("error" in auth && auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const programa = String(searchParams.get("programa") || "").trim();
  if (!PROGRAMAS.has(programa)) {
    return NextResponse.json(
      { error: "Indica ?programa= con un programa canónico." },
      { status: 400 }
    );
  }

  const { deleted, materiales } = await deleteBrochureMeta(programa);

  if (deleted?.pathname || deleted?.url) {
    try {
      await del(deleted.pathname || deleted.url);
    } catch (err) {
      console.warn(
        "[materiales] blob del failed:",
        err instanceof Error ? err.message : err
      );
    }
  }

  return NextResponse.json({
    ok: true,
    programa,
    deleted: Boolean(deleted),
    brochures: materiales.brochures,
  });
}
