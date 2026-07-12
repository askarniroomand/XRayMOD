import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/login')) {
    if (session) return NextResponse.redirect(new URL('/panel', request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith('/panel')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/panel/:path*', '/login'],
};
