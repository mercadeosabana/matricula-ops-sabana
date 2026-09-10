import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { appBaseUrl } from "@/lib/connections";
import { exchangeOutlookCode } from "@/lib/outlook";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const base = appBaseUrl();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const err = searchParams.get("error");
  const errDesc = searchParams.get("error_description");

  if (err) {
    return NextResponse.redirect(
      `${base}/hoy?outlook=error&msg=${encodeURIComponent(errDesc || err)}`
    );
  }

  const jar = await cookies();
  const expected = jar.get("outlook_oauth_state")?.value;

  if (!code || !state || !expected || state !== expected) {
    const res = NextResponse.redirect(`${base}/hoy?outlook=error&msg=state_invalid`);
    res.cookies.set("outlook_oauth_state", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return res;
  }

  try {
    await exchangeOutlookCode(code);
    const res = NextResponse.redirect(`${base}/hoy?outlook=connected`);
    res.cookies.set("outlook_oauth_state", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "callback_failed";
    const res = NextResponse.redirect(
      `${base}/hoy?outlook=error&msg=${encodeURIComponent(msg)}`
    );
    res.cookies.set("outlook_oauth_state", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return res;
  }
}
