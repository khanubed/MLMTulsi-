# Commission Engine Testing & Verification Guide

This guide details testing procedures for the Tulsi Swaraj Commission Engine, covering Level 1 milestone evaluation, Levels 2–10 ancestor rewards, strict broken-path handling, incrementally maintained summaries, and reconciliation.

---

## 1. Running the Automated Test Suite

Execute the complete Vitest test suite covering all commission and payment scenarios:

```bash
pnpm --filter @tulsi/web test
```

### Key Scenarios Tested:
1. **Level 1 Milestone Lifecycle**:
   - `0/3` direct purchases: Level 1 total = ₹0.
   - `1/3` direct purchases: progress 1/3, Level 1 total = ₹0.
   - `2/3` direct purchases: progress 2/3, Level 1 total = ₹0.
   - `3/3` direct purchases: progress 3/3, exactly one ₹500 reward created in `HELD` status, Level 1 summary incremented to 50,000 paise.
   - `4/3` direct purchases: progress remains 3/3, zero duplicate Level 1 rewards issued.
   - Duplicate callbacks/orders: `Level1QualificationEvent` composite uniqueness rejects duplicates.
2. **Levels 2–10 Ancestor Traversal & Rates**:
   - Level 2: ₹100 (10,000 paise)
   - Level 3: ₹75 (7,500 paise)
   - Level 4: ₹50 (5,000 paise)
   - Level 5: ₹25 (2,500 paise)
   - Level 6: ₹15 (1,500 paise)
   - Level 7: ₹10 (1,000 paise)
   - Level 8: ₹5 (500 paise)
   - Level 9: ₹3 (300 paise)
   - Level 10: ₹1 (100 paise)
   - Payout stops after 10 levels.
   - Buyer is never awarded as their own ancestor.
3. **Strict Broken-Path Validation**:
   - Missing or corrupted intermediate parent placement stops traversal immediately.
   - Upper ancestors are not awarded across broken links.
   - Inactive ancestor records commission as `BLOCKED` with `blockReason: 'BENEFICIARY_INACTIVE'`.
4. **Incrementally Maintained Summaries (`NetworkLevelSummary`)**:
   - Adding a Level 2 commission atomically increments `earnedAmountPaise` and `heldAmountPaise` by 10,000.
   - Status transition `HELD -> APPROVED` decrements held and increments available.
   - Status transition `APPROVED -> PAID` decrements available and increments paid.
5. **Reconciliation Engine**:
   - Discrepancy detector flags corrupted summaries and restores ledger truth.
6. **Multi-Tenant Authorization**:
   - Unauthorized requests to another user's summary or commissions are rejected with `403 Forbidden`.

---

## 2. Manual API Verification (Local Dev Server)

### 2.1 Start Development Server
```bash
pnpm --filter @tulsi/web dev
```

### 2.2 Seed the Database
```bash
pnpm --filter @tulsi/web db:seed
```
This initializes:
- Company Root Node (`TULSI-ROOT-001`, referral: `TULSI01`)
- Test Distributor (`TS10001`, referral: `TULSI101`, phone: `+919876543210`)
- Flagship product (*Tulsi Meta Ved — Herbal Mix*, ₹500)
- Pre-initialized `NetworkLevelSummary` rows for Levels 1–10.

### 2.3 Query Member Commission Summary (O(1) Indexed Read)
```bash
curl -X GET http://localhost:3000/api/v1/me/commissions/summary \
  -H "Authorization: Bearer <member_jwt_or_demo_token>"
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "networkId": "3499426f-...",
    "publicId": "TS10001",
    "currency": "INR",
    "totalEarnedPaise": 0,
    "totalHeldPaise": 0,
    "totalAvailablePaise": 0,
    "totalPaidPaise": 0,
    "totalReversedPaise": 0,
    "totalEarnedRupees": 0,
    "totalAvailableRupees": 0,
    "levels": [
      {
        "levelNumber": 1,
        "earnedAmountPaise": 0,
        "heldAmountPaise": 0,
        "availableAmountPaise": 0,
        "paidAmountPaise": 0,
        "reversedAmountPaise": 0,
        "levelwiseTotalRupees": 0,
        "currency": "INR"
      },
      ...
      {
        "levelNumber": 10,
        "earnedAmountPaise": 0,
        "heldAmountPaise": 0,
        "availableAmountPaise": 0,
        "paidAmountPaise": 0,
        "reversedAmountPaise": 0,
        "levelwiseTotalRupees": 0,
        "currency": "INR"
      }
    ]
  }
}
```

### 2.4 Query Level 1 Milestone Progress
```bash
curl -X GET http://localhost:3000/api/v1/me/qualification-progress \
  -H "Authorization: Bearer <member_jwt_or_demo_token>"
```
**Expected Initial Response:**
```json
{
  "success": true,
  "data": {
    "networkId": "3499426f-...",
    "planVersion": "tulsi-v1",
    "directPurchaseCount": 0,
    "requiredDirectPurchases": 3,
    "progressPercentage": 0,
    "isCompleted": false,
    "rewardIssued": false,
    "rewardAmountRupees": 0,
    "completedAt": null
  }
}
```

---

## 3. Administrative Reconciliation Command

To run the reconciliation audit against all network summaries:
```typescript
import { CommissionReconciliationService } from '@/modules/commissions/commission-reconciliation.service';

const report = await CommissionReconciliationService.reconcileNetworkSummaries();
console.log(report);
```
If any discrepancy is detected:
```typescript
await CommissionReconciliationService.repairDiscrepancies(networkId);
```
