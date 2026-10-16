import { NextResponse } from 'next/server';
import { ValidationError } from '@/domain/validate';
import { createSubmission } from '@/server/submissions';
import { createRateLimiter } from '@/server/rateLimit';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 4.5 * 1024 * 1024;
const allow = createRateLimiter(5, 10 * 60 * 1000);

export async function POST(req: Request) {
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Data terlalu besar' }, { status: 413 });
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
  if (!allow(ip)) return NextResponse.json({ error: 'Terlalu banyak pengajuan. Coba lagi beberapa menit lagi.' }, { status: 429 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Data pengajuan tidak valid', field: 'body' }, { status: 400 });
  }
  try {
    return NextResponse.json(await createSubmission(body), { status: 201 });
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json({ error: e.message, field: e.field }, { status: 400 });
    console.error('createSubmission failed', e);
    return NextResponse.json({ error: 'Gagal menyimpan pengajuan. Coba lagi.' }, { status: 500 });
  }
}
