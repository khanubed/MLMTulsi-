import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().default(''),
  DIRECT_URL: z.string().optional(),
  SESSION_SECRET: z.string().default('development_insecure_session_secret_min_32_chars_long'),

  // Provider Selection
  OTP_PROVIDER: z.enum(['mock', 'phonepe_sms', 'custom_sms']).default('mock'),
  PAYMENT_PROVIDER: z.enum(['mock', 'phonepe']).default('mock'),

  // Developer Testing Flags (Forbidden in production)
  MOCK_OTP_EXPOSE_CODE: z.preprocess(
    (v) => (typeof v === 'string' ? v.toLowerCase() === 'true' || v === '1' : Boolean(v)),
    z.boolean()
  ).default(true),
  MOCK_PAYMENT_ALLOW_SUCCESS: z.preprocess(
    (v) => (typeof v === 'string' ? v.toLowerCase() === 'true' || v === '1' : Boolean(v)),
    z.boolean()
  ).default(true),

  // PhonePe Gateway Credentials (for future production / sandbox)
  PHONEPE_MERCHANT_ID: z.string().optional(),
  PHONEPE_SALT_KEY: z.string().optional(),
  PHONEPE_SALT_INDEX: z.string().default('1'),
  PHONEPE_BASE_URL: z.string().default('https://api-preprod.phonepe.com/apis/pg-sandbox'),
  PHONEPE_CALLBACK_URL: z.string().optional(),

  // Application Endpoints
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),

  // Administration & Messaging
  ADMIN_BOOTSTRAP_EMAIL: z.string().default('admin@tulsiswaraj.com'),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().optional(),
  SMS_PROVIDER_API_KEY: z.string().optional(),
  SMS_SENDER_ID: z.string().default('TULSIS'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

export function validateEnvironment(customEnv?: Record<string, unknown>): Env {
  const source = customEnv || process.env;
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const errorMsg = JSON.stringify(parsed.error.format(), null, 2);
    throw new Error(`Invalid environment configuration:\n${errorMsg}`);
  }

  const data = parsed.data;

  // Strict Production Safeguards
  if (data.NODE_ENV === 'production') {
    if (data.OTP_PROVIDER === 'mock') {
      throw new Error(
        'FATAL CONFIGURATION ERROR: OTP_PROVIDER=mock is strictly prohibited in production mode. Configure a real SMS provider.'
      );
    }
    if (data.PAYMENT_PROVIDER === 'mock') {
      throw new Error(
        'FATAL CONFIGURATION ERROR: PAYMENT_PROVIDER=mock is strictly prohibited in production mode. Configure PhonePe credentials.'
      );
    }
    if (data.MOCK_OTP_EXPOSE_CODE) {
      throw new Error(
        'FATAL SECURITY VIOLATION: MOCK_OTP_EXPOSE_CODE must be false in production mode.'
      );
    }
    if (data.MOCK_PAYMENT_ALLOW_SUCCESS) {
      throw new Error(
        'FATAL SECURITY VIOLATION: MOCK_PAYMENT_ALLOW_SUCCESS must be false in production mode.'
      );
    }
  }

  return data;
}

export function getEnv(): Env {
  if (!validatedEnv) {
    try {
      validatedEnv = validateEnvironment();
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      console.warn('Environment warning in development:', (error as Error).message);
      // Fallback for local dev when variables are missing
      validatedEnv = envSchema.parse({
        ...process.env,
        DATABASE_URL:
          process.env.DATABASE_URL ||
          'postgresql://postgres:postgres@localhost:5432/tulsimlm?schema=public',
        SESSION_SECRET:
          process.env.SESSION_SECRET ||
          'development_insecure_session_secret_min_32_chars_long',
        OTP_PROVIDER: 'mock',
        PAYMENT_PROVIDER: 'mock',
        MOCK_OTP_EXPOSE_CODE: true,
        MOCK_PAYMENT_ALLOW_SUCCESS: true,
      });
    }
  }
  return validatedEnv;
}

/**
 * Resets validated environment cache (for testing environment mutations)
 */
export function resetEnvForTesting(): void {
  validatedEnv = null;
}
