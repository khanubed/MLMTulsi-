export type PaymentProviderStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface CreatePaymentInput {
  orderId: string;
  merchantTransactionId: string;
  amountPaise: number;
  currency: string;
  customerPhone?: string;
  customerName?: string;
}

export interface CreatePaymentOutput {
  providerReference: string;
  checkoutUrl?: string;
  status: PaymentProviderStatus;
  testMode: boolean;
}

export interface PaymentStatusInput {
  merchantTransactionId: string;
  orderId?: string;
}

export interface PaymentStatusOutput {
  status: PaymentProviderStatus;
  providerReference: string;
  amountPaise: number;
  currency: string;
  isTestMode: boolean;
  rawResponse?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput>;
  getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusOutput>;
}
