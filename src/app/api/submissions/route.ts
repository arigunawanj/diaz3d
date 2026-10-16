import { NextResponse } from 'next/server';
import { ValidationError } from '@/domain/validate';
import { createSubmission } from '@/server/submissions';

export const runtime = 'nodejs';

export async function POST(req: Request) {
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
