import { Router, Request, Response } from 'express';

export const authRouter = Router();

// POST /api/v1/admin/auth/login
authRouter.post('/login', async (_req: Request, res: Response) => {
  res.status(200).json({ data: { message: 'Auth placeholder' }, error: null });
});

// POST /api/v1/admin/auth/logout
authRouter.post('/logout', async (_req: Request, res: Response) => {
  res.status(200).json({ data: { message: 'Logged out' }, error: null });
});
