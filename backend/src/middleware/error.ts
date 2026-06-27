import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/http';
import { env } from '../env';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid request payload',
      details: err.flatten().fieldErrors,
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.name,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'InternalServerError',
    message:
      env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : (err as Error)?.message ?? 'Unknown error',
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'NotFound', message: 'Route not found' });
}
