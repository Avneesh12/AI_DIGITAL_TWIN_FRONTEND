/**
 * src/middleware.ts
 * ──────────────────
 * Edge middleware for route protection.
 * Reads the access token from session (client-readable) to gate /dashboard routes.
 * NOTE: Since JWTs are in sessionStorage (not cookies), full protection requires
 * the client-side AuthProvider. This middleware handles hard redirects only.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password"];
const AUTH_PATHS   = ["/login", "/register"];
const DASHBOARD_PREFIX = "/dashboard";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth hint from cookie (set by client after login for middleware use)
  const isLoggedIn = request.cookies.has("adt_auth_hint");

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard/chat", request.url));
  }

  // Redirect unauthenticated users away from dashboard
  if (!isLoggedIn && pathname.startsWith(DASHBOARD_PREFIX)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
