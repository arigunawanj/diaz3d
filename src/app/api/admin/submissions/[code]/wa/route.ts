import { NextResponse } from 'next/server';
import { whatsappLink } from '@/server/adminSubmissions';

export const runtime = 'nodejs';

export async function POST(_req: Request, { params }: { params: { code: string } }) {
  const url = await whatsappLink(params.code);
  return url ? NextResponse.json({ url }) : NextResponse.json({ error: 'Setujui atau revisi harga dulu' }, { status: 409 });
}
