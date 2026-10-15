import { Router, Request, Response, NextFunction } from 'express';

export const orderRouter = Router();

// GET /api/v1/orders/:orderNumber/status - Safe order status lookup
orderRouter.get('/:orderNumber/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      data: {
        orderNumber: req.params.orderNumber,
        status: 'PENDING_PAYMENT',
      },
      error: null,
      meta: {
        requestId: req.headers['x-request-id'],
      },
    });
  } catch (error) {
    next(error);
  }
});
