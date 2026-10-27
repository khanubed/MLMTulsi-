# Provider Integration Guide: Migrating from Mock to PhonePe & Real SMS

This guide explains how to transition from the development/testing mock providers to real third-party providers (PhonePe and live SMS) **without rewriting any checkout, registration, or MLM commission domain logic**.

---

## 1. Architectural Foundation: Provider Independence

The Tulsi Swarojgar backend communicates with external gateways through strictly decoupled TypeScript interfaces:

```text
Core Checkout & Domain Logic
        │
        ├──► OtpProvider Interface ────────► [MockOtpProvider | RealSmsProvider]
        │
        └──► PaymentProvider Interface ────► [MockPaymentProvider | PhonePeProvider]
```

All provider-specific SDK calls, HTTP requests, signature generation, and payload conversions are completely encapsulated within the provider adapter. Core services (`CheckoutService`, `FinalizationService`, `NetworkService`, `CommissionsService`) are 100% provider-agnostic.

---

## 2. Transitioning to PhonePe Payment Gateway

### Step 2.1: Locate the Adapter Boundary
Place the real PhonePe adapter in:
`apps/web/src/modules/providers/phonepe/phonepe-payment.provider.ts`

### Step 2.2: Implement `PaymentProvider` Interface

```ts
import {
  PaymentProvider,
  CreatePaymentInput,
  CreatePaymentOutput,
  PaymentStatusInput,
  PaymentStatusOutput,
} from '../interfaces/payment-provider.interface';
import { getEnv } from '../../../lib/env';
import crypto from 'crypto';

export class PhonePePaymentProvider implements PaymentProvider {
  public readonly name = 'phonepe';

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const env = getEnv();

    const payload = {
      merchantId: env.PHONEPE_MERCHANT_ID,
      merchantTransactionId: input.merchantTransactionId,
      merchantUserId: input.customerPhone || 'GUEST',
      amount: input.amountPaise,
      redirectUrl: `${env.NEXT_PUBLIC_APP_URL}/order-confirmation/${input.orderId}`,
      redirectMode: 'REDIRECT',
      callbackUrl: env.PHONEPE_CALLBACK_URL,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToHash = `${base64Payload}/pg/v1/pay${env.PHONEPE_SALT_KEY}`;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const xVerify = `${sha256}###${env.PHONEPE_SALT_INDEX}`;

    const response = await fetch(`${env.PHONEPE_BASE_URL}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json();
    const instrumentUrl = data.data?.instrumentResponse?.redirectInfo?.url;

    return {
      providerReference: data.data?.merchantTransactionId || input.merchantTransactionId,
      checkoutUrl: instrumentUrl,
      status: 'PENDING',
      testMode: false,
    };
  }

  async getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusOutput> {
    const env = getEnv();
    const endpoint = `/pg/v1/status/${env.PHONEPE_MERCHANT_ID}/${input.merchantTransactionId}`;
    const stringToHash = `${endpoint}${env.PHONEPE_SALT_KEY}`;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const xVerify = `${sha256}###${env.PHONEPE_SALT_INDEX}`;

    const response = await fetch(`${env.PHONEPE_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': env.PHONEPE_MERCHANT_ID!,
      },
    });

    const data = await response.json();
    const code = data.code;

    return {
      status: code === 'PAYMENT_SUCCESS' ? 'SUCCESS' : code === 'PAYMENT_ERROR' ? 'FAILED' : 'PENDING',
      providerReference: data.data?.transactionId || input.merchantTransactionId,
      amountPaise: data.data?.amount || 50000,
      currency: 'INR',
      isTestMode: false,
      rawResponse: data,
    };
  }
}
```

### Step 2.3: Register in `ProviderFactory`
Update `apps/web/src/modules/providers/provider.factory.ts`:

```ts
if (env.PAYMENT_PROVIDER === 'phonepe') {
  return new PhonePePaymentProvider();
}
```

### Step 2.4: Configure Production Environment Variables

```env
PAYMENT_PROVIDER=phonepe
MOCK_PAYMENT_ALLOW_SUCCESS=false

PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
PHONEPE_MERCHANT_ID=YOUR_PRODUCTION_MERCHANT_ID
PHONEPE_SALT_KEY=YOUR_PRODUCTION_SALT_KEY
PHONEPE_SALT_INDEX=1
PHONEPE_CALLBACK_URL=https://tulsiswaraj.com/api/v1/webhooks/phonepe
```

### Step 2.5: PhonePe Webhook Convergence to `FinalizationService`

When PhonePe delivers an asynchronous payment server-to-server callback (webhook) to `/api/v1/webhooks/phonepe`:
1. Verify the PhonePe `X-VERIFY` HMAC-SHA256 signature against the raw body and salt key.
2. Decode the base64 payload to extract `merchantTransactionId` and status (`PAYMENT_SUCCESS`).
3. Pass control to the single authoritative domain finalization service:

```ts
import { FinalizationService } from '@/modules/checkout/finalization.service';

// Webhook handler logic
if (code === 'PAYMENT_SUCCESS') {
  await FinalizationService.finalizePaidOrder(
    payment.orderId,
    merchantTransactionId
  );
}
```

Because both the mock simulator (`POST /api/v1/dev/payments/:paymentId/simulate`) and the live PhonePe webhook invoke `FinalizationService.finalizePaidOrder`:
- **Identity creation, referral trees, ternary placements, and upline commissions behave identically.**
- **Idempotency is 100% shared**: multiple webhook retries from PhonePe return early without duplicate database mutations.
- **No domain logic needs to change** when switching between mock and real gateway.

---

## 3. Transitioning to a Real SMS / OTP Gateway

### Step 3.1: Locate the Adapter Boundary
Place the live SMS adapter in:
`apps/web/src/modules/providers/sms/live-sms.provider.ts`

### Step 3.2: Implement `OtpProvider` Interface

```ts
import { OtpProvider, SendOtpInput, SendOtpOutput } from '../interfaces/otp-provider.interface';
import { getEnv } from '../../../lib/env';

export class LiveSmsOtpProvider implements OtpProvider {
  public readonly name = 'live_sms';

  async sendOtp(input: SendOtpInput): Promise<SendOtpOutput> {
    const env = getEnv();

    // Call your DLT-approved Indian SMS gateway (e.g. Fast2SMS, Twilio, Gupshup)
    const response = await fetch('https://api.sms-gateway.com/v1/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.SMS_PROVIDER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender_id: env.SMS_SENDER_ID,
        phone: input.phone,
        message: `Your Tulsi Swarojgar verification code is ${input.code}. Valid for 5 minutes. Do not share this code.`,
      }),
    });

    const data = await response.json();

    return {
      providerReference: data.message_id || `SMS-${Date.now()}`,
      expiresInSeconds: Math.max(0, Math.floor((input.expiresAt.getTime() - Date.now()) / 1000)),
      developmentOtp: undefined, // Never expose code in live mode!
    };
  }
}
```

### Step 3.3: Register in `ProviderFactory`
Update `apps/web/src/modules/providers/provider.factory.ts`:

```ts
if (env.OTP_PROVIDER === 'phonepe_sms' || env.OTP_PROVIDER === 'custom_sms') {
  return new LiveSmsOtpProvider();
}
```

---

## 4. Production Safeguards Checklist

Before deploying to production, verify:
1. `NODE_ENV=production` is set in production runtime.
2. `OTP_PROVIDER` is set to your live SMS provider (`phonepe_sms` or `custom_sms`).
3. `PAYMENT_PROVIDER=phonepe` is set.
4. `MOCK_OTP_EXPOSE_CODE=false`.
5. `MOCK_PAYMENT_ALLOW_SUCCESS=false`.
6. Any attempt to boot with `OTP_PROVIDER=mock` or `PAYMENT_PROVIDER=mock` in production will deliberately crash the server process with an explicit `FATAL CONFIGURATION ERROR`.
