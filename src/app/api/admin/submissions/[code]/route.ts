import { NextResponse } from 'next/server';
import { ValidationError } from '@/domain/validate';
import { reviewSubmission } from '@/server/adminSubmissions';

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: { code: string } }) {
  try {
    const view = await reviewSubmission(params.code, await req.json().catch(() => null));
    return view ? NextResponse.json(view) : NextResponse.json({ error: 'Pengajuan tidak ditemukan' }, { status: 404 });
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json({ error: e.message, field: e.field }, { status: 400 });
    throw e;
  }
}
