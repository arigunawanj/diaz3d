// HMAC-signed admin session token "<expiresAtMs>.<sig>"; Web Crypto so it runs in Edge middleware and Node.
const enc = new TextEncoder();

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const hmacKey = (secret: string, usage: 'sign' | 'verify') =>
  crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [usage]);

const fromB64url = (s: string): Uint8Array<ArrayBuffer> | null => {
  try {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
};

export async function signSession(secret: string, expiresAtMs: number): Promise<string> {
  const payload = String(expiresAtMs);
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret, 'sign'), enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

export async function verifySession(secret: string, token: string | undefined, nowMs: number): Promise<boolean> {
  if (!secret || !token) return false;
  const [payload, sig, extra] = token.split('.');
  if (extra !== undefined || !/^\d{1,16}$/.test(payload ?? '') || !sig) return false;
  const bytes = fromB64url(sig);
  if (!bytes) return false;
  // crypto.subtle.verify compares in constant time.
  const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret, 'verify'), bytes, enc.encode(payload));
  return ok && Number(payload) > nowMs;
}
