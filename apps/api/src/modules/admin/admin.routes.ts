import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(authorize(['ADMIN']));

// GET /api/v1/admin/products
adminRouter.get('/products', async (_req: Request, res: Response) => {
  res.status(200).json({ data: [], error: null });
});

// GET /api/v1/admin/orders
adminRouter.get('/orders', async (_req: Request, res: Response) => {
  res.status(200).json({ data: [], error: null });
});
