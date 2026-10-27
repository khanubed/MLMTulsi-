# Local Database Setup & Seeding Guide (Tulsi Swarojgar)

This guide documents the exact commands to set up, migrate, seed, and reset local development data for testing the Tulsi Swarojgar platform.

---

## 1. Prerequisites

- **Node.js**: v20 or v22
- **pnpm**: v10+ (`corepack enable pnpm`)
- **PostgreSQL**: A local Postgres instance running on port 5432 or a cloud database instance (e.g. Supabase, Neon).

---

## 2. Environment Configuration

Ensure `apps/web/.env` is configured with:

```env
NODE_ENV=development
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Provider selection for local testing
OTP_PROVIDER=mock
PAYMENT_PROVIDER=mock
MOCK_OTP_EXPOSE_CODE=true
MOCK_PAYMENT_ALLOW_SUCCESS=true

# Database connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tulsimlm?schema=public"
```

---

## 3. Database Migration & Client Generation

Run the following commands from the project root:

```bash
# 1. Validate the Prisma schema
pnpm --filter @tulsi/web prisma validate

# 2. Push schema changes directly to development database
pnpm --filter @tulsi/web db:push

# 3. Regenerate the Prisma Client
pnpm --filter @tulsi/web db:generate
```

---

## 4. Running the Seed Script

To populate the database with repeatable test fixtures:

```bash
pnpm --filter @tulsi/web db:seed
```

### Seed Fixtures Created:
1. **Flagship Product**:
   - Name: `Tulsi Meta Ved — Herbal Mix`
   - Slug: `tulsi-meta-ved-herbal-mix`
   - SKU: `META-VED-001`
   - Authoritative Price: ₹500.00 (`50,000 paise`)
   - Status: `PUBLISHED`, `isActive: true`
2. **Official Commission Rule Set (v1)**:
   - 10 Levels matching the verified schedule:
     - Level 1: ₹500 (`50,000 paise`)
     - Level 2: ₹100 (`10,000 paise`)
     - Level 3: ₹75 (`7,500 paise`)
     - Level 4: ₹50 (`5,000 paise`)
     - Level 5: ₹25 (`2,500 paise`)
     - Level 6: ₹15 (`1,500 paise`)
     - Level 7: ₹10 (`1,000 paise`)
     - Level 8: ₹5 (`500 paise`)
     - Level 9: ₹3 (`300 paise`)
     - Level 10: ₹1 (`100 paise`)
3. **Super Admin Account**:
   - Name: `System Administrator`
   - Phone: `+919999999999`
   - Email: `admin@tulsiswaraj.com`
   - Role: `SUPER_ADMIN`
4. **Company Root Network Node**:
   - Public ID: `TULSI-ROOT-001`
   - Referral Code: `TULSI01` (Use this for new registration testing!)
   - Placement Depth: `0`
5. **Example Test Member**:
   - Name: `Rajesh Sharma`
   - Phone: `+919876543210`
   - Network ID: `TS10001`
   - Referral Code: `TULSI101`
   - Placed at: `TULSI-ROOT-001` Slot 1

---

## 5. Starting the Application

```bash
pnpm --filter @tulsi/web dev
```

The storefront will be available at `http://localhost:3000`.

---

## 6. Running Automated Tests

```bash
pnpm --filter @tulsi/web test
```

---

## 7. Resetting Local Development Data

To safely wipe and reset all development records back to clean seed data:

```bash
# Push schema reset
pnpm --filter @tulsi/web prisma db push --force-reset

# Re-run seed
pnpm --filter @tulsi/web db:seed
```

---

## 8. Testing Checkout-to-Registration with Mock Gateway

1. **Initiate Checkout**:
   ```bash
   POST http://localhost:3000/api/v1/checkout/sessions
   Content-Type: application/json

   { "productId": "<PRODUCT_UUID>", "quantity": 1 }
   ```

2. **Confirm Registration & Create Order**:
   ```bash
   POST http://localhost:3000/api/v1/checkout/sessions/<SESSION_ID>/confirm
   Content-Type: application/json

   {
     "customerName": "Ramesh Kumar",
     "customerPhone": "+919876543210",
     "sponsorReferralCode": "TULSI01",
     "shippingAddress": {
       "line1": "123 Green Valley Road",
       "city": "Lucknow",
       "state": "Uttar Pradesh",
       "postalCode": "226001",
       "country": "IN"
     }
   }
   ```

3. **Simulate Payment Success**:
   ```bash
   POST http://localhost:3000/api/v1/dev/payments/<PAYMENT_ID_OR_TXN_REF>/simulate
   Content-Type: application/json

   { "status": "SUCCESS" }
   ```

4. **Inspect Generated Network ID & Registration Status**:
   ```bash
   # Read Registration Outcome
   GET http://localhost:3000/api/v1/me/orders/<ORDER_ID>/registration-status

   # View Owned Network IDs (pass x-user-id header or Auth cookie)
   GET http://localhost:3000/api/v1/me/network-ids

   # View Direct 3-slot Placements
   GET http://localhost:3000/api/v1/me/network-ids/<NETWORK_ID>/children

   # View Referral Code & Link
   GET http://localhost:3000/api/v1/me/network-ids/<NETWORK_ID>/referral
   ```

