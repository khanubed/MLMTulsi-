# End-to-End System Flows: Checkout, Payment, & Registration

This document details the authoritative sequence and state machine transitions for the 11-step purchase-based registration, payment simulation, and MLM hierarchy placement flow.

---

## Complete 11-Step Purchase-Based Registration Journey

```
Customer Browser                   Next.js Server / API               Database / Providers
       │                                     │                                  │
[Step 1: Product View]                       │                                  │
       │────── GET /api/v1/products/slug ───►│                                  │
       │◄───── 200 OK (Authoritative ₹500)──│                                  │
       │                                     │                                  │
[Step 2: Start Checkout]                     │                                  │
       │────── POST /checkout/sessions ─────►│                                  │
       │                                     │── INSERT INTO checkout_sessions ─►
       │◄───── 201 Created (sessionId) ─────│                                  │
       │                                     │                                  │
[Step 3: Details & Address]                  │                                  │
       │────── PATCH .../sessions/[id]/dtls ─►│                                  │
       │                                     │── Validate strict Indian Phone ───
       │                                     │── UPDATE checkout_sessions ──────►
       │◄───── 200 OK (DETAILS_PROVIDED) ───│                                  │
       │                                     │                                  │
[Step 4: Referral Validation]                │                                  │
       │────── POST .../referral/validate ──►│                                  │
       │                                     │── NetworkService.findPlacement ──►
       │◄───── 200 OK (Sponsor & Slot) ─────│                                  │
       │                                     │                                  │
[Step 5: OTP Request]                        │                                  │
       │────── POST .../phone/otp/request ──►│                                  │
       │                                     │── INSERT INTO otp_challenges ────►
       │                                     │── OtpProvider.sendOtp(code) ────►
       │◄───── 200 OK (challengeId) ────────│                                  │
       │                                     │                                  │
[Step 6: OTP Verification]                   │                                  │
       │────── POST .../phone/otp/verify ───►│                                  │
       │                                     │── Timing-safe SHA-256 match ─────
       │                                     │── UPDATE otp_challenges consumed ─►
       │                                     │── UPDATE sessions PHONE_VERIFIED ─►
       │◄───── 200 OK (verified: true) ─────│                                  │
       │                                     │                                  │
[Step 7: Confirm Checkout]                   │                                  │
       │────── POST .../sessions/[id]/confirm►│                                 │
       │                                     │── INSERT INTO orders (PENDING) ──►
       │◄───── 200 OK (orderId) ────────────│                                  │
       │                                     │                                  │
[Step 8: Initiate Payment]                   │                                  │
       │────── POST /payments/checkout ─────►│                                  │
       │                                     │── PaymentProvider.createPayment ─►
       │                                     │── INSERT INTO payments (INIT) ───►
       │◄───── 201 Created (checkoutUrl) ───│                                  │
       │                                     │                                  │
[Step 9: Simulate Payment (Dev)]             │                                  │
       │── POST /dev/payments/:id/simulate ─►│                                  │
       │                                     │── UPDATE payments SUCCESS ───────►
       │                                     │── FinalizationService ──────────►│
       │◄───── 200 OK (Finalized) ──────────│                                  │
       │                                     │                                  │
[Step 10: Status Verification]               │                                  │
       │────── GET /payments/[id]/status ───►│                                  │
       │                                     │── Authoritative DB status query ─►
       │◄───── 200 OK (SUCCESS, order data) ─│                                  │
       │                                     │                                  │
[Step 11: Finalization Consequences]         │                                  │
       │                                     │── 1. Create User (if new) ───────►
       │                                     │── 2. Create NetworkId ───────────►
       │                                     │── 3. Insert NetworkPlacement ────►
       │                                     │── 4. Allocate 10-Level Comm (HELD)►
       │                                     │── 5. Order marked PAID ──────────►
       │                                     │── 6. Outbox Job Created ─────────►
       │                                     │── 7. Audit Log Created ──────────►
```

---

## State Transition Machines

### 1. Checkout Session State Machine
```
[INITIATED] ────────► [DETAILS_PROVIDED] ────────► [PHONE_VERIFIED] ────────► [CONFIRMED]
     │                      │                            │                        │
     └──────────────────────┴────────────► [EXPIRED] ◄───┴────────────────────────┘
```

### 2. Order State Machine
```
[PENDING_PAYMENT] ───► [CONFIRMED / PAID] ───► [PROCESSING] ───► [SHIPPED] ───► [DELIVERED]
        │
        └───► [PAYMENT_FAILED] ───► [CANCELLED]
```

### 3. Payment State Machine
```
[INITIATED] ───► [PENDING] ───► [SUCCESS] (triggers FinalizationService)
     │
     └───► [FAILED]
```

---

## Finalization Safeguards (`finalizePaidOrder`)

1. **Server Authoritative Pricing**: Order amount is computed solely on the server from `Product.pricePaise`.
2. **Account Creation Timing**: No `User` or `NetworkId` is created until payment is authoritatively verified as `SUCCESS`. Abandoned carts never pollute the database.
3. **No Duplicate Accounts**: Verified `phoneE164` acts as a unique human identifier. If a phone exists, the order is attached to the existing `User` account.
4. **Strict Matrix Placement**:
   - Placement is assigned into a 3-slot matrix via `network_placements`.
   - Direct slots 1, 2, and 3 are filled first; subsequent registrations spill over using breadth-first traversal.
   - Normal checkout registrations cannot create a root node.
5. **10-Level Commission Allocation**:
   - Commissions are calculated relative to the newly activated node for 10 ascending upline levels.
   - All commissions are initially saved in `HELD` status until administrative review or return window expiry.
6. **Idempotency**: Repeated webhooks, simulator calls, or manual retries safely return the existing finalized record without duplicate inserts.
