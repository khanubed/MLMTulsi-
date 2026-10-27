import { getEnv } from '../../../lib/env';
import { logger } from '../../../lib/logger';
import { OtpProvider, SendOtpInput, SendOtpOutput } from '../interfaces/otp-provider.interface';

export class MockOtpProvider implements OtpProvider {
  public readonly name = 'mock';

  async sendOtp(input: SendOtpInput): Promise<SendOtpOutput> {
    const env = getEnv();

    if (env.NODE_ENV === 'production') {
      throw new Error(
        'SECURITY EXCEPTION: MockOtpProvider invocation attempted in production environment. Aborting.'
      );
    }

    const providerReference = `MOCK-SMS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiresInSeconds = Math.max(
      0,
      Math.floor((input.expiresAt.getTime() - Date.now()) / 1000)
    );

    // Development logging with clear developer visibility
    logger.info('📱 [MOCK OTP PROVIDER] SMS Challenge Dispatched', {
      meta: {
        providerReference,
        phone: input.phone,
        expiresInSeconds,
        // Only log code in non-production when dev code exposure is enabled
        code: env.MOCK_OTP_EXPOSE_CODE ? input.code : '[REDACTED]',
      },
    });

    return {
      providerReference,
      expiresInSeconds,
      // Only attach developmentOtp if permitted by environment and testing flag
      developmentOtp: env.MOCK_OTP_EXPOSE_CODE ? input.code : undefined,
    };
  }
}
