# Tulsi Swarojgar API Documentation

Base prefix: `/api/v1`

---

## 1. Product Catalogue

### `GET /api/v1/products`
Lists all active catalogue products.

### `GET /api/v1/products/[slug]`
Fetches product specifications by slug.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "c1f7a28b-...",
    "name": "Tulsi Meta Ved — Herbal Mix",
    "slug": "tulsi-meta-ved-herbal-mix",
    "sku": "META-VED-001",
    "description": "Vedic metabolic herbal blend...",
    "pricePaise": 50000,
    "displayPrice": 500,
    "currency": "INR",
    "isActive": true
  }
}
```

---

## 2. Purchase-Based Registration Checkout

### `POST /api/v1/checkout/sessions`
Starts a checkout session without user creation.

#### Request Body
```json
{
  "productSlug": "tulsi-meta-ved-herbal-mix",
  "quantity": 1,
  "purpose": "INITIAL_REGISTRATION"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "e6f47b2c-...",
    "productId": "c1f7a28b-...",
    "quantity": 1,
    "unitPricePaise": 50000,
    "totalAmountPaise": 50000,
    "status": "INITIATED",
    "purpose": "INITIAL_REGISTRATION",
    "expiresAt": "2026-10-23T16:00:00.000Z"
  }
}
```

---

### `PATCH /api/v1/checkout/sessions/[id]/details`
Saves customer contact details and delivery shipping address.

#### Request Body
```json
{
  "fullName": "Amit Verma",
  "phone": "9876543210",
  "email": "amit.verma@example.com",
  "shippingAddress": {
    "fullName": "Amit Verma",
    "phone": "9876543210",
    "addressLine1": "Flat 402, Green Meadows",
    "addressLine2": "Sector 14",
    "landmark": "Near Community Park",
    "city": "Gurugram",
    "state": "Haryana",
    "postalCode": "122001",
    "country": "India"
  }
}
```

---

### `POST /api/v1/checkout/sessions/[id]/referral/validate`
Validates sponsor referral code and computes ternary tree placement.

#### Request Body
```json
{
  "referralCode": "TULSI01",
  "preferredSlot": 1
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "sessionId": "e6f47b2c-...",
    "referralCode": "TULSI01",
    "sponsor": {
      "publicId": "TULSI-ROOT-001",
      "referralCode": "TULSI01",
      "ownerName": "System Administrator"
    },
    "placement": {
      "parentId": "0a9b8c7d-...",
      "slotNumber": 2,
      "isSpillover": false
    }
  }
}
```

---

### `POST /api/v1/checkout/sessions/[id]/phone/otp/request`
Generates a cryptographic 6-digit challenge code and invokes `OtpProvider`.

#### Response (200 OK — Development Environment)
```json
{
  "success": true,
  "data": {
    "challengeId": "9f3b1e2a-...",
    "phone": "+919876543210",
    "expiresInSeconds": 300,
    "developmentOtp": "748291"
  }
}
```

---

### `POST /api/v1/checkout/sessions/[id]/phone/otp/verify`
Verifies the submitted challenge code using SHA-256 and timing-safe equality.

#### Request Body
```json
{
  "challengeId": "9f3b1e2a-...",
  "code": "748291"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "verified": true,
    "phone": "+919876543210",
    "verifiedAt": "2026-10-23T15:05:00.000Z",
    "isExistingUser": false
  }
}
```

---

### `POST /api/v1/checkout/sessions/[id]/confirm`
Validates all checkout prerequisites and locks a pending `Order`.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "orderId": "b4c5d6e7-...",
    "orderNumber": "TS-104928-AB3F",
    "status": "PENDING_PAYMENT",
    "paymentStatus": "INITIATED",
    "totalAmountPaise": 50000,
    "currency": "INR",
    "customerName": "Amit Verma",
    "customerPhone": "+919876543210"
  }
}
```

---

## 3. Payments

### `POST /api/v1/payments/checkout`
Initiates payment for a confirmed order.

#### Request Body
```json
{
  "orderId": "b4c5d6e7-..."
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "paymentId": "f1e2d3c4-...",
    "orderId": "b4c5d6e7-...",
    "merchantTransactionId": "TXN_1729676800000_XY7Z",
    "amountPaise": 50000,
    "currency": "INR",
    "checkoutUrl": "/dev/payment-simulator/TXN_1729676800000_XY7Z",
    "isTestMode": true
  }
}
```

---

### `GET /api/v1/payments/[id]/status`
Checks authoritative provider status and executes finalization on success.

---

## 4. Development Payment Simulator (Development Only)

Protected endpoints available only when `NODE_ENV !== 'production'` and `PAYMENT_PROVIDER === 'mock'`:

- `GET /api/v1/dev/payment-simulator/[transactionId]`
- `POST /api/v1/dev/payment-simulator/[transactionId]/success`
- `POST /api/v1/dev/payment-simulator/[transactionId]/failure`
- `POST /api/v1/dev/payment-simulator/[transactionId]/pending`
- UI: `/dev/payment-simulator/[transactionId]`
