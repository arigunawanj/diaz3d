import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Prisma } from '@prisma/client';
import { db } from './db';
import { getPricingContext } from './pricingContext';
import { buildSubmissionRecord, makeCode, makeToken } from './submissionRecord';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_SCREENSHOT_BYTES = 3 * 1024 * 1024;
const PNG_PREFIX = 'data:image/png;base64,';

/** Decodes a PNG data URL; returns null for anything missing, malformed or too large. */
function decodeScreenshot(raw: unknown): Buffer | null {
  if (typeof raw !== 'string' || !raw.startsWith(PNG_PREFIX)) return null;
  const buf = Buffer.from(raw.slice(PNG_PREFIX.length), 'base64');
  const isPng = buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return isPng && buf.length <= MAX_SCREENSHOT_BYTES ? buf : null;
}

const todayJakarta = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

export async function createSubmission(body: unknown): Promise<{ code: string; token: string }> {
  const record = buildSubmissionRecord(body, await getPricingContext(), todayJakarta());
  const token = makeToken();
  const png = decodeScreenshot((body as Record<string, unknown>).screenshot);
  let screenshot: string | null = null;
  if (png) {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, `${token}.png`), png);
    screenshot = `${token}.png`;
  }
  for (let attempt = 0; ; attempt++) {
    const code = makeCode();
    try {
      await db.submission.create({
        data: {
          code, token, screenshot,
          name: record.name, wa: record.wa, eventDate: record.eventDate, location: record.location, notes: record.notes,
          designJson: JSON.stringify(record.design),
          linesJson: JSON.stringify(record.breakdown),
          estimate: record.breakdown.total,
        },
      });
      return { code, token };
    } catch (e) {
      const collision = e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
      if (!collision || attempt >= 5) throw e;
    }
  }
}
