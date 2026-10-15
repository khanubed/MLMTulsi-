import { Request, Response, NextFunction } from 'express';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // Placeholder: Session or JWT validation
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const requestId = req.headers['x-request-id'] as string;
    res.status(401).json({
      data: null,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
      meta: { requestId },
    });
    return;
  }
  next();
}
