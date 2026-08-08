import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

const AUTH_PAGES = ["/login", "/register"];

/**
 * Only checks the cookie's presence, not whether the token it holds is
 * still valid — that would mean a Laravel round-trip on every navigation.
 * A present-but-revoked token still gets caught, just one layer in: the
 * Server Component's apiFetch() call gets a 401 and redirects from there.
 * See app/dashboard/page.tsx.
 */
export function proxy(request: NextRequest) {
  const hasToken = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !hasToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (AUTH_PAGES.includes(pathname) && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
