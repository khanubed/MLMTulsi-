/**
 * Orders Service for lifecycle management
 */
export class OrderService {
  async getOrderByNumber(_orderNumber: string) {
    return null;
  }

  async getPublicOrderStatus(_orderNumber: string) {
    return null;
  }
}

export const orderService = new OrderService();
