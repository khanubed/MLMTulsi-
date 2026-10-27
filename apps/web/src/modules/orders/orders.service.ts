import { BadRequestError } from '../../lib/errors';
import { logger } from '../../lib/logger';

export interface CreateOrderInput {
  productId: string;
  quantity: number;
  referralCode?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export class OrdersService {
  static async createOrder(userId: string, input: CreateOrderInput) {
    if (!input.quantity || input.quantity < 1) {
      throw new BadRequestError('Quantity must be at least 1');
    }

    const orderId = `ord_${Date.now()}`;
    const totalPaise = input.quantity * 50000; // ₹500 in paise

    logger.info('Order draft created', {
      userId,
      meta: { orderId, totalPaise, referralCode: input.referralCode },
    });

    return {
      id: orderId,
      orderNumber: `TS-${Date.now().toString().slice(-6)}`,
      totalPaise,
      currency: 'INR',
      status: 'PENDING_PAYMENT',
      paymentStatus: 'INITIATED',
    };
  }
}
