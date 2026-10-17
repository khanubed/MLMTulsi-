import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Leaf,
  Heart,
  CheckCircle2,
  Info,
} from "lucide-react";
import { FLAGSHIP_PRODUCT } from "../data/productData";
import { FAQS } from "../data/faqData";
import { useCartStore } from "../store/useCartStore";
import { HomePurchasePopup } from "../components/home/HomePurchasePopup";
import { ProductAssembleSection } from "../components/home/ProductAssembleSection";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const handleAddToCart = () => {
    addItem(FLAGSHIP_PRODUCT, 1);
  };

  const handleBuyNow = () => {
    addItem(FLAGSHIP_PRODUCT, 1);
    navigate("/checkout");
  };

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#F8F5ED]">
      {/* 1. HERO SECTION - FULL-WIDTH CINEMATIC BACKGROUND VIDEO */}
      <section className="relative overflow-hidden min-h-screen lg:h-[720px] lg:max-h-[780px] flex items-center bg-[#183F32] border-b border-[#285642]/60">
        {/* Cinematic Background Video with Poster Fallback & Prefers-Reduced-Motion */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {prefersReducedMotion || videoError ? (
            <img
              src="/images/hero_botanical.png"
              alt="Tulsi Swaraj Herbal Preparation"
              className="w-full h-full object-cover object-[68%_center] sm:object-[68%_center] lg:object-[70%_center]"
            />
          ) : (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/hero_botanical.png"
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover object-[50%_center] sm:object-[68%_center] lg:object-[70%_center]"
            >
              <source src="/videos/hero-video.mp4" type="video/mp4" />
            </video>
          )}

          {/* Subtle Forest-Green Gradient Overlay */}
          {/* Mobile: Stronger vertical-to-horizontal gradient to ensure compact text stays readable while product shines */}
          {/* Desktop: Strongest on left (for text), gradually transparent towards center-right (for jar & label visibility) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#183F32]/95 via-[#183F32]/60 to-transparent sm:bg-gradient-to-r sm:from-[#183F32]/95 sm:via-[#183F32]/60 sm:to-transparent pointer-events-none" />

          {/* Bottom subtle edge vignette */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#183F32]/60 to-transparent pointer-events-none" />
        </div>

        {/* Content Container: Kept within existing max-width container, text confined to left 45% */}
        <div className="relative z-10 w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="w-full sm:max-w-xl lg:max-w-[48%] xl:max-w-[65%] text-left">
            {/* Top Block: Eyebrow badge, Headline, Paragraph */}
            <div className="space-y-5 sm:space-y-6">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#183F32]/80 backdrop-blur-md border border-[#A9B7A0]/40 text-xs font-semibold text-[#F8F5ED] shadow-sm">
                <Leaf className="w-3.5 h-3.5 text-[#A9B7A0]" />
                <span>Ayurvedic Botanical Living</span>
                <span className="text-[#B49A63]">·</span>
                <span className="text-[#F8F5ED] font-bold">
                  <span className="line-through mr-2 font-light text-xs">
                    {" "}
                    ₹1000{" "}
                  </span>{" "}
                  ₹500
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] xl:text-6xl font-serif text-[#F8F5ED] leading-[1.12] tracking-tight">
                Rooted in Nature.
                <br />
                <span className="italic font-normal text-[#F8F5ED]/90 block mt-1 sm:mt-2">
                  Made for Everyday Rituals.
                </span>
              </h1>

              {/* Supporting Paragraph */}
              <p className="text-sm max-sm:pb-12 sm:text-base lg:text-lg text-[#F8F5ED]/90 max-w-lg leading-relaxed font-sans">
                Discover Tulsi Swaraj and our mindful approach to bringing pure,
                thoughtfully prepared Indian herbal blends into your daily
                morning and evening wellness routines.
              </p>
            </div>

            {/* Bottom Block: Trust Markers & Action Buttons with dedicated mobile spacing */}
            <div className="mt-12 sm:mt-6 space-y-5">
                           {/* Action Buttons - 2 in a row on mobile and desktop */}
              <div className="sm:pt-2 pt-12  grid grid-cols-2 sm:flex sm:flex-row items-center justify-start gap-2.5 sm:gap-4">
                <button
                  onClick={() =>
                    navigate("/products/tulsi-meta-ved-herbal-mix")
                  }
                  className="w-full sm:w-auto px-3 sm:px-7 py-3 sm:py-3.5 bg-[#F8F5ED] text-[#183F32] rounded-xl text-xs sm:text-sm font-semibold tracking-wide hover:bg-white hover:shadow-lg transition-all shadow-md flex items-center justify-center gap-1.5 sm:gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B49A63] focus:ring-offset-2 focus:ring-offset-[#183F32]"
                >
                  <span>
                    Explore <span className="hidden sm:inline">the </span>
                    Product
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                <Link
                  to="/about"
                  className="w-full sm:w-auto px-3 sm:px-7 py-3 sm:py-3.5 bg-[#183F32]/40 border border-[#F8F5ED]/40 text-[#F8F5ED] hover:bg-[#F8F5ED]/15 backdrop-blur-sm rounded-xl text-xs sm:text-sm font-semibold transition-colors text-center flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#B49A63] focus:ring-offset-2 focus:ring-offset-[#183F32]"
                >
                  Our Story
                </Link>
              </div>
              {/* Trust Markers */}
              <div className="pt-5 grid grid-cols-3 gap-3 border-t border-[#F8F5ED]/20 text-left">
                <div className="p-1">
                  <p className="font-serif text-base sm:text-lg font-bold text-[#F8F5ED]">
                    100%
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#A9B7A0] leading-tight mt-0.5">
                    Botanical Heritage
                  </p>
                </div>
                <div className="p-1">
                  <p className="font-serif text-base sm:text-lg font-bold text-[#F8F5ED]">
                    ₹500
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#A9B7A0] leading-tight mt-0.5">
                    Transparent Price
                  </p>
                </div>
                <div className="p-1">
                  <p className="font-serif text-base sm:text-lg font-bold text-[#F8F5ED]">
                    Free
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#A9B7A0] leading-tight mt-0.5">
                    India Dispatch
                  </p>
                </div>
              </div>

 
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT CONTAINER ASSEMBLE (SCROLL-TRIGGERED GSAP) */}
      <ProductAssembleSection />

      {/* 3. BRAND INTRODUCTION */}
      <section className="py-16 sm:py-20 bg-[#EFE9DB]/50 border-b border-[#E5DFD3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B49A63]">
            Our Guiding Philosophy
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#183F32] leading-snug">
            "In Indian tradition, the sacred Tulsi leaf represents living
            balance, spiritual clarity, and gentle vitality."
          </h2>
          <p className="text-base text-[#77796F] leading-relaxed max-w-2xl mx-auto">
            Tulsi Swaraj was founded to honor this timeless botanical wisdom
            without the noise, exaggerated claims, or convoluted promises of
            modern commerce. We focus on one flagship formulation, meticulously
            prepared and offered directly to your home.
          </p>
          <div className="pt-2">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#183F32] hover:text-[#285642] underline underline-offset-4"
            >
              Read our full brand story
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCT SECTION */}
      <section className="py-20 border-b border-[#E5DFD3] bg-[#F8F5ED]">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#285642]">
              Flagship Presentation
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#183F32]">
              Tulsi Meta Ved Herbal Mix
            </h2>
            <p className="text-sm text-[#77796F]">
              Handcrafted botanical harmony for daily infusions, morning
              decoctions, or mindful evening warm tea.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#EFE9DB]/40 rounded-xl p-6 sm:p-10 border border-[#E5DFD3]">
            {/* Product Image */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden border border-[#E5DFD3] shadow-lg bg-white">
                <img
                  src={FLAGSHIP_PRODUCT.images[0].url}
                  alt={FLAGSHIP_PRODUCT.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-[#183F32] text-[#F8F5ED] text-xs font-medium px-3 py-1 rounded-full">
                  Verified Price: ₹500
                </div>
              </div>
            </div>

            {/* Product Details & Actions */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#B49A63]">
                  {FLAGSHIP_PRODUCT.badge}
                </span>
                <h3 className="text-3xl font-serif font-bold text-[#183F32] mt-1">
                  {FLAGSHIP_PRODUCT.name}
                </h3>
                <p className="text-sm text-[#77796F] mt-1 italic">
                  {FLAGSHIP_PRODUCT.subtitle}
                </p>
              </div>

              {/* Pricing Box */}
              <div className="flex items-baseline gap-3 py-3 border-y border-[#E5DFD3]">
                <span className="text-3xl font-bold font-serif text-[#183F32]">
                  ₹{FLAGSHIP_PRODUCT.price}
                </span>
                <span className="text-xs text-[#77796F]">
                  MRP inclusive of all taxes • Complimentary delivery across
                  India
                </span>
              </div>

              <p className="text-sm text-[#252923] leading-relaxed">
                {FLAGSHIP_PRODUCT.description}
              </p>

              {/* Key Specs Pills */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-sm bg-white/70 border border-[#E5DFD3]">
                  <span className="text-[#77796F] block">Packaging</span>
                  <span className="font-semibold text-[#183F32]">
                    Ceramic Sealed Jar (100g)*
                  </span>
                </div>
                <div className="p-3 rounded-sm bg-white/70 border border-[#E5DFD3]">
                  <span className="text-[#77796F] block">Key Herbs</span>
                  <span className="font-semibold text-[#183F32]">
                    Krishna Tulsi, Rama Tulsi
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 rounded-md border border-[#183F32] text-[#183F32] font-semibold text-sm hover:bg-[#EFE9DB] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3.5 px-6 rounded-md bg-[#183F32] text-[#F8F5ED] font-semibold text-sm hover:bg-[#285642] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  Buy Now (₹500)
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#77796F]">
                <Info className="w-3.5 h-3.5 text-[#B49A63] shrink-0" />
                <span>
                  *Preliminary prototype batch specifications. Detailed lab
                  report supplied upon production dispatch.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT DETAILS & INGREDIENT STORY */}
      <section className="py-20 bg-[#EFE9DB]/30 border-b border-[#E5DFD3]">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Left */}
            <div className="lg:col-span-5">
              <div className="rounded-lg overflow-hidden border border-[#E5DFD3] shadow-md aspect-4/3">
                <img
                  src="/images/botanical_ingredients.jpg"
                  alt="Raw botanical ingredients and fresh tulsi on limestone"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] text-[#77796F] text-center mt-2 italic">
                Fresh tulsi and complementary traditional spices arranged on
                natural limestone
              </p>
            </div>

            {/* Details Right */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#B49A63]">
                  Ingredient Transparency
                </span>
                <h2 className="text-3xl font-serif text-[#183F32] mt-1">
                  Reverence for the Leaf
                </h2>
                <p className="text-sm text-[#77796F] mt-2 leading-relaxed">
                  In keeping with our strict brand commitment, we do not invent
                  clinical claims or hide behind proprietary shields. Here is
                  our confirmed preliminary botanical formulation:
                </p>
              </div>

              <div className="space-y-3">
                {FLAGSHIP_PRODUCT.verifiedIngredients.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white rounded-md border border-[#E5DFD3] flex items-center gap-3 text-sm text-[#252923]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#285642] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-md bg-[#F8F5ED] border border-[#A9B7A0] text-xs text-[#285642] space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#183F32]" />
                  Verified Brand Standard
                </div>
                <p className="text-[#77796F]">
                  Final certified percentages, AYUSH license details, and batch
                  certification codes will be permanently embossed on production
                  packaging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BRAND VALUES */}
      <section className="py-20 bg-[#F8F5ED] border-b border-[#E5DFD3]">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#285642]">
              Integrity in Commerce
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#183F32]">
              Our Guiding Commitments
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-[#EFE9DB]/50 rounded-lg border border-[#E5DFD3] space-y-3">
              <div className="w-10 h-10 rounded-md bg-[#183F32] text-[#F8F5ED] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-[#A9B7A0]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#183F32]">
                Herbal Integrity
              </h3>
              <p className="text-xs text-[#77796F] leading-relaxed">
                Respecting centuries-old Indian herbal tradition with mindful
                sourcing, preserving botanical vitality.
              </p>
            </div>

            <div className="p-6 bg-[#EFE9DB]/50 rounded-lg border border-[#E5DFD3] space-y-3">
              <div className="w-10 h-10 rounded-md bg-[#183F32] text-[#F8F5ED] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#A9B7A0]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#183F32]">
                No Fabricated Claims
              </h3>
              <p className="text-xs text-[#77796F] leading-relaxed">
                We refuse to advertise miraculous cure-alls. We present honest,
                grounding wellness for thoughtful daily rituals.
              </p>
            </div>

            <div className="p-6 bg-[#EFE9DB]/50 rounded-lg border border-[#E5DFD3] space-y-3">
              <div className="w-10 h-10 rounded-md bg-[#183F32] text-[#F8F5ED] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#A9B7A0]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#183F32]">
                Fair & Clear Pricing
              </h3>
              <p className="text-xs text-[#77796F] leading-relaxed">
                A single transparent price of ₹500 without hidden fees,
                fabricated countdown timers, or artificially inflated discounts.
              </p>
            </div>

            <div className="p-6 bg-[#EFE9DB]/50 rounded-lg border border-[#E5DFD3] space-y-3">
              <div className="w-10 h-10 rounded-md bg-[#183F32] text-[#F8F5ED] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#A9B7A0]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#183F32]">
                Thoughtful Support
              </h3>
              <p className="text-xs text-[#77796F] leading-relaxed">
                Direct customer assistance from our Bengaluru support desk for
                order inquiries, delivery updates, and returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRODUCT IMAGERY & DAILY USAGE RITUAL */}
      <section className="py-20 bg-[#EFE9DB]/40 border-b border-[#E5DFD3]">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Steps Column */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#B49A63]">
                  Rituals of Mindful Living
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif text-[#183F32] mt-1">
                  How to Enjoy Tulsi Meta Ved
                </h2>
                <p className="text-sm text-[#77796F] mt-2">
                  Take three quiet minutes each morning or evening to pause and
                  reconnect.
                </p>
              </div>

              <div className="space-y-6">
                {FLAGSHIP_PRODUCT.usageInstructions.map((instruction) => (
                  <div
                    key={instruction.step}
                    className="flex gap-4 items-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#183F32] text-[#F8F5ED] flex items-center justify-center font-serif text-sm font-bold shrink-0">
                      {instruction.step}
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-semibold text-[#183F32]">
                        {instruction.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#77796F] mt-1 leading-relaxed">
                        {instruction.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleAddToCart}
                  className="px-6 py-3 bg-[#183F32] text-[#F8F5ED] rounded-md text-sm font-semibold hover:bg-[#285642] transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  Add to Cart • ₹500
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lifestyle Image */}
            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden shadow-xl border border-[#E5DFD3] bg-white aspect-square">
                <img
                  src="/images/product_lifestyle.png"
                  alt="Herbal morning tea infusion ritual with Tulsi Meta Ved jar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER FEEDBACK SECTION (Compliant & Honest) */}
      <section className="py-16 bg-[#F8F5ED] border-b border-[#E5DFD3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#77796F]">
            Customer Community
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#183F32]">
            Verified Feedback Protocol
          </h2>
          <div className="p-6 rounded-lg bg-[#EFE9DB]/60 border border-[#A9B7A0] max-w-xl mx-auto space-y-2">
            <ShieldCheck className="w-8 h-8 text-[#183F32] mx-auto" />
            <h3 className="font-serif text-base font-semibold text-[#183F32]">
              Real Reviews from Genuine Orders Only
            </h3>
            <p className="text-xs text-[#77796F] leading-relaxed">
              In accordance with our strict brand ethics, we do not fabricate
              testimonial quotes, customer ratings, or fictitious review counts.
              Once early-access customers receive their production jars,
              verified impressions will appear here.
            </p>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 bg-[#EFE9DB]/30 border-b border-[#E5DFD3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B49A63]">
              Clarity & Transparency
            </span>
            <h2 className="text-3xl font-serif text-[#183F32]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#77796F]">
              Direct answers regarding Tulsi Meta Ved, orders, formulation, and
              delivery.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-md border border-[#E5DFD3] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#F8F5ED] transition-colors"
                  >
                    <span className="font-serif text-base font-semibold text-[#183F32]">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#285642] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#77796F] shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#77796F] leading-relaxed border-t border-[#E5DFD3]/60 bg-[#F8F5ED]/40">
                      <p>{faq.answer}</p>
                      {faq.isPendingVerification && (
                        <span className="inline-block mt-2 text-[11px] text-[#B49A63] bg-[#EFE9DB] px-2.5 py-1 rounded">
                          Batch lab sheet pending publication
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. CLOSING CTA SECTION */}
      <section className="py-20 bg-[#183F32] text-[#F8F5ED] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#B49A63]">
            Begin Your Wellness Ritual
          </span>

          <h2 className="text-3xl sm:text-5xl font-serif leading-tight">
            Tulsi Meta Ved Herbal Mix
            <br />
            <span className="text-[#A9B7A0] font-normal italic">
              Pure Ayurvedic Heritage for ₹500
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#A9B7A0] max-w-xl mx-auto leading-relaxed">
            Experience the soothing harmony of botanical living. Delivered
            straight to your doorstep across India in a protective sealed
            container.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleBuyNow}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#B49A63] text-[#183F32] font-serif font-bold text-base rounded-md hover:bg-[#d0b47b] transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              Order Now • ₹500
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate("/products/tulsi-meta-ved-herbal-mix")}
              className="w-full sm:w-auto px-7 py-3.5 border border-[#A9B7A0] text-[#F8F5ED] rounded-md text-sm font-semibold hover:bg-[#285642] transition-colors cursor-pointer"
            >
              View Full Product Specs
            </button>
          </div>
        </div>
      </section>

      {/* Scroll-Triggered Home Product Purchase Popup */}
      <HomePurchasePopup />
    </div>
  );
};
