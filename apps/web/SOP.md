# MASTER BUILD PROMPT — TULSI SWARAJ
## Premium Ayurvedic E-Commerce Frontend Prototype

### 1. Your role

Act as a senior product designer, UI/UX architect, frontend engineer, e-commerce specialist, and visual design director.

Build a complete, polished, responsive frontend prototype for **Tulsi Swaraj**, an Indian Ayurvedic wellness brand selling its flagship product, **Tulsi Meta Ved Herbal Mix**, at ₹500.

This must feel like a real, professionally designed commerce product—not a generic AI-generated landing page, a template website, or a basic college project.

Priorities, in order:

1. Exceptional visual design and art direction.
2. Clear product discovery and purchase flow.
3. Trustworthy product presentation.
4. Professional checkout and order confirmation.
5. Functional customer account and dashboard.
6. Reusable architecture and maintainable code.
7. Responsive design and accessibility.
8. Realistic interactions and credible prototype data.

Do not stop after creating the homepage. Build the complete connected frontend experience.

---

### 2. Product and brand information

**Brand:** Tulsi Swaraj

**Product:** Tulsi Meta Ved Herbal Mix

**Selling price:** ₹500

**Market:** India

**Currency:** INR (₹)

**Primary audience:** Indian consumers interested in herbal products, Ayurvedic traditions, and everyday wellness.

**Brand positioning:** A contemporary Indian herbal wellness brand that presents its products with clarity, warmth, and a premium, trustworthy aesthetic.

The product should be the central focus of the website. Make it easy for visitors to understand what the product is, review its actual ingredients and usage instructions, and proceed to purchase.

Do not invent:
- Ingredient lists.
- Medical benefits or disease-treatment claims.
- Certifications, licenses, clinical studies, or laboratory results.
- Manufacturing details, origin claims, or organic status.
- Customer reviews, testimonials, or sales statistics.
- Discounts, delivery promises, or product awards.

Use clearly identifiable placeholders wherever the business has not supplied verified information. Do not present placeholders as established facts.

---

### 3. Scope and boundaries

This is a **frontend prototype**, not a production-ready MLM backend.

Implement a realistic shopping experience with simulated data and interactions. Do not claim that a payment has actually been processed, an order has actually been shipped, or a user account has been saved to a real server.

The public-facing marketing website should focus on the product, the brand, product information, and shopping.

Do not advertise the referral opportunity on the public homepage, product page, public navigation, or checkout marketing content.

If a referral program is demonstrated in the authenticated account experience, treat it as a separate, optional feature. Show its eligibility conditions and applicable terms before enrollment or activation. Do not silently enroll purchasers into financial arrangements or imply that an account is required to participate unless the actual business rules require it and this is disclosed.

Do not implement misleading earnings claims, guaranteed income promises, fabricated testimonials, or fake payment-success screens.

---

### 4. Technology stack

Inspect the existing repository before making changes. Reuse its working framework and dependencies when reasonable instead of rebuilding everything unnecessarily.

For a new project, use:

- Next.js with App Router.
- TypeScript with strict type checking.
- Tailwind CSS.
- shadcn/ui for carefully selected primitives.
- Lucide React for icons.
- Framer Motion or Motion for restrained, purposeful animations.
- React Hook Form for forms.
- Zod for form validation.
- Zustand for lightweight cart and UI state, or a simple React Context implementation if it better fits the project.
- Recharts for dashboard charts only when the data meaningfully benefits from visualization.
- Sonner for toast notifications.
- Swiper only if a product or editorial carousel genuinely needs it.

Use the current stable, mutually compatible versions available in the environment. Do not blindly upgrade existing packages.

Prefer Server Components for static marketing content when using Next.js. Add Client Components only for interactions that need them.

Use local mock data and local state for the prototype. Keep service boundaries ready for a future API.

Do not add Redux merely for the sake of using Redux. Keep the state-management solution proportional to the application's needs.

---

### 5. Design direction

#### Overall art direction

Create a premium Indian botanical wellness identity with contemporary editorial design.

The website should feel like a combination of:
- A sophisticated wellness brand.
- A carefully art-directed botanical editorial.
- A modern, trustworthy Indian e-commerce storefront.

Avoid the visual language of generic MLM websites.

#### Color system

Use the following starting palette:

- Deep forest green: #183F32
- Dark botanical green: #285642
- Muted sage: #A9B7A0
- Warm ivory: #F8F5ED
- Soft cream: #EFE9DB
- Natural charcoal: #252923
- Muted stone: #77796F
- White: #FFFFFF
- Restrained antique brass accent: #B49A63

Use green as the primary action color, warm ivory as the primary background, and charcoal for typography.

Do not make every section green. Alternate backgrounds to establish rhythm and hierarchy.

Gold or brass should be a subtle accent rather than a dominant luxury effect.

#### Typography

Use a distinctive editorial serif for large headlines and a highly readable sans-serif for body text.

Suggested pairing:
- Display: DM Serif Display or an equivalent editorial serif.
- Body and UI: Manrope or Inter.
- Optional numerical emphasis: the same sans-serif with tabular numerals.

Use a clear hierarchy between display headlines, section headings, body copy, labels, prices, and metadata.

Avoid excessively small text, huge blocks of uppercase text, and inconsistent font weights.

#### Layout principles

- Use a consistent content container, approximately 1200–1320px on large screens.
- Use a spacing scale based on 4px and 8px increments.
- Give the hero generous breathing room.
- Use strong alignment and a deliberate grid.
- Maintain comfortable text line lengths.
- Use large, high-quality product imagery.
- Keep important purchase actions visually prominent.
- Use restrained borders and shadows.
- Avoid excessive rounded cards.
- Use consistent button heights and input styling.
- Design mobile layouts intentionally instead of simply stacking desktop elements.

#### Explicit anti-patterns

Never use:
- Generic purple or blue gradients.
- Excessive glassmorphism.
- Floating decorative blobs everywhere.
- Emoji as primary icons.
- Repeated identical rounded cards across every section.
- Random animations on every element.
- Unnecessary scrolling marquees.
- Fake live purchase notifications.
- Fake counters or fabricated business statistics.
- Generic AI-looking dashboard cards without a clear purpose.
- Overly dense text or unnecessarily long landing pages.
- Medical before-and-after imagery.
- Unverified claims disguised as badges.

The final website must feel intentionally designed by a real brand design team.

---

### 6. Global navigation

Create a clean, premium navigation system.

#### Desktop header

Left:
- Tulsi Swaraj logo and wordmark.

Center or right:
- Home.
- Our Story.
- Product.
- Contact.

Right:
- Account icon.
- Cart icon with item count.
- A clear Shop Now action.

The header should be visually light and elegant. It may become sticky after scrolling, provided the transition is subtle and does not consume excessive viewport space.

The cart icon must open a working cart drawer or navigate to the cart page.

The account icon should open the account login or dashboard entry point.

#### Mobile header

- Brand mark on the left.
- Cart and menu controls on the right.
- Accessible mobile navigation drawer.
- Appropriate touch targets.
- No horizontal overflow.

Use semantic navigation elements and accessible focus states.

---

### 7. Homepage: the primary visual experience

Route: `/`

The homepage is the most important page. Spend the most design effort here.

#### Section 1: Hero

Create an extraordinary editorial hero with a strong composition.

Suggested layout:
- Large headline and concise supporting copy on the left.
- A beautifully art-directed product composition on the right.
- Small botanical details integrated into the scene.
- Clear primary CTA: “Explore the Product”.
- Secondary CTA: “Our Story”.
- Optional understated product-price label: “₹500”.

Possible headline direction:

“Rooted in Nature. Made for Everyday Rituals.”

Supporting-copy direction:

“Discover Tulsi Swaraj and our approach to bringing thoughtfully presented herbal products into your everyday routine.”

These are creative starting points. Refine the language to suit the final design, but do not make unsupported claims about efficacy.

The hero must have a clear visual focal point. Use large-scale typography, controlled whitespace, and carefully composed photography.

Do not use a generic full-screen image with text simply placed over it. Create a deliberate layout with clear contrast and responsive art direction.

On desktop, aim for an impactful split composition. On mobile, place the headline, CTA, and product image in an order that preserves readability and conversion.

#### Section 2: Brand introduction

Introduce Tulsi Swaraj in a short, editorial format.

Include:
- A concise brand statement.
- Botanical imagery.
- A link to the About page.

Do not invent a founder story or manufacturing history.

#### Section 3: Featured product

Present Tulsi Meta Ved Herbal Mix as the flagship product.

Include:
- Large product image.
- Product name.
- Price of ₹500.
- Brief factual description.
- Product information link.
- Add to Cart.
- Buy Now.

Both actions must work.

Add to Cart should update the cart state and cart count.

Buy Now should take the visitor directly into the purchase flow with the product added to the cart.

#### Section 4: Product details or ingredients

Create a refined ingredient-storytelling section.

Use the verified ingredient list when it is provided by the business. Until then, use explicit placeholder content in the development preview rather than inventing ingredients.

Make the section easy to update once the actual formulation is confirmed.

#### Section 5: Brand values

Use three or four understated editorial blocks.

Potential themes:
- Respect for traditional herbal practices.
- Ingredient transparency.
- Clear product information.
- Thoughtful customer support.

Only make specific factual claims when supported by supplied evidence.

Do not create fake certification badges or quality guarantees.

#### Section 6: Product imagery and usage

Show the product in an elegant lifestyle composition.

Include directions for use only when verified information is available. If unavailable, provide a clearly labeled placeholder in the preview.

#### Section 7: Customer feedback

Create a testimonial component that can be populated with real, permissioned customer feedback.

Do not publish invented names, ratings, reviews, or quotes.

If real testimonials have not been supplied, hide the live testimonial section or replace it with a non-testimonial product-information section.

#### Section 8: Frequently asked questions

Create an accordion covering:
- What is Tulsi Meta Ved Herbal Mix?
- What are its ingredients?
- How should it be used?
- What is the price?
- How can an order be placed?
- What are the shipping and return policies?
- How can customer support be contacted?

Use verified answers when available. Mark unanswered business details as pending configuration rather than inventing policies.

#### Section 9: Closing CTA

Finish with a visually distinctive but restrained product section.

Include:
- Product image.
- Product name.
- ₹500 price.
- Shop Now CTA.

#### Section 10: Footer

Include:
- Brand identity.
- Product navigation.
- About.
- Contact.
- Shipping policy.
- Returns and refunds.
- Privacy policy.
- Terms and conditions.
- Relevant product and business information.

All policy pages must contain real or clearly marked draft content. Do not create fake legal assurances.

---

### 8. Product detail page

Route: `/products/tulsi-meta-ved-herbal-mix`

Design this like a real premium e-commerce product page.

#### Above the fold

Left:
- Large primary product photograph.
- Thumbnail gallery.
- Optional zoom or lightbox.

Right:
- Breadcrumbs.
- Product name.
- Price: ₹500.
- Concise description.
- Pack size, once confirmed.
- Quantity selector.
- Add to Cart button.
- Buy Now button.
- Delivery availability input or postal-code checker if implemented with a clear mock-data disclaimer.

Make the purchase CTA visible without forcing the customer to scroll through long marketing content.

#### Below the fold

Create clear sections or tabs for:
- Overview.
- Ingredients.
- Directions for use.
- Product information.
- Shipping and returns.
- FAQs.

Add structured, readable product specifications.

Do not invent a net weight, shelf life, dosage, medical benefit, or certification.

Use an image gallery that supports keyboard navigation and works on mobile.

Add a sticky purchase bar on mobile only if it improves usability and does not obscure other controls.

---

### 9. Cart experience

Route: `/cart`

Create a proper cart page or drawer with:

- Product thumbnail.
- Product name.
- Unit price.
- Quantity selector.
- Remove action.
- Subtotal.
- Shipping estimate or configured shipping charge.
- Total.
- Proceed to Checkout.

Use ₹500 as the unit price for the initial product.

If the cart is empty, show an intentional empty state with a Shop Now CTA.

Support:
- Adding products.
- Updating quantity.
- Removing items.
- Updating the subtotal immediately.
- Persisting cart contents locally for the demo when practical.

Do not create fake discounts or an invented free-shipping threshold.

Use a clear order-summary layout and ensure that totals are consistent throughout the entire flow.

---

### 10. Checkout: professional commerce flow

Route: `/checkout`

The checkout must feel comparable to a polished modern e-commerce website.

Use a focused layout without distracting marketing sections.

#### Step 1: Contact details

Fields:
- Full name.
- Email address.
- Mobile number.

Validate required fields and provide clear, human-readable error messages.

#### Step 2: Shipping address

Fields:
- House or flat number.
- Street or locality.
- Landmark, optional.
- City.
- State.
- PIN code.
- Country, default India.

Use appropriate input types and validation.

Do not collect unnecessary personal information.

#### Step 3: Delivery information

Allow selection of a configured delivery option only if the prototype has explicit mock pricing and delivery estimates.

Otherwise, show a neutral delivery-information placeholder.

#### Step 4: Payment method

Provide a professional payment-method interface.

Possible options:
- UPI.
- Debit or credit card.
- Net banking.
- Cash on Delivery, only if the business supports it.

Display the actual configured options only.

For the frontend prototype, simulate selecting a payment method and moving into a demo payment flow.

Never ask users to enter real card credentials into a simulated payment form.

Do not pretend that a payment gateway is connected. Clearly label the environment as a demo.

If a gateway is integrated in a later phase, use its official checkout flow rather than storing card information in the application.

#### Step 5: Order review

Display:
- Product image.
- Product name.
- Quantity.
- Unit price.
- Subtotal.
- Shipping charges, if configured.
- Final total.

The default single-item subtotal must be ₹500 before any configured additional charges.

Show the order total prominently.

#### Step 6: Place order

Before placing the order:
- Validate required fields.
- Validate consent to applicable terms.
- Ensure the final total is correct.
- Show any relevant checkout terms.
- Avoid preselected marketing consent.

On successful mock submission, generate a demo order identifier and navigate to the confirmation page.

Do not claim that a real payment was processed.

The checkout must not advertise referral incentives. If account creation is tied to financial membership or additional obligations, disclose the applicable conditions before the user consents to them.

---

### 11. Order confirmation

Route: `/order-confirmation/[orderId]`, or a compatible prototype route.

Show:
- Success or demo-confirmation illustration.
- Order identifier.
- Product summary.
- Amount paid or payment status, clearly identified as simulated where applicable.
- Delivery address.
- Order status.
- Continue Shopping.
- View Order.

Do not display a real payment-success claim when no actual payment has occurred.

Use realistic demo order data, but identify the order as a prototype order.

---

### 12. Authentication and account creation

Create a complete frontend authentication experience.

Routes:
- `/login`
- `/register`
- `/forgot-password`

Registration fields:
- Full name.
- Email.
- Mobile number, if required.
- Password.
- Confirm password.
- Required terms acceptance.

Include:
- Password visibility toggle.
- Inline validation.
- Loading state.
- Success and error states.
- Clear navigation between login and registration.

Support an account-creation path after checkout. Do not force an unnecessary second form if the customer has already supplied the necessary details.

Use mock authentication for the prototype.

Do not imply that mock credentials or accounts are securely stored on a production server.

For production, authentication must be implemented server-side with appropriate password hashing, session management, rate limiting, and secure cookies.

---

### 13. Customer dashboard

Route: `/dashboard`

Create a professional customer dashboard with a coherent information architecture.

Use a sidebar on desktop and a suitable mobile navigation pattern.

#### Overview

Show:
- Welcome message.
- Account status.
- Total orders.
- Recent orders.
- Latest order status.
- Account profile completion, if meaningful.

Do not display fabricated real-world sales or earnings statistics.

#### My Orders

Route: `/dashboard/orders`

Display:
- Order ID.
- Date.
- Product.
- Quantity.
- Total.
- Payment status.
- Order status.
- View Details.

Use realistic mock orders and clear empty states.

#### Order details

Route: `/dashboard/orders/[orderId]`

Show:
- Order summary.
- Delivery address.
- Payment status.
- Order timeline.
- Support action.

#### My Profile

Route: `/dashboard/profile`

Allow the user to edit:
- Name.
- Email.
- Mobile number.
- Saved addresses.

Use local mock persistence.

#### Support

Route: `/dashboard/support`

Include:
- Contact options.
- Support form.
- Order-related query selection.
- Clear confirmation after submission.

Use configured business contact details. If those details are not supplied, use a development placeholder rather than an invented phone number.

#### Optional private referral module

If the prototype needs to demonstrate the post-purchase referral experience, place it in a distinct account area rather than the public shopping journey.

Make it an explicitly activated program with:
- Clear program terms.
- Eligibility conditions.
- A mock account or member identifier.
- A sample referral link.
- Referral status.
- Qualified referral count.
- Pending and approved rewards.
- A reward history.
- A transparent explanation of how qualification and payment work.

The proposed commercial model includes a ₹500 reward after three qualifying referrals and additional commission rules for referred participants. These rules are not fully specified and must not be treated as final.

Before implementation, keep all referral parameters in a configurable mock-data file. Do not hardcode the program into unrelated UI components.

Do not show projected income as guaranteed income. Do not invent a referral tree, commission percentages, reward caps, payout dates, or eligibility rules.

If referral functionality is not approved for demonstration, omit this module and keep the dashboard focused on customer account management.

---

### 14. Dashboard visual design

The dashboard must not look like a generic admin template.

Use:
- A warm, neutral canvas.
- A deep green navigation accent.
- Clear page headings.
- Carefully spaced statistics.
- Meaningful visual hierarchy.
- Compact, readable tables.
- Restrained status indicators.
- Useful empty states.
- Consistent form design.

Use charts only when there is a meaningful time series or comparison.

Suggested order statistics:
- Total orders.
- Pending orders.
- Delivered orders.
- Recent activity.

If referral statistics are enabled in the private demo, separate them visually from order statistics.

Every statistic must be derived from mock data rather than arbitrary hardcoded values scattered through the components.

---

### 15. About page

Route: `/about`

Create an editorial brand story page with:

1. A strong introductory headline.
2. An atmospheric botanical hero image.
3. A concise explanation of the brand.
4. The brand's philosophy.
5. A product-focused section.
6. A transparent statement of the brand's commitment to clear product information.
7. A Shop Now CTA.
8. Footer.

Keep the layout refined and content-led.

Do not fabricate the founder's story, founding year, sourcing locations, factory, manufacturing practices, or community impact.

If business information is missing, provide editable placeholders for the owner to complete.

Avoid over-animation on this page.

---

### 16. Contact and policy pages

Create:
- `/contact`
- `/shipping-policy`
- `/returns-refunds`
- `/privacy-policy`
- `/terms`

Contact page:
- Contact form.
- Email placeholder.
- Phone placeholder, if applicable.
- Business hours, only when confirmed.

Shipping policy:
- Delivery areas.
- Processing times.
- Estimated delivery times.
- Shipping charges.
- Delays and exceptions.

Returns and refunds:
- Eligible products.
- Return window.
- Damaged or incorrect orders.
- Refund process.
- Contact procedure.

Privacy:
- Data collected.
- Purpose of collection.
- Retention and deletion.
- Sharing and processors.
- Contact for privacy requests.

Terms:
- Purchase conditions.
- Pricing.
- Orders and cancellations.
- Payment.
- Delivery.
- Applicable business policies.

Use draft labels for unapproved policies. Never invent a business address or present a draft as an approved legal policy.

---

### 17. Image-generation plan

Generate a cohesive image family for the entire website.

All images must share the same art direction:
- Premium Indian botanical wellness.
- Warm ivory and natural earth tones.
- Deep forest green.
- Soft natural lighting.
- Photorealistic material textures.
- Subtle botanical details.
- Editorial composition.
- Authentic, restrained styling.
- No artificial-looking 3D product renders unless the real product packaging is being accurately represented.

The actual Tulsi Meta Ved Herbal Mix packaging must come from a genuine product photo supplied by the business. Until that is available, generate a neutral placeholder container without inventing a final label or brand packaging design.

#### Image A — Homepage hero

Prompt:

“Create a premium editorial hero photograph for a contemporary Indian botanical wellness brand. A single elegant, unbranded herbal product container sits slightly right of center on a warm ivory stone pedestal. Fresh tulsi leaves, delicate botanical branches, natural textured paper, soft sunlight entering from the upper left, subtle organic shadows, muted sage and deep forest-green accents, luxurious yet approachable Indian wellness art direction, tactile materials, realistic studio photography, 50mm lens appearance, natural depth of field, sophisticated art direction inspired by premium skincare and botanical editorial campaigns. Keep the left third relatively uncluttered for website headline placement. Landscape 16:9 composition. No text, no logos, no watermarks, no medical symbols, no floating ingredients, no exaggerated glow.”

#### Image B — Product hero image

Prompt:

“Photorealistic premium e-commerce product photograph of one neutral, unbranded container for a powdered herbal mix, standing upright against a warm ivory background. Soft directional studio lighting, realistic contact shadow, subtle botanical leaves placed around the base, accurate natural material textures, centered composition, premium Indian wellness editorial photography, clean silhouette, front-facing camera, generous negative space, no readable text, no invented logo, no certification badges, no watermark. Square 1:1 image.”

Replace this placeholder with the real product photo before production.

#### Image C — Botanical ingredient atmosphere

Prompt:

“Premium botanical editorial photograph featuring fresh tulsi leaves and understated Indian herbal ingredients arranged naturally on warm limestone and handmade ivory paper. Forest-green and muted sage palette, soft morning sunlight, realistic leaf veins and natural imperfections, tactile surfaces, understated composition, high-end wellness magazine art direction, no packaging, no text, no labels, no medical imagery. Landscape 4:3 composition.”

Do not use this image to imply ingredients that have not been verified.

#### Image D — Brand story

Prompt:

“Editorial lifestyle photograph for an Indian botanical wellness brand, featuring natural leaves, warm stone, handmade paper, soft sunlight and subtle traditional Indian material textures. Contemporary and refined rather than rustic or folkloric. Warm ivory, muted olive, and deep forest-green palette, realistic photography, gentle shadows, carefully balanced negative space, no people required, no religious symbols, no text, no logos. Landscape 16:9.”

#### Image E — Product detail gallery

Generate a consistent gallery with these distinct compositions:

1. Front-facing product pack on a neutral background.
2. Three-quarter product view with soft side lighting.
3. Close-up of the actual product texture, only after a genuine product sample is available.
4. Product beside subtle botanical elements, without implying unverified ingredients.
5. Minimal packaging-detail photograph using verified packaging.

Use the same container, label, color, and product proportions across the gallery. Do not generate five visually inconsistent versions of the same product.

#### Image F — About page banner

Prompt:

“Wide cinematic botanical still life for a premium contemporary Indian herbal wellness brand. Soft morning light across textured ivory stone, layered green leaves, subtle natural fibers, gentle shadows, editorial photography, restrained composition, warm earthy palette, sophisticated and quiet visual storytelling, large negative space for a headline, landscape 21:9 composition, no text, no logo, no packaging, no watermark.”

#### Image G — Empty cart illustration

Prompt:

“Minimal refined still-life illustration for a premium herbal e-commerce website: one simple natural leaf and a small warm ivory parcel, delicate organic shapes, forest-green and muted sage palette, restrained editorial illustration, clean negative space, no lettering, no gradients, no cartoon faces, no watermark, square composition.”

#### Image H — Order confirmation illustration

Prompt:

“Minimal premium editorial illustration for an e-commerce order confirmation screen, featuring a neatly wrapped ivory parcel, one understated green botanical sprig, a subtle checkmark integrated into a simple geometric composition, forest green, warm ivory, muted sage, sophisticated and restrained, clean shapes, no text, no brand logo, no excessive decoration, square composition.”

#### Image I — Mobile promotional crop

Create a portrait variation of the homepage hero with the product centered vertically, generous negative space above, natural botanical framing, and all important visual details inside the central safe area.

Do not merely crop the desktop image if the resulting composition looks unbalanced.

#### Asset-management rules

- Save generated assets under `/public/images/`.
- Use descriptive filenames such as `tulsi-swaraj-hero.webp`.
- Preserve the original image if future editing is needed.
- Use appropriately compressed WebP or AVIF derivatives.
- Provide explicit width and height or aspect-ratio information.
- Use responsive image sizes.
- Lazy-load below-the-fold imagery.
- Prioritize the actual hero image for LCP.
- Do not lazy-load the primary LCP image.
- Use `next/image` for optimization where appropriate.
- Add meaningful alt text for informative images.
- Use empty alt text for decorative images.
- Avoid placing important text inside generated image assets.

---

### 18. Animation and interaction guide

Use animations sparingly to make the experience feel refined.

Allowed:
- Subtle hero entrance animation.
- Small staggered section reveals.
- Gentle image movement on scroll, if performance permits.
- Refined button hover states.
- Cart drawer transitions.
- Accordion expand/collapse.
- Toast notifications.
- Dashboard sidebar transitions.
- Small, purposeful number transitions for changing demo statistics.

Avoid:
- Excessive parallax.
- Full-screen intro animations that delay shopping.
- Cursor-following decorations.
- Scroll hijacking.
- Infinite motion.
- Large animation libraries used for trivial effects.
- Animation that interferes with keyboard navigation.

Respect `prefers-reduced-motion`.

The primary CTA must be usable immediately and must never depend on an animation finishing.

---

### 19. Suggested project structure

Use a modular structure similar to:

src/
  app/
    page.tsx
    about/
      page.tsx
    products/
      tulsi-meta-ved-herbal-mix/
        page.tsx
    cart/
      page.tsx
    checkout/
      page.tsx
    order-confirmation/
      [orderId]/
        page.tsx
    login/
      page.tsx
    register/
      page.tsx
    forgot-password/
      page.tsx
    dashboard/
      page.tsx
      orders/
        page.tsx
      profile/
        page.tsx
      support/
        page.tsx
    contact/
      page.tsx
    shipping-policy/
      page.tsx
    returns-refunds/
      page.tsx
    privacy-policy/
      page.tsx
    terms/
      page.tsx

  components/
    layout/
      Header.tsx
      Footer.tsx
      MobileNavigation.tsx
    home/
      Hero.tsx
      BrandStory.tsx
      FeaturedProduct.tsx
      ProductInformation.tsx
      FAQ.tsx
    product/
      ProductGallery.tsx
      ProductPurchasePanel.tsx
      QuantitySelector.tsx
    cart/
      CartDrawer.tsx
      CartItem.tsx
      OrderSummary.tsx
    checkout/
      ContactForm.tsx
      AddressForm.tsx
      PaymentMethodSelector.tsx
      CheckoutSummary.tsx
    dashboard/
      DashboardSidebar.tsx
      DashboardOverview.tsx
      OrderHistory.tsx
      ProfileForm.tsx
    ui/

  lib/
    utils.ts
    validation.ts
    currency.ts
    mock-auth.ts
    mock-orders.ts

  data/
    product.ts
    navigation.ts
    faq.ts
    policies.ts
    referral-demo.ts

  store/
    cart-store.ts

  types/
    product.ts
    cart.ts
    order.ts
    account.ts

Adapt the structure to the framework already present. Do not create unnecessary abstractions or one-file-per-element components.

Keep content, configuration, mock data, and visual components separate.

---

### 20. Functional requirements

Every visible interactive element must have a real prototype behavior.

Implement:
- Navigation between pages.
- Product gallery interactions.
- Quantity selection.
- Add to Cart.
- Buy Now.
- Cart drawer or cart page.
- Cart item removal.
- Cart quantity updates.
- Accurate price calculation.
- Checkout form validation.
- Payment method selection.
- Demo order submission.
- Order confirmation.
- Mock login and registration.
- Dashboard navigation.
- Order history.
- Profile editing.
- FAQ accordions.
- Mobile navigation.
- Toast feedback.
- Empty states.
- Error states.
- Loading states where meaningful.

Do not use `href="#"` as a substitute for functionality.

Do not create buttons that do nothing.

Do not create a fake payment gateway that requests real payment details.

Persist demo state locally when appropriate. Include a clear reset path for testing the complete user journey.

---

### 21. Responsive design

Test these viewport widths:
- 360px.
- 390px.
- 768px.
- 1024px.
- 1440px.

Requirements:
- No horizontal scrolling.
- No clipped headings.
- No overlapping buttons.
- No excessively compressed product cards.
- Checkout inputs must remain comfortable to use.
- Dashboard tables should adapt to smaller screens.
- Header and cart actions must remain accessible.
- Images must preserve their intended composition.
- Hero typography must scale smoothly.

Design mobile first, then refine the desktop experience.

---

### 22. Accessibility

Follow practical WCAG accessibility principles.

Implement:
- Semantic HTML.
- Correct heading hierarchy.
- Keyboard navigation.
- Visible focus states.
- Form labels.
- Accessible validation messages.
- Sufficient color contrast.
- Appropriate dialog behavior.
- Accessible accordions.
- Meaningful alt text.
- Reduced-motion support.
- Buttons and links with understandable labels.

Do not rely on color alone to communicate payment, order, or referral status.

---

### 23. SEO and performance

Implement:
- Page-specific metadata.
- Descriptive page titles.
- Useful meta descriptions.
- Canonical URLs where appropriate.
- Open Graph metadata.
- Sitemap and robots configuration where appropriate.
- Product structured data based only on verified information.
- Organization schema only for accurate business details.
- Breadcrumbs where useful.

Performance requirements:
- Optimize the hero image.
- Use responsive image sizes.
- Lazy-load below-the-fold images.
- Minimize client-side JavaScript.
- Avoid loading large libraries unnecessarily.
- Avoid layout shifts.
- Reserve image dimensions.
- Keep animations lightweight.
- Remove unused components and dependencies.
- Run a production build.

Do not add fabricated review ratings or aggregate ratings to structured data.

---

### 24. Design tokens and reusable components

Create centralized design tokens for:
- Colors.
- Typography.
- Spacing.
- Border radii.
- Shadows.
- Content widths.
- Button sizes.
- Form fields.
- Status colors.
- Animation timing.

Create reusable components for:
- Primary and secondary buttons.
- Product cards.
- Price displays.
- Quantity selectors.
- Input fields.
- Form errors.
- Accordions.
- Breadcrumbs.
- Toast notifications.
- Empty states.
- Order status indicators.
- Dashboard navigation.

Use consistent variants instead of manually restyling the same component on every page.

---

### 25. Step-by-step standard operating procedure

Follow these stages in order.

#### Phase 1 — Repository inspection

1. Inspect the existing project structure.
2. Identify the framework and installed dependencies.
3. Check the current routing system.
4. Inspect existing assets.
5. Identify reusable components.
6. Check whether a working project must be preserved.
7. Summarize the implementation plan before making major changes.

Do not overwrite working configuration without a reason.

#### Phase 2 — Foundation

1. Install only necessary dependencies.
2. Configure Tailwind and design tokens.
3. Set up typography.
4. Configure global layout.
5. Create reusable buttons, fields, containers, and navigation.
6. Define product and order mock-data types.
7. Implement currency formatting.
8. Verify the application starts successfully.

#### Phase 3 — Image preparation

1. Generate the homepage hero.
2. Generate the neutral product placeholder.
3. Generate supporting botanical imagery.
4. Generate empty-state illustrations.
5. Optimize and organize the assets.
6. Ensure that desktop and mobile crops work.

If image-generation tools are unavailable, use the available image tool or clearly marked temporary placeholders. Do not use unrelated stock imagery as if it were the actual product.

#### Phase 4 — Homepage

1. Implement the header.
2. Build the hero composition.
3. Build the brand story.
4. Add the featured product.
5. Add factual product-information sections.
6. Add brand values.
7. Add FAQs.
8. Add the closing CTA.
9. Build the footer.
10. Test the responsive layout.

Do not move forward with an unpolished homepage simply to complete more pages.

#### Phase 5 — Product and cart

1. Build the product gallery.
2. Build the purchase panel.
3. Add quantity controls.
4. Implement cart state.
5. Add cart drawer or cart page.
6. Calculate subtotals correctly.
7. Implement empty states.
8. Test add, remove, and quantity-update flows.

#### Phase 6 — Checkout

1. Build the checkout layout.
2. Implement contact fields.
3. Implement address fields.
4. Add configured delivery choices.
5. Implement payment selection.
6. Build the order summary.
7. Add validation.
8. Implement demo submission.
9. Generate a demo order identifier.
10. Verify that every total matches the cart.

#### Phase 7 — Account and dashboard

1. Build login and registration.
2. Implement mock authentication.
3. Build dashboard navigation.
4. Build account overview.
5. Build order history and order details.
6. Build profile editing.
7. Build support form.
8. Add the optional private referral demo only if required and properly configured.

#### Phase 8 — Secondary pages

1. Build About.
2. Build Contact.
3. Build shipping policy.
4. Build returns and refunds.
5. Build privacy policy.
6. Build terms and conditions.
7. Check internal navigation and missing links.

#### Phase 9 — Quality assurance

Test these complete journeys:

**Journey A: New customer**
Home → Product → Add to Cart → Checkout → Address → Payment Selection → Demo Order Confirmation.

**Journey B: Direct purchase**
Home → Buy Now → Checkout → Demo Order Confirmation.

**Journey C: Returning customer**
Home → Login → Dashboard → Order History → Order Details.

**Journey D: Account creation**
Register → Account Overview → Profile → Orders.

**Journey E: Cart management**
Add product → Increase quantity → Remove product → Verify subtotal → Checkout.

**Journey F: Mobile purchase**
Open website on mobile → Browse product → Add to Cart → Complete demo checkout → View confirmation.

For each journey, verify:
- No broken navigation.
- No dead buttons.
- No console errors.
- No incorrect totals.
- No unexpected page refreshes.
- No broken images.
- No mobile overflow.

#### Phase 10 — Final delivery

1. Run linting and TypeScript checks.
2. Run the production build.
3. Resolve build errors.
4. Inspect important routes.
5. Test responsive layouts.
6. Verify accessibility basics.
7. Summarize completed features.
8. List any remaining limitations.
9. List all missing business inputs.
10. Explain how to run the prototype locally.

Do not report a successful build unless the command actually succeeds.

---

### 26. Acceptance criteria

The prototype is complete only when:

- The homepage has a polished, distinctive hero.
- The product price consistently displays as ₹500.
- The product page is accessible from the homepage.
- Add to Cart and Buy Now work.
- Cart totals are correct.
- Checkout forms validate properly.
- Payment methods are clearly identified as simulated.
- Order confirmation works.
- Login and registration have functional prototype behavior.
- The dashboard has working navigation.
- Order history and profile screens work.
- About and policy pages exist.
- Mobile layouts are usable.
- No public page advertises the referral program.
- Any optional private referral demo is clearly separated and does not misrepresent the program's terms.
- No unsupported medical or commercial claims are published.
- The application passes its available type checks and production build.
- All remaining mock functionality and unconfigured business details are documented.

### 27. Final instruction

Work as an independent senior frontend engineer and design lead.

Make sensible implementation decisions without repeatedly asking for approval on ordinary UI details. Use the supplied brand direction consistently, but do not invent missing commercial facts.

Build the actual working frontend rather than merely producing a design proposal or screenshot.

The final result should look premium, feel trustworthy, and guide the visitor naturally from product discovery to a professional checkout.

Begin with repository inspection, then proceed phase by phase. Prioritize quality, consistency, and a complete working purchase journey over unnecessary features.