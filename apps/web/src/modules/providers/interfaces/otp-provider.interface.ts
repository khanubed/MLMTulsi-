export interface SendOtpInput {
  phone: string;
  code: string;
  expiresAt: Date;
  checkoutSessionId?: string;
}

export interface SendOtpOutput {
  providerReference: string;
  /**
   * Only exposed in development/test mode when MOCK_OTP_EXPOSE_CODE is explicitly true.
   * Stripped and undefined in any production context.
   */
  developmentOtp?: string;
  expiresInSeconds: number;
}

export interface OtpProvider {
  readonly name: string;
  sendOtp(input: SendOtpInput): Promise<SendOtpOutput>;
}
