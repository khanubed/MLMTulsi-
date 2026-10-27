import { z } from 'zod';

export interface IndianMobileParseResult {
  isValid: boolean;
  cleaned?: string;
  e164?: string;
  error?: string;
}

/**
 * Strict Indian Mobile Number Parser and Validator.
 * Rejects non-Indian international numbers (+1, +44, etc.) and non-mobile allocations.
 */
export function parseIndianMobile(input: unknown): IndianMobileParseResult {
  if (typeof input !== 'string') {
    return { isValid: false, error: 'Phone number must be a valid text string' };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required' };
  }

  if (trimmed.startsWith('+') && !trimmed.startsWith('+91')) {
    return {
      isValid: false,
      error: 'Only Indian phone numbers (+91) are accepted. International numbers are not supported.',
    };
  }

  let sanitized = trimmed.replace(/[\s\-\(\)\.]/g, '');
  if (sanitized.startsWith('+')) {
    sanitized = sanitized.slice(1);
  }

  if (!/^\d+$/.test(sanitized)) {
    return {
      isValid: false,
      error: 'Phone number must contain digits only',
    };
  }

  let mobile10: string;
  if (sanitized.length === 12) {
    if (!sanitized.startsWith('91')) {
      return {
        isValid: false,
        error: 'Only Indian mobile numbers (+91) are accepted',
      };
    }
    mobile10 = sanitized.slice(2);
  } else if (sanitized.length === 11) {
    if (!sanitized.startsWith('0')) {
      return {
        isValid: false,
        error: 'Invalid phone number format. Please provide a valid 10-digit Indian mobile number',
      };
    }
    mobile10 = sanitized.slice(1);
  } else if (sanitized.length === 10) {
    mobile10 = sanitized;
  } else {
    return {
      isValid: false,
      error: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 98765 43210)',
    };
  }

  if (!/^[6-9]\d{9}$/.test(mobile10)) {
    return {
      isValid: false,
      error: 'Indian mobile numbers must start with digits 6, 7, 8, or 9',
    };
  }

  return {
    isValid: true,
    cleaned: mobile10,
    e164: `+91${mobile10}`,
  };
}

export const indianMobileSchema = z
  .string({ required_error: 'Mobile phone number is required' })
  .trim()
  .min(1, 'Mobile phone number is required')
  .superRefine((val, ctx) => {
    const res = parseIndianMobile(val);
    if (!res.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: res.error || 'Invalid Indian mobile number',
      });
    }
  });

export const indianPinCodeSchema = z
  .string({ required_error: 'PIN code is required' })
  .trim()
  .min(1, 'PIN code is required')
  .regex(/^[1-9]\d{5}$/, 'Please enter a valid 6-digit Indian PIN code (100001–999999)');

export const customerNameSchema = z
  .string({ required_error: 'Full name is required' })
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .regex(
    /^[a-zA-Z\s.'-]+$/,
    'Name can only contain letters, spaces, hyphens, apostrophes, and dots'
  );

export const customerEmailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address')
  .max(255, 'Email cannot exceed 255 characters')
  .optional()
  .or(z.literal(''))
  .nullable();

export const addressLine1Schema = z
  .string({ required_error: 'Address line is required' })
  .trim()
  .min(3, 'Address must be at least 3 characters')
  .max(200, 'Address cannot exceed 200 characters');

export const citySchema = z
  .string({ required_error: 'City is required' })
  .trim()
  .min(2, 'City must be at least 2 characters')
  .max(100, 'City cannot exceed 100 characters')
  .regex(/^[a-zA-Z\s.'-]+$/, 'City can only contain letters and spaces');

export const stateSchema = z
  .string({ required_error: 'State is required' })
  .trim()
  .min(2, 'State must be at least 2 characters')
  .max(100, 'State cannot exceed 100 characters')
  .regex(/^[a-zA-Z\s.'-]+$/, 'State can only contain letters and spaces');

export const countrySchema = z
  .string()
  .trim()
  .default('India')
  .refine(
    (val) => !val || val.toLowerCase() === 'india' || val.toUpperCase() === 'IN',
    { message: 'Deliveries are currently only available within India' }
  );

export const ShippingAddressSchema = z.object({
  fullName: customerNameSchema,
  phone: indianMobileSchema,
  addressLine1: addressLine1Schema,
  addressLine2: z.string().trim().max(200).optional().nullable(),
  landmark: z.string().trim().max(100).optional().nullable(),
  city: citySchema,
  state: stateSchema,
  postalCode: indianPinCodeSchema,
  country: countrySchema.optional(),
});
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export const CustomerDetailsSchema = z.object({
  fullName: customerNameSchema,
  phone: indianMobileSchema,
  email: customerEmailSchema.optional(),
  shippingAddress: ShippingAddressSchema,
});
export type CustomerDetails = z.infer<typeof CustomerDetailsSchema>;

export const CheckoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});
export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;

export const CheckoutRequestSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1, 'Cart cannot be empty'),
  customerName: customerNameSchema,
  customerPhone: indianMobileSchema,
  customerEmail: customerEmailSchema.optional(),
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
