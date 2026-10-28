import { z } from 'zod';

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const password = z.string().min(8).max(72).refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'Password must be at most 72 bytes');

export const signupSchema = z.object({
  email,
  password,
  organizationName: z.string().trim().min(1).max(120),
}).strict();

export const loginSchema = z.object({ email, password }).strict();
