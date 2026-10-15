# Tulsi Swaraj E-commerce Platform --- Technical Architecture

**Version:** 1.0\
**Status:** Proposed implementation baseline\
**Backend:** Node.js + Express.js + TypeScript\
**Database:** PostgreSQL\
**Payment gateway:** PhonePe Payment Gateway\
**Repository:** pnpm workspace monorepo (recommended)

------------------------------------------------------------------------

## 1. Architecture goals

-   Keep the frontend, backend API, and shared contracts in one
    maintainable repository.
-   Use PostgreSQL as the source of truth for products, orders, and
    payments.
-   Keep payment credentials and all payment verification on the server.
-   Separate order fulfilment state from payment state.
-   Use explicit modules and boundaries without premature microservices.
-   Make it straightforward to test checkout, webhooks, and order state
    transitions.
-   Preserve the existing frontend and integrate it incrementally rather
    than rewriting it unnecessarily.

## 2. High-level architecture

``` mermaid
flowchart TD
    C[Customer Browser] --> W[Storefront Web App]
    A[Admin Browser] --> W
    W -->|HTTPS JSON API| API[Express API]
    API --> AUTH[Auth and Authorization]
    API --> CAT[Catalogue Module]
    API --> CHECK[Checkout and Orders]
    API --> PAY[Payments Module]
    API --> ADMIN[Admin Module]
    CAT --> DB[(PostgreSQL)]
    CHECK --> DB
    PAY --> DB
    ADMIN --> DB
    PAY -->|Create payment / status check| PP[PhonePe PG]
    PP -->|Authenticated callback/webhook| API
    API --> LOG[Structured Logs and Monitoring]
```

### Request and payment boundaries

-   The browser calls the API; it never talks to PhonePe using merchant
    secrets.
-   The API validates input and uses the database to calculate
    authoritative prices.
-   PhonePe is an external payment provider. Its exact request/response
    format must be implemented according to the official documentation
    for the merchant account's enabled API version.
-   Payment callbacks are verified and processed idempotently.
-   A frontend return URL is not proof of payment.
-   Do not split the API into microservices for v1.

## 3. Recommended monorepo structure

Use `pnpm` workspaces with TypeScript. If the existing frontend already
uses another package manager, retain it unless there is a clear reason
to migrate.

``` text
tulsi-swaraj/
├── apps/
│   ├── web/                           # Existing customer storefront
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/                   # Or pages/, depending on current framework
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   ├── product/
│   │   │   │   ├── cart/
│   │   │   │   └── checkout/
│   │   │   ├── features/
│   │   │   │   ├── catalogue/
│   │   │   │   ├── cart/
│   │   │   │   ├── checkout/
│   │   │   │   └── orders/
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts
│   │   │   │   └── env.ts
│   │   │   └── styles/
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── api/                           # Node + Express backend
│   │   ├── src/
│   │   │   ├── app.ts                 # Express app composition
│   │   │   ├── server.ts              # Startup and graceful shutdown
│   │   │   ├── config/
│   │   │   │   ├── env.ts             # Validated environment schema
│   │   │   │   ├── database.ts        # PostgreSQL/ORM client
│   │   │   │   ├── cors.ts
│   │   │   │   └── logger.ts
│   │   │   ├── routes/
│   │   │   │   ├── index.ts
│   │   │   │   ├── health.routes.ts
│   │   │   │   ├── products.routes.ts
│   │   │   │   ├── checkout.routes.ts
│   │   │   │   ├── orders.routes.ts
│   │   │   │   ├── payments.routes.ts
│   │   │   │   └── admin.routes.ts
│   │   │   ├── middleware/
│   │   │   │   ├── authenticate.ts
│   │   │   │   ├── authorize.ts
│   │   │   │   ├── validate.ts
│   │   │   │   ├── rate-limit.ts
│   │   │   │   ├── request-id.ts
│   │   │   │   ├── not-found.ts
│   │   │   │   └── error-handler.ts
│   │   │   ├── modules/
│   │   │   │   ├── catalogue/
│   │   │   │   │   ├── product.controller.ts
│   │   │   │   │   ├── product.service.ts
│   │   │   │   │   ├── product.repository.ts
│   │   │   │   │   ├── product.schema.ts
│   │   │   │   │   └── product.routes.ts
│   │   │   │   ├── checkout/
│   │   │   │   │   ├── checkout.controller.ts
│   │   │   │   │   ├── checkout.service.ts
│   │   │   │   │   ├── checkout.schema.ts
│   │   │   │   │   └── checkout.routes.ts
│   │   │   │   ├── orders/
│   │   │   │   │   ├── order.controller.ts
│   │   │   │   │   ├── order.service.ts
│   │   │   │   │   ├── order.repository.ts
│   │   │   │   │   └── order-state.ts
│   │   │   │   ├── payments/
│   │   │   │   │   ├── payment.controller.ts
│   │   │   │   │   ├── payment.service.ts
│   │   │   │   │   ├── payment.repository.ts
│   │   │   │   │   ├── payment-provider.ts
│   │   │   │   │   ├── phonepe.provider.ts
│   │   │   │   │   ├── phonepe.callback.ts
│   │   │   │   │   ├── payment-state.ts
│   │   │   │   │   └── payment.routes.ts
│   │   │   │   ├── admin/
│   │   │   │   │   ├── admin.controller.ts
│   │   │   │   │   ├── admin.service.ts
│   │   │   │   │   └── admin.routes.ts
│   │   │   │   └── auth/
│   │   │   │       ├── auth.controller.ts
│   │   │   │       ├── auth.service.ts
│   │   │   │       ├── session.repository.ts
│   │   │   │       └── auth.routes.ts
│   │   │   ├── jobs/                  # Optional reconciliation/cleanup jobs
│   │   │   ├── utils/
│   │   │   └── types/
│   │   ├── prisma/                    # If Prisma is selected
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── admin/                         # Optional separate admin UI; can be omitted in v1
│       └── ...
│
├── packages/
│   ├── contracts/                     # Shared request/response schemas and DTOs
│   │   ├── src/
│   │   │   ├── product.ts
│   │   │   ├── checkout.ts
│   │   │   ├── order.ts
│   │   │   └── index.ts
│   │   └── package.json
│   ├── config/                        # Shared ESLint/TypeScript configuration
│   ├── ui/                            # Optional shared UI components
│   └── utils/                         # Small framework-independent helpers only
│
├── docs/
│   ├── prd.md
│   └── architecture.md
├── scripts/
│   ├── dev-setup.*
│   └── seed-admin.*
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.base.json
└── README.md
```

### Structure notes

-   `apps/web` represents the existing storefront; adapt the internal
    paths to the actual framework instead of forcing a Next.js or Vite
    migration.
-   `apps/api` contains the Express application.
-   `apps/admin` is optional. If no separate admin UI is required
    initially, expose protected admin API routes and add the dashboard
    later.
-   `packages/contracts` can share Zod schemas/DTO types between the
    frontend and backend, but do not import backend-only code into the
    browser.
-   Avoid a generic `shared` package that accumulates unrelated business
    logic.
-   Keep `phonepe.provider.ts` as the provider-specific adapter so
    provider details do not leak through order/checkout modules.
-   The suggested ORM is Prisma because it provides migrations, typed
    queries, and a practical PostgreSQL workflow. Drizzle or SQL can
    also work; choose one and use it consistently.

## 4. Backend architectural pattern

Use a modular monolith with a clear request path:

`Route → Middleware → Controller → Service → Repository/ORM → PostgreSQL`

-   **Routes:** HTTP method/path and middleware composition.
-   **Middleware:** authentication, authorization, validation, rate
    limiting, request IDs.
-   **Controllers:** translate HTTP requests/responses; avoid business
    logic.
-   **Services:** business rules and transaction orchestration.
-   **Repositories:** focused data access functions; do not create
    abstractions with no benefit.
-   **Provider adapter:** implements PhonePe-specific network calls and
    response verification.
-   **Database:** authoritative persisted state.

### Suggested libraries

Select stable compatible versions at implementation time: - TypeScript
and Node.js LTS. - Express. - Prisma ORM with PostgreSQL, or another ORM
chosen by the team. - Zod for environment, request, and response
validation. - Pino or another structured logger. - Helmet for HTTP
security headers. - A rate-limiting library for public/auth endpoints. -
Vitest or Jest for tests. - Supertest for Express integration tests. - A
supported PhonePe SDK if the merchant's selected API version has an
official SDK; otherwise implement the documented protocol carefully.

Do not install every suggested library automatically. Check the existing
repository first and avoid duplicate tooling.

## 5. PostgreSQL data model

Use UUID primary keys for internal entities and explicit timestamps. Use
`NUMERIC` only when necessary; for INR transaction amounts, integer
paise stored as `BIGINT` is a straightforward approach. Validate values
remain within safe application integer bounds.

### 5.1 `products`

-   `id UUID PRIMARY KEY`
-   `slug TEXT UNIQUE NOT NULL`
-   `name TEXT NOT NULL`
-   `description TEXT`
-   `price_paise BIGINT NOT NULL CHECK (price_paise >= 0)`
-   `currency CHAR(3) NOT NULL DEFAULT 'INR'`
-   `sku TEXT UNIQUE NULL`
-   `status TEXT NOT NULL` --- e.g. `DRAFT`, `PUBLISHED`, `ARCHIVED`
-   `stock_quantity INTEGER NULL` --- null only if the business
    intentionally uses a non-tracked availability model
-   `track_inventory BOOLEAN NOT NULL DEFAULT false`
-   `created_at TIMESTAMPTZ NOT NULL`
-   `updated_at TIMESTAMPTZ NOT NULL`

Initial product seed: - Name: `Tulsi Meta Ved Herbal Mix` - Slug:
`tulsi-meta-ved-herbal-mix` - Price: `50000` paise - Currency: `INR` -
Status: `DRAFT` until verified product content is approved; publish only
when ready.

### 5.2 `product_images`

-   `id UUID PRIMARY KEY`
-   `product_id UUID REFERENCES products(id)`
-   `url TEXT NOT NULL`
-   `alt_text TEXT`
-   `sort_order INTEGER NOT NULL DEFAULT 0`
-   `created_at TIMESTAMPTZ NOT NULL`

Store image files in object storage/CDN, not as large binary blobs in
PostgreSQL. The URL should reference a trusted asset location.

### 5.3 `orders`

-   `id UUID PRIMARY KEY`
-   `order_number TEXT UNIQUE NOT NULL`
-   `customer_name TEXT NOT NULL`
-   `customer_phone TEXT NOT NULL`
-   `customer_email TEXT NULL`
-   `shipping_address JSONB NOT NULL` --- snapshot at purchase time
-   `currency CHAR(3) NOT NULL DEFAULT 'INR'`
-   `subtotal_paise BIGINT NOT NULL`
-   `shipping_paise BIGINT NOT NULL DEFAULT 0`
-   `tax_paise BIGINT NOT NULL DEFAULT 0`
-   `discount_paise BIGINT NOT NULL DEFAULT 0`
-   `total_paise BIGINT NOT NULL`
-   `status TEXT NOT NULL`
-   `payment_status TEXT NOT NULL`
-   `idempotency_key TEXT NULL`
-   `created_at TIMESTAMPTZ NOT NULL`
-   `updated_at TIMESTAMPTZ NOT NULL`

Add a unique constraint scoped appropriately to the
checkout/customer/session if idempotency keys are persisted. Do not make
a globally shared client-provided key the sole security control.

### 5.4 `order_items`

-   `id UUID PRIMARY KEY`
-   `order_id UUID REFERENCES orders(id) ON DELETE RESTRICT`
-   `product_id UUID REFERENCES products(id) ON DELETE RESTRICT`
-   `product_name_snapshot TEXT NOT NULL`
-   `product_slug_snapshot TEXT NOT NULL`
-   `sku_snapshot TEXT NULL`
-   `unit_price_paise BIGINT NOT NULL`
-   `quantity INTEGER NOT NULL CHECK (quantity > 0)`
-   `line_total_paise BIGINT NOT NULL`

Order item snapshots must remain correct if a product is renamed or
repriced later.

### 5.5 `payments`

-   `id UUID PRIMARY KEY`
-   `order_id UUID REFERENCES orders(id) ON DELETE RESTRICT`
-   `provider TEXT NOT NULL` --- `PHONEPE`
-   `merchant_order_reference TEXT UNIQUE NOT NULL`
-   `provider_transaction_reference TEXT NULL`
-   `amount_paise BIGINT NOT NULL`
-   `currency CHAR(3) NOT NULL DEFAULT 'INR'`
-   `status TEXT NOT NULL`
-   `provider_status TEXT NULL`
-   `checkout_url TEXT NULL` --- only if the chosen API returns one
-   `initiated_at TIMESTAMPTZ NULL`
-   `verified_at TIMESTAMPTZ NULL`
-   `created_at TIMESTAMPTZ NOT NULL`
-   `updated_at TIMESTAMPTZ NOT NULL`

Do not persist access tokens, signing secrets, or unnecessary raw
payment payloads in this table.

### 5.6 `payment_events` / `webhook_events`

-   `id UUID PRIMARY KEY`
-   `provider TEXT NOT NULL`
-   `provider_event_id TEXT NULL`
-   `merchant_order_reference TEXT NULL`
-   `event_type TEXT NOT NULL`
-   `verification_result TEXT NOT NULL`
-   `payload_hash TEXT NULL`
-   `received_at TIMESTAMPTZ NOT NULL`
-   `processed_at TIMESTAMPTZ NULL`
-   `processing_result TEXT NULL`

Use a unique provider event ID where the provider supplies a stable ID.
If it does not, use a carefully designed idempotency key derived from
verified provider fields and persist enough information to avoid replay
side effects. Do not log secrets or sensitive payload fields.

### 5.7 `admin_users`

-   `id UUID PRIMARY KEY`
-   `email CITEXT UNIQUE NOT NULL` (or normalized lowercase `TEXT`)
-   `password_hash TEXT NOT NULL`
-   `role TEXT NOT NULL`
-   `is_active BOOLEAN NOT NULL DEFAULT true`
-   `last_login_at TIMESTAMPTZ NULL`
-   `created_at TIMESTAMPTZ NOT NULL`
-   `updated_at TIMESTAMPTZ NOT NULL`

### 5.8 `order_status_history`

-   `id UUID PRIMARY KEY`
-   `order_id UUID REFERENCES orders(id) ON DELETE RESTRICT`
-   `old_status TEXT NULL`
-   `new_status TEXT NOT NULL`
-   `changed_by_admin_id UUID NULL REFERENCES admin_users(id)`
-   `reason TEXT NULL`
-   `created_at TIMESTAMPTZ NOT NULL`

### 5.9 Indexes and constraints

At minimum: - Unique index on `products.slug`. - Index on
`products.status`. - Unique index on `orders.order_number`. - Index on
`orders.created_at`. - Index on `orders.status` and
`orders.payment_status`. - Index on `orders.customer_phone` only if
operationally needed and with appropriate access controls. - Unique
index on `payments.merchant_order_reference`. - Index on
`payments.order_id` and `payments.status`. - Index on
`payment_events.merchant_order_reference`. - Check constraints for
non-negative monetary fields and positive quantities. - Foreign keys for
all relationships.

Review query plans before adding speculative indexes.

## 6. Order and payment state machines

Keep order state and payment state separate.

### Order state (example)

``` text
PENDING_PAYMENT
  ├── payment verified successful → CONFIRMED
  ├── customer abandons / payment fails → remain pending or mark PAYMENT_FAILED according to policy
  └── payment mismatch / uncertain result → PAYMENT_REVIEW

CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    └── cancellation only when business policy allows it
```

### Payment state (example)

``` text
INITIATED → PENDING → SUCCESS
                    ├→ FAILED
                    ├→ CANCELLED
                    └→ RECONCILIATION_REQUIRED
```

Use explicit transition functions that reject invalid transitions. A
delayed callback may arrive after the browser has returned; processing
must still result in the correct final state. A failed attempt may allow
a new payment attempt while preserving the original attempt for audit.

Do not transition a payment from verified `SUCCESS` back to `FAILED` due
to a later stale event. Reconcile unexpected state changes with the
provider status API and an auditable process.

## 7. Checkout and PhonePe sequence

``` mermaid
sequenceDiagram
    participant U as Customer Browser
    participant A as Express API
    participant D as PostgreSQL
    participant P as PhonePe
    U->>A: POST /api/v1/checkout (items, customer, idempotency key)
    A->>D: Load products, validate prices/availability
    A->>D: Transaction: create order, order items, payment attempt
    A->>P: Create payment request using server credentials
    P-->>A: Provider reference and checkout/redirect data
    A->>D: Persist provider reference and pending state
    A-->>U: Return order reference and checkout handoff URL/data
    U->>P: Customer completes hosted payment flow
    P-->>A: Authenticated callback/webhook
    A->>A: Verify callback according to official PhonePe API version
    A->>D: Idempotently record event and update payment/order
    U->>A: Return/status page requests order status
    A->>P: Status check if needed/uncertain
    P-->>A: Verified provider status
    A->>D: Reconcile state
    A-->>U: Return safe server-verified status
```

### Critical implementation details

1.  Recalculate all prices on the server from product IDs and current
    database values.
2.  Create the order and payment attempt transactionally. External
    network calls cannot participate in a PostgreSQL transaction, so
    design recovery for a provider request that times out after the
    provider may have accepted it.
3.  Use a unique merchant order reference per payment attempt.
4.  Use the current PhonePe documentation for request
    signing/authentication, callback verification, status checks, and
    redirect handling. Do not copy an outdated integration snippet
    without confirming its API version.
5.  Verify callbacks before applying state changes.
6.  Persist event/idempotency information and apply state changes in a
    database transaction.
7.  If the provider response is ambiguous, keep the payment
    pending/reconciliation-required and query status; do not assume
    failure or success.
8.  Browser return pages should query the backend for status and show
    pending states when necessary.
9.  Keep PhonePe secrets only in the API environment.
10. Add tests for success, failure, duplicate callback, invalid
    callback, timeout, delayed callback, and amount/reference mismatch.

## 8. API design conventions

### Base path

`/api/v1`

### Response shape

Use one consistent response contract, for example:

``` json
{
  "data": {},
  "error": null,
  "meta": {
    "requestId": "request-id"
  }
}
```

For errors:

``` json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the submitted details.",
    "fields": {}
  },
  "meta": {
    "requestId": "request-id"
  }
}
```

Do not expose stack traces or provider secrets in production responses.

### Public endpoints

-   `GET /health/live` --- process liveness.
-   `GET /health/ready` --- readiness including required dependency
    checks.
-   `GET /api/v1/products` --- published products, with pagination if
    needed.
-   `GET /api/v1/products/:slug` --- published product details.
-   `POST /api/v1/checkout` --- validate and create order/payment
    attempt.
-   `GET /api/v1/orders/:orderNumber/status` --- return only safe fields
    and require a secure access mechanism.

### Payment endpoints

-   `POST /api/v1/payments/phonepe/callback` --- method and verification
    protocol must match the configured PhonePe API version.
-   `GET /api/v1/payments/phonepe/return` --- optional browser return
    route; never authoritative.
-   An internal/admin-only reconciliation endpoint or job for pending
    payments.

### Admin endpoints

-   `POST /api/v1/admin/auth/login`
-   `POST /api/v1/admin/auth/logout`
-   `GET /api/v1/admin/products`
-   `POST /api/v1/admin/products`
-   `PATCH /api/v1/admin/products/:id`
-   `GET /api/v1/admin/orders`
-   `GET /api/v1/admin/orders/:id`
-   `PATCH /api/v1/admin/orders/:id/fulfilment`

Use schema validation for body, query, and path parameters. Paginate
admin collections and apply authorization at the route and service
boundary where needed.

## 9. Security architecture

-   Enforce HTTPS in production.
-   Validate all environment variables at startup and fail fast if
    required values are missing.
-   Restrict CORS to the deployed storefront/admin origins.
-   Use Helmet and appropriate request-size limits.
-   Apply rate limits to login, checkout, and status-check endpoints.
-   Use secure session cookies or a carefully designed token strategy;
    do not store long-lived admin tokens in local storage.
-   Add CSRF protection when cookie-based authentication is used.
-   Hash passwords with Argon2id or bcrypt.
-   Use least-privilege database credentials.
-   Keep `.env` out of Git and provide only placeholders in
    `.env.example`.
-   Redact credentials, auth headers, phone/email/address where
    possible, and payment payload secrets from logs.
-   Verify PhonePe callback authentication according to the selected
    integration's official requirements.
-   Never trust a client-supplied total, order status, or payment
    success flag.
-   Keep administrative product and order operations auditable.
-   Define a retention and deletion policy for customer personal data.

## 10. Environment configuration

Example variable names only; exact PhonePe variables depend on the
selected API version and merchant account:

``` dotenv
NODE_ENV=development
PORT=4000
API_BASE_URL=http://localhost:4000
WEB_ORIGIN=http://localhost:3000

DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/tulsi_swaraj

SESSION_SECRET=replace-with-long-random-secret
ADMIN_BOOTSTRAP_EMAIL=
ADMIN_BOOTSTRAP_PASSWORD=

PHONEPE_ENV=sandbox
PHONEPE_CLIENT_ID=
PHONEPE_CLIENT_SECRET=
PHONEPE_CLIENT_VERSION=
PHONEPE_MERCHANT_ID=
PHONEPE_CALLBACK_URL=
PHONEPE_REDIRECT_URL=

LOG_LEVEL=info
```

-   Do not assume every variable above applies to every PhonePe
    integration version. Keep only the exact values required by the
    chosen official API.
-   Use sandbox credentials locally and in staging.
-   Never place PhonePe credentials in frontend environment variables or
    any variable prefixed with a browser-exposed convention such as
    `NEXT_PUBLIC_` or `VITE_`.
-   Production secrets should be stored in the hosting provider's secret
    manager.

## 11. Local development and workspace scripts

Example root scripts: - `pnpm dev` --- run web and API in development. -
`pnpm dev:web` --- run storefront only. - `pnpm dev:api` --- run API
only. - `pnpm build` --- build all applications/packages. - `pnpm lint`
--- lint workspace. - `pnpm typecheck` --- TypeScript checks. -
`pnpm test` --- run tests. - `pnpm db:migrate` --- apply local database
migrations. - `pnpm db:seed` --- seed development product data. -
`pnpm db:studio` --- open ORM database UI if supported.

Use `concurrently`, Turbo, or another workspace runner only if it solves
a real need. Do not add a task runner just for the sake of it.

## 12. Testing strategy

### Unit tests

-   Price calculation and integer-paise arithmetic.
-   Quantity validation.
-   Order/payment state transitions.
-   Idempotency decisions.
-   PhonePe adapter response parsing and verification helpers.

### Integration tests

-   PostgreSQL migrations and repository behavior.
-   Checkout order creation and rollback cases.
-   Product unpublished/unavailable and price-changed cases.
-   Admin authorization.
-   Callback verification and duplicate-event handling.

### End-to-end tests

-   Home page → scroll popup → Buy Now → checkout.
-   Product page → checkout.
-   PhonePe sandbox success and failure.
-   Customer returns before callback and sees pending state.
-   Delayed callback updates the order.
-   Repeated click does not create duplicate orders.
-   Admin views paid order and updates fulfilment.

Use a test database and mocked provider responses for most automated
tests. Use the PhonePe sandbox for provider-level validation.

## 13. Deployment and operations

A simple production deployment can consist of: - Frontend hosting
compatible with the current web framework. - Node.js API service. -
Managed PostgreSQL with automated backups and restricted network
access. - Object storage/CDN for product images. - Secret
manager/environment configuration. - Centralized structured logs and
error monitoring.

### Release sequence

1.  Configure staging database and migrations.
2.  Seed verified product content.
3.  Configure PhonePe sandbox and callback URLs.
4.  Test all payment lifecycle cases.
5.  Verify production domain, HTTPS, CORS, and provider callback
    configuration.
6.  Configure backups and test restoration.
7.  Configure alerts for API errors and pending-payment reconciliation.
8.  Switch to production PhonePe credentials only after merchant
    approval and sandbox sign-off.

### Operational jobs

For v1, a scheduled reconciliation task can query payments that have
remained pending beyond a defined interval. It should: - Select eligible
records in small batches. - Ask PhonePe for authoritative status using
the correct API. - Apply changes idempotently. - Record the outcome. -
Avoid retrying indefinitely without alerting. - Never mark a payment
successful without provider verification.

A queue is optional initially. Add a durable queue if notifications,
reconciliation, or other asynchronous work becomes significant.

## 14. Implementation phases

### Phase 1 --- Foundation

-   Confirm current frontend framework and package manager.
-   Create/align workspace structure.
-   Configure TypeScript, Express, environment validation, logger, CORS,
    error handling.
-   Configure PostgreSQL and migrations.
-   Add health endpoints and automated tests.

### Phase 2 --- Catalogue

-   Create product/image schema.
-   Seed the initial product as unpublished until business content is
    approved.
-   Implement public product endpoints.
-   Connect storefront product data to the API.

### Phase 3 --- Checkout and orders

-   Implement server-side validation and pricing.
-   Create orders/order items/payment attempts transactionally.
-   Add idempotency and safe order status access.
-   Connect checkout UI.

### Phase 4 --- PhonePe

-   Confirm merchant account and API version.
-   Implement provider adapter and sandbox flow.
-   Implement callback verification and status checks.
-   Add reconciliation and duplicate-event protection.
-   Test timeout, delayed callback, failure, and mismatch scenarios.

### Phase 5 --- Admin and operations

-   Implement admin authentication and roles.
-   Add product/order management if included in v1.
-   Add order status history and operational logs.
-   Configure production secrets, monitoring, backups, and deployment.

## 15. Architecture decisions and open questions

Before final implementation, confirm: 1. What frontend framework and
package manager are already in use? 2. Is checkout guest-first,
account-required, or both? 3. Does the client need COD alongside
PhonePe? 4. Which PhonePe PG integration/API version is enabled for the
merchant account? 5. What are the shipping fee, tax, cancellation, and
refund rules? 6. Will there be a separate admin app or just backend
endpoints initially? 7. Which image hosting/storage provider is already
in use? 8. What hosting provider and PostgreSQL service will be used?

**Guiding principle:** Keep v1 a secure modular monolith. Make the
payment lifecycle correct before adding complexity.
