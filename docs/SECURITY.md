# Security Architecture & Production Safeguards

This document outlines the security controls, cryptographic measures, and production isolation safeguards enforced in the Tulsi Swarojgar backend.

---

## 1. Production Mode Safeguards

To prevent developer testing bypasses in production:

1. **Provider Enforcement**:
   - `apps/web/src/lib/env.ts` evaluates `NODE_ENV`.
   - If `NODE_ENV === 'production'`, `OTP_PROVIDER=mock` and `PAYMENT_PROVIDER=mock` trigger an unhandled startup crash:
     ```
     FATAL CONFIGURATION ERROR: OTP_PROVIDER=mock is strictly prohibited in production mode.
     ```
2. **Testing Flags Prohibition**:
   - `MOCK_OTP_EXPOSE_CODE` and `MOCK_PAYMENT_ALLOW_SUCCESS` must be `false` in production. Any attempt to boot with these flags enabled immediately halts the process.
3. **Endpoint Shielding**:
   - All `/api/v1/dev/payment-simulator/*` route handlers verify `NODE_ENV !== 'production'` and `PAYMENT_PROVIDER === 'mock'`. Any request in production returns `403 Forbidden` (`ForbiddenError`).

---

## 2. Phone Verification & OTP Cryptography

1. **Random Generation**:
   - OTP codes are generated using Node.js's cryptographically secure pseudo-random number generator (`crypto.randomInt(100000, 999999)`), avoiding predictable pseudorandom functions (`Math.random()`).
2. **Zero Plaintext Storage**:
   - Plaintext OTP codes are never stored in the database. Only the SHA-256 hash (`codeHash`) is persisted in `otp_challenges`.
3. **Timing-Safe Equality**:
   - Verification comparisons use `crypto.timingSafeEqual` to eliminate timing side-channel attacks:
     ```ts
     const hashMatches = crypto.timingSafeEqual(
       Buffer.from(incomingHash),
       Buffer.from(challenge.codeHash)
     );
     ```
4. **Rate Limiting & Cooldown**:
   - A mandatory 60-second cooldown is enforced between challenge dispatches per checkout session and phone number.
   - A strict limit of 5 failed attempts (`maxAttempts: 5`) permanently invalidates the challenge.
5. **Single-Use Invalidation**:
   - Verified challenges immediately set `consumedAt = new Date()`, preventing replay attacks.

---

## 3. Financial & Payment Integrity

1. **Authoritative Server Pricing**:
   - Neither the browser client nor the checkout payload can submit price amounts or totals. All amounts are calculated exclusively on the server from `products.pricePaise`.
2. **Server-Confirmed Payment**:
   - The backend never trusts client assertions such as `{ status: "SUCCESS" }`. Orders are only finalized when the selected `PaymentProvider` confirms authoritative gateway settlement (`getPaymentStatus`).
3. **Immutable Address Snapshots**:
   - Completed orders capture a frozen JSON snapshot of `shippingAddress` at the instant checkout is confirmed, ensuring that future edits or deletions to customer address books cannot alter historical order fulfillment or audit records.
4. **Idempotency**:
   - `finalizePaidRegistration` runs within an atomic PostgreSQL transaction. If already finalized, it returns safely without creating duplicate customer accounts, duplicate network IDs, or duplicate commissions.
