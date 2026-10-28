import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../utils/http-error.js';

export const AUTH_COOKIE = 'stockflow_session';

export async function requireAuth(req, _res, next) {
  try {
    const token = req.cookies[AUTH_COOKIE];
    if (!token) throw new HttpError(401, 'Authentication required');

    const claims = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'stockflow-api',
      audience: 'stockflow-web',
    });
    if (typeof claims === 'string' || typeof claims.sub !== 'string') {
      throw new HttpError(401, 'Invalid session');
    }

    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: {
        id: true,
        email: true,
        organizationId: true,
        organization: { select: { name: true } },
      },
    });
    if (!user) throw new HttpError(401, 'Invalid session');

    req.auth = {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
    };
    return next();
  } catch (error) {
    if (error instanceof HttpError) return next(error);
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return next(new HttpError(401, 'Session expired or invalid'));
    }
    return next(error);
  }
}
