import type { CookieOptions, Request, Response } from 'express';
import type { OpenedSession } from '../../application/opened-session.js';

export const SESSION_COOKIE = 'footix_session';

const baseOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  path: '/',
});

// ponytail: lecture manuelle du header plutôt que cookie-parser, on ne lit qu'un cookie.
export function readSessionCookie(req: Request): string | undefined {
  const entry = req.headers.cookie?.split('; ').find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return entry?.slice(SESSION_COOKIE.length + 1);
}

// Sans « Rester connecté », cookie de session : effacé à la fermeture du navigateur.
export function writeSessionCookie(res: Response, session: OpenedSession) {
  res.cookie(SESSION_COOKIE, session.token, {
    ...baseOptions(),
    ...(session.remember && { expires: session.expiresAt }),
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, baseOptions());
}
