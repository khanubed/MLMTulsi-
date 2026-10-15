import { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
  const requestId = req.headers['x-request-id'] as string;
  res.status(404).json({
    data: null,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
    meta: {
      requestId,
    },
  });
}
