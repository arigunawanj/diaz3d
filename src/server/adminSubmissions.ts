import type { Submission } from '@prisma/client';
import type { Design } from '@/domain/design';
import type { PriceBreakdown } from '@/domain/pricing';
import { approvalLines, parseFinalLines, totalOf, type FinalLine } from '@/domain/revision';
import { ValidationError } from '@/domain/validate';
import { buildWaMessage, waLink } from '@/domain/whatsapp';
import { db } from './db';

export type Status = 'MENUNGGU' | 'DISETUJUI' | 'DIREVISI';
export const STATUSES: Status[] = ['MENUNGGU', 'DISETUJUI', 'DIREVISI'];

export interface SubmissionView extends Omit<Submission, 'designJson' | 'linesJson' | 'finalLinesJson' | 'status'> {
  status: Status;
  design: Design;
  breakdown: PriceBreakdown;
  finalLines: FinalLine[] | null;
}

export const toView = (s: Submission): SubmissionView => {
  const { designJson, linesJson, finalLinesJson, ...rest } = s;
  return {
    ...rest,
    status: s.status as Status,
    design: JSON.parse(designJson),
    breakdown: JSON.parse(linesJson),
    finalLines: finalLinesJson ? JSON.parse(finalLinesJson) : null,
  };
};

export const viewUrl = (s: Pick<Submission, 'code' | 'token'>) =>
  `${(process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')}/d/${s.code}?t=${s.token}`;

export async function reviewSubmission(code: string, body: unknown): Promise<SubmissionView | null> {
  const sub = await db.submission.findUnique({ where: { code } });
  if (!sub) return null;
  const b = (body ?? {}) as Record<string, unknown>;
  if (b.action === 'approve') {
    const lines = approvalLines(JSON.parse(sub.linesJson));
    return toView(await db.submission.update({
      where: { code },
      data: { status: 'DISETUJUI', finalLinesJson: JSON.stringify(lines), finalPrice: sub.estimate, adminNote: typeof b.adminNote === 'string' ? b.adminNote.trim().slice(0, 500) : '' },
    }));
  }
  if (b.action === 'revise') {
    const note = typeof b.adminNote === 'string' ? b.adminNote.trim() : '';
    if (!note || note.length > 500) throw new ValidationError('Catatan revisi wajib diisi (maks. 500 karakter)', 'adminNote');
    const lines = parseFinalLines(b.lines);
    return toView(await db.submission.update({
      where: { code },
      data: { status: 'DIREVISI', finalLinesJson: JSON.stringify(lines), finalPrice: totalOf(lines), adminNote: note },
    }));
  }
  throw new ValidationError('Aksi tidak dikenal', 'action');
}

export async function whatsappLink(code: string): Promise<string | null> {
  const sub = await db.submission.findUnique({ where: { code } });
  if (!sub || sub.status === 'MENUNGGU' || sub.finalPrice === null || !sub.finalLinesJson) return null;
  await db.submission.update({ where: { code }, data: { waSentAt: new Date() } });
  return waLink(sub.wa, buildWaMessage({
    code: sub.code, name: sub.name, status: sub.status as 'DISETUJUI' | 'DIREVISI',
    lines: JSON.parse(sub.finalLinesJson), finalPrice: sub.finalPrice, adminNote: sub.adminNote, viewUrl: viewUrl(sub),
  }));
}
