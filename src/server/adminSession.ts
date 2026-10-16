export const ADMIN_COOKIE = 'diaz3d_admin';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const sessionSecret = () => process.env.ADMIN_SESSION_SECRET ?? '';
