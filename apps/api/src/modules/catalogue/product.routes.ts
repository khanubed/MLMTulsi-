import { Router, Request, Response } from 'express';

export const productRouter = Router();

// GET /api/v1/products - List published products
productRouter.get('/', async (_req: Request, res: Response) => {
  res.status(200).json({
    data: [],
    error: null,
    meta: {
      requestId: _req.headers['x-request-id'],
    },
  });
});

// GET /api/v1/products/:slug - Product details
productRouter.get('/:slug', async (req: Request, res: Response) => {
  res.status(200).json({
    data: null,
    error: null,
    meta: {
      requestId: req.headers['x-request-id'],
    },
  });
});
