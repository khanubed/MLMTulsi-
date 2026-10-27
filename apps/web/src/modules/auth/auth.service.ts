import { BadRequestError } from '../../lib/errors';
import { logger } from '../../lib/logger';

export class AuthService {
  static async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    if (!phone || phone.length < 10) {
      throw new BadRequestError('Invalid phone number format');
    }
    logger.info('OTP challenge dispatched', { meta: { phone } });
    return {
      success: true,
      message: 'OTP has been sent successfully.',
    };
  }

  static async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; token: string }> {
    if (!otp || otp.length < 4) {
      throw new BadRequestError('Invalid OTP code');
    }
    return {
      success: true,
      token: 'demo-jwt-session-token',
    };
  }
}
