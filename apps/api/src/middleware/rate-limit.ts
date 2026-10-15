import { Request, Response, NextFunction } from 'express';

export function rateLimit(_windowMs: number = 60 * 1000, _maxRequests: number = 100) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    // Rate limit implementation placeholder
    next();
  };
}
