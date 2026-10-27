import { FLAGSHIP_PRODUCT } from '../../data/productData';

export class ProductsService {
  static async listProducts() {
    return [FLAGSHIP_PRODUCT];
  }

  static async getProductBySlug(slug: string) {
    if (slug === FLAGSHIP_PRODUCT.slug) {
      return FLAGSHIP_PRODUCT;
    }
    return null;
  }
}
