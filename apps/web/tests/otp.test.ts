import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { MockOtpProvider } from '../src/modules/providers/mock/mock-otp.provider';
import { resetEnvForTesting } from '../src/lib/env';

describe('OTP Security & Provider Verification', () => {
  beforeEach(() => {
    resetEnvForTesting();
    process.env.NODE_ENV = 'development';
    process.env.OTP_PROVIDER = 'mock';
    process.env.MOCK_OTP_EXPOSE_CODE = 'true';
  });

  afterEach(() => {
    resetEnvForTesting();
  });

  it('generates a 6-digit cryptographically secure numeric code', () => {
    const code = crypto.randomInt(100000, 999999).toString();
    expect(code).toMatch(/^\d{6}$/);
    expect(Number(code)).toBeGreaterThanOrEqual(100000);
    expect(Number(code)).toBeLessThanOrEqual(999999);
  });

  it('verifies code matches SHA-256 hash using timing-safe comparison', () => {
    const code = '492817';
    const hash = crypto.createHash('sha256').update(code).digest('hex');

    const incomingHash = crypto.createHash('sha256').update(code).digest('hex');
    const isMatch = crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(hash));
    expect(isMatch).toBe(true);

    const wrongHash = crypto.createHash('sha256').update('123456').digest('hex');
    const isWrongMatch = crypto.timingSafeEqual(Buffer.from(wrongHash), Buffer.from(hash));
    expect(isWrongMatch).toBe(false);
  });

  it('exposes developmentOtp when MOCK_OTP_EXPOSE_CODE is true in dev mode', async () => {
    process.env.MOCK_OTP_EXPOSE_CODE = 'true';
    resetEnvForTesting();

    const provider = new MockOtpProvider();
    const result = await provider.sendOtp({
      phone: '+919876543210',
      code: '839201',
      expiresAt: new Date(Date.now() + 300000),
    });

    expect(result.developmentOtp).toBe('839201');
    expect(result.providerReference).toContain('MOCK-SMS-');
    expect(result.expiresInSeconds).toBeGreaterThan(0);
  });

  it('strips developmentOtp when MOCK_OTP_EXPOSE_CODE is false', async () => {
    process.env.MOCK_OTP_EXPOSE_CODE = 'false';
    resetEnvForTesting();

    const provider = new MockOtpProvider();
    const result = await provider.sendOtp({
      phone: '+919876543210',
      code: '839201',
      expiresAt: new Date(Date.now() + 300000),
    });

    expect(result.developmentOtp).toBeUndefined();
    expect(result.providerReference).toContain('MOCK-SMS-');
  });

  it('throws security exception if MockOtpProvider is invoked in production', async () => {
    process.env.NODE_ENV = 'production';
    resetEnvForTesting();

    const provider = new MockOtpProvider();
    await expect(
      provider.sendOtp({
        phone: '+919876543210',
        code: '839201',
        expiresAt: new Date(Date.now() + 300000),
      })
    ).rejects.toThrow(/strictly prohibited in production mode|production environment/);
  });
});
