import { NextRequest, NextResponse } from "next/server";

// Next.js 16 renamed `middleware.ts` to `proxy.ts`.
export function proxy(request: NextRequest) {
  const authToken = request.cookies.get("authToken")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

  const { pathname } = request.nextUrl;

  if (!isAuthPage && !authToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if ((pathname === "/" || pathname === "/dashboard" || isAuthPage) && authToken) {
    return NextResponse.redirect(new URL("/dashboard/projects", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/dashboard/:path*", "/auth/:path*"],
};
