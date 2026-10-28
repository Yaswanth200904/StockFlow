import { env } from '../config/env.js';
import { AUTH_COOKIE } from './auth.js';

export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api',
};

export function setSessionCookie(res, token) {
  const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
  res.cookie(AUTH_COOKIE, token, {
    ...cookieOptions,
    maxAge: Math.max(0, claims.exp * 1000 - Date.now()),
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
}
