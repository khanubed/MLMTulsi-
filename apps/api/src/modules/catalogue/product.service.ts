/**
 * Product Catalogue Service
 */
export class ProductService {
  async getPublishedProducts() {
    // Database access via Prisma/repository to be implemented
    return [];
  }

  async getProductBySlug(_slug: string) {
    // Database access via Prisma/repository to be implemented
    return null;
  }
}

export const productService = new ProductService();
