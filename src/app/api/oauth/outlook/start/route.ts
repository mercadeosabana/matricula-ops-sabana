import { NextResponse } from "next/server";
import { getSessionRol } from "@/lib/auth";
import { appBaseUrl, azureEnvConfigured } from "@/lib/connections";
import { buildOutlookAuthUrl } from "@/lib/outlook";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = appBaseUrl();
  const rol = await getSessionRol();
  if (!rol) {
    return NextResponse.redirect(new URL("/", base));
  }
  if (!azureEnvConfigured()) {
    return NextResponse.redirect(`${base}/hoy?outlook=setup`);
  }
  const state = crypto.randomBytes(16).toString("hex");
  const url = buildOutlookAuthUrl(state);
  if (!url) {
    return NextResponse.redirect(`${base}/hoy?outlook=setup`);
  }
  const res = NextResponse.redirect(url);
  res.cookies.set("outlook_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
