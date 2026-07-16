// Disabled for static export + stealth UUID paths.
// Auth is enforced by Worker API (401) and client redirects.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
