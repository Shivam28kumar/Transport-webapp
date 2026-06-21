import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("auth_session");

  // Define public paths that don't need auth
  const isPublicPath = pathname === "/login" || pathname.startsWith("/api/auth");

  // Define paths that require auth
  const isProtectedPath =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/fleet") ||
    pathname.startsWith("/ledger") ||
    pathname.startsWith("/trips") ||
    (pathname.startsWith("/api") && !pathname.startsWith("/api/auth") && !pathname.startsWith("/api/seed"));

  if (isProtectedPath && !session) {
    // Redirect to login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicPath && session) {
    // Redirect logged-in users away from public/login page
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/seed (database seed script)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     */
    "/((?!api/seed|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
