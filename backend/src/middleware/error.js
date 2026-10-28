import { ZodError } from 'zod';
import { HttpError } from '../utils/http-error.js';

export function notFound(_req, _res, next) {
  next(new HttpError(404, 'Route not found'));
}

export function errorHandler(error, _req, res, _next) {
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be valid JSON' });
  }

  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({ message: error.issues.map((issue) => issue.message).join('; ') });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }

  if (error?.code === 'P2002') {
    return res.status(409).json({ message: 'A record with those details already exists' });
  }

  console.error('StockFlow request failed:', error?.name ?? 'UnknownError');
  return res.status(500).json({ message: 'An unexpected server error occurred' });
}
