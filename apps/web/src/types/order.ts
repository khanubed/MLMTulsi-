import type { CartItem } from './cart';

export type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'cod';

export interface ShippingAddress {
  fullName: string;
  email: string;
  mobile: string;
  houseFlat: string;
  streetLocality: string;
  landmark?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

export type OrderStatus = 'Processing' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'Simulated Paid' | 'Pending Verification' | 'Cash on Delivery';
  orderStatus: OrderStatus;
  shippingAddress: ShippingAddress;
  deliveryEstimate: string;
  isDemoOrder: true;
}
