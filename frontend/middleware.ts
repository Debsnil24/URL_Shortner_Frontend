import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const RESERVED_SEGMENTS = new Set([
  "",
  "api",
  "dashboard",
  "privacy-policy",
  "terms-of-service",
  "support",
  "login",
  "signup",
  "_next",
  "static",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
]);

const redirectOrigin =
  process.env.NEXT_PUBLIC_SHORT_DOMAIN ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

const isDevelopment = process.env.NODE_ENV === "development";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname || pathname === "/") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  if (
    !isDevelopment &&
    segments.length === 1 &&
    !segments[0].includes(".") &&
    !RESERVED_SEGMENTS.has(segments[0].toLowerCase())
  ) {
    const target = new URL(`/${segments[0]}`, redirectOrigin);
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};

