import { getEnv } from '../../lib/env';
import { OtpProvider } from './interfaces/otp-provider.interface';
import { PaymentProvider } from './interfaces/payment-provider.interface';
import { MockOtpProvider } from './mock/mock-otp.provider';
import { MockPaymentProvider } from './mock/mock-payment.provider';

let customOtpProvider: OtpProvider | null = null;
let customPaymentProvider: PaymentProvider | null = null;

export class ProviderFactory {
  static getOtpProvider(): OtpProvider {
    if (customOtpProvider) {
      return customOtpProvider;
    }

    const env = getEnv();

    if (env.OTP_PROVIDER === 'mock') {
      if (env.NODE_ENV === 'production') {
        throw new Error(
          'FATAL SECURITY VIOLATION: Mock OTP Provider cannot be initialized in production environment.'
        );
      }
      return new MockOtpProvider();
    }

    // Future SMS provider branches (e.g., 'phonepe_sms', 'custom_sms')
    throw new Error(
      `Unsupported OTP provider configured: "${env.OTP_PROVIDER}". Implement or configure an adapter.`
    );
  }

  static getPaymentProvider(): PaymentProvider {
    if (customPaymentProvider) {
      return customPaymentProvider;
    }

    const env = getEnv();

    if (env.PAYMENT_PROVIDER === 'mock') {
      if (env.NODE_ENV === 'production') {
        throw new Error(
          'FATAL SECURITY VIOLATION: Mock Payment Provider cannot be initialized in production environment.'
        );
      }
      return new MockPaymentProvider();
    }

    // Future PhonePe gateway adapter branch
    if (env.PAYMENT_PROVIDER === 'phonepe') {
      throw new Error(
        'PhonePe production provider selected, but merchant credentials and adapter are not active in this test build.'
      );
    }

    throw new Error(
      `Unsupported Payment provider configured: "${env.PAYMENT_PROVIDER}". Implement or configure an adapter.`
    );
  }

  /**
   * For automated unit testing injection
   */
  static setCustomOtpProvider(provider: OtpProvider | null): void {
    customOtpProvider = provider;
  }

  /**
   * For automated unit testing injection
   */
  static setCustomPaymentProvider(provider: PaymentProvider | null): void {
    customPaymentProvider = provider;
  }

  /**
   * Resets injected custom providers
   */
  static reset(): void {
    customOtpProvider = null;
    customPaymentProvider = null;
  }
}
