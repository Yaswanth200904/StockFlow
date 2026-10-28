import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z.string().url().refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'mysql:' && url.pathname.length > 1;
    } catch {
      return false;
    }
  }, 'must be a MySQL URL with a database name'),
  JWT_SECRET: z.string().min(32)
    .refine((value) => !value.toLowerCase().includes('replace-with'), 'must be a generated secret, not the example placeholder'),
  JWT_EXPIRES_IN: z.string().regex(/^\d+(s|m|h|d)$/, 'must be a duration such as 30m or 1d').default('1d'),
  FRONTEND_ORIGIN: z.string().url()
    .refine((value) => new URL(value).origin === value, 'must be an origin without a path')
    .default('http://127.0.0.1:5500'),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Invalid backend environment: ${result.error.issues.map((issue) => issue.path.join('.') + ' ' + issue.message).join('; ')}`);
}

export const env = result.data;
