import { z } from 'zod';

export const ProductStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

export const ProductImageSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid().optional(),
  url: z.string().url(),
  altText: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
});
export type ProductImage = z.infer<typeof ProductImageSchema>;

export const ProductSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  pricePaise: z.number().int().nonnegative(),
  currency: z.literal('INR').default('INR'),
  sku: z.string().nullable().optional(),
  status: ProductStatusSchema,
  stockQuantity: z.number().int().nullable().optional(),
  trackInventory: z.boolean().default(false),
  images: z.array(ProductImageSchema).default([]),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const PublicProductDtoSchema = ProductSchema.pick({
  id: true,
  slug: true,
  name: true,
  description: true,
  pricePaise: true,
  currency: true,
  images: true,
  status: true,
});
export type PublicProductDto = z.infer<typeof PublicProductDtoSchema>;
