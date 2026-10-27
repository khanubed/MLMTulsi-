import { TooManyRequestsError } from './errors';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const memoryRateLimitStore = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(key: string, config: RateLimitConfig): void {
  const now = Date.now();
  const entry = memoryRateLimitStore.get(key);

  if (!entry || now > entry.expiresAt) {
    memoryRateLimitStore.set(key, {
      count: 1,
      expiresAt: now + config.windowMs,
    });
    return;
  }

  if (entry.count >= config.maxRequests) {
    throw new TooManyRequestsError();
  }

  entry.count += 1;
}
