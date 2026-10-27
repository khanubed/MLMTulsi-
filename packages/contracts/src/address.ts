import { z } from 'zod';

export const AddressTypeSchema = z.enum(['SHIPPING', 'BILLING', 'BOTH']);
export type AddressType = z.infer<typeof AddressTypeSchema>;

export const AddressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  addressLine1: z.string().min(5, 'Street address is required'),
  addressLine2: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit Indian PIN code'),
  country: z.string().default('India'),
  type: AddressTypeSchema.default('SHIPPING'),
  isDefault: z.boolean().default(false),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});
export type Address = z.infer<typeof AddressSchema>;

export const CreateAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  addressLine1: z.string().min(5, 'Street address is required'),
  addressLine2: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit Indian PIN code'),
  country: z.string().default('India'),
  type: AddressTypeSchema.default('SHIPPING').optional(),
  isDefault: z.boolean().default(false).optional(),
});
export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;

export const UpdateAddressSchema = CreateAddressSchema.partial();
export type UpdateAddressDto = z.infer<typeof UpdateAddressSchema>;
