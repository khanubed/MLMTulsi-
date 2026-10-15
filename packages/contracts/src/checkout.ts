import { z } from 'zod';

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'),
  addressLine1: z.string().min(5, 'Street address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit Indian PIN code'),
  country: z.string().default('India'),
});
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export const CheckoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});
export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;

export const CheckoutRequestSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1, 'Cart cannot be empty'),
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'),
  customerEmail: z.string().email('Please enter a valid email address').optional(),
  shippingAddress: ShippingAddressSchema,
  idempotencyKey: z.string().optional(),
});
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export const CheckoutResponseSchema = z.object({
  orderNumber: z.string(),
  merchantOrderReference: z.string(),
  amountPaise: z.number().int().nonnegative(),
  currency: z.literal('INR'),
  checkoutUrl: z.string().url().nullable().optional(),
  status: z.string(),
});
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;
