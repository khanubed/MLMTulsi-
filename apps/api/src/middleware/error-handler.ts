import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || 'unknown';

  if (err instanceof ZodError) {
    res.status(400).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        fields: err.flatten().fieldErrors,
      },
      meta: {
        requestId,
      },
    });
    return;
  }

  logger.error('Unhandled API error', err, { requestId, path: req.path, method: req.method });

  const statusCode = (err as { status?: number; statusCode?: number }).statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected error occurred. Please try again later.'
    : (err instanceof Error ? err.message : 'Internal Server Error');

  res.status(statusCode).json({
    data: null,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
    meta: {
      requestId,
    },
  });
}
