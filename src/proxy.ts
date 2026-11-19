import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { refreshSession } from "@/lib/supabase/proxy";

const handleI18nRouting = createMiddleware(routing);

const PROTECTED_PREFIXES = ["/practice", "/interview", "/results", "/progress"];

function splitLocale(pathname: string) {
  const [, first, ...rest] = pathname.split("/");
  if ((routing.locales as readonly string[]).includes(first)) {
    return { locale: first, path: "/" + rest.join("/") };
  }
  return { locale: routing.defaultLocale as string, path: pathname };
}

function isProtected(path: string) {
  return PROTECTED_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
}

export default async function proxy(request: NextRequest) {
  const { locale, path } = splitLocale(request.nextUrl.pathname);

  // Public pages never touch the session on the server, so they stay static and fast.
  if (!isProtected(path)) {
    return handleI18nRouting(request);
  }

  const { userId, pending } = await refreshSession(request);

  let response: NextResponse;
  if (!userId) {
    const loginPath = locale === routing.defaultLocale ? "/login" : `/${locale}/login`;
    const url = new URL(loginPath, request.url);
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    response = NextResponse.redirect(url);
  } else {
    response = handleI18nRouting(request);
  }

  pending.cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  Object.entries(pending.headers).forEach(([key, value]) => response.headers.set(key, value));
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  // Skip API routes, auth route handlers, Next internals and files with an extension.
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
