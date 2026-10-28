import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { clearSessionCookie, setSessionCookie } from '../middleware/cookie.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../utils/http-error.js';
import { loginSchema, signupSchema } from '../validators/auth.js';

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Try again later.' },
});

function createToken(userId) {
  return jwt.sign({}, env.JWT_SECRET, {
    algorithm: 'HS256',
    subject: userId,
    issuer: 'stockflow-api',
    audience: 'stockflow-web',
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function publicUser(user) {
  return { id: user.id, email: user.email, organizationName: user.organization.name };
}

router.post('/signup', loginLimiter, validate(signupSchema), asyncHandler(async (req, res) => {
  const { email, password, organizationName } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: organizationName },
      select: { id: true },
    });
    await tx.organizationSettings.create({ data: { organizationId: organization.id } });
    return tx.user.create({
      data: { email, passwordHash, organizationId: organization.id },
      include: { organization: { select: { name: true } } },
    });
  });

  setSessionCookie(res, createToken(user.id));
  return res.status(201).json({ user: publicUser(user) });
}));

router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
    include: { organization: { select: { name: true } } },
  });
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    throw new HttpError(401, 'Email or password is incorrect');
  }

  setSessionCookie(res, createToken(user.id));
  return res.json({ user: publicUser(user) });
}));

router.get('/me', requireAuth, (req, res) => {
  return res.json({
    user: {
      id: req.auth.userId,
      email: req.auth.email,
      organizationName: req.auth.organizationName,
    },
  });
});

router.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  return res.status(204).end();
});

export default router;
