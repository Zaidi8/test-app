import {NextRequest, NextResponse} from 'next/server';
import {jwtVerify} from 'jose';

// Next.js 16 renamed `middleware.ts` to `proxy.ts`.

// Must match the API's JWT_ACCESS_SECRET. Only available server-side (not
// NEXT_PUBLIC_), so it never reaches the browser.
const accessSecret = process.env.JWT_ACCESS_SECRET;

async function hasValidAccessToken(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('accessToken')?.value;
  if (!token || !accessSecret) return false;
  try {
    const {payload} = await jwtVerify(
      token,
      new TextEncoder().encode(accessSecret),
    );
    return payload.type === 'access';
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const isAuthPage = pathname.startsWith('/auth');
  const authed = await hasValidAccessToken(request);

  if (!isAuthPage && !authed) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if ((pathname === '/' || pathname === '/dashboard' || isAuthPage) && authed) {
    return NextResponse.redirect(new URL('/dashboard/projects', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard', '/dashboard/:path*', '/auth/:path*'],
};
