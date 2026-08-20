import { NextRequest, NextResponse } from "next/server";

import { isLegacyAdminAuthPath, isMalformedServerAction, requiresSession } from "@/proxy.helpers";

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const;

// One line per process so the filter is visibly live in run.log after a deploy,
// without recreating the log flood it exists to stop.
let loggedFirstBlock = false;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Reject forged Server Action ids before Next starts rendering. Without this
  // the framework rejects them only mid-render, after it has already kicked off
  // a background revalidation that then fails — the source of the server-side
  // memory growth. See proxy.helpers.ts for why length 42 is the whole test.
  if (isMalformedServerAction(request.headers.get("next-action"))) {
    if (!loggedFirstBlock) {
      loggedFirstBlock = true;
      console.warn("[proxy] blocking malformed Next-Action requests (further ones are silent)");
    }
    return new NextResponse(null, { status: 400 });
  }

  // Legacy admin auth route is removed — send it to the unified login.
  if (isLegacyAdminAuthPath(pathname)) {
    return NextResponse.redirect(new URL("/accedi", request.url));
  }

  // Everything outside the account-gated areas is public. This guard is what
  // keeps the widened matcher safe: without it the storefront would redirect
  // every anonymous visitor to the login page.
  if (!requiresSession(pathname)) {
    return NextResponse.next();
  }

  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));

  if (!hasSessionCookie) {
    const loginUrl = new URL("/accedi", request.url);

    // Checkout requires an account — guests are sent to login by default
    // (the /accedi page links to registration). Return to the cart afterwards.
    loginUrl.searchParams.set(
      "redirect",
      pathname.startsWith("/checkout") ? "/carrello" : pathname,
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Widened from the three protected prefixes to everything, because the
  // malformed-action filter above has to see the attack traffic — it targets
  // public pages (/, /catalogo, /chi-siamo, …). Static assets stay excluded so
  // the proxy is not invoked for files it would only wave through.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)",
  ],
};
