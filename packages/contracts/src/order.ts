import { z } from 'zod';
import { ShippingAddressSchema } from './checkout.js';

export const OrderStatusSchema = z.enum([
  'PENDING_PAYMENT',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'PAYMENT_REVIEW',
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PaymentStatusSchema = z.enum([
  'INITIATED',
  'PENDING',
  'SUCCESS',
  'FAILED',
  'CANCELLED',
  'REFUND_PENDING',
  'REFUNDED',
  'RECONCILIATION_REQUIRED',
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  productNameSnapshot: z.string(),
  productSlugSnapshot: z.string(),
  skuSnapshot: z.string().nullable().optional(),
  unitPricePaise: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  lineTotalPaise: z.number().int().nonnegative(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.string().nullable().optional(),
  shippingAddress: ShippingAddressSchema,
  currency: z.literal('INR').default('INR'),
  subtotalPaise: z.number().int().nonnegative(),
  shippingPaise: z.number().int().nonnegative().default(0),
  taxPaise: z.number().int().nonnegative().default(0),
  discountPaise: z.number().int().nonnegative().default(0),
  totalPaise: z.number().int().nonnegative(),
  status: OrderStatusSchema,
  paymentStatus: PaymentStatusSchema,
  items: z.array(OrderItemSchema).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Order = z.infer<typeof OrderSchema>;

export const PublicOrderStatusResponseSchema = z.object({
  orderNumber: z.string(),
  status: OrderStatusSchema,
  paymentStatus: PaymentStatusSchema,
  totalPaise: z.number().int().nonnegative(),
  currency: z.literal('INR'),
  createdAt: z.string(),
});
export type PublicOrderStatusResponse = z.infer<typeof PublicOrderStatusResponseSchema>;
