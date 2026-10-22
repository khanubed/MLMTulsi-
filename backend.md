# Tulsi Swarojgar --- Backend Architecture & Implementation Plan

**Document type:** Backend technical plan (`backend.md`)\
**Project:** Tulsi Swarojgar --- Meta Ved Herbal Mix, referral-network
e-commerce\
**Version:** 1.0\
**Status:** Proposed architecture --- business rules marked "confirm"
must be approved before production.

------------------------------------------------------------------------

## 1. Executive summary

Build a **modular monolith** using Next.js App Router for the website
and API, PostgreSQL as the primary database, Prisma ORM for data access,
TypeScript, Zod validation, and PhonePe for payments.

The system combines four distinct domains:

1.  **Commerce:** product, order, payment and order history.
2.  **Identity:** one account per person/verified phone, with the
    ability to own multiple network IDs.
3.  **Referral hierarchy:** each network ID is a distinct position in a
    maximum-three-child tree, up to the configured depth.
4.  **Rewards and payouts:** commission rules, immutable wallet ledger,
    withdrawal requests and administrative review.

### Recommended architecture decisions

-   Use separate `users` and `network_ids` tables for production.
-   Keep a `products` table even though the launch catalogue contains
    only Meta Ved. Orders must store a price snapshot.
-   Store each network ID's parent in `network_ids.parentNetworkId`; do
    not use a PostgreSQL array as the primary source of child
    relationships.
-   Enforce the maximum three children through a transaction and a
    consistent parent-row locking protocol. Consider a slot-allocation
    table or database trigger if enforcement must also protect against
    future code paths that bypass the service.
-   Store money as integer paise (`₹500 = 50,000 paise`), never
    floating-point values.
-   Treat the PhonePe redirect as user experience only. A verified
    server-side payment status/webhook is required before activating an
    ID or granting a reward.
-   Use idempotency keys and unique constraints so retries and duplicate
    webhooks cannot create duplicate IDs, orders, commissions or ledger
    entries.
-   Use a ledger as the financial source of truth; do not treat a
    mutable `wallet.balance` field as the only financial record.
-   Do not launch the referral/commission scheme until its legal, tax,
    consumer-protection and direct-selling compliance has been reviewed
    by a qualified Indian professional.

------------------------------------------------------------------------

## 2. Technology stack

  -----------------------------------------------------------------------
  Layer                   Recommended technology  Why
  ----------------------- ----------------------- -----------------------
  Frontend + API          Next.js App Router,     One TypeScript
                          Route Handlers          application for UI and
                                                  server endpoints; clear
                                                  modular boundaries

  Language                TypeScript, strict mode Shared types and fewer
                                                  runtime mistakes

  Database                PostgreSQL              Relational integrity,
                                                  transactions,
                                                  constraints, recursive
                                                  queries and strong
                                                  financial-data support

  ORM                     Prisma                  Typed database access
                                                  and migration workflow

  Validation              Zod                     Validate request
                                                  bodies, query
                                                  parameters, environment
                                                  variables and provider
                                                  payloads

  Authentication          Secure server-side      Revocable sessions and
                          sessions in HttpOnly    reduced exposure
                          cookies; OTP for phone  compared with storing
                          verification            long-lived tokens in
                                                  browser storage

  Payments                PhonePe official        Hosted/approved
                          server-side integration checkout, server
                                                  verification, status
                                                  checks and webhook
                                                  processing according to
                                                  current PhonePe
                                                  documentation

  Rate limiting           Redis or a managed      Protect OTP, login,
                          rate-limit service when referral validation and
                          needed; database-backed payment initiation
                          throttles for early     
                          prototype               

  Background jobs         Start with a durable    Recoverable payment
                          database job/outbox     reconciliation and
                          table; later add a      commission processing
                          queue such as BullMQ +  
                          Redis if scale warrants 
                          it                      

  Logging                 Structured server logs  Trace payment and
                          with request IDs; error placement failures
                          monitoring              without leaking secrets

  Tests                   Vitest/Jest,            Test rules, concurrency
                          integration tests       and full payment-to-ID
                          against PostgreSQL,     flows
                          Playwright for critical 
                          user journeys           

  Hosting                 Node.js-compatible      Next.js Route Handlers
                          hosting with persistent and database
                          PostgreSQL and secure   transactions require a
                          environment variables   compatible runtime

  File/object storage     Optional S3-compatible  Only if product images,
                          storage                 documents or other user
                                                  files need managed
                                                  storage
  -----------------------------------------------------------------------

### Runtime and code organization

Use the Node.js runtime for database/payment modules unless a specific
route is intentionally compatible with Edge. Keep payment signing,
secrets, Prisma and financial services out of client bundles.

Suggested layout:

``` text
src/
  app/
    (store)/
    (member)/
    admin/
    api/v1/
      auth/
      products/
      orders/
      payments/
      webhooks/phonepe/
      network-ids/
      member/
      admin/
  modules/
    auth/
    users/
    products/
    orders/
    payments/
    network/
    commissions/
    wallet/
    withdrawals/
    admin/
    audit/
  lib/
    db.ts
    env.ts
    auth.ts
    permissions.ts
    validation.ts
    errors.ts
    logger.ts
    rate-limit.ts
  jobs/
    reconcile-payments.ts
    process-commissions.ts
    process-outbox.ts
prisma/
  schema.prisma
  migrations/
tests/
```

Keep route handlers thin. They should authenticate, validate, call a
service and map the result to an HTTP response. Business rules belong in
services, not duplicated in UI or route files.

------------------------------------------------------------------------

## 3. Core business rules and assumptions

The following reflects the current project brief. Confirm unresolved
points before implementing the commission engine.

1.  Meta Ved selling price starts at **₹500 (50,000 paise)**.
2.  A person has one account, normally tied to one verified mobile
    number.
3.  One account can own up to **100 network IDs**.
4.  Each network ID has a unique public ID and unique referral code.
5.  Each network ID can have no more than **three direct children**.
6.  The hierarchy and commission earning depth is strictly limited to
    **ten (10) levels** relative to each node. Any node in the tree—including
    the designated root—earns commissions solely up to 10 descendant levels
    below itself.
7.  A network ID is activated only after its associated ₹500 order has a
    verified successful payment and all placement constraints pass.
8.  An additional ID is created under the same user account, but
    occupies a separate hierarchy position.
9.  A placement/referral code is not a guarantee that the position will
    remain empty. Revalidate the target position at the final placement
    transaction.
10. A successful browser redirect is not payment proof.
11. Strict **No Refund, No Return, and No Cash-on-Delivery (COD)** policy.
    All sales are 100% prepaid and processed via PhonePe. Orders are final
    upon confirmed payment callback, eliminating post-settlement return/chargeback
    commission reversals.
12. Never silently move an ID to a different parent if the intended
    position becomes unavailable after payment. Put the order into a
    recoverable exception state and resolve it under a documented
    policy.
13. Only authorized administrators can suspend IDs, approve/reject
    withdrawals, change product availability, or change commission
    rules.
14. A commission calculation must use a versioned rule set and be
    idempotent.

### Confirmed Commission & Hierarchy Rules (Business Owner Verified)

The confirmed commission schedule per qualifying direct purchase across 10 levels:

  -----------------------------------------------------------------------
  Level / Reward                                                   Amount
  ------------------------------ ----------------------------------------
  Level 1 reward after three                                         ₹500
  qualifying direct purchases    

  Level 2                                                            ₹100

  Level 3                                                             ₹75

  Level 4                                                             ₹50

  Level 5                                                             ₹25

  Level 6                                                             ₹15

  Level 7                                                             ₹10

  Level 8                                                              ₹5

  Level 9                                                              ₹3

  Level 10                                                             ₹1
  -----------------------------------------------------------------------

#### Business Owner Confirmations & Operational Specifications

1.  **Level Completion Prerequisite for Withdrawal:**
    - Commissions in a given level **cannot be withdrawn individually or piecemeal**.
    - The accumulated commission for any specific level can be withdrawn **ONLY when that entire level is completely filled/completed** (e.g., Level 1 requires all 3 direct child slots completed; subsequent levels require their full respective branch completion).
    - Incomplete levels hold earned commissions in a locked/unwithdrawable state until the final qualifying slot in that level is occupied and activated.

2.  **Relative Upline Level Calculation:**
    - Levels are strictly calculated **relative to each buyer's upline**, not measured from a static, absolute global root.
    - When a purchase occurs at Node $N$:
      - Immediate parent node = Level 1 upline.
      - Parent's parent node = Level 2 upline.
      - Continuing up the direct ancestor chain up to Level 10 upline.

3.  **Strict 10-Level Earning Horizon for All Nodes:**
    - Both the root node and **all descendant nodes** are subject to an identical cap: commissions are earned **only up to 10 descendant levels** below each node.
    - Any transaction occurring at depth $> 10$ relative to a node yields zero commission for that node.

4.  **Qualifying Sale Definition & Payment Finality:**
    - A qualifying sale requires a verified, complete payment executed via **PhonePe** (authoritative server-to-server callback verification).
    - **No Refund, No Return, and No COD Policy:** The platform strictly disallows returns, cancellations, refunds, or Cash-on-Delivery. All sales are irreversible upon PhonePe payment confirmation.

5.  **Commission Lifecycle: Hold Period & Admin Approval to Wallet:**
    - Upon successful PhonePe order settlement, commission entitlements are calculated and placed in a **HOLD** state (`status = HELD` / `PENDING_ADMIN_APPROVAL`).
    - An authorized **Administrator** reviews and confirms the commission records.
    - Once confirmed by Admin, the funds transfer to the user's **Wallet** balance (`wallet_transactions` ledger entry posted).
    - Payout/withdrawal from the wallet remains locked until the specific level has reached **100% completion**.

6.  **Multi-ID Ownership & Self-Referrals:**
    - One user account (`users`) can own up to **100 network IDs** (`network_ids`).
    - **Self-referral is explicitly permitted:** When an existing user purchases an additional network ID, they may use their own existing network ID's referral code to place the new ID within their own downline tree.
    - Each network ID operates as an independent node in the hierarchy, tracking its own direct children, level depth, and level-completion progress.
    - All withdrawable commissions earned by a user's various network IDs consolidate into the user's master wallet ledger upon admin confirmation and level completion.

7.  **Implementation Constraint:**
    - Implement all rules as versioned configuration data (`commission_rule_sets`, `commission_rules`), avoiding hardcoded numeric constants in application code.

------------------------------------------------------------------------

## 4. Database design overview

Use UUID primary keys internally. Public network IDs and referral codes
are separate unique identifiers intended for display or sharing. Add
`createdAt` and `updatedAt` to mutable business entities. Use PostgreSQL
foreign keys, unique constraints, check constraints and indexes wherever
possible.

### Table inventory

  -----------------------------------------------------------------------
  Table                               Purpose
  ----------------------------------- -----------------------------------
  `users`                             Person/account, normalized phone,
                                      profile and account status

  `sessions`                          Revocable authenticated sessions

  `otp_challenges`                    Phone verification/login challenge
                                      metadata, expiry and attempt count

  `products`                          Current product catalogue and
                                      active price

  `orders`                            Immutable commercial record and
                                      price snapshot

  `payments`                          PhonePe transaction references and
                                      payment state

  `payment_events`                    Webhook/event idempotency and
                                      processing result

  `network_ids`                       Each hierarchy position owned by a
                                      user

  `network_placements` (optional but  Placement history and/or explicit
  recommended for strict slot         child-slot allocation
  semantics/audit)                    

  `commission_rule_sets`              Versioned commission plans

  `commission_rules`                  Amount and trigger for each
                                      level/reward in a rule set

  `qualification_events`              Auditable facts used to determine
                                      qualification

  `commissions`                       Individual commission entitlements
                                      and their states

  `wallet_transactions`               Append-only financial ledger

  `withdrawals`                       Payout requests and
                                      review/processing state

  `payout_events` (optional)          External payout-provider events, if
                                      automated payouts are added

  `outbox_jobs`                       Durable jobs to retry
                                      reconciliation/commission
                                      processing

  `admin_users` or role field         Admin identity/authorization; may
                                      be role-based on `users` if
                                      appropriate

  `audit_logs`                        Security-sensitive and financial
                                      administrative actions

  `idempotency_keys` (optional        Safe retry of important write APIs
  generic mechanism)                  
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 5. Database tables --- fields, purpose and constraints

The tables below are logical design specifications, not a substitute for
reviewing the final Prisma schema and generated migrations.

### 5.1 `users`

Stores the human account, not a tree position.

  -----------------------------------------------------------------------
  Field                   Suggested type          Purpose
  ----------------------- ----------------------- -----------------------
  `id`                    UUID PK                 Internal account
                                                  identifier

  `fullName`              String                  Member name

  `phoneE164`             String UNIQUE           Normalized phone
                                                  number, e.g. `+91...`

  `phoneVerifiedAt`       DateTime nullable       Proof that phone
                                                  verification succeeded

  `email`                 String nullable         Optional email; unique
                                                  only if business
                                                  requires it

  `passwordHash`          String nullable         Only if password login
                                                  is supported; never
                                                  store plaintext

  `role`                  Enum (`MEMBER`,         Authorization role;
                          `ADMIN`, `SUPPORT`)     consider separate admin
                                                  identity for higher
                                                  assurance

  `status`                Enum (`PENDING`,        Account access state
                          `ACTIVE`, `SUSPENDED`,  
                          `CLOSED`)               

  `createdAt` /           DateTime                Audit and ordering
  `updatedAt`                                     
  -----------------------------------------------------------------------

**Why:** A person can own many IDs. Account identity and authentication
must not be duplicated for every network position.

**Constraints:** unique normalized phone; do not expose phone numbers in
public tree responses. Validate account status and role on every
protected operation.

### 5.2 `sessions`

  -----------------------------------------------------------------------
  Field                   Suggested type          Purpose
  ----------------------- ----------------------- -----------------------
  `id`                    UUID PK                 Session record

  `userId`                UUID FK → `users.id`    Session owner

  `tokenHash`             String UNIQUE           Store hash of random
                                                  session secret, not raw
                                                  bearer secret

  `expiresAt`             DateTime                Session expiry

  `revokedAt`             DateTime nullable       Logout/revocation

  `createdAt`,            DateTime                Session audit
  `lastSeenAt`                                    
  -----------------------------------------------------------------------

**Why:** Sessions can be revoked after logout, account suspension,
credential change or suspected compromise. Use secure, HttpOnly,
SameSite cookies and CSRF protection for cookie-authenticated mutations.

### 5.3 `otp_challenges`

  Field            Suggested type      Purpose
  ---------------- ------------------- -------------------------------------------
  `id`             UUID PK             Challenge ID
  `phoneE164`      String              Destination phone
  `purpose`        Enum                Registration, login, phone change, etc.
  `codeHash`       String              Hash of OTP; never store OTP in plaintext
  `expiresAt`      DateTime            Short expiry
  `attemptCount`   Integer             Limit guessing
  `consumedAt`     DateTime nullable   Prevent reuse
  `createdAt`      DateTime            Audit

**Why:** OTPs need expiry, attempt limits, rate limits, single-use
behavior and abuse monitoring.

### 5.4 `products`

Even with one product, retain a catalogue table.

  Field                      Suggested type   Purpose
  -------------------------- ---------------- ------------------------------------------
  `id`                       UUID PK          Internal product key
  `name`                     String           `Meta Ved — Herbal Mix`
  `sku`                      String UNIQUE    Stable product code, e.g. `META-VED-001`
  `description`              Text nullable    Product copy
  `pricePaise`               Integer          Current price; ₹500 = 50,000 paise
  `currency`                 String           `INR`
  `isActive`                 Boolean          Whether new orders may be placed
  `createdAt`, `updatedAt`   DateTime         Audit

**Why:** Admin can update price/availability without a code deployment,
and orders retain historical price snapshots.

**Validation:** `pricePaise > 0`; do not trust price or total sent by
the client. If tax/shipping is introduced, store each component
explicitly.

### 5.5 `orders`

An order represents the customer's purchase intent and agreed price. It
should be created before payment initiation.

  ------------------------------------------------------------------------------
  Field                       Suggested type             Purpose
  --------------------------- -------------------------- -----------------------
  `id`                        UUID PK                    Order ID

  `orderNumber`               String UNIQUE              Human-readable order
                                                         reference

  `userId`                    UUID FK → `users.id`       Buyer

  `productId`                 UUID FK → `products.id`    Product purchased

  `networkIdId`               UUID nullable FK →         ID purchase is intended
                              `network_ids.id`           to create/qualify, if
                                                         applicable

  `intendedParentNetworkId`   UUID nullable FK →         Intended parent for a
                              `network_ids.id`           new ID

  `referralCodeUsed`          String nullable            Snapshot of code used;
                                                         avoid relying on
                                                         mutable code later

  `purpose`                   Enum                       Why the order exists
                              (`INITIAL_REGISTRATION`,   
                              `ADDITIONAL_ID`,           
                              `PRODUCT_PURCHASE`)        

  `quantity`                  Integer                    Quantity, initially
                                                         usually 1

  `unitPricePaise`            Integer                    Price agreed at order
                                                         time

  `subtotalPaise`             Integer                    Server-calculated
                                                         subtotal

  `shippingPaise`             Integer                    If applicable

  `taxPaise`                  Integer                    If applicable

  `totalAmountPaise`          Integer                    Amount to collect

  `status`                    Enum (`PENDING_PAYMENT`,   Order lifecycle
                              `PAID`, `PAYMENT_FAILED`,  
                              `CANCELLED`,               
                              `REFUND_PENDING`,          
                              `REFUNDED`, `EXCEPTION`)   

  `idempotencyKey`            String nullable UNIQUE per Avoid duplicate order
                              user/scope                 creation on retries

  `paidAt`                    DateTime nullable          Verified paid timestamp

  `createdAt`, `updatedAt`    DateTime                   Audit
  ------------------------------------------------------------------------------

**Why:** An order preserves what was bought, at what price and for what
purpose. It also binds payment to a particular intended placement.

**Important:** A paid order whose requested placement is no longer
available must enter `EXCEPTION` (or a similarly explicit state) and be
handled through a documented recovery/refund policy. Do not silently
reassign.

### 5.6 `payments`

  -------------------------------------------------------------------------
  Field                     Suggested type          Purpose
  ------------------------- ----------------------- -----------------------
  `id`                      UUID PK                 Internal payment record

  `orderId`                 UUID FK → `orders.id`   Order being paid

  `provider`                Enum/String             `PHONEPE`

  `merchantOrderId`         String UNIQUE           Merchant-generated
                                                    reference sent to
                                                    provider

  `providerTransactionId`   String nullable UNIQUE  Provider transaction
                                                    identifier when
                                                    available

  `amountPaise`             Integer                 Exact expected amount

  `currency`                String                  `INR`

  `status`                  Enum (`CREATED`,        Payment lifecycle
                            `PENDING`, `SUCCESS`,   
                            `FAILED`, `CANCELLED`,  
                            `UNKNOWN`)              

  `providerResponseSafe`    JSON nullable           Sanitized response
                                                    only; exclude
                                                    secrets/PII not needed

  `initiatedAt`,            DateTime nullable       Audit
  `verifiedAt`                                      

  `createdAt`, `updatedAt`  DateTime                Audit
  -------------------------------------------------------------------------

**Why:** Orders and payment attempts are not the same thing. A single
order may need retries or status reconciliation; each attempt must be
auditable.

**Validation:** Amount must match the order's server-side total. A
client-supplied success flag is never accepted as proof.

### 5.7 `payment_events`

  -------------------------------------------------------------------------
  Field                   Suggested type          Purpose
  ----------------------- ----------------------- -------------------------
  `id`                    UUID PK                 Event row

  `provider`              String                  Provider name

  `providerEventId`       String nullable UNIQUE  Unique provider event ID
                                                  when supplied

  `merchantOrderId`       String                  Merchant reference

  `eventType`             String                  Normalized event type

  `payloadHash`           String                  Deduplication/integrity
                                                  diagnostics

  `receivedAt`            DateTime                Arrival time

  `processedAt`           DateTime nullable       Completion time

  `processingStatus`      Enum (`RECEIVED`,       Processing lifecycle
                          `PROCESSED`, `RETRY`,   
                          `REJECTED`)             

  `errorCode`             String nullable         Safe failure
                                                  classification
  -------------------------------------------------------------------------

**Why:** Webhooks can be duplicated, delayed or arrive out of order.
Persist receipt and processing status so retries are safe.

### 5.8 `network_ids` --- recommended separate-table approach

Each row is one distinct position in the referral tree.

  -----------------------------------------------------------------------
  Field                   Suggested type          Purpose
  ----------------------- ----------------------- -----------------------
  `id`                    UUID PK                 Internal primary key

  `publicId`              String UNIQUE           User-facing ID such as
                                                  `TS10001`

  `ownerUserId`           UUID FK → `users.id`    Account owner

  `referralCode`          String UNIQUE           Shareable
                                                  placement/referral code

  `parentNetworkId`       UUID nullable self-FK → Direct parent position
                          `network_ids.id`        

  `placementDepth`        Integer                 Depth from defined
                                                  root; define root depth
                                                  as 0

  `placementPath`         String nullable         Optional indexed
                                                  materialized path;
                                                  derived data must be
                                                  maintained
                                                  transactionally

  `status`                Enum (`PENDING`,        Position lifecycle
                          `ACTIVE`, `SUSPENDED`,  
                          `CLOSED`)               

  `qualifyingOrderId`     UUID nullable FK →      Verified purchase that
                          `orders.id` UNIQUE      created/qualified this
                          where appropriate       ID

  `createdAt`,            DateTime                Audit
  `updatedAt`                                     
  -----------------------------------------------------------------------

**Why separate:** one user can own up to 100 IDs; each ID has its own
parent, children, referral code, status, qualification and reward
history.

**Constraints and indexes:** - Unique `publicId`. - Unique
`referralCode`. - Index `ownerUserId`. - Index `parentNetworkId`. -
Index `placementDepth` if frequently filtered. - Foreign key on
`parentNetworkId`. - Reject `parentNetworkId = id`. - Reject circular
hierarchy changes by checking ancestors/descendants inside the placement
transaction. - Enforce a maximum of three children with concurrency-safe
placement logic. - Enforce at most 100 IDs per user with a per-user
lock/transaction or an allocation mechanism. A plain `COUNT(*)` without
serialization is not sufficient under concurrent ID creation. - Define
root creation explicitly; do not permit arbitrary root IDs unless
authorized.

### 5.9 Optional `network_placements` / child slots

If every parent has exactly three named slots (slot 1, 2, 3) and slot
availability must be represented explicitly, use a table such as:

  Field               Suggested type   Purpose
  ------------------- ---------------- --------------------------
  `id`                UUID PK          Placement slot record
  `parentNetworkId`   UUID FK          Parent
  `slotNumber`        Integer (1--3)   Slot under parent
  `childNetworkId`    UUID UNIQUE FK   Child occupying the slot
  `createdAt`         DateTime         Placement timestamp

Add `UNIQUE(parentNetworkId, slotNumber)`, `UNIQUE(childNetworkId)` and
`CHECK(slotNumber BETWEEN 1 AND 3)`. Allocate a slot transactionally.
This is an alternative to a simple `parentNetworkId` model, not
something to add redundantly without a reason. It provides explicit slot
identity and can make "share code for slot 2" semantics clearer.

A placement-history table can also record `childNetworkId`, old/new
parent, slot, actor, reason and timestamp. If placements are immutable
after creation, state that rule and avoid move APIs entirely.

### 5.10 Combined `users` + network-ID table --- alternative design

A single combined table is technically possible but **not recommended**
for this project. It is documented here because the project owner asked
to compare both approaches.

Example logical shape:

`members` - `id` - `fullName` - `phoneE164` - `passwordHash` - `role` -
`networkPublicId` - `referralCode` - `parentNetworkId` -
`placementDepth` - `networkStatus` - `qualifyingOrderId` - timestamps

Each row represents both an account and one network position. To let a
person own four IDs, the account/profile fields would be repeated across
four rows or you would need nullable "account-only" rows and more
complex constraints.

**Potential advantages** - Fewer tables in a toy prototype. - A single
row can be easy to inspect for a one-account/one-ID design.

**Problems** - Repeated phone/profile/password data across IDs can
become inconsistent. - Login identity is coupled to tree position. -
Unique phone constraints conflict with repeating the same account across
several IDs. - Nullable account-only rows and uniqueness workarounds add
complexity. - Suspension of an account versus suspension of one network
position becomes ambiguous. - Foreign keys and business rules become
harder to reason about. - It is difficult to guarantee account-level
maximum 100 IDs cleanly.

**If the combined design is mandatory:** prefer an explicit
`accounts`/`users` row plus a separate positions table. If you literally
merge them, you must first decide whether each row is a user, an ID, or
both; a nullable `networkPublicId` design is effectively a single-table
inheritance pattern and adds constraints. For this project's
one-user-to-many-IDs requirement, the separate design is cleaner and
safer.

### 5.11 `commission_rule_sets`

  Field               Suggested type                        Purpose
  ------------------- ------------------------------------- --------------------------
  `id`                UUID PK                               Rule-set ID
  `version`           Integer UNIQUE                        Immutable version number
  `name`              String                                Human-readable plan name
  `status`            Enum (`DRAFT`, `ACTIVE`, `RETIRED`)   Lifecycle
  `effectiveFrom`     DateTime                              Start time
  `createdByUserId`   UUID FK                               Admin who created it
  `createdAt`         DateTime                              Audit

**Why:** Existing commissions must remain explainable even after the
business changes its rules. Do not overwrite old rules in place.

### 5.12 `commission_rules`

  ---------------------------------------------------------------------------
  Field                   Suggested type              Purpose
  ----------------------- --------------------------- -----------------------
  `id`                    UUID PK                     Rule ID

  `ruleSetId`             UUID FK →                   Rule version
                          `commission_rule_sets.id`   

  `relativeLevel`         Integer nullable            Upline level where
                                                      applicable

  `triggerType`           Enum                        Event that earns the
                          (`PER_QUALIFYING_ORDER`,    reward
                          `LEVEL_QUALIFICATION`,      
                          `ONE_TIME_MILESTONE`)       

  `amountPaise`           Integer                     Reward amount

  `conditions`            JSON nullable               Explicitly versioned
                                                      conditions, if needed

  `isActive`              Boolean                     Rule availability
  ---------------------------------------------------------------------------

**Constraints:** amount must be non-negative; uniqueness should prevent
duplicate rules for the same rule set/level/trigger where the business
rules require one rule.

### 5.13 `qualification_events`

  -----------------------------------------------------------------------------------
  Field                   Suggested type          Purpose
  ----------------------- ----------------------- -----------------------------------
  `id`                    UUID PK                 Qualification event

  `networkIdId`           UUID FK                 Position whose qualification
                                                  changed

  `sourceOrderId`         UUID FK → `orders.id`   Evidence order

  `eventType`             Enum/string             E.g.
                                                  `DIRECT_QUALIFICATION_COMPLETED`,
                                                  `MILESTONE_REACHED`, `REVERSED`

  `details`               JSON                    Auditable calculation inputs,
                                                  excluding unnecessary PII

  `createdAt`             DateTime                Event time
  -----------------------------------------------------------------------------------

**Why:** A one-time reward triggered by three qualifying direct
purchases must be supported by auditable facts. Avoid calculating
one-time milestones from a mutable counter alone.

### 5.14 `commissions`

  ----------------------------------------------------------------------------
  Field                    Suggested type              Purpose
  ------------------------ --------------------------- -----------------------
  `id`                     UUID PK                     Commission record

  `beneficiaryNetworkId`   UUID FK → `network_ids.id`  Position credited

  `beneficiaryUserId`      UUID FK → `users.id`        Owner at time of
                                                       earning; useful for
                                                       audit

  `sourceOrderId`          UUID FK → `orders.id`       Order/event that caused
                                                       it

  `ruleSetId`              UUID FK →                   Rule version
                           `commission_rule_sets.id`   

  `ruleId`                 UUID FK →                   Exact rule applied
                           `commission_rules.id`       

  `relativeLevel`          Integer nullable            Level used by rule

  `amountPaise`            Integer                     Commission amount

  `status`                 Enum (`PENDING`,            Lifecycle
                           `APPROVED`, `AVAILABLE`,    
                           `BLOCKED`, `REVERSED`,      
                           `PAID`)                     

  `idempotencyKey`         String UNIQUE               Prevent duplicate
                                                       entitlement

  `reasonCode`             String nullable             Explain block/reversal

  `createdAt`,             DateTime nullable           Audit
  `approvedAt`                                         
  ----------------------------------------------------------------------------

**Why:** A commission is an auditable entitlement, not just a balance
increase. It records why, for whom and under which rule version the
amount was calculated.

**Important:** Beneficiary is tracked per network ID (`beneficiaryNetworkId`)
with the owning user (`beneficiaryUserId`) recorded. As confirmed by the
business owner, one user account can own up to 100 network IDs and self-referrals
are explicitly permitted via new network IDs. Each network ID earns independently,
and approved withdrawable funds roll up to the user's master wallet balance once
the corresponding level has reached 100% completion.

### 5.15 `wallet_transactions` --- append-only ledger

  -----------------------------------------------------------------------
  Field                   Suggested type          Purpose
  ----------------------- ----------------------- -----------------------
  `id`                    UUID PK                 Ledger row

  `userId`                UUID FK → `users.id`    Account owner

  `networkIdId`           UUID nullable FK        Network ID context

  `commissionId`          UUID nullable UNIQUE FK Commission that caused
                                                  credit

  `withdrawalId`          UUID nullable FK        Withdrawal associated
                                                  with debit/reservation

  `type`                  Enum (`CREDIT`,         Financial operation
                          `DEBIT`, `RESERVE`,     
                          `RELEASE`, `REVERSAL`,  
                          `ADJUSTMENT`)           

  `amountPaise`           Integer                 Positive magnitude;
                                                  direction comes from
                                                  type

  `status`                Enum (`POSTED`,         Do not delete posted
                          `VOIDED`)               history

  `idempotencyKey`        String UNIQUE           Prevent duplicate
                                                  ledger writes

  `description`           String                  Member-facing
                                                  explanation

  `createdAt`             DateTime                Immutable event time
  -----------------------------------------------------------------------

**Why:** Ledger rows preserve financial history and support
reconciliation. The available balance should be derived from posted
entries and reservations, or maintained as a carefully reconciled
projection---not treated as the only source of truth.

Use a database transaction to post the commission and ledger credit
consistently. Never edit or delete a posted financial entry to "fix" it;
add a compensating reversal/adjustment with audit history.

### 5.16 `withdrawals`

  -----------------------------------------------------------------------
  Field                   Suggested type          Purpose
  ----------------------- ----------------------- -----------------------
  `id`                    UUID PK                 Withdrawal ID

  `userId`                UUID FK → `users.id`    Requesting account

  `networkIdId`           UUID nullable FK        Selected ID context if
                                                  required by the
                                                  business

  `amountPaise`           Integer                 Requested payout

  `status`                Enum (`REQUESTED`,      Payout lifecycle
                          `UNDER_REVIEW`,         
                          `APPROVED`,             
                          `PROCESSING`, `PAID`,   
                          `REJECTED`,             
                          `CANCELLED`, `FAILED`)  

  `payoutMethod`          Enum/string             Bank/UPI/etc.,
                                                  according to approved
                                                  policy

  `payoutDetailsRef`      String nullable         Reference to securely
                                                  stored/verified payout
                                                  details; avoid exposing
                                                  full details

  `reviewedByUserId`      UUID nullable FK        Admin reviewer

  `reviewedAt`            DateTime nullable       Audit

  `providerPayoutRef`     String nullable UNIQUE  External payout
                                                  reference if automated
                                                  payouts are added

  `failureReasonCode`     String nullable         Safe failure
                                                  classification

  `createdAt`,            DateTime                Audit
  `updatedAt`                                     
  -----------------------------------------------------------------------

**Why:** Withdrawal requests require a state machine, admin review,
balance reservation and payout reconciliation.

**Level Completion Enforcement:** Before approving or reserving funds for a
withdrawal, the service must verify that the requested funds originate from
commissions whose corresponding hierarchy level is 100% complete and has been
confirmed by an administrator. Uncompleted level balances cannot be withdrawn.

**Concurrency rule:** Lock the account/ledger balance scope in a
transaction, calculate available funds, create the withdrawal and
reserve funds atomically. Two simultaneous withdrawal requests must not
spend the same balance.

### 5.17 `outbox_jobs`

  ------------------------------------------------------------------------
  Field                   Suggested type          Purpose
  ----------------------- ----------------------- ------------------------
  `id`                    UUID PK                 Job ID

  `jobType`               String                  E.g.
                                                  `PROCESS_PAID_ORDER`,
                                                  `RECONCILE_PAYMENT`,
                                                  `CALCULATE_COMMISSION`

  `aggregateId`           UUID/string             Related order/payment

  `payload`               JSON                    Minimal job data

  `status`                Enum (`PENDING`,        Durable job lifecycle
                          `PROCESSING`, `DONE`,   
                          `RETRY`, `DEAD`)        

  `attemptCount`          Integer                 Retry tracking

  `nextAttemptAt`         DateTime                Backoff scheduling

  `lastErrorCode`         String nullable         Safe diagnostics

  `createdAt`,            DateTime                Audit
  `updatedAt`                                     
  ------------------------------------------------------------------------

**Why:** A database transaction cannot atomically commit both PostgreSQL
data and an external PhonePe request. The outbox pattern lets committed
business events be retried safely.

### 5.18 `audit_logs`

  ------------------------------------------------------------------------
  Field                   Suggested type          Purpose
  ----------------------- ----------------------- ------------------------
  `id`                    UUID PK                 Audit row

  `actorUserId`           UUID nullable FK →      Actor
                          `users.id`              

  `action`                String                  E.g.
                                                  `WITHDRAWAL_APPROVED`,
                                                  `NETWORK_ID_SUSPENDED`

  `entityType`            String                  Affected entity

  `entityId`              String                  Affected ID

  `requestId`             String nullable         Correlate logs

  `metadata`              JSON                    Before/after summary
                                                  without secrets

  `createdAt`             DateTime                Audit time
  ------------------------------------------------------------------------

**Why:** Financial, access-control and hierarchy changes need
traceability.

------------------------------------------------------------------------

## 6. Relationship summary

``` text
users 1 ───── N sessions
users 1 ───── N network_ids
users 1 ───── N orders
products 1 ── N orders
orders 1 ──── N payments
orders 1 ──── N commissions (depending on rules)
network_ids 1 ─ N network_ids (parent → children)
network_ids 1 ─ N commissions (as beneficiary)
users 1 ───── N wallet_transactions
users 1 ───── N withdrawals
commission_rule_sets 1 ─ N commission_rules
commission_rules 1 ─ N commissions
orders/payments ─── payment_events and outbox_jobs
users/admins ────── audit_logs
```

------------------------------------------------------------------------

## 7. API conventions

Base prefix: `/api/v1`.

-   Use JSON for ordinary APIs.
-   Use `GET` for reads; `POST` for creation/actions; `PATCH` for
    partial state changes only where allowed.
-   Use UUIDs or public identifiers consistently; never trust a
    user-supplied owner ID.
-   Use cursor pagination for large tables and trees.
-   Validate every path parameter, query parameter and body with Zod.
-   Authenticate every member endpoint and verify ownership server-side.
-   Require admin role/permission for all `/admin` routes.
-   Apply rate limits to OTP, login, referral validation, checkout and
    withdrawal creation.
-   Return consistent errors:
    `{ "error": { "code": "VALIDATION_ERROR", "message": "..." , "requestId": "..." } }`.
-   Do not expose stack traces, provider secrets, full phone numbers,
    password hashes, raw OTPs or sensitive payment payloads.
-   Use idempotency keys for order creation, checkout initiation,
    withdrawal creation and other retryable mutations.
-   Use CSRF protection for cookie-authenticated state-changing
    requests.
-   Version the API under `/api/v1`.

### Suggested HTTP status codes

-   `200 OK`: successful read/action.
-   `201 Created`: resource created.
-   `202 Accepted`: queued reconciliation/processing.
-   `400 Bad Request`: malformed request.
-   `401 Unauthorized`: missing/invalid session.
-   `403 Forbidden`: authenticated but not allowed.
-   `404 Not Found`: resource absent or not visible to caller.
-   `409 Conflict`: slot occupied, duplicate operation, state conflict,
    child limit reached.
-   `422 Unprocessable Entity`: valid shape but invalid business rule.
-   `429 Too Many Requests`: rate limited.
-   `500/503`: internal/temporary service failure; return a request ID,
    not internal details.

------------------------------------------------------------------------

## 8. API catalogue, purpose, controller/service logic and validation

The route paths below are proposed. Exact names can change, but keep the
domain boundaries and security rules.

### 8.1 Authentication and account

  --------------------------------------------------------------------------------------------
  Method + endpoint         Purpose              Controller/service flow  Main validation
  ------------------------- -------------------- ------------------------ --------------------
  `POST /auth/send-otp`     Start phone          Normalize phone →        E.164 phone format;
                            verification/login   rate-limit by            purpose allow-list;
                                                 phone/IP/device → create cooldown; attempt
                                                 challenge with           and daily limits
                                                 hash/expiry → send       
                                                 through approved SMS     
                                                 provider → return        
                                                 generic success          

  `POST /auth/verify-otp`   Verify OTP and       Find live challenge →    Challenge exists,
                            establish session    compare hash safely →    not
                                                 enforce                  expired/consumed,
                                                 attempts/expiry/single   attempts below max;
                                                 use → mark consumed →    phone verified
                                                 find/create account      before ID purchase
                                                 according to flow →      
                                                 create session → set     
                                                 secure cookie            

  `POST /auth/register`     Create               Validate profile →       Name length;
                            profile/account      require verified         normalized unique
                            where registration   phone/session → create   phone; required
                            needs a separate     account if not already   consents/versioned
                            step                 created; otherwise       terms
                                                 update permitted profile 
                                                 fields                   

  `POST /auth/login`        Optional password    Verify credentials using Generic failure
                            login if enabled     secure password hash →   response; rate
                                                 create session cookie →  limits; account
                                                 audit suspicious         status; password
                                                 failures                 policy

  `POST /auth/logout`       Revoke current       Revoke server-side       Valid session;
                            session              session → clear cookie   idempotent logout

  `GET /auth/me`            Current account and  Read authenticated user  Valid session;
                            permissions          and safe profile fields  return no secrets

  `PATCH /auth/me`          Update allowed       Validate allowed fields  Allow-list fields;
                            profile details      → update → audit; phone  length/format; no
                                                 change requires a fresh  direct role/status
                                                 verification flow        changes

  `GET /member/profile`     Profile view if a    Return safe profile and  Ownership/session
                            separate member      account state            
                            route is preferred                            
  --------------------------------------------------------------------------------------------

**Note:** If OTP-only authentication is used, do not add password fields
or password endpoints without need. Do not allow an unverified phone to
create active network IDs.

### 8.2 Public product and order APIs

  -------------------------------------------------------------------------------------------------
  Method + endpoint                       Purpose           Controller/service    Main validation
                                                            flow                  
  --------------------------------------- ----------------- --------------------- -----------------
  `GET /products`                         Show active       Query active          Pagination if
                                          products          catalogue; return     catalogue grows
                                                            public fields         

  `GET /products/:productId`              Product detail    Fetch active/public   Valid ID; do not
                                                            product; return safe  leak admin-only
                                                            fields                fields

  `POST /orders`                          Create order      Authenticate user →   Product active;
                                          before checkout   validate product and  quantity bounds;
                                                            purpose → fetch       valid intended
                                                            current active        parent/referral
                                                            product price →       code; one order
                                                            validate target       per idempotency
                                                            referral/parent if    key; correct
                                                            this is an ID order → account status
                                                            compute totals        
                                                            server-side → persist 
                                                            pending order and     
                                                            idempotency key       

  `GET /orders`                           Member order      Query only current    Cursor/limit
                                          history           user's orders;        bounds; never
                                                            paginate              accept arbitrary
                                                                                  userId

  `GET /orders/:orderId`                  Order detail      Fetch order scoped to Ownership; valid
                                                            current user or admin state

  `POST /orders/:orderId/cancel`          Cancel unpaid     Lock order → permit   Owner; order
                                          order             cancellation only if  pending; no
                                                            no successful         verified success
                                                            payment/fulfillment → 
                                                            update status         

  `GET /orders/:orderId/payment-status`   Poll status for   Return internal       Owner; request
                                          UI                state; if stale,      throttling
                                                            schedule server-side  
                                                            reconciliation        
                                                            instead of trusting   
                                                            frontend              
  -------------------------------------------------------------------------------------------------

For a one-product launch, the frontend may omit product selection, but
the backend should still resolve the product from the database and set
the price itself.

### 8.3 PhonePe payment APIs

  --------------------------------------------------------------------------------------------------------------
  Method + endpoint                             Purpose           Controller/service   Main validation
                                                                  flow                 
  --------------------------------------------- ----------------- -------------------- -------------------------
  `POST /payments/checkout`                     Start PhonePe     Authenticate owner → Order belongs to user;
                                                checkout for an   lock/read order →    amount equals order
                                                order             ensure payable state total; not already paid;
                                                                  → create unique      valid idempotency key;
                                                                  merchant             credentials/signature
                                                                  reference/payment    configured
                                                                  attempt → call       
                                                                  PhonePe server-side  
                                                                  using current        
                                                                  official API         
                                                                  specification →      
                                                                  persist              
                                                                  response/status →    
                                                                  return only checkout 
                                                                  URL/token needed by  
                                                                  browser              

  `GET /payments/:paymentId/status`             Return verified   Authorize            Ownership; rate limit;
                                                internal payment  owner/admin → read   provider response must
                                                state             DB state → if        match merchant reference
                                                                  pending/stale,       and amount
                                                                  enqueue or perform   
                                                                  bounded server-side  
                                                                  provider status      
                                                                  check → update       
                                                                  through same         
                                                                  idempotent processor 

  `POST /webhooks/phonepe`                      Receive payment   Verify request       Signature/authenticity;
                                                status            authenticity exactly known merchant reference;
                                                notification      as current PhonePe   correct amount/currency;
                                                                  docs require →       allowed state transition;
                                                                  persist event →      duplicate event safe
                                                                  acknowledge          
                                                                  according to         
                                                                  provider contract →  
                                                                  process idempotently 
                                                                  → reconcile          
                                                                  server-side if event 
                                                                  is ambiguous         

  `POST /payments/:paymentId/reconcile`         Internal/admin    Check provider       Admin/service
                                                support           status server-side → authentication; rate
                                                reconciliation,   compare              limit; never accept
                                                not public member reference/amount →   client claim
                                                endpoint          transition           
                                                                  payment/order        
                                                                  transactionally →    
                                                                  queue paid-order     
                                                                  processing           

  `POST /admin/payments/:paymentId/reconcile`   Admin-triggered   Same service as      Admin permission; reason
                                                reconciliation    above with audit     required
                                                                  trail                
  --------------------------------------------------------------------------------------------------------------

**PhonePe rules:** - Follow the current official PhonePe developer
documentation for API version, authentication/signing, checkout, status
lookup, callback/webhook verification, retries and response codes. Do
not copy an outdated signature scheme from a blog. - Never put merchant
secrets in browser code or public environment variables. - Verify
payment on the server using the provider-supported status/callback
mechanism. - Verify merchant reference, expected amount, currency and
order state. - Handle pending/unknown states; do not mark a payment
successful based on a redirect. - Keep provider calls outside
long-running database transactions where possible. - Use a unique
merchant reference and persist all meaningful transitions. - Schedule
reconciliation for payments left pending after timeouts. - Treat webhook
delivery as at-least-once: duplicate events must not duplicate business
effects.

### 8.4 Network ID and referral APIs

  ---------------------------------------------------------------------------------------------------------------
  Method + endpoint                                 Purpose           Controller/service   Main validation
                                                                      flow                 
  ------------------------------------------------- ----------------- -------------------- ----------------------
  `GET /network-ids`                                List current      Query by             Auth; pagination
                                                    user's IDs        authenticated        
                                                                      `ownerUserId`;       
                                                                      return ID, status,   
                                                                      safe summary         

  `GET /network-ids/:networkId`                     ID detail         Verify ID belongs to Ownership/permission
                                                                      current user or      
                                                                      caller is admin;     
                                                                      return safe details  

  `POST /network-ids`                               Start             Authenticate → lock  Account status; phone
                                                    additional-ID     account/serialize ID verified; max 100;
                                                    purchase flow     count → ensure fewer valid code; target
                                                                      than 100             slot not currently
                                                                      active/pending IDs   occupied; idempotency
                                                                      according to policy  
                                                                      → validate referral  
                                                                      code/target → create 
                                                                      pending order        
                                                                      (preferred) rather   
                                                                      than active ID →     
                                                                      return               
                                                                      order/checkout next  
                                                                      step                 

  `GET /network-ids/:networkId/tree`                Display selected  Verify ownership →   Ownership; max
                                                    ID's tree         query bounded        depth/page size; no
                                                                      subtree by           PII
                                                                      level/page → return  
                                                                      child slots and safe 
                                                                      public IDs only      

  `GET /network-ids/:networkId/children`            Direct children   Verify               Ownership; valid ID
                                                                      ownership/admin      
                                                                      permission → fetch   
                                                                      at most three direct 
                                                                      children and slot    
                                                                      status               

  `GET /network-ids/:networkId/empty-positions`     Show available    Verify ownership →   Ownership; tree depth
                                                    child slots       query slots/child    constraints; no
                                                                      count → return empty personal data
                                                                      slots or safe        
                                                                      referral actions     

  `POST /referral-codes/validate`                   Validate a code   Resolve code → check Rate limit; code
                                                    before order      target               format; no private
                                                                      active/eligible,     owner information
                                                                      depth, capacity and  
                                                                      rules → return       
                                                                      valid/invalid and    
                                                                      safe target info     

  `GET /network-ids/:networkId/summary`             Selected-ID       Aggregate own        Ownership; no
                                                    summary           position, child      arbitrary beneficiary
                                                                      count, progress,     ID
                                                                      commissions; scope   
                                                                      all data to selected 
                                                                      ID                   

  `GET /network-ids/:networkId/placement-history`   Audit/history     Read immutable       Ownership/admin;
                                                                      placement events if  pagination
                                                                      enabled              
  ---------------------------------------------------------------------------------------------------------------

**Placement design:** A referral code should resolve to an intended
parent/slot, not authorize the client to set arbitrary
`parentNetworkId`. The backend derives the parent from the code.
Revalidate availability when the successful payment is processed.

**Tree size:** Do not send the entire theoretical 10-level tree in one
response. Return a bounded subtree, lazy-load children, and represent
empty slots separately from actual IDs.

### 8.5 Member dashboard, commissions and wallet

  ----------------------------------------------------------------------------------------------------------------------------
  Method + endpoint                                  Purpose                      Controller/service flow    Main validation
  -------------------------------------------------- ---------------------------- -------------------------- -----------------
  `GET /member/dashboard`                            Account-level dashboard      Aggregate account profile, Auth; avoid
                                                                                  ID count, recent orders    confusing account
                                                                                  and account-level          totals with
                                                                                  financial summary          selected-ID
                                                                                                             totals

  `GET /member/network-ids/:networkId/summary`       Summary for selected ID      Verify ownership →         Selected ID must
                                                                                  calculate position, direct belong to current
                                                                                  children, qualification    user
                                                                                  and reward status for that 
                                                                                  ID                         

  `GET /member/network-ids/:networkId/progress`      Qualification progress       Read qualification events  Ownership;
                                                                                  and applicable rule        versioned rule
                                                                                  version; compute progress  

  `GET /member/network-ids/:networkId/commissions`   Commission history for       Query commissions with     Ownership; cursor
                                                     selected ID                  beneficiary ID and         bounds
                                                                                  paginate; explain          
                                                                                  pending/blocked/reversed   
                                                                                  status                     

  `GET /member/commissions`                          Account-level commission     Query all authorized       Auth; clearly
                                                     history                      beneficiary IDs owned by   distinguish
                                                                                  user if business policy    account totals
                                                                                  defines account            and ID-specific
                                                                                  aggregation                totals

  `GET /member/wallet`                               Available/pending/reserved   Compute from ledger and    Auth; use integer
                                                     totals                       withdrawal reservations,   paise
                                                                                  or use a reconciled        
                                                                                  projection                 

  `GET /member/wallet/transactions`                  Ledger history               Query ledger rows for      Auth; do not
                                                                                  current user, paginate     expose other
                                                                                                             users' rows

  `GET /member/withdrawals`                          Withdrawal history           Query current user's       Auth; pagination
                                                                                  withdrawals                

  `POST /member/withdrawals`                         Request payout               Validate amount/method →   Positive amount;
                                                                                  transactionally lock       sufficient
                                                                                  balance scope → compute    available
                                                                                  available balance →        balance; account
                                                                                  enforce minimum/KYC policy active; payout
                                                                                  → create withdrawal →      details verified;
                                                                                  reserve funds in ledger →  idempotency
                                                                                  audit                      

  `GET /member/withdrawals/:withdrawalId`            Withdrawal detail            Return only if owned by    Ownership
                                                                                  user                       

  `POST /member/withdrawals/:withdrawalId/cancel`    Cancel request if policy     Lock withdrawal → allow    Ownership; valid
                                                     permits                      only in cancellable states state
                                                                                  → release reservation      
                                                                                  transactionally            
  ----------------------------------------------------------------------------------------------------------------------------

### 8.6 Admin APIs

All admin routes require server-side admin authorization, audit logging,
and preferably MFA for financial/high-risk operations.

  ------------------------------------------------------------------------------------------------------------------------
  Method + endpoint                                   Purpose                    Controller/service flow Validation /
                                                                                                         controls
  --------------------------------------------------- -------------------------- ----------------------- -----------------
  `GET /admin/dashboard`                              Operational overview       Aggregate orders,       Admin permission
                                                                                 payments, active IDs,   
                                                                                 pending commissions and 
                                                                                 withdrawals             

  `GET /admin/users`                                  Search/list accounts       Filter by normalized    Rate limits;
                                                                                 search/status; paginate avoid unnecessary
                                                                                                         PII

  `GET /admin/users/:userId`                          Account detail             Return least-privilege  Admin permission;
                                                                                 profile and associated  audit sensitive
                                                                                 IDs/orders              reads if required

  `PATCH /admin/users/:userId/status`                 Suspend/reactivate account Validate transition →   Admin role;
                                                                                 update transactionally  reason required;
                                                                                 → audit reason          do not erase
                                                                                                         financial history

  `GET /admin/network-ids`                            Search IDs                 Filter by public ID,    Admin permission
                                                                                 owner, parent, status;  
                                                                                 paginate                

  `GET /admin/network-ids/:networkId`                 Inspect ID                 Return position, status Admin permission
                                                                                 and relevant history    

  `PATCH /admin/network-ids/:networkId/status`        Suspend/reactivate ID      Validate transition;    Admin permission;
                                                                                 record actor/reason;    reason required
                                                                                 define effect on child  
                                                                                 placements and          
                                                                                 commissions             

  `GET /admin/orders`                                 Order operations           Filter by               Admin permission
                                                                                 state/date/order        
                                                                                 number; paginate        

  `GET /admin/orders/:orderId`                        Inspect order              Return order and        Admin permission
                                                                                 payment timeline        

  `GET /admin/payments`                               Search payment attempts    Filter by               Admin permission
                                                                                 status/reference/date   

  `POST /admin/payments/:paymentId/reconcile`         Recheck payment            Call reconciliation     Admin permission;
                                                                                 service and audit       provider truth
                                                                                                         only

  `GET /admin/commissions`                            Search commissions         Filter by               Admin permission
                                                                                 beneficiary/source      
                                                                                 order/status/rule       
                                                                                 version                 

  `POST /admin/commissions/:commissionId/approve`     Approve pending reward if  Lock commission →       Admin permission;
                                                      manual review is part of   validate eligibility →  reason/audit
                                                      policy                     transition once → post  
                                                                                 ledger entry            
                                                                                 idempotently            

  `POST /admin/commissions/:commissionId/block`       Block invalid reward       Lock record → set       Admin permission;
                                                                                 reason/status → audit   no deleting

  `POST /admin/commissions/:commissionId/reverse`     Reverse                    Create compensating     Admin permission;
                                                      incorrect/returned-order   ledger entry and        reason and source
                                                      commission                 commission reversal;    reference
                                                                                 preserve history        

  `GET /admin/withdrawals`                            Review payout queue        Filter by               Admin permission
                                                                                 state/date/user         

  `POST /admin/withdrawals/:withdrawalId/approve`     Approve payout             Lock withdrawal → check Admin permission;
                                                                                 reserved funds/KYC →    preferably
                                                                                 transition → audit      maker-checker for
                                                                                                         large amounts

  `POST /admin/withdrawals/:withdrawalId/reject`      Reject payout              Lock withdrawal →       Admin permission;
                                                                                 transition → release    reason required
                                                                                 reservation in ledger → 
                                                                                 audit                   

  `POST /admin/withdrawals/:withdrawalId/mark-paid`   Record externally paid     Validate payout         Admin permission;
                                                      payout if manual payout    reference → transition  reference
                                                      workflow                   and post                required;
                                                                                 debit/settlement        duplicate safe
                                                                                 consistently            

  `GET /admin/audit-logs`                             Review sensitive activity  Filter logs and         Admin permission;
                                                                                 paginate                logs should not
                                                                                                         be editable
                                                                                                         through ordinary
                                                                                                         API

  `GET /admin/commission-rule-sets`                   View rule versions         Return immutable        Admin permission
                                                                                 versions                

  `POST /admin/commission-rule-sets`                  Draft new rule set         Validate complete rule  Admin permission;
                                                                                 configuration; create   cannot
                                                                                 draft                   retroactively
                                                                                                         mutate past rules

  `POST /admin/commission-rule-sets/:id/activate`     Activate approved rules    Validate effective date Higher
                                                                                 and completeness;       privilege/dual
                                                                                 retire previous set     approval
                                                                                 atomically; audit       recommended
  ------------------------------------------------------------------------------------------------------------------------

Never expose internal reconciliation or arbitrary ledger-adjustment APIs
to normal members.

------------------------------------------------------------------------

## 9. Controller/service architecture

Recommended request path:

``` text
HTTP request
  → Route Handler
    → Session authentication
      → Authorization / ownership check
        → Zod schema validation
          → Controller (request/response orchestration)
            → Domain service (business rules)
              → Repository / Prisma
                → PostgreSQL transaction and constraints
```

### Responsibilities

**Route Handler** - Parse request and route parameters. - Apply basic
security headers/rate limits where appropriate. - Invoke authentication
and validation. - Return consistent HTTP status and response shape.

**Controller** - Convert validated HTTP input into service arguments. -
Never trust `userId`, price, payment status, parent ID or commission
amount from the client. - Map known domain errors to safe API responses.

**Service** - Own business logic: account limits, placement, payment
transitions, qualification and commission rules, withdrawal balance
reservation. - Define transaction boundaries and idempotency. - Call
provider integrations outside database locks when appropriate.

**Repository / Prisma** - Encapsulate database queries. - Use explicit
transactions and appropriate isolation/locking for concurrent
operations. - Keep queries scoped by ownership. - Avoid leaking Prisma
records directly to clients.

**Provider adapter** - Encapsulate PhonePe API version, request
authentication/signing, response parsing, status lookup and webhook
verification. - Keep provider-specific code out of domain services.

**Background worker** - Process durable outbox jobs. - Retry transient
errors with exponential backoff. - Move permanently failing work to a
dead-letter state and alert operators. - All jobs must be idempotent.

### Example: `POST /orders` controller logic

1.  Require authenticated user.
2.  Parse and validate product ID, purpose, quantity, referral code and
    idempotency key.
3.  Fetch product from DB; reject inactive product.
4.  Calculate amount from DB price, not client input.
5.  If an ID placement is intended, resolve referral code to parent/slot
    and validate basic eligibility.
6.  Create a pending order with price snapshot in a transaction.
7.  Return order ID and next step; do not activate a network ID yet.

### Example: PhonePe successful-payment processing

1.  Verify webhook authenticity according to current PhonePe docs, or
    retrieve status through the official server-side status API.
2.  Resolve the merchant reference to the exact internal payment/order.
3.  Validate expected amount, currency and permitted state transition.
4.  Persist the event with deduplication.
5.  In a DB transaction, lock payment/order, recheck current state and
    mark success only once.
6.  Add a durable `PROCESS_PAID_ORDER` outbox job.
7.  Return provider-required acknowledgement.
8.  Worker processes paid order idempotently:
    -   validate account ID cap and intended placement again;
    -   lock parent/slot and owner account scope;
    -   if placement valid, create/activate the ID and record
        qualification facts;
    -   if not valid, mark the order/fulfillment as an exception and
        follow the approved recovery policy;
    -   calculate commissions from the versioned rules;
    -   create commission rows and ledger credits according to
        status/hold policy;
    -   mark job done.
9.  If any stage fails, retry without duplicating records.
    Reconciliation must be able to recover successful payments whose
    business processing did not complete.

Keep network calls outside long-running database transactions. The
payment state transition and durable job insertion should be atomic in
PostgreSQL.

### Example: three-child-safe placement

Preferred service algorithm (pseudo-code):

``` text
begin transaction
  lock intended parent network_ids row FOR UPDATE
  lock owner users row (or dedicated account-capacity row) to serialize ID count
  re-read parent status, depth and current children
  re-check owner ID count including pending/active IDs according to policy
  reject if parent has 3 children
  reject if depth would exceed maximum
  reject self-parenting or circular ancestry
  allocate an available slot if using network_placements
  create network ID with parentNetworkId
  record placement history
commit
```

All paths that create/move a child must use the same protocol. A
frontend check is only for user experience and is never the enforcement
layer. A normal `CHECK` constraint cannot count child rows in another
table. For stronger database-level protection, implement a carefully
tested trigger or explicit slot table with uniqueness constraints.

### Example: commission engine

Use a pure calculation layer that accepts: - verified source order; -
purchaser's network ID; - actual ancestor path; - applicable rule-set
version; - qualification events and exclusions; -
self-referral/duplicate-beneficiary policy.

It returns a list of commission entitlements without writing to the
database. A separate transactional service persists those entitlements
using unique idempotency keys. Never calculate rewards from
client-submitted tree data. Never create commissions for unverified or
ineligible orders. Reversals should create compensating entries rather
than delete history.

------------------------------------------------------------------------

## 10. Validation and enforcement matrix

  -----------------------------------------------------------------------------------------------------------
  Rule                    API validation          Database/transaction enforcement
  ----------------------- ----------------------- -----------------------------------------------------------
  Unique phone            Normalize and validate  Unique index on `users.phoneE164`

  Unique public network   Generate server-side    Unique constraint
  ID                                              

  Unique referral code    Generate server-side    Unique constraint

  Maximum 100 IDs per     Check in service        Serialize by locking owner/account-capacity row; count
  account                                         pending/active per policy; transaction

  Maximum three children  Friendly pre-check      Parent lock + count/slot allocation in transaction;
  per parent                                      optional trigger

  No self-parent          Reject in service       `CHECK(parentNetworkId IS NULL OR parentNetworkId <> id)`
                                                  where supported by schema

  No cycles               Walk                    Do in same transaction under placement serialization;
                          ancestors/descendants   immutable placements simplify this
                          before insert/move      

  Maximum depth           Calculate parent        Transactional validation; optionally DB trigger
                          depth + 1               

  ID activation requires  Never trust client      Only paid-order worker can activate; FK to qualifying order
  payment                                         where suitable

  Price integrity         Never accept price from Persist server-calculated order snapshot
                          browser                 

  Payment integrity       Verify provider         Unique merchant/provider references; state-transition
                          server-side             transaction

  Duplicate webhooks      Provider event dedupe   Unique event identifier and idempotent processor

  One-time reward         Check qualification     Unique entitlement key + transaction
                          facts                   

  No commission for       Payment-state guard     Commission service only consumes verified paid events
  unpaid order                                    

  No double withdrawal    Check balance for UX    Lock ledger/balance scope and reserve funds atomically

  Ownership               Auth + ownership check  Every query scoped to session owner; don't rely on UI
                                                  hiding buttons

  Admin actions           RBAC and reason         Audit row written transactionally with state change

  Safe user input         Zod schema              DB constraints as last line of defense

  No financial float      Integer paise           Integer columns and non-negative checks
  errors                  validation              
  -----------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 11. Payment and ID-creation state machines

### Order/payment states

A possible order state machine:

``` text
PENDING_PAYMENT
  ├── verified success → PAID
  ├── definitive failure → PAYMENT_FAILED
  ├── user cancels before payment → CANCELLED
  └── payment succeeds but placement cannot complete → EXCEPTION

PAID
  ├── eligible fulfillment completed → remains PAID
  └── approved refund/return process → REFUND_PENDING → REFUNDED
```

Payment attempts have their own states: `CREATED`, `PENDING`, `SUCCESS`,
`FAILED`, `CANCELLED`, `UNKNOWN`. An order can have more than one
payment attempt if retries are permitted. Never allow a failed late
webhook to overwrite a previously verified success.

### ID lifecycle

``` text
No active ID
  → authenticated account + verified phone
  → create pending order
  → initiate PhonePe checkout
  → server verifies successful payment
  → revalidate owner limit and parent/slot
  → create/activate network ID
  → record qualification/placement event
  → queue commission processing
```

If the payment succeeds but the requested position is no longer
available, do not silently select another parent. Record the exception,
notify the user/admin, and follow the pre-approved policy.

------------------------------------------------------------------------

## 12. Tree queries and performance

-   Add indexes on `network_ids.ownerUserId`,
    `network_ids.parentNetworkId`, `network_ids.publicId`, and
    `network_ids.referralCode`.
-   Use recursive PostgreSQL CTEs or a maintained materialized path for
    descendants/ancestors when needed.
-   `placementPath` is denormalized derived data: if used, update it
    transactionally and test consistency. Do not maintain it casually in
    a separate asynchronous step.
-   Lazy-load each tree branch. Return at most three direct children per
    parent and a bounded depth per request.
-   Do not send tens of thousands of possible descendants to the
    browser.
-   Return empty slots as explicit UI data; do not fabricate child IDs
    for unoccupied slots.
-   Use pagination for admin searches and transaction histories.
-   Add query timeouts and indexes based on real query plans.

------------------------------------------------------------------------

## 13. Security and privacy

1.  Store secrets only in server-side environment variables/secret
    management; never prefix PhonePe secrets with `NEXT_PUBLIC_`.
2.  Use HTTPS in production.
3.  Set session cookies `HttpOnly`, `Secure`, and an appropriate
    `SameSite` policy; add CSRF protection for cookie-authenticated
    mutations.
4.  Hash passwords with a modern password-hashing algorithm if password
    login exists. Hash OTPs and session secrets.
5.  Rate-limit OTP requests, OTP verification, login, referral-code
    validation, checkout and withdrawal actions.
6.  Use strict role-based access control and ownership checks for every
    member resource.
7.  Validate with Zod, but also use database constraints.
8.  Avoid leaking phone numbers, addresses, bank details or payment
    payloads in tree endpoints and logs.
9.  Sanitize provider payloads before storing/logging them.
10. Use idempotency keys for retryable mutations.
11. Maintain audit logs for status changes, commission adjustments,
    refunds, withdrawals and rule changes.
12. Back up PostgreSQL and test restoration.
13. Monitor webhook failures, payment reconciliation backlog, outbox
    retries, suspicious OTP traffic and failed payout processing.
14. Use least-privilege database credentials and separate
    production/test PhonePe credentials.
15. Define data-retention and account-closure processes that preserve
    legally required financial/audit records.

------------------------------------------------------------------------

## 14. Testing plan

### Unit tests

-   Price and total calculation in paise.
-   Referral code parsing and resolution.
-   Placement depth calculation.
-   Three-child and ten-level boundary rules.
-   Commission calculation for each approved rule-set version.
-   Qualification and reversal rules.
-   Withdrawal state transitions.

### Database/integration tests

-   Duplicate phone rejected.
-   Duplicate public ID/referral code rejected.
-   One user can own multiple IDs up to 100.
-   101st ID is rejected under concurrent requests.
-   Fourth child is rejected under concurrent requests.
-   A child cannot be attached to two parents.
-   Circular hierarchy is rejected.
-   Two simultaneous placements into the same final slot: exactly one
    succeeds.
-   Duplicate PhonePe webhook does not duplicate payment, ID, commission
    or ledger entry.
-   Payment amount/reference mismatch is rejected.
-   Successful payment followed by DB/job failure is recoverable.
-   A pending/failed payment never activates an ID.
-   A refund/reversal preserves ledger history.
-   Two simultaneous withdrawals cannot reserve the same funds.
-   Member A cannot read Member B's orders, IDs, commissions or
    withdrawals.
-   Non-admin cannot call admin APIs.
-   Tree response contains no private phone or payout data.

### End-to-end tests

1.  New user → verify phone → create order → PhonePe sandbox checkout →
    verify payment → exactly one ID created.
2.  Existing user → create additional ID → pay → intended parent
    placement.
3.  User selects each owned ID → sees only that ID's tree and rewards.
4.  Parent has three children → fourth placement is rejected.
5.  Referral target fills during checkout → payment processing enters
    exception workflow, not silent reassignment.
6.  Member earns approved commission → ledger reflects it once.
7.  Member requests withdrawal → funds reserved → admin approves/rejects
    → ledger/reservation reconciled.

------------------------------------------------------------------------

## 15. Implementation phases

### Phase 0 --- Confirm business and compliance rules

-   Finalize exact definition of root and depth.
-   Decide whether the 100-ID limit counts pending IDs, active IDs,
    suspended IDs or all created IDs.
-   Finalize referral-code semantics and whether a code points to a
    parent or a specific slot.
-   Finalize commission trigger, levels, beneficiaries, one-time reward,
    qualification, reversals and hold periods.
-   Finalize order cancellation/refund/failed-placement policy.
-   Confirm payout, KYC, tax and consumer-protection obligations with
    qualified advisers.

### Phase 1 --- Foundation

-   Create Next.js TypeScript app and Prisma/PostgreSQL.
-   Configure strict TypeScript, Zod, environment validation, error
    handling and logging.
-   Create initial migrations, seed the Meta Ved product, and set up
    tests.
-   Implement session/OTP flow and RBAC.

### Phase 2 --- Commerce and payment

-   Implement product reads, order creation and order history.
-   Implement PhonePe adapter in sandbox.
-   Implement payment events, webhook verification, status
    reconciliation, idempotency and outbox processing.
-   Test duplicate/out-of-order webhooks and payment recovery.

### Phase 3 --- Network IDs and tree

-   Implement referral-code generation/validation.
-   Implement concurrency-safe parent slot allocation and account ID
    cap.
-   Implement additional-ID purchase flow and post-payment placement.
-   Implement selected-ID selector, bounded tree API, empty slots and
    placement history.

### Phase 4 --- Commission and wallet

-   Implement versioned rules only after business sign-off.
-   Implement qualification events and pure calculation engine.
-   Implement commission idempotency and ledger posting/reversal.
-   Implement wallet summary and withdrawal reservation/state machine.

### Phase 5 --- Admin and operations

-   Implement user/order/payment/network search.
-   Implement commission and withdrawal review with audit trails.
-   Implement payment reconciliation dashboard, failed-job retries and
    operational alerts.
-   Add maker-checker review for sensitive financial actions if
    appropriate.

### Phase 6 --- Production readiness

-   Security review and dependency audit.
-   Load/concurrency tests for placement and withdrawal paths.
-   PhonePe production credential/configuration review.
-   Backup/restore drill.
-   Monitoring, alerting and incident-response runbook.
-   Legal/consumer-protection/compliance approval before enabling real
    sales and commission payouts.

------------------------------------------------------------------------

## 16. Deployment and environment variables

Use validated server-only environment variables. Names below are
illustrative; adapt them to the chosen PhonePe API version and SDK.

``` text
DATABASE_URL=
DIRECT_URL=
APP_BASE_URL=
SESSION_SECRET=
OTP_PROVIDER_API_KEY=
OTP_PROVIDER_SENDER_ID=
PHONEPE_ENV=
PHONEPE_CLIENT_ID=
PHONEPE_CLIENT_SECRET=
PHONEPE_CLIENT_VERSION=
PHONEPE_WEBHOOK_USERNAME=
PHONEPE_WEBHOOK_PASSWORD=
REDIS_URL=
LOG_LEVEL=
```

-   `DATABASE_URL`: pooled runtime connection if using a pooler.
-   `DIRECT_URL`: direct database connection for migrations if the
    deployment/provider requires it.
-   PhonePe variable names depend on the currently approved integration;
    do not assume every API version uses these exact names.
-   Validate environment variables at startup.
-   Never commit `.env` files.
-   Keep sandbox and production credentials separate.
-   Rotate exposed credentials and document operational ownership.

------------------------------------------------------------------------

## 17. Decisions to sign off before code

  -----------------------------------------------------------------------
  Decision                            Recommended default
  ----------------------------------- -----------------------------------
  User/ID model                       Separate `users` and `network_ids`

  Product model                       Keep `products` table with one
                                      seeded product

  Hierarchy representation            `parentNetworkId` self-reference;
                                      optional explicit slot table

  Child cap                           Three slots, allocated
                                      transactionally under parent lock

  Account ID cap                      100 IDs, enforced with serialized
                                      per-account allocation

  Root depth                          Root depth = 0; maximum descendant
                                      depth = 10, if that matches the
                                      business definition

  Payment proof                       Server-side PhonePe verification;
                                      never browser redirect

  ID activation                       Only after verified payment and
                                      successful placement

  Failed placement after payment      Explicit exception and
                                      support/refund policy; never
                                      silently reassign

  Money representation                Integer paise

  Commission history                  Versioned rules, immutable
                                      commission records and append-only
                                      ledger

  Commission beneficiary              Must be explicitly decided: network
                                      ID, account owner, or both for
                                      audit

  Refund policy                       Must be legally reviewed; do not
                                      assume an absolute no-refund policy
                                      is enforceable

  Launch                              Sandbox and legal/compliance review
                                      before live payments and commission
                                      payouts
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 18. Official references to verify during implementation

Use the current official documentation at implementation time,
especially because payment-provider APIs and framework versions change:

-   Next.js documentation: https://nextjs.org/docs
-   Prisma documentation: https://www.prisma.io/docs
-   PostgreSQL documentation: https://www.postgresql.org/docs/
-   PhonePe developer portal: https://developer.phonepe.com/
-   Zod documentation: https://zod.dev/

For the referral/commission model, obtain professional advice on Indian
direct-selling, consumer-protection, advertising, tax and payout
obligations. The technical plan does not determine whether the proposed
business model is legally compliant.

------------------------------------------------------------------------

## Final recommendation

Build the **separate-table modular monolith** first. Keep account
identity, hierarchy positions, orders, payment attempts, commissions and
ledger entries as distinct records. Use PostgreSQL constraints and
transactions as the final guardrails; do not rely on frontend checks.
Implement PhonePe reconciliation and idempotency before enabling ID
activation. Most importantly, freeze the commission semantics and
compliance requirements before writing the commission engine, because a
small ambiguity there can become a large financial and operational
defect.
