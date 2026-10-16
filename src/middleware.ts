import { NextResponse, type NextRequest } from 'next/server';
import { verifySession } from '@/domain/session';
import { ADMIN_COOKIE, sessionSecret } from '@/server/adminSession';

const PUBLIC = new Set(['/admin/login', '/api/admin/login']);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.has(pathname)) return NextResponse.next();
  const ok = await verifySession(sessionSecret(), req.cookies.get(ADMIN_COOKIE)?.value, Date.now());
  if (ok) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
