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

  // The order-completed pages (incl. the SumUp return handler) must stay reachable
  // even without a session — payment redirects can land here logged out.
  if (pathname.startsWith("/checkout/completato")) {
    return NextResponse.next();
  }

  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));

  if (!hasSessionCookie) {
    // Checkout requires an account — guests are sent to login by default
    // (the /accedi page links to registration). Return to the cart afterwards.
    if (pathname.startsWith("/checkout")) {
      const loginUrl = new URL("/accedi", request.url);
      loginUrl.searchParams.set("redirect", "/carrello");
      return NextResponse.redirect(loginUrl);
    }

    const loginUrl = new URL("/accedi", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
};
