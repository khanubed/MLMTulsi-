# Tulsi Swarojgar: End-to-End Checkout, Payment & Network Registration Architecture

> **Purpose**: This document provides a comprehensive, senior-architect-level walkthrough of the entire customer lifecycle—from arrival and storefront checkout to phone verification, payment gateway integration, database transaction finalization, MLM network ternary placement, and upline commission allocation. Use this guide to understand the system design, explain it to senior stakeholders, and review the security controls and verification checks in place.

---

## 1. Executive Summary & Design Principles

Tulsi Swarojgar operates a direct-to-consumer (D2C) e-commerce storefront coupled with an automated 3-child (ternary) Multi-Level Marketing (MLM) distribution tree.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   HIGH-LEVEL PIPELINE                                  │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [1. Product]          [2. Session]             [3. Customer & Address]     [4. Referral]
  Pick Product   ───►  Create Checkout    ───►    Input Details (Zod)   ───►  Validate Sponsor &
                        Session (₹500)             & E.164 Mobile              Placement Slot
                                                                                    │
                                                                                    ▼
  [8. Payment Gate]     [7. Pending Order]       [6. OTP Verify]             [5. OTP Challenge]
  Create Transaction ◄── Create Order      ◄───   Verify via SHA-256    ◄───  Dispatch 6-Digit
  (Mock / PhonePe)       (Idempotent)             Timing-Safe Equal           Crypto Random SMS
         │
         ▼
  [9. Verification Callback]          [10. Single Finalization Service]
  Webhook (PhonePe) OR           ───►  Atomic PostgreSQL $transaction:
  Dev Simulator (/dev/payments)        • Phone-reuse customer account
                                       • Collision-resistant TS-XXXX NetworkId
                                       • Ternary placement (Slots 1..3 or Spillover)
                                       • 10-Level upline commissions (HELD status)
                                       • Transactional Outbox Job & Audit Log
```

### Core Architectural Guarantees
1. **Server-Authoritative Pricing**: Neither browser clients nor API consumers can submit custom pricing or discount amounts. All calculations derive from `products.pricePaise` in PostgreSQL.
2. **Zero-Trust Payment Settlement**: Orders are never confirmed based on client-side status claims. Confirmation requires cryptographic webhook verification (PhonePe) or local simulator dispatch (`NODE_ENV !== 'production'`).
3. **Decoupled Gateway Abstraction**: Core business and network logic never depends directly on PhonePe or SMS vendor SDKs. External gateways conform to pluggable TypeScript interfaces (`PaymentProvider`, `OtpProvider`), allowing mock-to-production migration without changing domain logic.
4. **Account vs. Network Identity Separation**:
   - `User`: The personal customer account, uniquely keyed by E.164 phone number (`+91XXXXXXXXXX`). Existing users are automatically reused to prevent account duplication.
   - `NetworkId`: The MLM distributor position owned by a `User`. Capped at 1 node per user for `INITIAL_REGISTRATION`, and max 100 nodes overall.
5. **Strict Atomic Idempotency**: Finalization is wrapped in an isolated PostgreSQL transaction with pre- and post-condition checks. Repeating finalization returns existing data safely without duplicate user, node, placement, or commission entries.

---

## 2. Comprehensive Step-by-Step Lifecycle

---

### Step 1: Product Selection & Session Initialization
- **API**: `POST /api/v1/checkout/sessions`
- **What Happens**:
  1. The client selects a product (e.g., *Tulsi Meta Ved Herbal Mix*) and quantity.
  2. The backend looks up the active product in PostgreSQL (`products.id`).
  3. The server computes `unitPricePaise` and `totalAmountPaise` directly from the database record (`50,000 paise = ₹500`).
  4. A `CheckoutSession` record is persisted with status `INITIATED` and a 1-hour expiration timestamp (`expiresAt`).
- **Logic Applied**:
  - **Server-Authoritative Pricing**: Client input contains only `{ productId, quantity }`. Any price submitted by the client is ignored.
  - **Session Isolation**: Each checkout journey receives an isolated UUID `sessionId` to prevent state collision.

---

### Step 2: Customer Details & Indian Mobile Normalization
- **API**: `POST /api/v1/checkout/sessions/:id/details`
- **What Happens**:
  1. The customer enters their full name, email, 10-digit Indian mobile number, and delivery address.
  2. The payload is validated via Zod schema (`CustomerDetailsSchema`).
  3. The phone number is validated and normalized to E.164 format (`+91XXXXXXXXXX`).
  4. The session updates to `DETAILS_PROVIDED`.
- **Logic Applied**:
  - **Regex Normalization**: Strips leading `0`, `+91`, spaces, and dashes. Enforces valid Indian telecom numbering plans (10 digits starting with `6, 7, 8, 9`).
  - **Session State Guard**: Rejects updates if the session is already `CONFIRMED` or `EXPIRED`.

---

### Step 3: Referral Validation & Ternary Placement Calculation
- **API**: `POST /api/v1/checkout/sessions/:id/referral/validate`
- **What Happens**:
  1. Customer enters a sponsor's referral code (e.g. `TULSI01` or `TULSI101`).
  2. The system checks `NetworkService.validateReferralCode`:
     - Verifies the referral code exists and the node has `status === 'ACTIVE'`.
     - Inspects the sponsor's direct children using `parentPlacements`.
  3. The system calculates the exact placement slot via `NetworkService.findPlacementSlot`:
     - Checks direct slots `1`, `2`, and `3` under the sponsor.
     - If direct slots are full, performs a **Breadth-First Search (BFS)** downline traversal to locate the nearest available spillover slot.
  4. The session updates with `sponsorNetworkId`, `intendedParentId`, and `intendedSlot`.
- **Logic Applied**:
  - **Ternary Constraint (Max 3 Direct Children)**: Enforces that no network node can have more than 3 direct children.
  - **Relation Accuracy**: Uses `parentPlacements` (where the sponsor is the parent) to inspect occupied slots, avoiding confusion with `placements` (where the node is a child).
  - **Automatic Spillover**: Downlines benefit from sponsor spillover placements automatically without manual administrator intervention.

---

### Step 4: Cryptographic Phone OTP Challenge
- **API**: `POST /api/v1/checkout/sessions/:id/phone/otp/request`
- **What Happens**:
  1. The server checks that customer details have been provided and the session is active.
  2. Enforces a **60-second resend cooldown** against previous challenges for this session.
  3. Generates a 6-digit random code using `crypto.randomInt(100000, 999999)`.
  4. Computes a SHA-256 hash of the code (`codeHash`).
  5. Stores the challenge in `otp_challenges` (expires in 5 minutes, `maxAttempts: 5`). Plaintext is **never** saved to database.
  6. Dispatches the SMS via the configured `OtpProvider` (`MockOtpProvider` in dev; live SMS provider in production).
- **Logic Applied**:
  - **Cryptographic Randomness**: Uses OS-level CSPRNG (`crypto.randomInt`), never pseudo-random `Math.random()`.
  - **Zero Plaintext Storage**: Only `codeHash` is stored, eliminating credential leaks from database snapshots or logs.

---

### Step 5: Timing-Safe OTP Verification
- **API**: `POST /api/v1/checkout/sessions/:id/phone/otp/verify`
- **What Happens**:
  1. Client submits `{ code: "123456" }`.
  2. Server fetches the latest active, unconsumed challenge for the session.
  3. Checks `attemptCount < maxAttempts` and expiration time.
  4. Hashes the incoming code and performs a **timing-safe comparison** (`crypto.timingSafeEqual`) against `challenge.codeHash`.
  5. Increments `attemptCount`. If valid, marks `consumedAt = new Date()`.
  6. Updates the session: `phoneVerifiedAt = new Date()`, `status = 'PHONE_VERIFIED'`.
- **Logic Applied**:
  - **Timing-Attack Resistance**: `crypto.timingSafeEqual` prevents hackers from deducing digits via microscopic response time differences.
  - **Replay Protection**: Challenge is immediately marked `consumedAt` upon successful verification.
  - **Brute-Force Lockout**: Locked out after 5 consecutive failed attempts.

---

### Step 6: Checkout Confirmation & Order Creation
- **API**: `POST /api/v1/checkout/sessions/:id/confirm`
- **What Happens**:
  1. Server verifies `session.phoneVerifiedAt` is present.
  2. Idempotency check: If `session.orderId` already exists, returns the existing order immediately.
  3. Creates a new `Order` record:
     - `status: 'PENDING_PAYMENT'`, `paymentStatus: 'INITIATED'`.
     - `purpose: 'INITIAL_REGISTRATION'`.
     - Immutable JSON snapshot of `shippingAddress`.
     - Order line items snapshot (`productNameSnapshot`, `skuSnapshot`, `unitPricePaise`, `lineTotalPaise`).
  4. Links `order.id` back to `session.orderId` and transitions session to `CONFIRMED`.
- **Logic Applied**:
  - **OTP Prerequisite Gate**: Order cannot be created if phone OTP verification was bypassed.
  - **Historical Integrity**: Freezes product details and address snapshots so future catalogue or profile edits cannot alter order history.

---

### Step 7: Payment Initiation
- **API**: `POST /api/v1/payments/checkout`
- **What Happens**:
  1. Accepts `{ orderId }`.
  2. Verifies the order exists and is not already paid.
  3. Generates a unique transaction identifier: `merchantOrderId` (e.g. `TXN_1793008915693_QVTIJ`).
  4. Calls `PaymentProvider.createPayment`:
     - **In Development**: `MockPaymentProvider` generates a local checkout URL: `/dev/payment-simulator/TXN_...`.
     - **In Production**: `PhonePePaymentProvider` calls PhonePe `/pg/v1/pay` and returns PhonePe standard checkout redirect URL.
  5. Creates a `Payment` record in PostgreSQL with `amountPaise: order.totalAmountPaise`, `status: 'INITIATED'`, and `merchantOrderId`.
- **Logic Applied**:
  - **Server-Authoritative Amount**: Amount sent to payment gateway is taken strictly from `order.totalAmountPaise` in DB.

---

### Step 8: Payment Execution & Gateway Settlement
- **In Development**:
  - User visits `/dev/payment-simulator/:transactionId` in browser and clicks **Simulate Success**, OR calls `POST /api/v1/dev/payments/:id/simulate` with `{ status: "SUCCESS" }`.
- **In Production**:
  - Customer completes payment on PhonePe gateway (UPI/Cards/Netbanking).
  - PhonePe sends server-to-server webhook callback to `/api/v1/webhooks/phonepe`.
  - The webhook handler validates PhonePe's HMAC-SHA256 signature (`X-VERIFY`).
- **Convergence**:
  - Both flows converge directly on the authoritative domain engine:
    ```ts
    await FinalizationService.finalizePaidOrder(orderId, verifiedPaymentReference);
    ```

---

### Step 9: Atomic Database Finalization Transaction
- **Method**: `FinalizationService.finalizePaidOrder(orderId, verifiedPaymentReference)`
- **Configuration**: PostgreSQL `$transaction` with `{ maxWait: 15000, timeout: 30000 }`.
- **10 Sequential Steps Inside Transaction**:
  1. **Idempotency Check**: If order is already `CONFIRMED` or `PAID`, returns existing data immediately with `alreadyFinalized: true`.
  2. **Payment Amount & Currency Verification**: Asserts `payment.amountPaise === order.totalAmountPaise` and `payment.currency === order.currency`.
  3. **Authoritative Provider Verification**: Verifies gateway status (`paymentProvider.getPaymentStatus`) confirms `SUCCESS`.
  4. **Customer Account Resolution (User)**:
     - Queries `users` table by `phoneE164: order.customerPhone`.
     - If user exists: links order to existing `user.id` (prevents duplicate accounts).
     - If user does not exist: creates new `User` with `role: MEMBER, status: ACTIVE, phoneVerifiedAt: new Date()`.
  5. **Network Identity Check**:
     - For `INITIAL_REGISTRATION`, checks if the user already owns an active `NetworkId`.
     - If yes: reuses existing node (enforces rule: 1 initial registration node per customer).
  6. **Ternary Placement Slot Assignment**:
     - If new node required: verifies sponsor node is `ACTIVE`.
     - Invokes `NetworkService.findPlacementSlot` using the transaction client (`tx`) to find direct slot or downline spillover.
     - Generates cryptographically random collision-resistant `publicId` (e.g. `TS-MMQ8X1-8FA9`) and `referralCode` (e.g. `TS8A71F0`).
     - Computes `placementDepth = parent.placementDepth + 1`.
     - Creates `NetworkId` record.
     - Creates `NetworkPlacement` record linking `(parentNetworkId, slotNumber, childNetworkId)` (enforced by DB `@@unique([parentNetworkId, slotNumber])`).
  7. **10-Level Upline Commission Allocation**:
     - Calls `CommissionsService.allocateCommissionsForOrder(tx, orderId, createdNetworkId)`.
     - Traverses up to 10 relative upline parent nodes.
     - Fetches active `CommissionRuleSet`.
     - Allocates commissions in `HELD` status per official schedule:
       - Level 1 (Direct sponsor): ₹500 (`50,000 paise`)
       - Level 2: ₹100 (`10,000 paise`)
       - Level 3: ₹75 (`7,500 paise`)
       - Level 4: ₹50 (`5,000 paise`)
       - Level 5: ₹25 (`2,500 paise`)
       - Level 6: ₹15 (`1,500 paise`)
       - Level 7: ₹10 (`1,000 paise`)
       - Level 8: ₹5 (`500 paise`)
       - Level 9: ₹3 (`300 paise`)
       - Level 10: ₹1 (`100 paise`)
  8. **Payment Record Update**: Updates `payments` table to `status: SUCCESS, verifiedAt: new Date()`.
  9. **Order Record Update**: Updates `orders` table to `status: CONFIRMED, paymentStatus: SUCCESS, paidAt: new Date()`.
  10. **Transactional Outbox & Audit Log**:
      - Creates `OutboxJob` with type `POST_PAYMENT_ORDER_FULFILLMENT` for async warehouse/ERP processing.
      - Creates `AuditLog` record documenting payment confirmation and network publicId.

---

### Step 10: Status Verification & Member Dashboard Inspection
- **APIs**:
  - `GET /api/v1/payments/:id/status` — Checks payment settlement & finalization status.
  - `GET /api/v1/me/orders/:orderId/registration-status` — Reads verified customer & network outcome.
  - `GET /api/v1/me/network-ids` — Lists all Network IDs owned by the authenticated user.
  - `GET /api/v1/me/network-ids/:id` — Inspects node metadata and direct upline parent.
  - `GET /api/v1/me/network-ids/:id/children` — Inspects direct 3 ternary placement slots (`1`, `2`, `3`).
  - `GET /api/v1/me/network-ids/:id/referral` — Retrieves personal referral link (`/register?ref=TSXXXXXX`) and referral count.

---

## 3. Security, Verification & Threat Model Audit

| Threat / Risk | Vulnerability Description | Mitigation & Architecture Defense in Tulsi MLM | Status |
| :--- | :--- | :--- | :---: |
| **Price Tampering** | Malicious client alters JSON payload to pay ₹1 instead of ₹500. | All amounts derive authoritatively from `products.pricePaise` in PostgreSQL. Client price inputs are completely ignored. Finalization validates `payment.amountPaise === order.totalAmountPaise`. | ✅ Verified Secure |
| **OTP Brute-Forcing** | Attacker attempts all 1,000,000 6-digit combinations. | Hard limit of 5 attempts (`maxAttempts: 5`). After 5 failures, challenge is permanently invalidated. 60-second resend cooldown limits request frequency. | ✅ Verified Secure |
| **Timing Side-Channel Attacks** | Attacker measures comparison execution time to infer correct OTP digits one by one. | Verification uses `crypto.timingSafeEqual` over SHA-256 hashes. Execution time is identical regardless of how many digits match. | ✅ Verified Secure |
| **Plaintext Credential Leaks** | Plaintext OTP exposed in database dumps or query logs. | Plaintext OTP is never stored in DB. Only SHA-256 `codeHash` is stored. | ✅ Verified Secure |
| **OTP Replay Attack** | Attacker intercepts a valid OTP and submits it again for another checkout. | Challenges are single-use (`consumedAt = new Date()`). Any consumed challenge is rejected immediately. | ✅ Verified Secure |
| **Checkout Bypass** | Client jumps directly to order confirmation without OTP verification. | `confirmCheckout` enforces `if (!session.phoneVerifiedAt) throw BadRequestError`. Database order creation is impossible without OTP verification. | ✅ Verified Secure |
| **Mock Gateway in Production** | Developer forgets mock flags in production, allowing free order confirmation. | `apps/web/src/lib/env.ts` enforces `NODE_ENV === 'production'`. Having `OTP_PROVIDER=mock` or `PAYMENT_PROVIDER=mock` causes an intentional server startup crash. Simulator routes return `403 Forbidden`. | ✅ Verified Secure |
| **Duplicate Network Nodes** | Double-clicking or network retries creating 2 network nodes for 1 order. | Wrapped in PostgreSQL `$transaction`. Order status guard returns early if already `CONFIRMED`. Max 1 active node per user rule on initial registration. | ✅ Verified Secure |
| **Matrix Slot Overwriting** | Two simultaneous registrations writing to the same slot under a sponsor. | PostgreSQL unique constraint `@@unique([parentNetworkId, slotNumber])` on `network_placements`. Collisions fail safely and trigger downline spillover. | ✅ Verified Secure |
| **Multi-Tenant Privacy Leak** | User A tries to view or crawl User B's network downline or earnings. | All `/api/v1/me/network-ids/*` routes enforce `if (node.ownerUserId !== requestingUserId) throw new ForbiddenError()`. | ✅ Verified Secure |
| **Database Pool Starvation** | Deep downline recursive placement queries holding connections for >30s. | BFS downline queue queries use lightweight indexed selects. Connection timeout configured with `maxWait: 15000, timeout: 30000`. | ✅ Verified Secure |

---

## 4. Key Implementation Rules (For Your Senior)

When explaining this implementation to your senior architect or engineering lead, emphasize these 5 pillars:

### 1. "How do we prevent duplicate accounts when an existing member buys again?"
> **Answer**: Account resolution is keyed on `phoneE164`. The finalization engine first queries `tx.user.findUnique({ where: { phoneE164 } })`. If an account already exists, the new order is linked to that existing customer without creating a duplicate record.

### 2. "How do we generate unique IDs without slow sequential record counting?"
> **Answer**: We generate collision-resistant, cryptographically random identifiers:
> - `publicId`: `TS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}` (e.g. `TS-MMQ8X1-8FA9`).
> - `referralCode`: `TS${crypto.randomBytes(3).toString('hex').toUpperCase()}` (e.g. `TS8A71F0`).
> This guarantees high throughput without table locks.

### 3. "How does the ternary tree placement work with spillover?"
> **Answer**: Each node has exactly 3 direct slots (`1`, `2`, `3`) mapped via `NetworkPlacement` with `@@unique([parentNetworkId, slotNumber])`. When a sponsor's direct slots 1, 2, and 3 are full, `NetworkService.findPlacementSlot` executes a breadth-first search (BFS) through the sponsor's downline to place the new member under the first available downline slot, creating automatic spillover.

### 4. "How do we guarantee PhonePe webhooks won't cause duplicate commissions?"
> **Answer**: `FinalizationService.finalizePaidOrder` is idempotent. Before running mutations, it checks `order.status`. If the order is already `CONFIRMED` or `PAID`, it immediately returns the existing result without executing additional database writes.

### 5. "How do we safely test without real PhonePe credentials?"
> **Answer**: We created a pluggable provider pattern via `PaymentProvider` interface. In development, `PAYMENT_PROVIDER=mock` enables our local payment simulator `/dev/payment-simulator/:transactionId`. The simulator invokes the exact same `FinalizationService.finalizePaidOrder` method that the live PhonePe webhook uses. When we receive PhonePe merchant credentials, we simply toggle `.env` to `PAYMENT_PROVIDER=phonepe` with zero changes to domain logic.

---

## 5. Automated Verification & Test Coverage Matrix

The entire checkout, payment, network creation, and security boundary is backed by automated Vitest tests.

### Current Test Execution Status
```text
Test Files  7 passed (7)
Tests       33 passed (33)
Build       Compiled successfully with 0 TypeScript errors (35 Next.js routes)
```

| Test Suite | Scenario Verified |
| :--- | :--- |
| `checkout-flow.test.ts` | Server-authoritative pricing (₹500 / 50,000 paise per unit). |
| `checkout-flow.test.ts` | Invalid quantity and invalid Indian phone rejection. |
| `otp.test.ts` | Timing-safe OTP hash comparison and single-use challenge consumption. |
| `otp.test.ts` | Rate limiting, cooldown, and 5-attempt brute-force lockout. |
| `production-safeguards.test.ts` | Strict rejection of `mock` providers and testing flags in `production`. |
| `hierarchy.test.ts` | Ternary tree capacity (max 3 direct children) and 10-level schedule. |
| `network-id-finalization.test.ts` | Successful mock payment creates `User` & `NetworkId`. |
| `network-id-finalization.test.ts` | Failed or pending payment does **not** create `NetworkId`. |
| `network-id-finalization.test.ts` | Existing verified phone reuses `User` without duplicate record. |
| `network-id-finalization.test.ts` | Repeating finalization is idempotent (no duplicate writes). |
| `network-id-finalization.test.ts` | Invalid payment amount or currency is rejected with `BadRequestError`. |
| `network-id-finalization.test.ts` | Inactive placement parent is rejected. |
| `network-id-finalization.test.ts` | Max 1 initial registration Network ID enforced per user. |
| `network-id-finalization.test.ts` | Spillover handles 4th child automatically into downline. |
| `network-id-finalization.test.ts` | Multi-tenant security: User A cannot view User B's network node (`403 Forbidden`). |
| `network-id-finalization.test.ts` | Transient database error rollback and clean retry. |

---

## 6. Conclusion
The checkout-to-network-registration lifecycle is fully implemented, strictly typed, cryptographically secure, and thoroughly tested. Everything from customer arrival to 10-level upline commission allocation functions reliably under local mock simulation and is ready for production gateway enablement.
