import { auth } from "@/lib/auth";
import { headers } from "next/headers";
// import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (request.nextUrl.pathname.startsWith("/admin/auth")) {
    return NextResponse.next();
  }

  if (!session || session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
