# Database Architecture & Entity Specifications (PostgreSQL / Prisma)

This document describes the schema architecture, relational constraints, and transactional consistency models for Tulsi Swarojgar.

---

## 1. Schema Overview

The database contains 20 core models partitioned into functional sub-domains:

```
┌────────────────────────────────────────────────────────┐
│                        Identity                        │
│  - users             - sessions         - addresses    │
└────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                       Commerce                         │
│  - products          - product_images   - checkout_sessions
│  - orders            - order_items                     │
└────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                       Payments                         │
│  - payments          - payment_events   - otp_challenges
└────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                    MLM & Network                       │
│  - network_ids       - network_placements               │
│  - commission_rule_sets                 - commission_rules
│  - commissions       - wallet_ledger    - withdrawals  │
└────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                 System & Auditing                      │
│  - outbox_jobs       - audit_logs                      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Table Specifications

### 2.1 `checkout_sessions`
- **Purpose**: Tracks anonymous, multi-step customer checkout before payment confirmation.
- **Key Fields**:
  - `id`: UUID Primary Key.
  - `status`: `INITIATED`, `DETAILS_PROVIDED`, `PHONE_VERIFIED`, `CONFIRMED`, `EXPIRED`, `ABANDONED`.
  - `unitPricePaise` / `totalAmountPaise`: BigInt server-authoritative pricing (₹500 = 50,000 paise).
  - `shippingAddress`: Immutable JSON snapshot.
  - `orderId`: Unique foreign key to resulting `orders` record.
- **Indexes**: `[customerPhone]`, `[status, expiresAt]`.

### 2.2 `otp_challenges`
- **Purpose**: Cryptographic phone-binding challenges.
- **Key Fields**:
  - `codeHash`: SHA-256 hash of random 6-digit code.
  - `attemptCount` / `maxAttempts`: Hard limit of 5 verification attempts.
  - `consumedAt`: Timestamp set upon successful verification (prevents replay).
  - `checkoutSessionId`: Foreign key to `checkout_sessions`.
- **Indexes**: `[phoneE164, purpose]`, `[checkoutSessionId]`.

### 2.3 `orders`
- **Purpose**: Customer purchase agreements.
- **Key Fields**:
  - `userId`: Nullable UUID foreign key to `users` (assigned only after paid finalization).
  - `status`: `PENDING_PAYMENT`, `PAID`, `CONFIRMED`, `PAYMENT_FAILED`, `CANCELLED`, `EXCEPTION`.
  - `paymentStatus`: `INITIATED`, `PENDING`, `SUCCESS`, `FAILED`.
  - `shippingAddress`: Immutable JSON snapshot retained for legal/shipping records.
  - `shippingAddressId`: Optional foreign key to `addresses`.
- **Indexes**: `[createdAt]`, `[userId]`, `[status, paymentStatus]`.

### 2.4 `payments`
- **Purpose**: Authoritative payment gateway attempts.
- **Key Fields**:
  - `merchantOrderId`: Unique transaction reference sent to provider.
  - `provider`: `MOCK` or `PHONEPE`.
  - `isTestMode`: Boolean flag distinguishing sandbox/mock attempts.
  - `mockStatus`: State holder for developer payment simulation.
- **Indexes**: `[orderId, status]`.

### 2.5 `network_ids` & `network_placements`
- **Purpose**: Ternary tree structure (maximum 3 direct children per parent).
- **Constraints**:
  - `network_placements`: `@@unique([parentNetworkId, slotNumber])` enforces that only one child can ever occupy slot 1, 2, or 3 of any parent.
  - `network_placements`: `childNetworkId` is unique (a node can only be placed once in the tree).
  - Max IDs per user: 100 enforced by `NetworkService.assertUserCanOwnNetworkId`.

### 2.6 `commissions`
- **Purpose**: MLM earnings ledger.
- **Rules**:
  - `relativeLevel`: 1 to 10 relative to the purchasing node's upline.
  - `status`: Created in `HELD`.
  - `levelCompleteAt`: Recorded when all 3 direct children of that level are filled.

---

## 3. Concurrency & Transactional Guarantees

All critical state transitions (such as `finalizePaidRegistration`) run inside `prisma.$transaction`:
1. Database row locks are acquired for the order.
2. Placement slots are acquired via atomic `network_placements` insert; concurrent collisions trigger a unique key constraint violation that the service catches to automatically re-route via downline spillover.
3. User creation, order state update, network placement, upline commission calculation, and outbox job creation commit atomically or roll back completely.
