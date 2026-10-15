import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { productRouter } from '../modules/catalogue/product.routes.js';
import { checkoutRouter } from '../modules/checkout/checkout.routes.js';
import { orderRouter } from '../modules/orders/order.routes.js';
import { paymentRouter } from '../modules/payments/payment.routes.js';
import { adminRouter } from '../modules/admin/admin.routes.js';
import { authRouter } from '../modules/auth/auth.routes.js';

export const apiRouter = Router();

// Health routes
apiRouter.use('/health', healthRouter);

// Public catalogue routes
apiRouter.use('/api/v1/products', productRouter);

// Checkout and orders
apiRouter.use('/api/v1/checkout', checkoutRouter);
apiRouter.use('/api/v1/orders', orderRouter);

// PhonePe payment callbacks and verification
apiRouter.use('/api/v1/payments', paymentRouter);

// Protected admin routes
apiRouter.use('/api/v1/admin/auth', authRouter);
apiRouter.use('/api/v1/admin', adminRouter);
