import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Runs before any dashboard page loads. Without a login cookie, go straight to login.
// This only checks that a cookie exists; the backend still checks that it's valid.
export function proxy(request: NextRequest) {
  if (!request.cookies.has("jwt")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
