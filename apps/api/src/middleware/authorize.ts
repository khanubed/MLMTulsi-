import { Request, Response, NextFunction } from 'express';

export function authorize(roles: string[] = ['ADMIN']) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    // Role check logic placeholder
    next();
  };
}
