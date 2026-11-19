import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const loginWithError = (reason: string) => {
    const url = new URL("/login", origin);
    url.searchParams.set("error", reason);
    return NextResponse.redirect(url);
  };

  if (searchParams.get("error")) return loginWithError("provider");
  if (!code) return loginWithError("missing_code");

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return loginWithError("exchange");

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (process.env.NODE_ENV !== "development" && forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`);
  }
  return NextResponse.redirect(`${origin}${next}`);
}
