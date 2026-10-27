# Tulsi Swaraj - Project Memory & Context Log

> **MANDATORY OPERATING RULE**: Every action, feature implementation, architectural decision, and configuration change performed in this project MUST be documented in this file. Before starting new work, always review this document for context.

---

## 1. Project Overview & Architecture Reference

- **Product:** Tulsi Swaraj E-commerce Platform (Direct-to-Customer Storefront & Admin)
- **Primary Product:** Tulsi Meta Ved Herbal Mix (Initial display ₹500 = 50,000 paise)
- **Architecture Strategy:** Modular Monolith in a pnpm workspace
- **Backend Stack:** Node.js, Express.js (ESM), TypeScript, Prisma ORM, PostgreSQL
- **Frontend Stack:** Next.js 16 (App Router), React 19, TailwindCSS v4, TypeScript, Zustand, Zod, React Hook Form, Lenis, GSAP ScrollTrigger
- **Payment Gateway:** PhonePe Payment Gateway (Server-to-server callbacks, authoritative status reconciliation)
- **Documentation:**
  - [prd.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/prd.md)
  - [architecture.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/architecture.md)

---

## 2. Activity & Change Log

### [2026-10-15 17:00 IST] - Monorepo Setup, API Scaffolding & Frontend Integration

#### A. Monorepo Base Setup

- **Workspace Config:** Created [pnpm-workspace.yaml](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/pnpm-workspace.yaml) linking `apps/*` and `packages/*`.
- **Environment Template:** Added [.env.example](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/.env.example) detailing Node, Postgres, Auth, and PhonePe sandbox variables.
- **Root Configurations:** Created root [package.json](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/package.json), [tsconfig.base.json](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/tsconfig.base.json), [.gitignore](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/.gitignore), and [README.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/README.md).
- **Documentation Migration:** Organized specs into [docs/prd.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/prd.md) and [docs/architecture.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/architecture.md).

#### B. Shared Packages Created

1. **`packages/contracts` (`@tulsi/contracts`)**:
   - [product.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/packages/contracts/src/product.ts): Product schemas, status (`DRAFT`, `PUBLISHED`, `ARCHIVED`), and DTOs.
   - [checkout.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/packages/contracts/src/checkout.ts): Shipping address, checkout item, request, and response schemas.
   - [order.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/packages/contracts/src/order.ts): Order state machine (`PENDING_PAYMENT`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `PAYMENT_REVIEW`), payment status machine (`INITIATED`, `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `REFUND_PENDING`, `REFUNDED`, `RECONCILIATION_REQUIRED`), and order item schemas.
2. **`packages/config` (`@tulsi/config`)**:
   - Base shared TypeScript configurations.
3. **`packages/utils` (`@tulsi/utils`)**:
   - [currency.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/packages/utils/src/currency.ts): `formatPaiseToInr` and `rupeesToPaise` for integer-paise calculations.
4. **`packages/ui` (`@tulsi/ui`)**:
   - Prepared package placeholder for shared design tokens and UI components.

#### C. Backend API Scaffolding (`apps/api`)

- **Package:** [@tulsi/api](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/package.json) linking workspace contracts and utils.
- **Server Bootstrap:** [server.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/server.ts) with port listening and graceful shutdown (`SIGINT`/`SIGTERM`).
- **App Factory:** [app.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/app.ts) configured with Helmet, CORS, body-parser limits, request-id, router, 404, and global error handling.
- **Configuration & Middleware:**
  - [env.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/config/env.ts): Zod-validated environment schema.
  - [cors.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/config/cors.ts): Restricted origins based on `WEB_ORIGIN`.
  - [logger.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/config/logger.ts): Structured JSON logger.
  - [request-id.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/middleware/request-id.ts), [validate.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/middleware/validate.ts), [not-found.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/middleware/not-found.ts), [error-handler.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/middleware/error-handler.ts), [authenticate.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/middleware/authenticate.ts), [authorize.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/middleware/authorize.ts), [rate-limit.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/middleware/rate-limit.ts).
- **Modules & Routes:**
  - Catalogue: [product.routes.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/modules/catalogue/product.routes.ts), [product.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/modules/catalogue/product.service.ts)
  - Checkout: [checkout.routes.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/modules/checkout/checkout.routes.ts), [checkout.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/modules/checkout/checkout.service.ts)
  - Orders: [order.routes.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/modules/orders/order.routes.ts), [order.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/modules/orders/order.service.ts)
  - Payments: [payment.routes.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/modules/payments/payment.routes.ts), [phonepe.provider.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/modules/payments/phonepe.provider.ts)
  - Admin & Auth: [admin.routes.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/modules/admin/admin.routes.ts), [auth.routes.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/modules/auth/auth.routes.ts)
  - Jobs: [reconcile-payments.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/src/jobs/reconcile-payments.ts)
- **Database (Prisma):**
  - [schema.prisma](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/prisma/schema.prisma) with full PostgreSQL schema: `products`, `product_images`, `orders`, `order_items`, `payments`, `payment_events`, `admin_users`, and `order_status_history`.

#### D. Frontend Prototype Integration (`apps/web`)

- The user pasted the existing web frontend prototype into [apps/web](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web).
- Stack identified: React 19 (`react@^19.2.8`), Vite 8 (`vite@^8.3.0`), TailwindCSS v4 (`@tailwindcss/vite@^4.3.3`), Zustand (`zustand@^5.0.15`), React Router v7 (`react-router-dom@^7.18.4`).
- Dependencies installed via `npm i` successfully.
- **Frontend Inventory Discovered:**
  - **Pages (20):** `HomePage.tsx` (scroll popup, hero, buy now), `ProductDetailPage.tsx`, `CartPage.tsx`, `CheckoutPage.tsx`, `OrderConfirmationPage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `AboutPage.tsx`, `ContactPage.tsx`, Customer Dashboard pages (`DashboardPage.tsx`, `DashboardOrdersPage.tsx`, `DashboardOrderDetailPage.tsx`, `DashboardProfilePage.tsx`, `DashboardReferralPage.tsx`, `DashboardSupportPage.tsx`), and Policy pages (`PrivacyPolicyPage`, `TermsPage`, `ShippingPolicyPage`, `ReturnsRefundsPage`).
  - **State Stores:** `useCartStore.ts` (Zustand), `useAuthStore.ts` (Zustand).
  - **Static Mock Data:** `data/productData.ts`, `data/faqData.ts`, `data/policiesData.ts`.
- **Root Scripts Added:** `"dev:web": "pnpm --filter tulsimlm-prototype dev"` added to root [package.json](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/package.json).

### [2026-10-15 17:10 IST] - GSAP Animation Library Installation

- **Action:** Installed `gsap` and `@gsap/react` into `apps/web`.
- **Packages Installed:** `gsap` (`^3.15.0`) and `@gsap/react` (`^2.1.2`).
- **Files Modified:** [apps/web/package.json](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/package.json), lockfiles updated, and workspace synchronized via `pnpm install`.
- **Outcome:** Animation utilities available for rich scroll effects, hero entrance animations, and micro-interactions across the storefront.

### [2026-10-15 17:35 IST] - Product Container Assembly Section (ScrollTrigger)

- **Action:** Created [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx) and mounted it directly below the Hero Section in [HomePage.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/pages/HomePage.tsx).
- **Behavior:**
  - Cap (`containerTop.png`, 209x97) scrolls down from above.
  - Body (`containerBottom.png`, 208x374) scrolls up from below.
  - They lock into seamless alignment with identical proportional width and plain background (`#F8F5ED`).
- **Manual Configuration Tuning:**
  - Added explicit, commented constants (`CAP_START_Y`, `BODY_START_Y`, `CAP_FINAL_Y`, `BODY_FINAL_Y`) and JSX styling notes for manual positioning, width, and seam overlap tweaks.

### [2026-10-15 18:05 IST] - Bottle Hold, Move Down & Circular Ingredients Bloom

- **Action:** Enhanced [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx) with a multi-phase ScrollTrigger timeline:
  1. **Phase 1 (Assembly):** Cap converges with body (retaining user's tuned `CAP_FINAL_Y = 42`).
  2. **Phase 2 (Hold):** A brief hold pause while fully assembled.
  3. **Phase 3 (Move Down):** The whole assembled container (`bottleGroupRef`) moves downward by `BOTTLE_MOVE_DOWN_Y = 110px`.
  4. **Phase 4 (Circular Ingredients Bloom):** 4 key ingredients (`AWLA.png`, `HERBS.png`, `LAHSUN.png`, `SHILAJIT.png`) emerge with a smooth elastic transition (`back.out(1.2)`) from behind the bottle in a circular arrangement.
- **Manual Configuration Tuning:**
  - Placed customizable `BOTTLE_MOVE_DOWN_Y` and `INGREDIENT_POSITIONS` (awla, herbs, lahsun, shilajit) with responsive scaling factors at the top of the component.

### [2026-10-15 18:15 IST] - Desktop Layout Refactor (40% Text / 60% Effect)

- **Action:** Refactored [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx) to resolve laptop header crowding:
  - **Left Column (40% width on Desktop):** Contains left-aligned brand badge, headline ("Harmonized by Nature. Crafted to Wholeness."), description, and botanical feature highlight pills.
  - **Right Column (60% width on Desktop):** Dedicated animation canvas housing the assembled bottle and radial ingredient bloom.
  - **Responsiveness:** Gracefully collapses to a clean vertical stack on mobile/tablet screens.
- **Outcome:** Clean, editorial split presentation on laptops/desktops with zero header congestion while keeping the full ScrollTrigger animation pinned and smooth.

### [2026-10-15 18:20 IST] - Added Tulsi Ingredient & Removed Opacity Fading

- **Action:** Updated [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx):
  1. **5th Ingredient Added:** Integrated `tulsi.png` at the apex / top-center position of the radial arrangement.
  2. **Removed Opacity Animations:** Completely removed opacity fades across all animated elements (cap, body, text, shadow, and ingredients). All elements remain at 100% solid opacity, moving purely through physical translation (`x`, `y`) and scale (`scale`).
  3. **Updated 5-Point Symmetry:** Tulsi (Top-Center), Amla (Upper-Left), Wild Herbs (Upper-Right), Lahsun (Bottom-Left), and Shilajit (Bottom-Right).

### [2026-10-15 18:22 IST] - Reduced Container Size (Mobile & Desktop)

- **Action:** Scaled down the product container (cap & body) in [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx):
  - **Previous Widths:** `w-[180px] sm:w-[220px] md:w-[240px]`
  - **Reduced Widths:** `w-[130px] sm:w-[155px] md:w-[175px] lg:w-[180px]` (~25% more compact, refined proportion).
  - **Proportional Contact Shadow:** Adjusted to `w-28 sm:w-36 md:w-40 h-2.5`.
- **Outcome:** Container is sleeker and well-balanced on desktop and mobile, giving the emerging ingredients greater clearance and visual prominence.

### [2026-10-15 18:27 IST] - Two-Scene Full Viewport Experience (Assembly & Ingredients)

- **Action:** Implemented a full-viewport, 2-scene pinned cinematic experience in [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx):
  1. **Scene 1 (Assembly Stage):**
     - Full 100vh/100vw viewport with giant low-opacity watermark: `"TULSI SWAROJGAR"` (`text-[14vw]`, `opacity: 0.06`).
     - Cap (`containerTop.png`) from top and body (`containerBottom.png`) from bottom converge and combine into a unified product container in the center.
  2. **Travel Transition (Scroll Down):**
     - As user scrolls down, the assembled bottle travels downwards directly with the scroll, smoothly migrating from Scene 1 into Scene 2.
  3. **Scene 2 (Ingredients Stage):**
     - Full viewport ingredients section with header ("5 Potent Ayurvedic Ingredients").
     - As the bottle lands in its designated position, the 5 ingredients (Tulsi, Amla, Wild Herbs, Lahsun, Shilajit) bloom outward in a radial circular arrangement around the bottle.

### [2026-10-15 18:30 IST] - Two Distinct Full-Height Sections (h-screen & w-full each)

- **Action:** Structured [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx) as **two distinct, uncollapsed sections** in document flow (total 200vh height):
  - **Section 1 (`w-full h-screen min-h-screen`):** Distinct full-screen Assembly section with giant low-opacity watermark `"TULSI SWAROJGAR"`. Cap and body converge at center.
  - **Section 2 (`w-full h-screen min-h-screen`):** Distinct full-screen Ingredients section below Section 1 with header and trust markers - **Pinned Transition Layer:** Pinned smoothly across both sections (`start: 'top top'`, `end: 'bottom bottom'`) so the assembled bottle travels with the scroll down from Section 1 into Section 2, where the 5 ingredients bloom outwards.

### [2026-10-15 18:35 IST] - Complete Re-Engineering of Product Assembly & Scroll Animation

- **Action:** Executed a comprehensive audit and ground-up architectural rebuild of [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx) in `apps/web`.
- **Root Causes Identified & Fixed:**
  1. _Cap & Container Misalignment:_ Analyzed exact pixel boundaries: `containerTop.png` (209x97 px) has visible neck rim `[34, 175]` px, and `containerBottom.png` (208x374 px) has identical neck opening `[34, 175]` px with 12px overlap. Replaced fragile magic offsets with a scale-invariant container frame (aspect ratio `208/459`, body at `top: 18.52%`). Cap and body remain locked on the identical vertical axis at any screen width.
  2. _Pinning & Section Jumps:_ Eliminated previous collapsed layout caused by `pinSpacing: false` across unlinked sections. Established a single pinned stage with `pinSpacing: true`, `end: '+=280%'`, and scrub tuning (`scrub: 0.8`), reserving proper document flow space so the following section ("Our Guiding Philosophy") flows naturally without snapping or overlapping.
  3. _Coordinate System Correction:_ Removed duplicate vertical offsets. Ingredients are now positioned strictly relative to the bottle center `(0, 0)` in polar coordinates, blooming outward smoothly.
  4. _Multi-Phase Master Timeline:_
     - **Phase A (Assembly):** Cap descends and body rises into sealed union.
     - **Phase B (Hold):** Assembled product remains completely stable for inspection.
     - **Phase C (Transition):** Bottle travels down smoothly (`y: 90px`); Act 1 header seamlessly cross-fades into Act 2 header.
     - **Phase D (Bloom Reveal):** 5 ingredients (`tulsi.png`, `AWLA.png`, `HERBS.png`, `LAHSUN.png`, `SHILAJIT.png`) emerge radially from behind the bottle with subtle elastic settling.
     - **Phase E (Final Composition):** Balanced, readable arrangement holding before unpinning.
  5. _Responsive Breakpoints & Reduced Motion:_ Used `gsap.matchMedia()` with dedicated coordinate scales for Desktop (`(min-width: 1024px)`), Tablet (`(min-width: 640px) and (max-width: 1023px)`), Mobile (`(max-width: 639px)`), and `(prefers-reduced-motion: reduce)`.
- **Verification & Testing:**
  - Automated browser subagent verified all 7 phases: Hero load, Phase A assembly, Phase B hold, Phase C transition, Phase D ingredient bloom, Phase E unpinning, and upward reverse scroll.
  - TypeScript compilation and Vite production build verified with 0 errors.

### [2026-10-15 19:10 IST] - Rebuilt Product Story into Two Full-Screen Sections

- **Action:** Re-engineered [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx) to provide two genuine, separate full-viewport semantic sections (`min-h-[100svh]`, `w-full` each):
  1. _Section 1 (`#section-bottle-assembly`):_ Dedicated Brand Introduction & Bottle Assembly section. Features oversized, low-opacity background watermark `"TULSI SWAROJGAR"` (`text-[13vw]`, `opacity: 0.05`), editorial header (`Harmonized by Nature. Assembled with Precision.`), and separated cap and body on the vertical axis.
  2. _Persistent Shared Visual Stage:_ Implemented an overlay stage spanning across both sections with a sticky viewport container (`sticky top-0 h-[100svh]`). Keeps the assembled bottle continuously visible without visual jumps, resets, duplicate copies, or artificial cross-fades.
  3. _Transition Between Sections:_ The bottle travels smoothly downward (`y: 0` to `y: 70px` on desktop) as the user scrolls naturally between Section 1 and Section 2.
  4. _Section 2 (`#section-ingredient-showcase`):_ Full-screen Ingredient Showcase section. As the bottle arrives in position, 5 authentic Ayurvedic ingredients (`tulsi.png`, `AWLA.png`, `HERBS.png`, `LAHSUN.png`, `SHILAJIT.png`) emerge radially from behind the bottle with subtle opacity and scale transitions.
  5. _Three Independent Timelines:_
     - `assemblyTimeline`: Pins Section 1 for short controlled scroll (`+=75%`), descending cap to bottle rim with an appreciation hold.
     - `transitionTimeline`: Triggers as Section 2 enters viewport (`start: 'top bottom'`, `end: 'top top'`), translating bottle smoothly down.
     - `ingredientTimeline`: Pins Section 2 (`+=85%`), blooming the 5 ingredients radially with staggered reveals.
- **Verification & Testing:**
  - Vite production build passed with 0 errors (`npm run build`).
  - Automated browser subagent recorded and verified all phases: Section 1 entrance, cap assembly, downward transition, radial ingredient bloom, clean unpinning into next section, and full scroll reversibility.
  - Added inline configuration comments explaining cap starting position (`capStartY`), bottle travel distance (`bottleTravelY`), radial ingredient coordinates, and cap landing position (`y: 0`, `x: 0`).

### [2026-10-15 19:30 IST] - Cap Initial Rotation & 40/60 Desktop Split Layout

- **Action:** Updated [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx):
  1. _Cap Initial Rotation:_ Added `capInitialRotation` (-14° desktop, -10° tablet, -8° mobile). The cap now begins with an organic suspended tilt in mid-air, and smoothly straightens out to 0° as it descends and locks into the bottle opening.
  2. _Desktop 40% / 60% Split Layout:_ Re-architected Section 2 (Ingredient Showcase) for laptop/desktop screens (`lg:`):
     - Left Column (40% width): Dedicated to editorial narrative, "5 Sacred Ayurvedic Pillars" header, description, and 4 trust cards.
     - Right Column (60% width): Dedicated canvas for the assembled bottle and radial blooming ingredients.

### [2026-10-15 19:42 IST] - Lenis Smooth Scroll Integration & Extended Timeline Holds

- **Action:**
  1. _Lenis Installation & Setup:_ Installed `lenis` (`^1.x`) and imported `lenis/dist/lenis.css`. Configured global smooth inertial scroll in [App.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/App.tsx) with `duration: 1.2`, synchronized with GSAP ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add((time) => lenis.raf(time * 1000))`, and `gsap.ticker.lagSmoothing(0)`.
  2. _Extended Section Holds in [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx):_
     - _Assembly Stage (Section 1):_ Expanded scroll pin distance to `end: "+=120%"` with `scrub: 1`. Cap descends and straightens over duration 0.8, followed by a generous **1.2s appreciation hold** where the assembled bottle remains completely stable across ~60% of the scroll.
     - _Ingredient Stage (Section 2):_ Expanded scroll pin distance to `end: "+=135%"` with `scrub: 1`. Ingredients emerge radially over duration 0.65, followed by a generous **1.35s composition hold** keeping all 5 botanicals stably bloomed in view.
  3. _Cleaned Unused Variables:_ Resolved TS warnings for `Sparkles`, `sec2HeaderRef`, and `sec2FooterRef`.
- **Verification & Testing:**
  - `npm run build` in `apps/web` succeeded with 0 errors.
  - Automated browser subagent verified smooth inertial scrolling, Section 1 assembly hold, smooth transition into the 60% right column, Section 2 radial bloom hold, and reverse scroll.
  - Updated desktop `bottleTravelY` to 75px and set `bottleTravelX` to 0, centering the container and radial ingredients across Section 2 on all screen sizes.
  - Integrated `/images/product_back.png` into `FLAGSHIP_PRODUCT.images` and updated `verifiedIngredients` and `usageInstructions` in `productData.ts` based on authentic bottle label.

### [2026-10-15 20:30 IST] - Global Typography Overhaul (ProductDetailPage Alignment)

- **Action:** Overhauled storefront typography system across `apps/web` based directly on the design patterns in [ProductDetailPage.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/pages/ProductDetailPage.tsx):
  1. _Font Family Integration:_ Updated [index.html](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/index.html) Google Fonts link to import `Manrope` (`500;600;700;800`) alongside `DM Sans` and `Plus Jakarta Sans`.
  2. _Tailwind CSS v4 `@theme` Configuration:_ Defined `--font-sans`, `--font-heading`, `--font-serif`, and `--font-body` tokens in [index.css](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/index.css), mapping `@theme` variables directly to Manrope for headings and DM Sans for body copy.
  3. _Elimination of Times New Roman / Generic Browser Serifs:_ Explicitly mapped `.font-serif` to `var(--font-heading) !important` with `-0.03em` letter-spacing, converting all existing `.font-serif` usage across `HomePage` and components to crisp, modern Manrope.
  4. _Heading Hierarchy in `@layer base`:_ Configured `h1` through `h6` with `font-family: var(--font-heading)`, deep botanical forest green (`#183F32`), tight tracking (`-0.03em` to `-0.04em`), and balanced line heights.
  5. _Typography Utility Classes:_ Added `.typography-eyebrow` (antique brass `#B49A63`, tracking `0.18em`), `.typography-price` (Manrope tabular-nums), and `.typography-subtitle`.
### [2026-10-15 21:07 IST] - Storefront Navbar Official Logo Integration
- **Action:** Updated [Navbar.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/layout/Navbar.tsx):
  - Replaced the text and generic Leaf icon with the official brand logo image (`/images/logo.png`, "Tulsi Swarojgar Pvt. Limited").
  - Set responsive scaling (`h-10 sm:h-14 w-auto object-contain`) and smooth hover opacity transition within the home navigation link.
### [2026-10-17 13:28 IST] - Mobile Hero Action Buttons Arranged 2 in a Row
- **Action:** Updated [HomePage.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/pages/HomePage.tsx#L114-L129):
  - Changed the action buttons layout to `grid grid-cols-2 sm:flex sm:flex-row items-center justify-start gap-2.5 sm:gap-4`.
  - Configured responsive sizing (`text-xs sm:text-sm`, `px-3 sm:px-7`, `py-3 sm:py-3.5`) so both "Explore Product" and "Our Story" sit cleanly side-by-side on mobile devices without vertical stacking.
### [2026-10-17 13:30 IST] - Hero Gradient Update (Dark Green at Bottom on Mobile, Left-to-Right on Desktop)
- **Action:** Updated [HomePage.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/pages/HomePage.tsx#L80):
  - Configured `bg-gradient-to-t from-[#183F32]/95 via-[#183F32]/60 to-transparent sm:bg-gradient-to-r sm:from-[#183F32]/95 sm:via-[#183F32]/60 sm:to-transparent`.
  - On mobile, dark forest green is positioned at the bottom with transparent at the top, providing maximum contrast for bottom action buttons and trust markers.
  - On desktop, the horizontal gradient flows from dark green on the left to transparent on the right, keeping text legible while showing the product jar.
- **Outcome:** Consistent brand aesthetic across screen sizes with optimal contrast for text and buttons.

### [2026-10-17 13:38 IST] - Hero Section Mobile Spacing Separation
- **Action:** Refined [HomePage.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/pages/HomePage.tsx#L85-L165):
  - Segmented the left hero column into two distinct blocks: the Top Block (Eyebrow, Headline, Paragraph) and Bottom Block (Trust Markers, Action Buttons).
  - Added dedicated mobile separation (`mt-12 sm:mt-6`) between the top narrative and the bottom trust/action block.
- **Outcome:** Clean visual breathing room in the middle on mobile, leaving the background product video unobstructed while preserving tight cohesive flow on desktop.

### [2026-10-17 17:30 IST] - Complete Migration to Next.js 16 App Router (SSG, SEO & Monorepo Integration)

- **Action:** Migrated storefront (`apps/web`) from legacy Vite React SPA to **Next.js 16 (`^16.4.2`)** with App Router, React 19, Zod (`^3.24.2`), and React Hook Form (`^7.54.2`).
- **Tooling & Monorepo Updates:**
  - Renamed package in [apps/web/package.json](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/package.json) to `@tulsi/web`.
  - Added dependencies: `next@^16.4.2`, `react-hook-form@^7.54.2`, `@hookform/resolvers@^3.10.0`, `zod@^3.24.2`, `@tailwindcss/postcss@^4.0.0`, `postcss@^8.4.38`, and workspace links to `@tulsi/contracts` and `@tulsi/utils`.
  - Configured [apps/web/next.config.mjs](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/next.config.mjs) with `transpilePackages: ['@tulsi/contracts', '@tulsi/utils']`.
  - Configured [apps/web/postcss.config.mjs](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/postcss.config.mjs) with `@tailwindcss/postcss`.
  - Updated root [package.json](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/package.json) scripts: `"dev:web": "pnpm --filter @tulsi/web dev"`.
- **App Router Architecture (`apps/web/src/app/`):**
  - [app/layout.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/layout.tsx): Root layout with `next/font/google` (Manrope + DM Sans), `Organization` JSON-LD schema, metadata defaults, `Navbar`, `CartDrawer`, `Footer`, and `SmoothScrollProvider` (Lenis).
  - [app/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/page.tsx): SSG Home page with `FAQPage` JSON-LD schema rendering [HomePageClient.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/HomePageClient.tsx).
  - [app/products/[slug]/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/products/[slug]/page.tsx): SSG product details via `generateStaticParams()`, `generateMetadata()`, and Google Merchant compliant `Product` JSON-LD schema, rendering [ProductDetailClient.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/product/ProductDetailClient.tsx).
  - **Static Editorial & Legal Pages (100% SSG):** [app/about/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/about/page.tsx), [app/shipping-policy/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/shipping-policy/page.tsx), [app/returns-refunds/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/returns-refunds/page.tsx), [app/privacy-policy/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/privacy-policy/page.tsx), [app/terms/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/terms/page.tsx).
  - [app/contact/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/contact/page.tsx) & [app/contact/ContactFormClient.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/contact/ContactFormClient.tsx): Static layout with interactive React Hook Form + Zod island.
  - [app/cart/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/cart/page.tsx): Client-side cart with SSR hydration-safe mounted guard.
  - [app/checkout/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/checkout/page.tsx): Full multi-step checkout powered by `react-hook-form` + `zod` (`@tulsi/contracts` shippingAddressSchema validation).
  - [app/order-confirmation/[orderId]/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/order-confirmation/[orderId]/page.tsx): Dynamic order confirmation receipt with celebratory `canvas-confetti`.
  - [app/login/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/login/page.tsx), [app/register/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/register/page.tsx), [app/forgot-password/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/forgot-password/page.tsx): Auth suite with RHF + Zod form validation.
  - [app/dashboard/](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/dashboard): Full customer dashboard with App Router layout, orders list, order detail view, profile editor (RHF + Zod), support ticket submission (RHF + Zod), and referral earnings tracker.
  - [app/sitemap.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/sitemap.ts) & [app/robots.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/robots.ts): Dynamic metadata routes for Google crawler directives and XML sitemaps.
  - [app/not-found.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/not-found.tsx): Custom branded 404 page.
- **Component Adaptations:**
  - Converted [Navbar.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/layout/Navbar.tsx), [Footer.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/layout/Footer.tsx), [CartDrawer.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/cart/CartDrawer.tsx), [DashboardLayout.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/dashboard/DashboardLayout.tsx), and [HomePurchasePopup.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/HomePurchasePopup.tsx) from `react-router-dom` to `next/link` and `next/navigation`.
  - Guarded GSAP ScrollTrigger plugin registration in [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx) with `typeof window !== 'undefined'`.
  - Created [SmoothScrollProvider.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/providers/SmoothScrollProvider.tsx) initializing Lenis with GSAP ticker sync.
- **Legacy Vite Cleanup:**
  - Removed `src/pages/`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/App.css`, `src/index.css`.
- **Verification & Build:**
  - Production build `pnpm --filter @tulsi/web run build` completed with **Exit code 0** (22/22 static pages generated).
  - Dev server tested and verified with zero errors on `http://localhost:3000` via Turbopack.
### [2026-10-21 15:52 IST] - 50% Promotional Discount Display (M.R.P. ₹999 -> ₹500) & TypeScript Hardening

- **Action:** Updated all storefront price representations where ₹500 is used to explicitly present a 50% promotional launch discount from M.R.P. ₹999 down to ₹500 (50,000 paise).
- **Files Modified:**
  - [HomePageClient.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/HomePageClient.tsx): Hero eyebrow badge, hero trust marker, product card image badge, product pricing box (MRP strikethrough, 50% OFF badge, ₹499 savings), buy buttons, fair pricing highlight, ritual CTA, and closing banner.
  - [HomePurchasePopup.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/HomePurchasePopup.tsx): Modal price header with ₹999 strikethrough, 50% OFF badge, and "Buy Now — ₹500 (50% OFF)" CTA.
  - [Navbar.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/layout/Navbar.tsx): Announcement bar (`₹999 ₹500 (50% OFF)`) and mobile drawer CTA.
  - [Footer.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/layout/Footer.tsx): Quick links and prototype disclaimer badge (`₹999 ₹500 (50% OFF from ₹999)`).
  - [CartDrawer.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/layout/CartDrawer.tsx): Item unit price with MRP strikethrough & 50% OFF pill, plus subtotal promotional savings row.
  - [cart/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/cart/page.tsx): Empty cart button, item unit price badges, and order summary breakdown showing Total M.R.P. & Promotional Discount (-₹499 per unit).
  - [checkout/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/checkout/page.tsx): Itemized order review with MRP strikethrough & 50% OFF badge, plus order calculation breakdown.
  - [productData.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/data/productData.ts): Specification table updated with Flat 50% Launch Discount and M.R.P. ₹999.
  - [faqData.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/data/faqData.ts) & [policiesData.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/data/policiesData.ts): Price FAQ and terms descriptions updated.
  - [about/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/about/page.tsx), [dashboard/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/dashboard/page.tsx), [dashboard/referrals/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/dashboard/referrals/page.tsx): Consistent discount notation across portal.
  - [DashboardLayout.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/dashboard/DashboardLayout.tsx): Defined `NavItem` interface with optional `isReferral` property to fix TypeScript compilation error.
- **Verification:**
  - Ran `pnpm --filter @tulsi/web run build`: Passed with **Exit code 0** (22/22 static pages generated).

### [2026-10-21 16:50 IST] - Vercel Deployment & `npm install` Compatibility Fix

- **Problem:** Vercel deployment failed during `npm install` with `npm error code EUNSUPPORTEDPROTOCOL` on `workspace:*` dependencies (`@tulsi/contracts` and `@tulsi/utils`).
- **Resolution:**
  - Removed unused `"@tulsi/contracts": "workspace:*"` and `"@tulsi/utils": "workspace:*"` from [apps/web/package.json](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/package.json).
  - Removed `transpilePackages` from [apps/web/next.config.mjs](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/next.config.mjs).
  - Synced [apps/web/package-lock.json](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/package-lock.json) and [pnpm-lock.yaml](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/pnpm-lock.yaml).
- **Outcome:** `apps/web` can now be built and deployed natively on Vercel using either standard `npm` or `pnpm` with zero protocol errors. Production build verified with `pnpm --filter @tulsi/web run build` (Exit code 0).

### [2026-10-21 17:53 IST] - Radial Ingredients Update: Replaced Shilajit & Awla with Cumin & Fenugreek

- **Action:** Replaced the animated radial ingredients in [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx):
  - Replaced **Wild Amla** (`AWLA.png`) with **Fenugreek** (`/images/INGREDIENTS/fenugreek.png`) in the Upper-Left coordinate position (`fenugreekRef`).
  - Replaced **Himalayan Shilajit** (`SHILAJIT.png`) with **Cumin** (`/images/INGREDIENTS/cumin.png`) in the Lower-Right coordinate position (`cuminRef`).
  - Updated `BreakpointConfig` coordinates, `RESPONSIVE_LAYOUTS` for desktop, tablet, and mobile, `useGSAP` animation timelines (assembly hold, transition, and ingredient bloom), and JSX pill badges.
- **Verification:**
  - Ran `pnpm --filter @tulsi/web run build`: Passed with **Exit code 0** (22/22 static pages generated).

### [2026-10-21 18:08 IST] - Enhanced Assembly Animation: Ingredients Drop Into Bottle Neck Before Cap Closes

- **Action:** Re-engineered Scene 1 timeline in [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx):
  - **Ingredients Drop-In Effect (Section 1):** Before the cap closes, all 5 authentic botanicals (Holy Tulsi, Golden Fenugreek, Vedic Herbs, Native Lahsun, Pure Cumin) cascade down sequentially from high above (`dropStartY`) right into the open neck of the bottle (`dropEndY`), funneling in and disappearing inside the jar body (`scale: 0`, `opacity: 0`).
  - **Airtight Cap Sealing (Section 1):** Once all 5 botanicals have entered the jar, the cap immediately descends from its tilted angle (`capInitialRotation`) to straighten and lock seamlessly over the neck opening (`y: 0, rotation: 0`), accompanied by the contact shadow intensification and appreciation hold.
  - **Preserved Radial Pop-Out Bloom (Section 2):** When scrolling into Section 2 (Ingredient Showcase), the 5 botanicals dynamically pop out from inside the bottle and bloom into their full circular 5-pillar sacred formation with animated `.ingredient-label` pills.
- **Verification:**
  - Production build `pnpm --filter @tulsi/web run build` passed with **Exit code 0** (22/22 static pages generated).

### [2026-10-21 18:40 IST] - Editorial Botanical Redesign & Enhancement of ProductAssembleSection

- **Component Modified:** [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx)
- **Visual Design & Architectural Enhancements:**
  1. **Section 1 (Bottle Assembly Experience):**
     - Restored & styled editorial header: Eyebrow `THE BOTANICAL FORMULA`, Headline `The Art of Herbal Wellness.`, and non-medicinal supporting copy.
     - Brand Header Bar: `TULSI SWAROJGAR • 01 / THE FORMULA | AYURVEDIC WELLNESS`.
     - Atmospheric Layers: Subtle oversized `TULSI SWAROJGAR` typography watermark (`text-[#183F32]/[0.035]`), fine concentric guide circles with cardinal ticks behind the bottle, delicate corner botanical line art, and brass accent coordinates.
     - Scroll guidance: Replaced with `DISCOVER THE FORMULA` and a subtle downward indicator.
     - Clearance: Adjusted top paddings (`pt-28 sm:pt-32`) and bottle initial offset (`bottleStartY: 45`) to provide complete visual clearance below the fixed navbar and ensure zero collision with the headline.
  2. **Section 2 (Editorial Botanical Ingredient Showcase):**
     - Radial Arrangement: Preserved all 5 sacred botanicals (`Holy Tulsi`, `Fenugreek`, `Vedic Herbs`, `Native Lahsun`, `Cumin`) in balanced radial symmetry.
     - Editorial Annotation Flanks (Desktop):
       - Left Flank: `01 / BOTANICAL` (Holy Tulsi), `02 / BOTANICAL` (Fenugreek), `04 / BOTANICAL` (Native Lahsun) with botanical Latin subtitles and neutral traditional copy.
       - Right Flank: `03 / BOTANICAL` (Vedic Herbs), `05 / BOTANICAL` (Cumin), and the Product Identity Panel (`TULSI SWAROJGAR`, `TULSI META VED`, `HERBAL MIX`, link to `/products/tulsi-meta-ved-herbal-mix`).
     - Connecting Lines: Rendered delicate SVG guide lines with brass endpoint anchors connecting annotation anchors directly to ingredient thumbnails.
     - Section 2 Header Metadata: `02 / SACRED BOTANICALS`, `The Five-Fold Botanical Harmony`.
     - Mobile/Tablet Layout: Streamlined layout prioritizing bottle hero and clear thumbnails, with compact pills and bottom identity card, preventing any horizontal overflow or overlap.
  3. **GSAP Timelines Integration:**
     - Connected Section 2 annotations, connecting lines, section metadata, and product identity panel directly to `ingredientTimeline` (Timeline 3) for synchronized scrub with Lenis.
     - Preserved early return for `prefers-reduced-motion: reduce`.
- **Verification:**
  - `pnpm --filter @tulsi/web run build` completed with **Exit code 0** (22 static pages generated).
  - Browser verification confirmed bottle assembly, drop-in sequence, radial bloom, connecting lines, annotations, and product identity panel.

### [2026-10-21 19:05 IST] - Desktop Symmetrical Layout & Alignment Fix for Section 2

- **Component Modified:** [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx)
- **Desktop Symmetrical Layout Fix:**
  - **Symmetric Centering:** Converted Section 2 (`#section-ingredient-showcase`) into a true vertically centered container (`relative w-full h-[100svh] min-h-[100svh] flex items-center justify-center select-none overflow-hidden`).
  - **Balanced Flanks Container:** Replaced hardcoded transforms with a responsive grid/flex container (`relative w-full max-w-[1440px] mx-auto px-8 lg:px-12 xl:px-16 flex items-center justify-between pointer-events-none z-15 hidden lg:flex`).
  - **Left-Flank Alignment:** Grouped cards `01 / BOTANICAL` (Holy Tulsi), `02 / BOTANICAL` (Fenugreek), and `04 / BOTANICAL` (Native Lahsun) in a vertical stack aligned directly to the left with responsive padding (`px-8 lg:px-12 xl:px-16`).
  - **Right-Flank Alignment:** Grouped cards `03 / BOTANICAL` (Vedic Herbs), `05 / BOTANICAL` (Cumin), and the desktop Product Identity signature card (`TULSI META VED`) in an identical vertical stack aligned directly to the right with responsive padding.
  - **Central Visual Spacer:** Added `w-[440px] xl:w-[500px]` spacer reserving the exact footprint of the central bottle and 5 radial botanicals.
  - **Initial Opacity Guards:** Added initial `opacity-0` to `.sec2-metadata`, `.ingredient-annotation`, `.connecting-line`, and `.product-identity-panel` to ensure clean transitions via GSAP ScrollTrigger timeline without flash of unstyled content.
- **Verification:**
  - Next.js 16 build (`pnpm --filter @tulsi/web run build`) passed with **Exit code 0** (22/22 static pages generated).

### [2026-10-21 20:12 IST] - Business Owner Commission & Hierarchy Rules Specification

- **File Modified:** [backend.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/backend.md)
- **Confirmed Business Decisions Incorporated:**
  1. **Level Completion Required for Withdrawal:** Total commission for a level can only be withdrawn once that entire level is 100% completed/filled (single commissions cannot be withdrawn piecemeal).
  2. **Relative Upline Calculation:** Levels are calculated relative to each purchasing node's upline (immediate parent = Level 1, up to Level 10 ancestor), not fixed to a global root.
  3. **Strict 10-Level Earning Cap:** All nodes (including the root node) earn commissions solely up to 10 descendant levels below them.
  4. **Qualifying Sale Definition:** Only orders with confirmed, completed payment via PhonePe qualify. The platform enforces a strict No Refund, No Return, and No COD policy; transactions are final upon settlement.
  5. **Reward Hold & Admin Approval Workflow:** Calculated commissions enter a `HELD` state. Once reviewed and confirmed by an Administrator, funds credit the user's master wallet balance. Payouts from wallet remain gated until the level is fully complete.
  6. **Multi-ID & Self-Referrals:** Users can hold up to 100 network IDs and are explicitly permitted to perform self-referrals using their own network IDs. Each ID maintains its own tree position while withdrawable earnings consolidate into the user account.
  7. **Core Rules Updated:** Restored and formalized Rule 6 (10-level cap) and Rule 11 (No Refund / No Return / No COD finality). Updated Section 5.14 (`commissions`) and Section 5.16 (`withdrawals`) specifications.



### [2026-10-22 16:38 IST] - ProductAssembleSection Atmospheric Herbal Background Image Integration

- **Component Modified:** [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx)
- **Action & Visual Integration:**
  - Added [assemble-section-bg.png](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/public/images/assemble-section-bg.png) as an atmospheric, low-opacity background image across the entire two-scene bottle assembly and radial ingredients experience.
  - Placed the image inside a sticky viewport container (`sticky top-0 h-[100svh] w-full`) within the component's master container (`absolute inset-0 pointer-events-none z-0`) so it stays framed across both Scene 1 (Assembly Stage) and Scene 2 (Ingredients Showcase).
  - Configured subtle low opacity (`opacity-10 sm:opacity-12`) with `mix-blend-multiply` and a delicate gradient wash (`from-[#F8F5ED]/30 via-transparent to-[#F8F5ED]/40`), blending the rustic herbal flatlay into the ivory background (`#F8F5ED`) without interfering with text contrast, concentric guide lines, or foreground animations.
### [2026-10-22 17:16 IST] - Bottle Vertical Positioning Downward Adjustment

- **Component Modified:** [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx)
- **Changes Made:**
  - Lowered the bottle vertical positioning in `RESPONSIVE_LAYOUTS` across all breakpoints:
    - **Desktop:** `bottleStartY` increased from `45` to `75` (+30px), and `bottleTravelY` increased from `15` to `50` (+35px).
    - **Tablet:** `bottleStartY` increased from `35` to `65` (+30px), and `bottleTravelY` increased from `45` to `70` (+25px).
    - **Mobile:** `bottleStartY` increased from `25` to `55` (+30px), and `bottleTravelY` increased from `35` to `65` (+30px).
  - Aligned the Section 1 atmospheric concentric blueprint circles container with `translate-y-7 sm:translate-y-9 md:translate-y-11` to maintain centering directly behind the lowered bottle.
  - Gives more vertical breathing room beneath the editorial headers in both Section 1 and Section 2.
### [2026-10-22 17:19 IST] - Section 2 (Ingredient Showcase) Final Downward Position Enhancement

- **Component Modified:** [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx)
- **Changes Made:**
  - Increased `bottleTravelY` across all device breakpoints to position the bottle and bloomed radial botanical composition significantly lower down at the end in Section 2:
    - **Desktop (`>= 1024px`):** `bottleTravelY` increased from `50` to `110` (+60px further downward).
    - **Tablet (`640px - 1023px`):** `bottleTravelY` increased from `70` to `115` (+45px further downward).
    - **Mobile (`< 640px`):** `bottleTravelY` increased from `65` to `100` (+35px further downward).
  - Offset the desktop flank container (`translate-y-8 lg:translate-y-10 xl:translate-y-12`) so the editorial botanical annotations remain centered with the lowered bottle and blooming ingredients.
### [2026-10-22 17:46 IST] - Section 2 Mobile Responsiveness & Interactive Botanical Details Showcase

- **Component Modified:** [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx)
- **Root Causes Identified & Resolved:**
  1. *Section 2 Header Hidden Behind Navbar:* Sticky navbar height (92px on mobile with announcement bar) overlapped `sec2-metadata` which was placed at `top-16` (64px). Adjusted to `top-24 sm:top-28 lg:top-20` (`z-20`) to ensure 100% visibility and clearance below navbar.
  2. *Botanical Details Hidden on Mobile:* Desktop flank cards were previously constrained with `hidden lg:flex`, leaving mobile users with zero botanical text details or descriptions.
  3. *Bottle Overlapping Bottom Details:* Lowered bottle position on mobile (`bottleTravelY: 100`) pushed the bottle directly into the bottom card. Rebalanced mobile coordinates (`bottleTravelY: -10`, `tulsi: -135`, etc.) to leave 200px of clean vertical breathing room below the bottle.
- **Features Implemented:**
  - **Interactive Mobile Botanical Details Card (`lg:hidden`):** Positioned at `bottom-3 sm:bottom-6` with glassmorphic styling, pill selectors `[Holy Tulsi] [Fenugreek] [Vedic Herbs] [Native Lahsun] [Cumin]`, Latin nomenclature, botanical benefit description, pagination (`1/5`), Prev/Next arrow navigation, and a direct link to explore formulation.
  - **Tactile Botanical Selection:** Clicking/tapping any of the 5 floating radial ingredients on the canvas activates that botanical, highlights the pill, adds a gold halo ring, and updates the mobile details card instantly.
### [2026-10-22 18:24 IST] - ProductAssembleSection Background Image & Desktop Bottle Downward Offset

- **Component Modified:** [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx)
- **Changes Applied:**
  1. **Atmospheric Background Image:** Integrated [assemble-section-bg.png](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/public/images/assemble-section-bg.png) with `opacity-10 sm:opacity-12` and `mix-blend-multiply` inside a sticky full-viewport container (`sticky top-0 h-[100svh] w-full z-0`) with a delicate soft gradient overlay.
  2. **Desktop Bottle Downward Position:**
     - Increased `bottleStartY` on desktop from `45` to `75` (+30px downward in Section 1).
     - Increased `bottleTravelY` on desktop from `15` to `55` (+40px downward in Section 2).
     - Aligned Section 1 concentric blueprint circles (`translate-y-7 sm:translate-y-9 md:translate-y-11`) to center behind the lowered bottle.
     - Aligned Section 2 desktop flank cards (`translate-y-6 lg:translate-y-8`) with the lowered bottle and blooming ingredients.
### [2026-10-22 18:32 IST] - Section 2 Desktop Bottle Position Shifted Further Downward

- **Component Modified:** [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx)
- **Changes Applied:**
  - Adjusted `desktop.bottleTravelY` from `55` to `95` (+40px downward in Section 2 on desktop screens).
  - Aligned the Section 2 desktop flank card container (`translate-y-8 lg:translate-y-10`) so the editorial botanical annotations remain centered with the lowered bottle and bloomed radial ingredients.
- **Verification:**
  - Next.js 16 build passed with `pnpm --filter @tulsi/web build` (Exit code 0, 22/22 static pages generated).

### [2026-10-22 18:52 IST] - Section 1 Health Benefits & Targeted Problem Description Integration

- **Component Modified:** [ProductAssembleSection.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/ProductAssembleSection.tsx)
- **Features & Content Added to Section 1 (Assembly Stage):**
  1. **Desktop Symmetrical Benefit Flanks:**
     - Styled identically to Section 2's editorial botanical cards with numbered uppercase tags, golden divider lines (`h-px w-6 bg-[#B49A63]/40`), bold serif titles, italic Ayurvedic subheadings, and refined copy.
     - **Left Flank:**
       - `01 / METABOLISM` — **Metabolic Vitality** (*Deepana & Digestive Fire*): Stimulates sluggish metabolism, accelerates nutrient assimilation, and eases post-meal heaviness.
       - `02 / GUT HARMONY` — **Gut & Digestive Ease** (*Microbiome & Motility*): Alleviates bloating and abdominal discomfort, supporting smooth daily motility and gut flora.
     - **Right Flank:**
       - `03 / LIVER SUPPORT` — **Hepatic Cleansing** (*Yakrit Shodhana & Bile Flow*): Assists healthy liver bile production and filtration, helping clear accumulated metabolic toxins (Ama).
       - `04 / WHOLE-BODY` — **Enduring Lightness** (*Clean Everyday Stamina*): Clears sluggish bodily fatigue to restore clean, non-stimulant daytime vigor and whole-body lightness.
     - Positioned at `z-25` with `w-[440px] xl:w-[500px]` central spacer, perfectly framing the central bottle assembly and blueprint concentric guides.
  2. **Mobile & Tablet Targeted Health Pillars:**
     - Added targeted benefit pills beneath the main headline: `[Kindles Metabolism]`, `[Soothes Gut & Bloating]`, `[Supports Liver Health]`.
     - Added a concise summary note below the bottle assembly: *"Formulated to rekindle sluggish metabolism, ease gut bloating, and rejuvenate liver vitality."*
  3. **GSAP Timeline Synchronization:**
     - Set initial visibility to `opacity: 1` so the health benefits are immediately readable when Section 1 is active.
     - Integrated smooth fade-out in `transitionTimeline` when scrolling from Section 1 into Section 2, ensuring seamless transition between Section 1 (Why you need it) and Section 2 (The 5 sacred herbs inside).
- **Verification:**
  - Next.js 16 build passed (`pnpm --filter @tulsi/web build`, Exit code 0, 22/22 static routes compiled).
  - Browser visual inspection verified cards on both flanks framing the central bottle with crisp legibility.


### [2026-10-22 19:15 IST] - Decluttered App Directory & Consolidated Client Views into `(store)` Route Group

- **Action:** Refactored [apps/web/src/app](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app) directory structure by consolidating all storefront pages, customer portals, and client views into the Next.js route group [apps/web/src/app/(store)](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/(store)):
  - **Routes Moved to `(store)`:**
    - `page.tsx` (Homepage `/`)
    - `products/` (`/products/[slug]`)
    - `order-confirmation/` (`/order-confirmation/[orderId]`)
    - `login/` (`/login`)
    - `register/` (`/register`)
    - `forgot-password/` (`/forgot-password`)
    - `privacy-policy/` (`/privacy-policy`)
    - `terms/` (`/terms`)
    - `shipping-policy/` (`/shipping-policy`)
    - `returns-refunds/` (`/returns-refunds`)
    - `dashboard/` (`/dashboard`, `/dashboard/orders`, `/dashboard/profile`, `/dashboard/referrals`, `/dashboard/support`)
  - **Clean App Root:** [apps/web/src/app](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app) is now decluttered, containing strictly:
    - Route groups: `(store)` (all client views and customer-facing pages) and `api` (backend proxy and Next.js route handlers).
    - Root Next.js configuration files: `layout.tsx`, `globals.css`, `not-found.tsx`, `robots.ts`, `sitemap.ts`.
- **Route Integrity & Verification:**
  - Route group parenthesis syntax `(store)` does not alter public URL paths, preserving all SEO links (`/`, `/products/...`, `/checkout`, `/dashboard`).
  - Next.js 16 build (`pnpm --filter @tulsi/web build`) completed with **Exit code 0** (22/22 static & dynamic routes compiled without errors).

### [2026-10-22 19:30 IST] - Implemented Full Backend Architecture Folder Structure (`backend.md` L141-L183)

- **Action:** Structured the application architecture strictly in alignment with [backend.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/backend.md) (Lines 141-183):
  1. **Route Groups & Endpoints (`apps/web/src/app`):**
     - `(store)/`: Public storefront pages (Home, products, checkout, cart, about, policies, auth).
     - `(member)/`: Dedicated member portal group housing `dashboard/` (orders, profile, referrals, support).
     - `admin/`: Admin Control Center route ([admin/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/admin/page.tsx)) for operational governance, commission review, and withdrawal approvals.
     - `api/v1/`: Next.js Route Handlers:
       - `auth/` ([api/v1/auth/route.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/api/v1/auth/route.ts))
       - `products/` ([api/v1/products/route.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/api/v1/products/route.ts))
       - `orders/` ([api/v1/orders/route.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/api/v1/orders/route.ts))
       - `payments/` ([api/v1/payments/route.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/api/v1/payments/route.ts))
       - `webhooks/phonepe/` ([api/v1/webhooks/phonepe/route.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/api/v1/webhooks/phonepe/route.ts))
       - `network-ids/` ([api/v1/network-ids/route.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/api/v1/network-ids/route.ts))
       - `member/` ([api/v1/member/route.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/api/v1/member/route.ts))
       - `admin/` ([api/v1/admin/route.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/api/v1/admin/route.ts))
  2. **Domain Modules Layer (`apps/web/src/modules`):**
     - `auth/` ([auth.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/auth/auth.service.ts))
     - `users/` ([users.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/users/users.service.ts))
     - `products/` ([products.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/products/products.service.ts))
     - `orders/` ([orders.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/orders/orders.service.ts))
     - `payments/` ([payments.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/payments/payments.service.ts))
     - `network/` ([network.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/network/network.service.ts)): Ternary child constraints (max 3), max 100 IDs per user, self-referral checks.
     - `commissions/` ([commissions.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/commissions/commissions.service.ts)): Official 10-level schedule (₹500 L1 reward, ₹100 L2, etc.).
     - `wallet/` ([wallet.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/wallet/wallet.service.ts)): Ledger-backed balance calculations in integer paise.
     - `withdrawals/` ([withdrawals.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/withdrawals/withdrawals.service.ts)): 100% level-completion prerequisite gating.
     - `admin/` ([admin.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/admin/admin.service.ts)): Operational summaries and maker-checker approval transitions.
     - `audit/` ([audit.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/audit/audit.service.ts)): Non-repudiable audit logging.
  3. **Shared Backend Utilities (`apps/web/src/lib`):**
     - [db.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/lib/db.ts), [env.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/lib/env.ts), [auth.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/lib/auth.ts), [permissions.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/lib/permissions.ts), [validation.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/lib/validation.ts), [errors.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/lib/errors.ts), [logger.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/lib/logger.ts), [rate-limit.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/lib/rate-limit.ts).
  4. **Background Jobs (`apps/web/src/jobs`):**
     - [reconcile-payments.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/jobs/reconcile-payments.ts)
     - [process-commissions.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/jobs/process-commissions.ts)
     - [process-outbox.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/jobs/process-outbox.ts)
  5. **Prisma Database Schema & Tests (`apps/web/prisma`, `apps/web/tests`):**
     - [schema.prisma](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/prisma/schema.prisma): Complete PostgreSQL relational schema covering 19 tables specified in `backend.md`.
     - [hierarchy.test.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/tests/hierarchy.test.ts): Core MLM business rule unit assertions.
- **Verification:**
  - `pnpm --filter @tulsi/web build` passed with **Exit code 0** (31 static, dynamic, and API routes compiled successfully).

### [2026-10-22 19:36 IST] - Implemented System Health & Readiness API (`/api/health`)

- **Action:** Created [apps/web/src/app/api/health/route.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/api/health/route.ts):
  - Provides system health status, uptime tracking, timestamp, active environment, and service identifier (`@tulsi/web`).
  - Supports `?ready=true` or `?checkDb=true` probe parameter to verify database connectivity.
  - Implements lightweight `HEAD` response for automated load-balancer liveness checks with `no-store` headers.
- **Verification:**
  - Production build `pnpm --filter @tulsi/web build` passed with **Exit code 0** (32 routes generated).
  - Queried active server on `http://localhost:3000/api/health` — responded HTTP 200 `{"status":"healthy","service":"@tulsi/web","uptimeSeconds":12500,"environment":"development"}`.

### [2026-10-22 19:47 IST] - Added and Refined Database Tables in `schema.prisma` (`backend.md` 5.1–5.8)

- **Action:** Synchronized [apps/web/prisma/schema.prisma](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/prisma/schema.prisma) and [apps/api/prisma/schema.prisma](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/prisma/schema.prisma) with the exact table specifications from [backend.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/backend.md) (Sections 5.1–5.8):
  1. `users` (5.1): Added `phoneVerifiedAt`, `phoneE164`, `email`, `passwordHash`, `role` (`MEMBER`, `ADMIN`, `SUPPORT`, `SUPER_ADMIN`), `status` (`PENDING`, `ACTIVE`, `SUSPENDED`, `CLOSED`).
  2. `sessions` (5.2): Added `lastSeenAt`, `tokenHash` (unique), `revokedAt`, `expiresAt`, `ipAddress`, `userAgent`.
  3. `otp_challenges` (5.3): Added `codeHash`, `purpose` (`LOGIN`, `REGISTRATION`, `PHONE_CHANGE`), `attemptCount`, `maxAttempts`, `consumedAt`, `expiresAt`.
  4. `products` (5.4): Added `isActive` boolean flag, `sku` (unique), `pricePaise` (BigInt ₹500 = 50,000 paise), `currency` ("INR").
  5. `orders` (5.5): Added `purpose` (`INITIAL_REGISTRATION`, `ADDITIONAL_ID`, `PRODUCT_PURCHASE`), `networkIdId` relation, `intendedParentNetworkId` relation, `referralCodeUsed`, `unitPricePaise`, `subtotalPaise`, `totalAmountPaise`, `paidAt`, `status` (`PENDING_PAYMENT`, `PAID`, `PAYMENT_FAILED`, `CANCELLED`, `REFUND_PENDING`, `REFUNDED`, `EXCEPTION`).
  6. `payments` (5.6): Added `merchantOrderId` (unique), `providerTransactionId` (unique), `providerResponseSafe` (Json), `status` (`CREATED`, `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `UNKNOWN`).
  7. `payment_events` (5.7): Added `providerEventId` (unique), `merchantOrderId`, `payloadHash`, `processingStatus` (`RECEIVED`, `PROCESSED`, `RETRY`, `REJECTED`), `errorCode`.
  8. `network_ids` (5.8): Added `publicId` (unique), `referralCode` (unique), `ownerUserId`, `parentNetworkId`, `placementDepth`, `placementPath`, `qualifyingOrderId` (unique), `status` (`PENDING`, `ACTIVE`, `SUSPENDED`, `CLOSED`).
- **Verification:**
  - `pnpm --filter @tulsi/web build` passed with **Exit code 0** (32 routes compiled).

### [2026-10-22 19:57 IST] - Created Environment Configuration Files (`.env` & `.env.example`)

- **Action:** Created environment configuration files in `apps/web`:
  - [apps/web/.env.example](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/.env.example): Fully documented template for development and production deployments.
  - [apps/web/.env](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/.env): Local development configuration with working sample credentials:
    - `NODE_ENV=development`
    - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
    - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tulsimlm?schema=public`
    - `SESSION_SECRET=tulsi_swaraj_dev_session_secret_replace_in_production_min_32_chars`
    - `PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox`
    - `PHONEPE_MERCHANT_ID=PGTESTPAYUAT86`
    - `PHONEPE_SALT_KEY=96434309-7796-489d-8924-ab56988a6076`
    - `PHONEPE_SALT_INDEX=1`
    - `PHONEPE_CALLBACK_URL=http://localhost:3000/api/v1/webhooks/phonepe`
    - `ADMIN_BOOTSTRAP_EMAIL=admin@tulsiswaraj.com`
    - `SMS_SENDER_ID=TULSIS`
  - Updated [apps/web/src/lib/env.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/lib/env.ts) Zod validation schema to strongly type and default all environment variables.
  - Updated [apps/web/.gitignore](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/.gitignore) to protect `.env` and `.env*.local` from accidental repository commits.
- **Verification:**
  - Next.js build loaded `.env` and completed with **Exit code 0** (32 routes compiled).

### [2026-10-22 20:10 IST] - Pinned Stable Prisma 6.19 & Generated Prisma Client

- **Action:**
  - Resolved npm package resolution mismatch where experimental `prisma@8.0.0-rc.25` was pulled instead of stable Prisma.
  - Pinned `@prisma/client` and `prisma` to stable `^6.4.1` (resolved to `6.19.3`) in [apps/web/package.json](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/package.json).
  - Executed `prisma generate`: Generated TypeScript Prisma Client for all 19 PostgreSQL models in 238ms.
  - Updated [apps/web/src/lib/db.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/lib/db.ts) with direct static typing using `PrismaClient` singleton.
- **Verification:**
  - Next.js Turbopack build passed cleanly with **Exit code 0** (32 routes compiled).

### [2026-10-22 20:54 IST] - Added Address Model & Supabase `directUrl` Migration Configuration

- **Action:**
  - Added `directUrl = env("DIRECT_URL")` to `datasource db` in [apps/web/prisma/schema.prisma](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/prisma/schema.prisma) and [apps/api/prisma/schema.prisma](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/api/prisma/schema.prisma) for dual pooler/direct migration support with Supabase.
  - Added `AddressType` enum (`SHIPPING`, `BILLING`, `BOTH`).
  - Added the `Address` model:
    - `id` (UUID PK), `userId` (FK to `users`), `fullName`, `phone`, `addressLine1`, `addressLine2`, `landmark`, `city`, `state`, `postalCode`, `country`, `type`, `isDefault`, timestamps.
    - Linked `User` -> `addresses Address[]` with cascade delete.
    - Linked `Order` -> `shippingAddressId String?` and `shippingAddressRef Address?` with `onDelete: SetNull`, while maintaining immutable JSON snapshot `shippingAddress Json` for checkout immutability.
  - Ran `pnpm db:generate` to regenerate Prisma Client types with the new `Address` model.
- **Verification:**
  - Next.js Turbopack build passed cleanly with **Exit code 0** (32 routes compiled).

### [2026-10-22 21:00 IST] - Address Table Contracts & Architecture Documentation

- **Action:**
  - Documented Section `5.19 addresses` in [backend.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/backend.md) and updated Section 6 relationship summary to include `users 1 ───── N addresses` and `addresses 1 ─ N orders (optional reference)`.
  - Created [packages/contracts/src/address.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/packages/contracts/src/address.ts) defining:
    - `AddressTypeSchema` (`SHIPPING`, `BILLING`, `BOTH`).
    - `AddressSchema` with strict Zod validation (PIN code 6 digits, 10-digit Indian phone).
    - `CreateAddressSchema` and `UpdateAddressSchema` for client mutation requests.
  - Exported address contracts in [packages/contracts/src/index.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/packages/contracts/src/index.ts).
- **Verification:**
  - Compiled contracts: `pnpm --filter @tulsi/contracts build` exited with code 0.
  - Full application build: `pnpm --filter @tulsi/web build` passed with **Exit code 0** (32 routes compiled).

### [2026-10-23 15:15 IST] - Tulsi Swarojgar Testing Backend Architecture & Implementation

- **Action:** Implemented the complete testing backend architecture for Tulsi Swarojgar, allowing end-to-end local development, customer journey verification, and purchase-based registration without requiring PhonePe or live SMS credentials.
- **Key Modules & Deliverables Implemented:**
  1. **Environment Configuration & Production Safeguards:**
     - [apps/web/src/lib/env.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/lib/env.ts): Added `OTP_PROVIDER` (`mock`), `PAYMENT_PROVIDER` (`mock`), `MOCK_OTP_EXPOSE_CODE`, and `MOCK_PAYMENT_ALLOW_SUCCESS`. Implemented hard startup rejection in production mode (`NODE_ENV === 'production'`).
     - [apps/web/.env.example](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/.env.example) and [apps/web/.env](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/.env): Documented provider switches and developer flags.
  2. **Database Schema Enhancements:**
     - [apps/web/prisma/schema.prisma](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/prisma/schema.prisma): Added `CheckoutSession` model, `CheckoutSessionStatus` enum, and relations linking `Product`, `OtpChallenge`, and `Order`. Added `isTestMode` and `mockStatus` to `Payment`.
     - Regenerated Prisma Client into workspace virtual store.
  3. **Provider-Independent Abstractions:**
     - [apps/web/src/modules/providers/interfaces/otp-provider.interface.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/providers/interfaces/otp-provider.interface.ts): Defined `OtpProvider` interface.
     - [apps/web/src/modules/providers/interfaces/payment-provider.interface.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/providers/interfaces/payment-provider.interface.ts): Defined `PaymentProvider` interface.
     - [apps/web/src/modules/providers/mock/mock-otp.provider.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/providers/mock/mock-otp.provider.ts): Mock OTP with developer code exposure gating and production lock.
     - [apps/web/src/modules/providers/mock/mock-payment.provider.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/providers/mock/mock-payment.provider.ts): Mock Payment backed by authoritative database state.
     - [apps/web/src/modules/providers/provider.factory.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/providers/provider.factory.ts): Factory with production safeguards and testing dependency injection.
  4. **Domain Services:**
     - [apps/web/src/modules/checkout/checkout.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/checkout/checkout.service.ts): 7-step checkout session lifecycle (create, details, referral, otp request, otp verify, confirm).
     - [apps/web/src/modules/checkout/finalization.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/checkout/finalization.service.ts): Authoritative, transactional, idempotent payment finalization, user creation, network ID generation, and commission allocation.
     - [apps/web/src/modules/network/network.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/network/network.service.ts): Referral validation, slot discovery (slots 1..3), breadth-first spillover downline traversal, and 100-ID limit checks.
     - [apps/web/src/modules/commissions/commissions.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/commissions/commissions.service.ts): 10-level upline traversal, HELD commission creation, and level-complete detection.
     - [apps/web/src/modules/payments/payments.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/payments/payments.service.ts): Persistent payment attempts and status queries.
  5. **API Endpoints & Developer Simulator:**
     - Created endpoints:
       - `GET /api/v1/products/[slug]`
       - `POST /api/v1/checkout/sessions`
       - `GET /api/v1/checkout/sessions/[id]`
       - `PATCH /api/v1/checkout/sessions/[id]/details`
       - `POST /api/v1/checkout/sessions/[id]/referral/validate`
       - `POST /api/v1/checkout/sessions/[id]/phone/otp/request`
       - `POST /api/v1/checkout/sessions/[id]/phone/otp/verify`
       - `POST /api/v1/checkout/sessions/[id]/confirm`
       - `POST /api/v1/payments/checkout`
       - `GET /api/v1/payments/[id]/status`
       - `GET /api/v1/orders/[id]`
       - Developer Simulator API: `/api/v1/dev/payment-simulator/[transactionId]/*`
     - Created Developer Simulator UI: [apps/web/src/app/dev/payment-simulator/[transactionId]/page.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/app/dev/payment-simulator/[transactionId]/page.tsx).
  6. **Repeatable Seeding & Documentation:**
     - [apps/web/prisma/seed.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/prisma/seed.ts): Idempotent seed script for Flagship Product (₹500), Commission Rule Set v1, Admin user, Root network node (`TULSI01`), and test distributor member.
     - [docs/SEEDING.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/SEEDING.md): Step-by-step local setup, migrations, and seed commands.
     - [docs/PROVIDER_INTEGRATION.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/PROVIDER_INTEGRATION.md): Complete guide for replacing mock providers with PhonePe and real SMS without domain code changes.
     - [docs/API.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/API.md): Comprehensive API request/response specification.
     - [docs/DATABASE.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/DATABASE.md): Database tables, constraints, indexes, and transactional boundaries.
     - [docs/FLOWS.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/FLOWS.md): Detailed 11-step sequence diagrams and state transitions.
     - [docs/SECURITY.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/SECURITY.md): Cryptographic OTP hashing, timing attack defenses, and production safeguards.
  7. **Automated Testing Suite (Vitest):**
     - Installed `vitest` and `tsx` in `@tulsi/web`.
     - Created 6 test suites covering OTP security, mock payment provider, production safeguards, MLM business rules, checkout flow, and payment finalization.
- **Verification:**
  - Automated tests: `pnpm --filter @tulsi/web test` passed with **21 tests passed across 6 test suites** (0 failures).
  - Next.js production build: `pnpm --filter @tulsi/web build` passed with **Exit code 0** (34 static, dynamic, and API routes compiled successfully).

---

## 3. Current Architecture & State

### Apps and Packages Directory Tree

```text
TulsiMLM/
├── AGENTS.md                  # Workspace rules governing memory.md updates
├── memory.md                  # This persistent context tracking file
├── backend.md                 # Full backend architecture & MLM rules specification
├── docs/
│   ├── prd.md                 # Product requirements
│   ├── architecture.md        # Technical architecture
│   ├── SEEDING.md             # Local setup, migrations, and seed guide
│   ├── PROVIDER_INTEGRATION.md# Blueprint for plugging in live PhonePe & SMS
│   ├── API.md                 # Complete API documentation
│   ├── DATABASE.md            # Schema, relationships, and transactional boundaries
│   ├── FLOWS.md               # 11-step registration, payment & recovery flows
│   └── SECURITY.md            # Security controls & production safeguards
├── apps/
│   ├── api/                   # Express backend API (Port 4000)
│   └── web/                   # Next.js 16 App Router fullstack platform (@tulsi/web, Port 3000)
│       ├── prisma/
│       │   ├── schema.prisma  # Full PostgreSQL MLM schema (20 models)
│       │   └── seed.ts        # Database seed fixtures
│       ├── tests/             # Vitest automated test suites (21 passing tests)
│       └── src/
│           ├── app/
│           │   ├── (store)/   # Public storefront routes: /, /products, /cart, /checkout, /policies
│           │   ├── (member)/  # Member portal routes: /dashboard, /dashboard/orders, /referrals
│           │   ├── admin/     # Admin Control Center: /admin
│           │   ├── dev/       # Developer Simulator: /dev/payment-simulator/[transactionId]
│           │   ├── api/v1/    # Route Handlers: auth, checkout, payments, dev simulator, member, admin
│           │   └── ...
│           ├── modules/       # Domain services (checkout, finalization, network, commissions, providers, payments)
│           └── lib/           # db, env, auth, permissions, validation, errors, logger
├── packages/
│   ├── contracts/             # Zod contracts & DTOs
│   ├── config/                # Shared configs
│   ├── ui/                    # Shared UI library placeholder
│   └── utils/                 # Currency & formatting utilities
```

### [2026-10-23 16:30 IST] - Strict Indian Phone & Shared Checkout Validation Engine

- **Objective:** Enforce strict validation accepting only Indian mobile numbers (+91 / 10 digits starting with 6-9) across customer details and checkout, rejecting foreign country codes, and making validations common across backend and frontend.
- **Root Cause Identified:**
  - `CheckoutService.updateCustomerDetails` was using a naive `.replace(/\D/g, '').slice(-10)` string slicing, which stripped non-digits and took the suffix of any foreign phone number (US, UK, UAE, etc.), permitting invalid numbers to pass.
  - Request body in `/api/v1/checkout/sessions/[id]/details` was not validated via Zod schema before hitting the service.
  - Field validations (names, addresses, PIN codes) were duplicated or inconsistent between frontend forms and backend services.
- **Architectural Implementation:**
  1. **Shared Validation Engine (`apps/web/src/lib/validations/checkout.ts` & `index.ts`):**
     - `parseIndianMobile(input)`: Strict parser rejecting non-+91 country codes, ensuring standard 10-digit extraction (handling `+91`, `91`, and trunk `0`), and verifying TRAI allocation starting with digits 6, 7, 8, or 9.
     - `cleanIndianMobile(input)` & `formatIndianMobileE164(input)`: Standardized sanitizers and E.164 formatters (`+919876543210`).
     - `indianMobileSchema`: Zod schema utilizing `parseIndianMobile` with descriptive errors for user feedback.
     - `indianPinCodeSchema`: Strict 6-digit Indian postal code regex (`/^[1-9]\d{5}$/`, strictly rejecting numbers starting with 0).
     - `customerNameSchema`, `addressLine1Schema`, `citySchema`, `stateSchema`, `countrySchema`.
     - `ShippingAddressSchema` & `CustomerDetailsSchema`: Composite schemas for backend validation.
     - `StorefrontCheckoutFormSchema`: Client-side schema shared with `useForm` and `zodResolver`.
  2. **Monorepo Contracts Synchronization (`packages/contracts/src/checkout.ts`):**
     - Updated contracts package with identical `parseIndianMobile`, `indianMobileSchema`, `indianPinCodeSchema`, `ShippingAddressSchema`, and `CustomerDetailsSchema` adhering to Rule 2.
  3. **Backend Service & API Route Updates:**
     - `apps/web/src/modules/checkout/checkout.service.ts`: Enforced `CustomerDetailsSchema.safeParse(input)` in `updateCustomerDetails`, normalized both customer phone and shipping address phone to E.164. Added explicit lifecycle safeguards to `requestPhoneOtp` guarding against expired or confirmed sessions.
     - `apps/web/src/app/api/v1/checkout/sessions/[id]/details/route.ts`: Integrated `validateJsonBody(request, CustomerDetailsSchema)`.
  4. **Frontend Checkout Form Integration (`apps/web/src/app/(store)/checkout/page.tsx`):**
     - Replaced local inline form schema with `StorefrontCheckoutFormSchema` from `@/lib/validations/checkout`.
  5. **Automated Testing & Build Verification:**
     - Added test cases in `apps/web/tests/checkout-flow.test.ts` testing rejection of foreign numbers (US `+1...`), invalid starting digits (e.g. `5...`), invalid PIN codes, and valid formats.
     - Vitest: **22 tests passing across 6 test suites** (0 failures).
     - Next.js build: **Compiled all 34 routes successfully** with zero TypeScript errors.

### [2026-10-23 18:15 IST] - Payment Simulator Route Hotfix: UUID Type Casting & BigInt Serialization

- **Root Cause Identified from Terminal:**
  - `GET /api/v1/dev/payment-simulator/TXN_...` threw a 500 Internal Server Error due to:
    1. **PostgreSQL UUID Casting Error:** Querying `{ OR: [{ id: transactionId }, { merchantOrderId: transactionId }] }` caused PostgreSQL to attempt casting `"TXN_..."` to type `UUID` for the `payment.id` column, throwing code `22P02: invalid input syntax for type uuid`.
    2. **BigInt JSON Serialization:** `order.totalAmountPaise` is a `BigInt` on the Prisma `Order` model. Directly returning `order: payment.order` in `NextResponse.json` causes `TypeError: Do not know how to serialize a BigInt`.
- **Changes Applied:**
  - Added regex `isUuid` check across simulator routes (`route.ts`, `success/route.ts`, `failure/route.ts`, `pending/route.ts`) and `PaymentsService.getPaymentStatus` so that `id` is only queried when `transactionId` is a valid UUID format.
  - Converted `order.totalAmountPaise` to `Number(payment.order.totalAmountPaise)` before returning in JSON.

### [2026-10-24 19:40 IST] - Network ID Creation & Authoritative Finalization Lifecycle

- **Feature Implementation:**
  - Implemented authoritative finalization service `FinalizationService.finalizePaidOrder(orderId, verifiedPaymentReference)` supporting idempotency, phone number reuse, collision-resistant random `publicId` and `referralCode`, ternary placement with BFS downline spillover, 10-level upline commissions in `HELD` status, transactional outbox jobs, and audit logs.
  - Implemented development mock payment simulator endpoint `POST /api/v1/dev/payments/:paymentId/simulate` accepting `{ status: 'SUCCESS' | 'FAILED' | 'PENDING' }`, supporting both UUID and `TXN_...` formats, with strict production safeguards.
  - Implemented member network inspection endpoints:
    - `GET /api/v1/me/network-ids`
    - `GET /api/v1/me/network-ids/:id`
    - `GET /api/v1/me/network-ids/:id/children`
    - `GET /api/v1/me/network-ids/:id/referral`
    - `GET /api/v1/me/orders/:orderId/registration-status`
  - Enforced multi-tenant isolation via `ForbiddenError` (403) across all `/me/network-ids/*` routes.
  - Created automated Vitest suite `tests/network-id-finalization.test.ts` covering all 11 required business and security scenarios (33/33 tests passing).
  - Updated documentation in `docs/FLOWS.md`, `docs/SEEDING.md`, `docs/PROVIDER_INTEGRATION.md`, and `.env.example`.
- **Files Modified / Created:**
  - `apps/web/src/modules/checkout/finalization.service.ts`
  - `apps/web/src/modules/network/network.service.ts`
  - `apps/web/src/app/api/v1/dev/payments/[paymentId]/simulate/route.ts`
  - `apps/web/src/app/api/v1/me/network-ids/route.ts`
  - `apps/web/src/app/api/v1/me/network-ids/[id]/route.ts`
  - `apps/web/src/app/api/v1/me/network-ids/[id]/children/route.ts`
  - `apps/web/src/app/api/v1/me/network-ids/[id]/referral/route.ts`
  - `apps/web/src/app/api/v1/me/orders/[orderId]/registration-status/route.ts`
  - `apps/web/src/lib/auth.ts`
  - `apps/web/vitest.config.mts`
  - `apps/web/tests/network-id-finalization.test.ts`
  - `docs/FLOWS.md`
  - `docs/SEEDING.md`
  - `docs/PROVIDER_INTEGRATION.md`
  - `.env.example`
  - `apps/web/.env.example`
- **Validation Results:**
  - Tests: **33 tests passing across 7 test suites** (0 failures).
  - Next.js Production Build: **35 routes compiled and static-rendered successfully** with zero TypeScript errors.

### [2026-10-26 15:53 IST] - Fix: NetworkPlacement Relation Mapping (`parentPlacements` vs `placements`)

- **Root Cause Analysis:**
  - In `schema.prisma`, `NetworkId` defines two relations to `NetworkPlacement`:
    - `placements @relation("ChildPlacement")` (where this node is the child).
    - `parentPlacements @relation("ParentPlacement")` (where this node is the parent).
  - `NetworkService` methods (`findPlacementSlot`, `validateReferralCode`, `listUserNetworkIds`, `getNetworkIdDetails`) were querying `include: { placements: true }` instead of `parentPlacements: true`.
  - For parent nodes (including the Root Node `TULSI-ROOT-001`), `placements` returned an empty list `[]` (since the root node is nobody's child).
  - Consequently, `findPlacementSlot` always concluded that slot 1 was open under the root node, even though slot 1 was already occupied by Rajesh Sharma from the seed script.
  - When finalization attempted `tx.networkPlacement.create({ data: { parentNetworkId, slotNumber: 1, ... } })`, PostgreSQL rejected the write with `P2002: Unique constraint failed on the fields: (parent_network_id, slot_number)`.
- **Changes Applied:**
  - Updated [network.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/network/network.service.ts) across `validateReferralCode`, `findPlacementSlot`, `listUserNetworkIds`, and `getNetworkIdDetails` to query `include: { parentPlacements: true }` and safely fallback to `placements` for compatibility.
- **Validation:**
  - Ran Vitest suite: 33/33 tests passing.

### [2026-10-26 18:15 IST] - Comprehensive Checkout & Network Registration Architecture Guide

- **Documentation Created:**
  - Created [docs/CHECKOUT_AND_REGISTRATION_ARCHITECTURE.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/CHECKOUT_AND_REGISTRATION_ARCHITECTURE.md) covering the entire 10-step lifecycle from storefront arrival to 10-level upline commission allocation.
  - Documented core business rules: Server-Authoritative Pricing (₹500), Indian E.164 normalization, CSPRNG SHA-256 phone challenge verification with timing-safe comparisons, BFS ternary tree spillover, User account reuse, collision-resistant random identifier generation, and atomic idempotent finalization.
  - Performed comprehensive security & verification audit (threat model covering price tampering, timing attacks, replay attacks, checkout bypass, and multi-tenant isolation).
  - Included senior-level Q&A cheat sheet for architectural defense.
- **Validation:**
  - Executed Vitest suite: 33/33 tests passing across all 7 test files.

### [2026-10-26 18:37 IST] - Storefront Hero Mobile Top-and-Bottom Layout Tuning

- **UI Enhancement:**
  - In [HomePageClient.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/HomePageClient.tsx), updated the Hero section mobile layout:
    - Anchored the **Top Block** (Eyebrow badge, Main Headline, Supporting Paragraph) directly below the Navbar at the top of the mobile screen.
    - Anchored the **Bottom Block** (Action Buttons and Trust Markers) to the bottom of the section above the fold (`mt-auto sm:mt-6 pb-1 sm:pb-0`).
    - Adjusted mobile gradient overlay to a dual vertical gradient (`from-[#183F32]/90 via-[#183F32]/40 to-[#183F32]/95`), maintaining high contrast and readability for top text and bottom buttons while allowing the background botanical video to shine through in the center.
    - Desktop layout retains its original left-aligned grouping (`sm:block`, `sm:bg-gradient-to-r`).

### [2026-10-26 19:15 IST] - Removal of OrderItem Table & Consolidation into Single-Product Order Model

- **Background & Context:**
  - Tulsi Swarojgar is a dedicated single-product D2C storefront (*Tulsi Meta Ved — Herbal Mix*).
  - Having a separate `OrderItem` (`order_items`) 1:N relational table introduced unnecessary joins, migration complexity, and redundant foreign keys without providing any architectural benefit for a single-product catalog.
- **Architectural Changes:**
  - **Prisma Schema (`apps/web/prisma/schema.prisma`):**
    - Dropped `model OrderItem` (`order_items` table).
    - Removed `orderItems OrderItem[]` relation from `model Product`.
    - Removed `items OrderItem[]` relation from `model Order`.
    - Added immutable product snapshot fields directly to `model Order`:
      - `productNameSnapshot String? @map("product_name_snapshot")`
      - `productSlugSnapshot String? @map("product_slug_snapshot")`
      - `skuSnapshot String? @map("sku_snapshot")`
    - Preserved existing product audit fields on `Order`: `productId`, `quantity`, `unitPricePaise`, `subtotalPaise`, `totalAmountPaise`.
  - **Database Migration:**
    - Applied schema changes to Supabase PostgreSQL database using `prisma db push --accept-data-loss`.
    - Regenerated Prisma Client using `prisma generate --no-engine`.
  - **Backend Checkout Service (`apps/web/src/modules/checkout/checkout.service.ts`):**
    - Updated `confirmCheckout` to write `productNameSnapshot`, `productSlugSnapshot`, and `skuSnapshot` directly to `Order.create` data, removing `items: { create: [...] }`.
  - **Orders API Route (`apps/web/src/app/api/v1/orders/[id]/route.ts`):**
    - Removed `include: { items: true }` from database query.
    - Updated response payload to return `productName`, `productSlug`, `sku`, `quantity`, and `unitPricePaise` directly at the root.
    - Provided a synthesized `items: [...]` array in the response for full backward compatibility with existing frontends and contract consumers.
  - **Contracts (`packages/contracts/src/order.ts`):**
    - Added `productId`, `productNameSnapshot`, `productSlugSnapshot`, `skuSnapshot`, `quantity`, and `unitPricePaise` to `OrderSchema`.
    - Maintained `items: z.array(OrderItemSchema).optional()` as optional for backward compatibility.
    - Recompiled `@tulsi/contracts`.
- **Validation Results:**
  - Automated tests: **All 33 Vitest tests passed** across all 7 test suites (0 failures).
  - Next.js production build: **Cleanly compiled across all 35 routes** with zero TypeScript errors.

### [2026-10-26 19:40 IST] - Pure Relational Address Referencing for Orders & JSON Column Removal

- **Background & Context:**
  - Transitioned the orders table from storing an individual `shipping_address` JSON blob to pure foreign key referencing (`shipping_address_id` -> `addresses.id`).
- **Architectural Changes:**
  - **Prisma Schema (`apps/web/prisma/schema.prisma`):**
    - Dropped `shippingAddress Json @map("shipping_address")` from `model Order`.
    - Maintained `shippingAddressId String? @map("shipping_address_id") @db.Uuid` and renamed relation to `shippingAddress Address? @relation("OrderShippingAddressRef", ...)`.
    - Made `Address.userId` nullable (`String?`) to support guest checkout before user account registration.
  - **Database Migration:**
    - Applied schema update to PostgreSQL using `prisma db push --accept-data-loss`.
    - Regenerated Prisma Client using `prisma generate --no-engine`.
  - **Checkout Flow (`apps/web/src/modules/checkout/checkout.service.ts`):**
    - In `confirmCheckout`, extracts validated shipping details from session, deduplicates against existing user addresses, and creates an `Address` row in `addresses` table.
    - Creates `Order` with `shippingAddressId: address.id` without storing redundant JSON.
  - **Payment Finalization (`apps/web/src/modules/checkout/finalization.service.ts`):**
    - In `finalizeOrderAndRegistration`, when `User` is created/resolved, links `address.userId = user.id` and marks `isDefault: true` if the user has no existing default address.
  - **Orders API Route (`apps/web/src/app/api/v1/orders/[id]/route.ts`):**
    - Queries `include: { shippingAddress: true }`.
    - Returns structured address entity with backward-compatible aliases (`houseFlat`, `streetLocality`, `pinCode`, `mobile`).
  - **Member API Route (`apps/web/src/app/api/v1/me/addresses/route.ts`):**
    - Added authenticated endpoint `GET /api/v1/me/addresses` to list saved addresses for the current member.
  - **Contracts (`packages/contracts/src/order.ts`):**
    - Updated `OrderSchema` to include `shippingAddressId` and recompiled `@tulsi/contracts`.
- **Validation Results:**
  - Automated tests: **All 34 Vitest tests passed** across all 7 test suites (including new scenario 12 verifying Address-to-User linking).
  - Next.js production build: **Cleanly compiled across all 36 routes** with zero TypeScript or Turbopack errors.

### [2026-10-26 19:55 IST] - Commission Engine Technical Architecture & Security Documentation

- **Documentation Created:**
  - Created [docs/COMMISSION_ENGINE_ARCHITECTURE.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/COMMISSION_ENGINE_ARCHITECTURE.md) detailing the complete technical, mathematical, and security specification of the Tulsi Swaraj Commission Engine.
  - Formulated the Level 1 direct milestone state machine (`0/3` -> ₹0, `1/3` -> ₹0, `2/3` -> ₹0, `3/3` -> ₹500, `4/3` -> no duplicate), backed by composite unique constraints on `Level1QualificationEvent`.
  - Detailed the Levels 2–10 per-qualifying-position ancestor traversal rates (L2: ₹100, L3: ₹75, L4: ₹50, L5: ₹25, L6: ₹15, L7: ₹10, L8: ₹5, L9: ₹3, L10: ₹1).
  - Documented strict broken-path rules (halts on missing/corrupt link, no skipping over broken links, audits `BLOCKED` status).
  - Specified the precomputed, incrementally maintained `NetworkLevelSummary` architecture with atomic SQL updates, enabling $O(1)$ indexed reads for member dashboard queries.
  - Documented the administrative reconciliation tool (`CommissionReconciliationService`) and senior architect Q&A defense cheat sheet.

### [2026-10-26 20:15 IST] - Tulsi Swaraj Commission Engine Implementation & Full Verification

- **Background & Objectives:**
  - Implemented the complete backend commission calculation and ledger engine in accordance with client specifications and the approved architecture.
  - Built an incrementally maintained precomputed database summary (`NetworkLevelSummary`) to ensure $O(1)$ dashboard reads without full-table aggregations.
- **Architectural Deliverables & Schema Changes:**
  - **Prisma Schema (`apps/web/prisma/schema.prisma`):**
    - Extended `Commission` model with `planVersion`, `rewardType`, `idempotencyKey` (`@unique`), `blockReason`, and `@@index([beneficiaryNetworkId, relativeLevel])`.
    - Created `NetworkLevelSummary` model tracking 10 levels with `[networkId, levelNumber]` unique constraint and fields for `earnedAmountPaise`, `heldAmountPaise`, `availableAmountPaise`, `paidAmountPaise`, and `reversedAmountPaise`.
    - Created `Level1Qualification` and `Level1QualificationEvent` models with composite unique constraints for concurrency-safe milestone evaluation (`0/3` -> ₹0, `1/3` -> ₹0, `2/3` -> ₹0, `3/3` -> ₹500, `4/3` -> no duplicate).
    - Synchronized schema to PostgreSQL via `prisma db push --accept-data-loss` and regenerated Prisma client with `prisma generate --no-engine`.
  - **Domain Services (`apps/web/src/modules/commissions/`):**
    - [commission-plan.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/commissions/commission-plan.ts): Centralized frozen configuration in integer paise (`tulsi-v1`).
    - [hierarchy-resolver.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/commissions/hierarchy-resolver.service.ts): Strict-path upline traversal up to 10 levels with cycle and self-parenting guards.
    - [commission-qualification.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/commissions/commission-qualification.service.ts): Level 1 direct milestone evaluation and progress tracker.
    - [commission-summary.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/commissions/commission-summary.service.ts): Pre-initializes 10 level summaries per node; maintains atomic SQL increments/decrements.
    - [commission-ledger.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/commissions/commission-ledger.service.ts): Idempotent ledger entry insertion with status `HELD` and summary updates.
    - [commission-reconciliation.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/commissions/commission-reconciliation.service.ts): Audits precomputed summaries against ledger truth and repairs discrepancies.
    - [commission-engine.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/commissions/commission-engine.service.ts): Authoritative entry point `processQualifyingSale(orderId)`.
    - [commissions.service.ts](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/modules/commissions/commissions.service.ts): Facade for controllers and member APIs with `OFFICIAL_COMMISSION_SCHEDULE`.
  - **Checkout Finalization Integration (`apps/web/src/modules/checkout/finalization.service.ts`):**
    - Pre-initializes 10 level summaries for every newly created node.
    - Triggers authoritative upline commission distribution inside the payment confirmation transaction.
  - **Member API Endpoints:**
    - `GET /api/v1/me/commissions/summary`: $O(1)$ precomputed summary response.
    - `GET /api/v1/me/commissions`: Paginated ledger history with status and level filters.
    - `GET /api/v1/me/qualification-progress`: Current Level 1 milestone completion progress.
    - `GET /api/v1/me/network-ids/[id]/commissions`: Node-specific commission ledger.
    - `GET /api/v1/me/network-ids/[id]/qualification`: Node-specific Level 1 progress.
  - **Database Seed (`apps/web/prisma/seed.ts`):**
    - Updated seed script to pre-initialize 10-level summaries for seeded tree nodes.
  - **Documentation & Verification Guide:**
    - [docs/COMMISSION_ENGINE_ARCHITECTURE.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/COMMISSION_ENGINE_ARCHITECTURE.md): Technical architecture, mathematical proofs, and security guide.
    - [docs/COMMISSION_TESTING.md](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/docs/COMMISSION_TESTING.md): Verification checklists and testing instructions.
- **Validation Results:**
  - Automated Tests: **All 44 Vitest tests passed** across all 8 test suites (including 10 comprehensive commission engine scenarios).
  - Next.js Production Build: **All 39 static and dynamic routes compiled cleanly** with zero TypeScript or Turbopack errors.

### [2026-10-26 20:52 IST] - Hero Video Gradient Overlay Tuning for Mobile and Desktop

- **Component Modified:** [HomePageClient.tsx](file:///d:/CODING/NavigoTech%20Innovation/TulsiMLM/apps/web/src/components/home/HomePageClient.tsx#L83)
- **Gradient Adjustments:**
  - **Mobile (`< sm`):** Formulated natural multi-stop eased gradient (`0.60` -> `0.52` at 20% -> `0.38` at 32% -> `0.18` at 44% -> `0.04` at 54% -> `0` at 62%, and mirrored up to `0.60` at 100%) eliminating sharp banding lines and providing a gentle, organic feather into the transparent video center.
  - **Desktop (`sm:`):** Formulated smooth horizontal gradient curve (`0.60` -> `0.52` at 25% -> `0.38` at 42% -> `0.20` at 58% -> `0.06` at 74% -> `0` at 88%) for a soft photographic vignette across the text zone.
- **Verification:** All 44 automated tests passing.

---


## 4. Current Workspace Status & Next Steps

1. **Current Status**:
   - The Tulsi Swaraj Commission Engine and incrementally maintained database summary system are 100% implemented, tested, and integrated.
   - All 44 automated tests passing across 8 suites.
   - Next.js 16 production build compiled with 0 errors.
2. **Next Steps**:
   - Integrate live PhonePe merchant credentials when provided.
   - Implement admin review dashboard UI to approve `HELD` commissions to `APPROVED` for wallet withdrawal.



