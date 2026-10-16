import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { signSession } from '@/domain/session';
import { ADMIN_COOKIE, SESSION_TTL_MS, sessionSecret } from '@/server/adminSession';

export const runtime = 'nodejs';

const digest = (s: string) => createHash('sha256').update(s).digest();

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD ?? '';
  const secret = sessionSecret();
  if (!expected || !secret) return NextResponse.json({ error: 'Admin belum dikonfigurasi (ADMIN_PASSWORD / ADMIN_SESSION_SECRET)' }, { status: 500 });
  const body = await req.json().catch(() => ({}));
  const given = typeof body?.password === 'string' ? body.password : '';
  // Equal-length digests make the comparison constant-time regardless of input length.
  if (!timingSafeEqual(digest(given), digest(expected))) {
    return NextResponse.json({ error: 'Password salah' }, { status: 401 });
  }
  const expires = Date.now() + SESSION_TTL_MS;
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await signSession(secret, expires), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', expires: new Date(expires),
  });
  return res;
}
