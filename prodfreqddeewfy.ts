import { auth } from "@/lib/auth";
// import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function effrfefefer(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (request.nextUrl.pathname.startsWith("/admin/auth")) {
    return NextResponse.next();
  }

  if (!session || session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/auth", request.url));
  }

  return NextResponse.next();
}

export const efewfew = {
  matcher: ["/admin/:path*"],
};
