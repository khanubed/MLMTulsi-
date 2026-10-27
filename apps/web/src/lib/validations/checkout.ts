import { z } from 'zod';

export interface IndianMobileParseResult {
  isValid: boolean;
  cleaned?: string; // 10-digit subscriber number: e.g. "9876543210"
  e164?: string;    // E.164 international format: e.g. "+919876543210"
  error?: string;
}

/**
 * Strict Indian Mobile Number Parser and Validator.
 *
 * Rules:
 * - Must be an Indian mobile number (+91).
 * - Foreign numbers (e.g. +1, +44, +971, etc.) are strictly rejected.
 * - Allowed formats:
 *   - Standard 10 digits: "9876543210"
 *   - With country code: "+919876543210", "+91 98765 43210", "919876543210"
 *   - With trunk prefix: "09876543210"
 * - The core 10-digit number MUST start with 6, 7, 8, or 9 (TRAI / DoT mobile allocation).
 */
export function parseIndianMobile(input: unknown): IndianMobileParseResult {
  if (typeof input !== 'string') {
    return { isValid: false, error: 'Phone number must be a valid text string' };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Reject foreign country codes explicitly: if starts with '+' and not '+91'
  if (trimmed.startsWith('+') && !trimmed.startsWith('+91')) {
    return {
      isValid: false,
      error: 'Only Indian phone numbers (+91) are accepted. International numbers are not supported.',
    };
  }

  // Strip common punctuation / spacing characters: spaces, hyphens, parentheses, dots
  let sanitized = trimmed.replace(/[\s\-\(\)\.]/g, '');

  // Strip leading '+'
  if (sanitized.startsWith('+')) {
    sanitized = sanitized.slice(1);
  }

  // Must only contain digits
  if (!/^\d+$/.test(sanitized)) {
    return {
      isValid: false,
      error: 'Phone number must contain digits only',
    };
  }

  // Determine the core 10-digit number
  let mobile10: string;

  if (sanitized.length === 12) {
    // 12 digits: MUST start with 91 (India country code)
    if (!sanitized.startsWith('91')) {
      return {
        isValid: false,
        error: 'Only Indian mobile numbers (+91) are accepted',
      };
    }
    mobile10 = sanitized.slice(2);
  } else if (sanitized.length === 11) {
    // 11 digits: MUST start with 0 (national trunk prefix)
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

  // Enforce TRAI Indian mobile prefix: must start with 6, 7, 8, or 9
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

/**
 * Extracts clean 10-digit Indian phone or returns null if invalid.
 */
export function cleanIndianMobile(input: unknown): string | null {
  const result = parseIndianMobile(input);
  return result.isValid && result.cleaned ? result.cleaned : null;
}

/**
 * Formats Indian phone into E.164 (+91XXXXXXXXXX) or returns null if invalid.
 */
export function formatIndianMobileE164(input: unknown): string | null {
  const result = parseIndianMobile(input);
  return result.isValid && result.e164 ? result.e164 : null;
}

// ---------------------------------------------------------------------------
// Field-Level Zod Schemas (Reusable across Frontend Forms and Backend APIs)
// ---------------------------------------------------------------------------

/**
 * Zod schema for Indian mobile phone numbers.
 * Validates inputs such as "9876543210", "+919876543210", "+91 98765 43210", "09876543210".
 * Rejects non-Indian numbers, wrong lengths, and non-6-9 starting digits.
 */
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

/**
 * Zod schema for strict 6-digit Indian PIN / Postal code (100001 - 999999).
 * First digit cannot be 0 in Indian postal codes.
 */
export const indianPinCodeSchema = z
  .string({ required_error: 'PIN code is required' })
  .trim()
  .min(1, 'PIN code is required')
  .regex(/^[1-9]\d{5}$/, 'Please enter a valid 6-digit Indian PIN code (100001–999999)');

/**
 * Zod schema for customer full name (2 - 100 characters).
 */
export const customerNameSchema = z
  .string({ required_error: 'Full name is required' })
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .regex(
    /^[a-zA-Z\s.'-]+$/,
    'Name can only contain letters, spaces, hyphens, apostrophes, and dots'
  );

/**
 * Zod schema for optional customer email.
 */
export const customerEmailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address')
  .max(255, 'Email cannot exceed 255 characters')
  .optional()
  .or(z.literal(''))
  .nullable();

/**
 * Zod schema for primary address line (House / Flat / Building / Street).
 */
export const addressLine1Schema = z
  .string({ required_error: 'Address line is required' })
  .trim()
  .min(3, 'Address must be at least 3 characters')
  .max(200, 'Address cannot exceed 200 characters');

/**
 * Zod schema for secondary address line (Colony / Locality / Sector).
 */
export const addressLine2Schema = z
  .string()
  .trim()
  .max(200, 'Address line 2 cannot exceed 200 characters')
  .optional();

/**
 * Zod schema for landmark.
 */
export const landmarkSchema = z
  .string()
  .trim()
  .max(100, 'Landmark cannot exceed 100 characters')
  .optional();

/**
 * Zod schema for city.
 */
export const citySchema = z
  .string({ required_error: 'City is required' })
  .trim()
  .min(2, 'City must be at least 2 characters')
  .max(100, 'City cannot exceed 100 characters')
  .regex(/^[a-zA-Z\s.'-]+$/, 'City can only contain letters and spaces');

/**
 * Zod schema for state.
 */
export const stateSchema = z
  .string({ required_error: 'State is required' })
  .trim()
  .min(2, 'State must be at least 2 characters')
  .max(100, 'State cannot exceed 100 characters')
  .regex(/^[a-zA-Z\s.'-]+$/, 'State can only contain letters and spaces');

/**
 * Zod schema for country (strictly India).
 */
export const countrySchema = z
  .string()
  .trim()
  .default('India')
  .refine(
    (val) => !val || val.toLowerCase() === 'india' || val.toUpperCase() === 'IN',
    { message: 'Deliveries are currently only available within India' }
  );

// ---------------------------------------------------------------------------
// Composite Schemas
// ---------------------------------------------------------------------------

/**
 * Shipping Address Schema for checkout and order delivery.
 */
export const ShippingAddressSchema = z.object({
  fullName: customerNameSchema,
  phone: indianMobileSchema,
  addressLine1: addressLine1Schema,
  addressLine2: addressLine2Schema.optional(),
  landmark: landmarkSchema.optional(),
  city: citySchema,
  state: stateSchema,
  postalCode: indianPinCodeSchema,
  country: countrySchema.optional(),
});
export type ShippingAddressInput = z.infer<typeof ShippingAddressSchema>;

/**
 * Customer Details Schema for Checkout Session Step 3.
 * Used by CheckoutService.updateCustomerDetails and PATCH /api/v1/checkout/sessions/[id]/details.
 */
export const CustomerDetailsSchema = z.object({
  fullName: customerNameSchema,
  phone: indianMobileSchema,
  email: customerEmailSchema.optional(),
  shippingAddress: ShippingAddressSchema,
});
export type CustomerDetailsInput = z.infer<typeof CustomerDetailsSchema>;

/**
 * Storefront Checkout Form Schema.
 * Used by the client-side checkout wizard (apps/web/src/app/(store)/checkout/page.tsx).
 */
export const StorefrontCheckoutFormSchema = z.object({
  fullName: customerNameSchema,
  mobile: indianMobileSchema,
  email: z.string().trim().email('Valid email address is required'),
  houseFlat: addressLine1Schema,
  streetLocality: z.string().trim().min(3, 'Street, colony or locality is required').max(200),
  landmark: landmarkSchema.optional(),
  pinCode: indianPinCodeSchema,
  city: citySchema,
  state: stateSchema,
  country: countrySchema,
  paymentMethod: z.enum(['upi', 'card', 'netbanking', 'cod']),
  upiId: z.string().optional(),
  selectedBank: z.string().optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the checkout terms to complete your order' }),
  }),
});
export type StorefrontCheckoutFormData = z.infer<typeof StorefrontCheckoutFormSchema>;
