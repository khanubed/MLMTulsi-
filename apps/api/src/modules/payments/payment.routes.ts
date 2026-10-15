import { Router, Request, Response, NextFunction } from 'express';

export const paymentRouter = Router();

// POST /api/v1/payments/phonepe/callback - Authenticated PhonePe webhook
paymentRouter.post('/phonepe/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Signature verification and idempotent event logging to be implemented
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/payments/phonepe/return - Browser return landing page
paymentRouter.get('/phonepe/return', async (req: Request, res: Response) => {
  res.status(200).json({
    data: { message: 'Payment response received. Awaiting server-side verification.' },
    error: null,
    meta: { requestId: req.headers['x-request-id'] },
  });
});
