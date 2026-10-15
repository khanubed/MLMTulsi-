# Tulsi Swaraj E-commerce Platform --- Product Requirements Document (PRD)

**Document status:** Initial implementation baseline\
**Product:** Tulsi Swaraj online store\
**Version:** 1.0\
**Primary product:** Tulsi Meta Ved Herbal Mix\
**Initial displayed price:** ₹500 (must be managed as backend product
data, not hardcoded in the frontend)\
**Backend stack:** Node.js, Express.js, PostgreSQL\
**Payment gateway:** PhonePe Payment Gateway\
**Repository approach:** TypeScript monorepo recommended

------------------------------------------------------------------------

## 1. Product overview

Tulsi Swaraj is a direct-to-customer e-commerce website for selling the
brand's products online. The initial release focuses on the Tulsi Meta
Ved Herbal Mix product and a clear, reliable purchase journey from the
home page through checkout and payment confirmation.

The frontend already has a brand-led storefront direction. The backend
must provide a reliable source of truth for product information,
pricing, carts, checkout, orders, payment status, customer details, and
administrative product/order management.

The platform must not rely on client-side prices or trust a browser
redirect as proof of payment. PostgreSQL is the system of record,
Express provides the API, and PhonePe handles payment processing.

## 2. Goals

1.  Allow customers to discover the product and purchase it online.
2.  Make checkout simple and mobile-friendly.
3.  Integrate PhonePe securely for online payments.
4.  Persist orders and payment attempts so customers and administrators
    can track them.
5.  Give authorized administrators the ability to manage products,
    orders, and basic store content.
6.  Provide a maintainable foundation for adding products, coupons,
    shipping rules, and other capabilities later.
7.  Keep product claims, ingredients, instructions, legal details, and
    certifications restricted to verified information supplied by the
    business.

## 3. Non-goals for the initial release

Unless separately approved, the first release does not require: -
Multi-vendor marketplace functionality. - Subscriptions or recurring
payments. - Loyalty points, referral programmes, or public referral
messaging. - Complex warehouse or multi-location inventory. -
Multi-currency checkout. - Native mobile apps. - Customer reviews and
ratings. - Automated medical, therapeutic, or disease-related claims. -
A custom payment processor or storing card/UPI credentials.

## 4. Users and roles

### 4.1 Guest customer

-   Browse the home page and product pages.
-   Add a product to cart.
-   Enter contact and delivery details.
-   Initiate checkout and pay through PhonePe.
-   View order confirmation and order status using an appropriately
    protected order reference or a customer account, depending on the
    final authentication decision.

### 4.2 Registered customer (optional for v1)

-   Manage profile and saved addresses.
-   View order history.
-   Track orders and reorder.

**Recommendation:** Do not force account creation for the first
purchase. Support guest checkout; add accounts only if the client
confirms they are needed.

### 4.3 Administrator

-   Sign in securely.
-   Create, edit, publish, unpublish, and archive products.
-   Update price, product images, descriptions, and availability.
-   View orders and payment status.
-   Update fulfilment status and add tracking information.
-   Review payment failures and reconciliation states.
-   View basic sales/order metrics.

## 5. Scope and functional requirements

### 5.1 Product catalogue

-   Product records must be stored in PostgreSQL.
-   Each product has a stable ID, unique slug, name, description, price
    in paise, currency, SKU (if used), images, publication status,
    stock/availability policy, and timestamps.
-   The initial product is **Tulsi Meta Ved Herbal Mix**, with an
    initial displayed price of **₹500**.
-   Store monetary amounts as integer paise (₹500 = 50,000 paise); do
    not use floating-point values for money.
-   Frontend must fetch product details from the API.
-   Price, stock, and publication status must be revalidated by the
    backend during checkout.
-   Only approved product copy can be published. Ingredients, net
    quantity, usage instructions, certifications, and claims must not be
    invented.

### 5.2 Home page and scroll-triggered purchase popup

-   The home page can show a product purchase popup after a visitor
    scrolls a small amount.
-   The popup is a frontend experience; it does not require a dedicated
    backend popup endpoint for v1.
-   Its product title, image, and price should come from the product API
    or shared product data returned by the backend.
-   The CTA must invoke the normal checkout flow. It must not mark an
    order as paid or bypass server-side validation.
-   Dismissal and scroll thresholds can be managed client-side. Avoid
    adding visitor tracking unless explicitly approved.

### 5.3 Cart

-   Support adding/removing items and changing quantity.
-   The frontend may maintain a temporary cart, but the backend must
    recalculate prices and validate product availability at checkout.
-   Never trust totals, discounts, tax, shipping, or unit prices
    submitted by the client.
-   Prevent invalid quantities and duplicate checkout submissions.
-   A persistent server-side cart may be added if required; it is not
    mandatory for a simple guest checkout v1.

### 5.4 Checkout

-   Collect the minimum information needed to fulfil an order: customer
    name, phone number, delivery address, city, state, postal code, and
    optional email/instructions if the business needs them.
-   Validate fields on both client and server.
-   Calculate the order subtotal and any configured shipping/tax charges
    on the server.
-   Show an order summary before payment.
-   Create a pending order and payment attempt before
    redirecting/handing off to PhonePe.
-   Store an immutable order-item snapshot containing product name,
    slug/SKU where applicable, quantity, unit price, and line total at
    purchase time.
-   Use idempotency protection to prevent duplicate orders when users
    double-click or retry.
-   Do not collect unnecessary sensitive personal information.

### 5.5 PhonePe payments

-   Integrate using the current official PhonePe Payment Gateway
    documentation and the merchant account's enabled API/version.
-   Keep merchant credentials and signing secrets exclusively on the
    server.
-   Create payment requests server-side.
-   Persist the merchant order reference, provider transaction/payment
    reference, amount, currency, and payment state.
-   Handle success, failure, cancellation, delayed response, and
    abandoned checkout.
-   Treat browser redirects as user-experience signals only. Confirm
    final payment state using the authenticated server-to-server
    callback/webhook and/or the official status-check API supported by
    the configured PhonePe integration.
-   Verify the callback/webhook according to the selected PhonePe API
    version's official authentication/signature procedure.
-   Make payment processing idempotent: duplicate callbacks must not
    create duplicate orders or fulfilment actions.
-   Never store card details, UPI PINs, OTPs, or other payment
    credentials.
-   Never mark an order paid solely because the frontend sends
    `success: true`.
-   If payment status is uncertain, keep the payment/order in a pending
    or reconciliation state until verified.

### 5.6 Order management

-   Each order receives a unique human-readable order number plus an
    internal UUID.
-   Initial order states should include `PENDING_PAYMENT`, `CONFIRMED`,
    `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, and
    `PAYMENT_REVIEW` as appropriate.
-   Payment states should be tracked separately: `INITIATED`, `PENDING`,
    `SUCCESS`, `FAILED`, `CANCELLED`, `REFUND_PENDING`, `REFUNDED`, and
    `UNKNOWN`/`RECONCILIATION_REQUIRED` where needed.
-   Do not conflate order fulfilment status with payment status.
-   Administrators can view order details and update fulfilment status
    with an audit record.
-   Refunds, if supported by the merchant account and approved for v1,
    must use the official PhonePe refund flow and be recorded. Otherwise
    handle refunds manually and record the administrative outcome.

### 5.7 Authentication and admin

-   Admin routes must require authentication and role checks.
-   Hash passwords using a modern password hashing algorithm such as
    Argon2id or bcrypt with suitable parameters.
-   Use secure, HTTP-only cookies for browser sessions if cookie-based
    auth is chosen; configure `Secure`, `SameSite`, and CSRF protections
    appropriately.
-   Rate-limit login and sensitive endpoints.
-   Provide logout and session invalidation.
-   Avoid exposing admin endpoints or sensitive operational data to
    public clients.
-   Customer accounts are optional in v1; if included, customer and
    admin roles must be separated.

### 5.8 Shipping and fulfilment

-   V1 should support a configurable flat shipping fee or free-shipping
    threshold if the business provides the rule.
-   Do not invent delivery estimates or PIN-code serviceability. If the
    client provides a serviceability table, implement it as
    data/configuration.
-   Track fulfilment status and optional courier/tracking reference.
-   Keep shipping rules configurable rather than hardcoding them in UI
    components.

### 5.9 Notifications

-   V1 may send order confirmation and payment outcome messages by email
    or SMS/WhatsApp only after the provider and business messaging
    policy are decided.
-   Notification failures must not roll back a successfully recorded
    payment.
-   Queue/retry notifications if needed; do not send duplicate messages
    on duplicate payment callbacks.
-   No notification provider is assumed in this baseline.

### 5.10 SEO and storefront data

-   Product pages should render SEO metadata from verified product data.
-   Structured data must reflect real price, availability, and product
    information.
-   Avoid fake ratings, review counts, discount percentages, urgency
    claims, or fabricated certifications.

## 6. Core customer journeys

### Journey A: Home page popup purchase

1.  Visitor opens `/`.
2.  Frontend fetches published product information.
3.  Visitor scrolls past the configured threshold.
4.  Popup appears once for that visit.
5.  Visitor selects **Buy Now --- ₹500**.
6.  Frontend begins checkout using the existing cart/checkout flow.
7.  Backend validates product and price and creates a pending
    order/payment attempt.
8.  Backend initiates PhonePe payment and returns the required
    redirect/checkout payload.
9.  Customer completes or abandons payment.
10. Backend verifies the result with PhonePe and updates payment/order
    states.
11. Frontend displays a result page based on server-verified order
    status.

### Journey B: Product page purchase

1.  Customer opens the product page.
2.  Product data is loaded from the API.
3.  Customer chooses quantity and starts checkout.
4.  Server recalculates the order total and creates a pending order.
5.  PhonePe payment is initiated and verified server-side.
6.  Customer receives a confirmation/status page.

### Journey C: Admin fulfilment

1.  Admin signs in.
2.  Admin opens the order list and filters by order/payment status.
3.  Admin inspects order details.
4.  After payment is verified, admin updates fulfilment status.
5.  Status changes are audited.

## 7. Suggested API contract

Use a versioned API prefix such as `/api/v1`. Exact route names can be
adjusted to match the existing frontend.

### Public catalogue

-   `GET /api/v1/products` --- list published products.
-   `GET /api/v1/products/:slug` --- fetch one published product.
-   `GET /api/v1/storefront/home` --- optional home-page
    content/configuration.

### Checkout and payments

-   `POST /api/v1/checkout` --- validate cart/customer details, create
    pending order and payment attempt, initiate PhonePe, return provider
    handoff data.
-   `GET /api/v1/orders/:orderNumber/status` --- return a safe, minimal
    order/payment status after verifying access via a signed token,
    session, or other access-control mechanism.
-   `POST /api/v1/payments/phonepe/callback` --- PhonePe
    server-to-server callback/webhook endpoint; exact method, headers,
    and verification must match the configured PhonePe API version.
-   `GET /api/v1/payments/phonepe/return` --- optional browser return
    route; must not itself confirm payment.
-   `POST /api/v1/payments/:paymentId/reconcile` --- internal/admin-only
    reconciliation action, not public.

### Admin

-   `POST /api/v1/admin/auth/login`
-   `POST /api/v1/admin/auth/logout`
-   `GET /api/v1/admin/products`
-   `POST /api/v1/admin/products`
-   `PATCH /api/v1/admin/products/:id`
-   `GET /api/v1/admin/orders`
-   `GET /api/v1/admin/orders/:id`
-   `PATCH /api/v1/admin/orders/:id/fulfilment`

Do not expose internal UUIDs or provider secrets unnecessarily. Validate
every input and use consistent error responses.

## 8. Data entities

Minimum initial entities: - `products` - `product_images` - `orders` -
`order_items` - `payments` - `admin_users` - `sessions` (if using
database-backed sessions) - `order_status_history` - `webhook_events` or
`payment_events` for idempotency and audit - `addresses` only if saved
addresses/customer accounts are included

Suggested data design and relationships are detailed in
`architecture.md`.

## 9. Non-functional requirements

### Security

-   HTTPS in production.
-   Secrets in environment/secret management; never commit `.env`.
-   Validate and sanitize input.
-   Parameterized database queries/ORM.
-   CORS restricted to approved frontend origins.
-   Secure cookie/session settings where applicable.
-   Rate limiting on auth, checkout, and public sensitive endpoints.
-   Request size limits and security headers.
-   No card/UPI credentials stored by the application.
-   Redact secrets, personal information, and payment payloads from
    logs.

### Reliability

-   Database transactions around order and payment state changes.
-   Idempotent checkout and webhook processing.
-   Retry-safe payment status reconciliation.
-   Health and readiness endpoints.
-   Graceful shutdown and connection pool handling.

### Performance

-   Indexed lookup fields (slug, order number, payment reference,
    state).
-   Pagination for admin lists.
-   Avoid N+1 queries.
-   Cache public product reads only where cache invalidation is safe.
-   Do not cache customer/order/payment data publicly.

### Accessibility and usability

-   Mobile-first checkout.
-   Clear loading, pending, success, failure, and retry states.
-   Never imply a payment succeeded until the backend verifies it.
-   Preserve a clear route back to the order status page.

### Observability

-   Structured logs with request/correlation IDs.
-   Track checkout-started, payment-initiation, verified-success,
    failure, and reconciliation counts without logging secrets.
-   Alert on repeated webhook verification failures and payments stuck
    pending.

## 10. Acceptance criteria

The initial release is acceptable when: 1. Published product data and
price are retrieved from the backend. 2. Checkout validates product,
quantity, and server-side price. 3. An order and payment attempt are
persisted before payment handoff. 4. PhonePe credentials are never sent
to the frontend. 5. A browser redirect alone cannot mark an order paid.
6. Valid provider callbacks/status checks update payment state exactly
once. 7. Duplicate callbacks and repeated requests do not duplicate
orders or fulfilment actions. 8. Admin access is protected and roles are
enforced. 9. Orders retain a snapshot of the product name and price
paid. 10. Payment failures and pending states are visible and
recoverable. 11. No unverified product claims or fake promotional data
are published. 12. The app can be run locally from the documented
monorepo setup.

## 11. Decisions to confirm with the client

-   Guest checkout only, or customer accounts in v1?
-   Exact delivery/shipping fee and PIN-code serviceability rules.
-   Whether COD is required in addition to PhonePe.
-   Whether taxes are included in displayed prices and how invoices
    should be handled.
-   Which notification channels are required.
-   Whether admin needs product/content management in v1 or products can
    initially be seeded.
-   Whether refunds need to be initiated from the admin dashboard.
-   Production hosting, domain, database hosting, image storage, and
    backup requirements.
-   Confirm merchant onboarding and the exact PhonePe PG API version
    available to the account.

## 12. Launch checklist

-   [ ] Merchant account and PhonePe credentials configured for the
    correct environment.
-   [ ] Official PhonePe integration and callback verification reviewed.
-   [ ] Test/sandbox payments and failure cases tested.
-   [ ] Duplicate callback and retry tests passed.
-   [ ] Production URLs and callback allowlists configured.
-   [ ] HTTPS and CORS configured.
-   [ ] Database migrations and backups configured.
-   [ ] Admin credentials created securely.
-   [ ] Product content and legal details approved by the business.
-   [ ] Refund, cancellation, shipping, and customer support policies
    approved.
-   [ ] Logs and payment reconciliation monitoring enabled.
