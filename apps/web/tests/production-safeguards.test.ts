import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateEnvironment, resetEnvForTesting } from '../src/lib/env';
import { ProviderFactory } from '../src/modules/providers/provider.factory';

describe('Production Environment Safeguards', () => {
  beforeEach(() => {
    resetEnvForTesting();
    ProviderFactory.reset();
  });

  afterEach(() => {
    resetEnvForTesting();
    ProviderFactory.reset();
  });

  it('rejects OTP_PROVIDER=mock in production mode', () => {
    expect(() => {
      validateEnvironment({
        NODE_ENV: 'production',
        OTP_PROVIDER: 'mock',
        PAYMENT_PROVIDER: 'phonepe',
        MOCK_OTP_EXPOSE_CODE: false,
        MOCK_PAYMENT_ALLOW_SUCCESS: false,
      });
    }).toThrow(/OTP_PROVIDER=mock is strictly prohibited in production mode/);
  });

  it('rejects PAYMENT_PROVIDER=mock in production mode', () => {
    expect(() => {
      validateEnvironment({
        NODE_ENV: 'production',
        OTP_PROVIDER: 'phonepe_sms',
        PAYMENT_PROVIDER: 'mock',
        MOCK_OTP_EXPOSE_CODE: false,
        MOCK_PAYMENT_ALLOW_SUCCESS: false,
      });
    }).toThrow(/PAYMENT_PROVIDER=mock is strictly prohibited in production mode/);
  });

  it('rejects MOCK_OTP_EXPOSE_CODE=true in production mode', () => {
    expect(() => {
      validateEnvironment({
        NODE_ENV: 'production',
        OTP_PROVIDER: 'phonepe_sms',
        PAYMENT_PROVIDER: 'phonepe',
        MOCK_OTP_EXPOSE_CODE: true,
        MOCK_PAYMENT_ALLOW_SUCCESS: false,
      });
    }).toThrow(/MOCK_OTP_EXPOSE_CODE must be false in production mode/);
  });

  it('rejects MOCK_PAYMENT_ALLOW_SUCCESS=true in production mode', () => {
    expect(() => {
      validateEnvironment({
        NODE_ENV: 'production',
        OTP_PROVIDER: 'phonepe_sms',
        PAYMENT_PROVIDER: 'phonepe',
        MOCK_OTP_EXPOSE_CODE: false,
        MOCK_PAYMENT_ALLOW_SUCCESS: true,
      });
    }).toThrow(/MOCK_PAYMENT_ALLOW_SUCCESS must be false in production mode/);
  });

  it('allows mock providers in development mode', () => {
    const env = validateEnvironment({
      NODE_ENV: 'development',
      OTP_PROVIDER: 'mock',
      PAYMENT_PROVIDER: 'mock',
      MOCK_OTP_EXPOSE_CODE: true,
      MOCK_PAYMENT_ALLOW_SUCCESS: true,
    });

    expect(env.OTP_PROVIDER).toBe('mock');
    expect(env.PAYMENT_PROVIDER).toBe('mock');
    expect(env.MOCK_OTP_EXPOSE_CODE).toBe(true);
    expect(env.MOCK_PAYMENT_ALLOW_SUCCESS).toBe(true);
  });
});
