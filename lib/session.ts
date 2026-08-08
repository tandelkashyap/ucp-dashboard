export const SESSION_COOKIE = "ucp_token";

/**
 * httpOnly so the token is never reachable from client-side JS — mitigates
 * token theft via XSS. This means login/register/logout have to happen
 * through Server Actions or Route Handlers, never a client-side fetch
 * directly against the Laravel API. See lib/actions/auth.ts.
 */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  // Sanctum tokens don't expire by default on the Laravel side yet, so this
  // is this cookie's own lifetime, not evidence the underlying token is
  // still valid — a revoked-but-not-expired cookie will just fail on the
  // next API call and get treated as logged-out by apiFetch below.
  maxAge: 60 * 60 * 24 * 7,
};
