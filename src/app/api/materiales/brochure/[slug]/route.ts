import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import {
  PROGRAMAS_META_CANONICOS,
  brochureSlugForPrograma,
  getMateriales,
} from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Public shareable brochure PDF (marketing asset).
 * Blob store is private; this route streams with the server token.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await ctx.params;
  const slug = String(rawSlug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  if (!slug) {
    return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
  }

  const materiales = await getMateriales();
  let pathname: string | null = null;
  let fileName = `brochure-${slug}.pdf`;

  for (const programa of PROGRAMAS_META_CANONICOS) {
    const meta = materiales.brochures[programa];
    if (!meta) continue;
    if (
      brochureSlugForPrograma(programa) === slug ||
      meta.pathname.endsWith(`brochure-${slug}.pdf`)
    ) {
      pathname = meta.pathname;
      fileName = meta.fileName || fileName;
      break;
    }
  }

  if (!pathname) {
    // Fallback: try canonical pathname even if store entry missing
    pathname = `materiales/brochure-${slug}.pdf`;
  }

  try {
    const result = await get(pathname, {
      access: "private",
      useCache: false,
    });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json(
        { error: "Brochure no encontrado" },
        { status: 404 }
      );
    }
    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName.replace(/"/g, "")}"`,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/not found|404|BlobNotFound/i.test(msg)) {
      return NextResponse.json(
        { error: "Brochure no encontrado" },
        { status: 404 }
      );
    }
    console.error("[materiales/brochure] get failed:", msg);
    return NextResponse.json({ error: "Error al leer brochure" }, { status: 502 });
  }
}
