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


---

## 3. Current Architecture & State

### Apps and Packages Directory Tree

```text
TulsiMLM/
├── AGENTS.md                  # Workspace rules governing memory.md updates
├── memory.md                  # This persistent context tracking file
├── apps/
│   ├── api/                   # Express backend API (Port 4000)
│   └── web/                   # Next.js 16 App Router storefront (@tulsi/web, Port 3000)
│       └── src/
│           ├── app/           # App Router pages, layouts, metadata & JSON-LD schemas
│           ├── components/    # Reusable UI & client islands (home, product, cart, dashboard)
│           ├── data/          # Flagship product data, FAQs, policies
│           └── store/         # Zustand stores (useCartStore, useAuthStore)
├── packages/
│   ├── contracts/             # Zod contracts & DTOs
│   ├── config/                # Shared configs
│   ├── ui/                    # Shared UI library placeholder
│   └── utils/                 # Currency & formatting utilities
└── docs/
    ├── prd.md                 # Product requirements
    └── architecture.md        # Technical architecture
```

---

## 4. Next Implementation Steps

1. **Backend API Integration (`apps/api` connection):**
   - Create unified API client (`apps/web/src/lib/api-client.ts`) pointing to `apps/api` (`http://localhost:4000/api/v1`).
2. **Product Catalogue Connection:**
   - Connect Next.js product page and dynamic params to `GET /api/v1/products` while preserving static fallback / revalidation.
3. **Checkout & PhonePe Integration:**
   - Wire checkout form submission (`apps/web/src/app/checkout/page.tsx`) to `POST /api/v1/checkout` with backend authoritative pricing.
   - Connect PhonePe redirect flow and return verification.

