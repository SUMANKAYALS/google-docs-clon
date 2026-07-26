import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedRoute = pathname.startsWith("/documents") || pathname.startsWith("/profile");

  console.log(`[Auth Middleware] Path: ${pathname} | IsLoggedIn: ${isLoggedIn} | User: ${req.auth?.user?.email || "none"}`);

  // 1. Authenticated users attempting to access login/register -> redirect to /documents
  if (isAuthPage) {
    if (isLoggedIn) {
      console.log(`[Auth Middleware Redirect] Authenticated user redirected from ${pathname} to /documents`);
      return NextResponse.redirect(new URL("/documents", req.url));
    }
    return NextResponse.next();
  }

  // 2. Unauthenticated users attempting to access protected routes -> redirect to /login
  if (isProtectedRoute) {
    if (!isLoggedIn) {
      console.log(`[Auth Middleware Redirect] Unauthenticated request for ${pathname} redirected to /login`);
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/documents/:path*", "/profile/:path*", "/login", "/register"],
};
