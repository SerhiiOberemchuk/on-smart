import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Legacy admin auth route is removed — send it to the unified login.
  if (pathname === "/admin/auth" || pathname.startsWith("/admin/auth/")) {
    return NextResponse.redirect(new URL("/accedi", request.url));
  }

  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));

  if (!hasSessionCookie) {
    const loginUrl = new URL("/accedi", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
