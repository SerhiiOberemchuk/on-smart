// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // void request;
  // void auth;
  // void headers;

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
