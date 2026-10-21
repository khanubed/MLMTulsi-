'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  ZoomIn,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { FLAGSHIP_PRODUCT } from "@/data/productData";
import { FAQS } from "@/data/faqData";
import { useCartStore } from "@/store/useCartStore";

export const ProductDetailClient: React.FC = () => {
  const router = useRouter();
  const { addItem } = useCartStore();

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // Purchase state
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  // PIN code delivery state
  const [pincode, setPincode] = useState("");
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<{
    status: "success" | "error";
    message: string;
    estimate?: string;
  } | null>(null);

  // Accordion state (mobile-first collapsible sections)
  const [openSection, setOpenSection] = useState<string | null>("description");
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1");

  // Sticky bottom purchase bar observer
  const [showStickyBar, setShowStickyBar] = useState(false);
  const purchaseActionRef = useRef<HTMLDivElement>(null);

  // Touch swipe support for mobile gallery
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const images = FLAGSHIP_PRODUCT.images;
  const currentImage = images[activeImageIndex] || images[0];

  // SEO & Schema.org Product structured data
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${FLAGSHIP_PRODUCT.name} — ₹${FLAGSHIP_PRODUCT.price} | Tulsi Swaraj`;

    // JSON-LD structured data for Google Product Schema
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "product-jsonld";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      name: FLAGSHIP_PRODUCT.name,
      image: images.map((img) => window.location.origin + img.url),
      description: FLAGSHIP_PRODUCT.description,
      brand: {
        "@type": "Brand",
        name: "Tulsi Swaraj",
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: FLAGSHIP_PRODUCT.price,
        availability: "https://schema.org/InStock",
        url: window.location.href,
        priceValidUntil: "2027-12-31",
        seller: {
          "@type": "Organization",
          name: "Tulsi Swaraj",
        },
      },
    });

    document.head.appendChild(script);

    return () => {
      document.title = originalTitle;
      const existingScript = document.getElementById("product-jsonld");
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [images]);

  // Observer for Sticky Mobile Purchase Bar
  useEffect(() => {
    const target = purchaseActionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar only when the main purchase buttons scroll above the viewport
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Keyboard navigation for image modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isZoomModalOpen) return;
      if (e.key === "Escape") {
        setIsZoomModalOpen(false);
      } else if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomModalOpen, images.length]);

  // Handle Touch Swipe on Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left -> next
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      } else {
        // Swiped right -> prev
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    setTouchStartX(null);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.min(10, Math.max(1, prev + delta)));
  };

  const handleAddToCart = () => {
    addItem(FLAGSHIP_PRODUCT, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    addItem(FLAGSHIP_PRODUCT, quantity);
    router.push("/checkout");
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim();

    if (!cleanPin || cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setPincodeResult({
        status: "error",
        message: "Please enter a valid 6-digit Indian PIN code (e.g. 110001 or 400001).",
      });
      return;
    }

    setIsCheckingPincode(true);
    setPincodeResult(null);

    // Realistic demo serviceability check with quick feedback
    setTimeout(() => {
      setIsCheckingPincode(false);
      if (cleanPin === "999999") {
        setPincodeResult({
          status: "error",
          message: `PIN ${cleanPin} is currently outside our standard courier network. Please contact support.`,
        });
      } else {
        setPincodeResult({
          status: "success",
          message: `Delivery available to PIN ${cleanPin}.`,
          estimate: "Estimated delivery in 3–5 business days • Free Standard Shipping",
        });
      }
    }, 280);
  };

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#252923] antialiased">
      {/* Toast Notification when product is added to cart */}
      {addedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 sm:right-8 z-50 bg-[#183F32] text-[#F8F5ED] px-4 py-3 rounded-xl shadow-xl border border-[#A9B7A0]/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="w-6 h-6 rounded-full bg-[#285642] flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 text-[#A9B7A0]" />
          </div>
          <div className="text-xs sm:text-sm">
            <p className="font-semibold">{quantity} × Added to Cart</p>
            <p className="text-[11px] text-[#A9B7A0]">Subtotal: ₹{FLAGSHIP_PRODUCT.price * quantity}</p>
          </div>
          <button
            onClick={() => router.push("/cart")}
            className="ml-2 text-xs font-semibold underline text-[#F8F5ED] hover:text-[#A9B7A0]"
          >
            View Cart
          </button>
        </div>
      )}

      {/* 1. BREADCRUMBS & BACK NAVIGATION */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-[#E5DFD3] bg-[#EFE9DB]/40 sticky top-16 sm:top-20 z-20 backdrop-blur-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between text-xs text-[#77796F]">
            <ol className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <li>
                <Link href="/" className="hover:text-[#183F32] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-[#A9B7A0]" />
              </li>
              <li>
                <Link href="/" className="hover:text-[#183F32] transition-colors">
                  Botanicals
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-[#A9B7A0]" />
              </li>
              <li aria-current="page" className="text-[#183F32] font-semibold truncate max-w-[200px] sm:max-w-none">
                {FLAGSHIP_PRODUCT.name}
              </li>
            </ol>

            <Link
              href="/"
              className="text-xs text-[#183F32] font-medium hover:underline shrink-0 hidden sm:inline-block"
            >
              ← Back to Catalogue
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. MAIN PRODUCT SECTION (Mobile: Stacked, Desktop: 2-Column Balanced) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 sm:pt-8 sm:pb-16 lg:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: PRODUCT IMAGE GALLERY (50-55% ON DESKTOP) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-3 sm:space-y-4">
            {/* Main Image Container (Square 1:1, Clean Warm Ivory / White Background) */}
            <div
              className="relative aspect-square w-full rounded-2xl bg-white border border-[#E5DFD3] overflow-hidden shadow-xs flex items-center justify-center group cursor-pointer select-none"
              onClick={() => setIsZoomModalOpen(true)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={currentImage.url}
                alt={currentImage.alt}
                fetchPriority="high"
                className="w-full h-full object-contain p-2 sm:p-4 transition-transform duration-300 group-hover:scale-[1.02]"
              />

              {/* Tag / Category Badge */}
              <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#183F32] text-[#F8F5ED] text-[11px] sm:text-xs font-semibold shadow-xs">
                  <Sparkles className="w-3 h-3 text-[#B49A63]" />
                  Flagship Botanical
                </span>
              </div>

              {/* Tap to Zoom Hint Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomModalOpen(true);
                }}
                aria-label="Open full-screen image viewer"
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 w-9 h-9 rounded-full bg-[#F8F5ED]/90 backdrop-blur-md text-[#183F32] border border-[#E5DFD3] flex items-center justify-center hover:bg-white shadow-xs transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Mobile Arrows for Direct Tap Navigation */}
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#F8F5ED]/90 text-[#183F32] border border-[#E5DFD3] flex items-center justify-center hover:bg-white shadow-sm lg:hidden"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev + 1) % images.length);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#F8F5ED]/90 text-[#183F32] border border-[#E5DFD3] flex items-center justify-center hover:bg-white shadow-sm lg:hidden"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Mobile Image Counter Badge */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 px-2.5 py-1 rounded-full bg-[#183F32]/80 backdrop-blur-xs text-[#F8F5ED] text-[11px] font-medium lg:hidden">
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Pagination Dots (Mobile) */}
            <div className="flex items-center justify-center gap-1.5 lg:hidden py-1">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`Go to image ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImageIndex === idx ? "w-6 bg-[#183F32]" : "w-1.5 bg-[#A9B7A0]/60"
                  }`}
                />
              ))}
            </div>

            {/* Thumbnail Strip (Desktop & Tablet) */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View ${img.caption || `Product image ${idx + 1}`}`}
                  className={`relative aspect-square rounded-xl bg-white border p-1 sm:p-1.5 transition-all cursor-pointer overflow-hidden ${
                    activeImageIndex === idx
                      ? "border-[#183F32] ring-2 ring-[#183F32]/25 shadow-xs"
                      : "border-[#E5DFD3] hover:border-[#A9B7A0] opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    loading="lazy"
                    className="w-full h-full object-contain"
                  />
                  {activeImageIndex === idx && (
                    <span className="sr-only">Currently selected image</span>
                  )}
                </button>
              ))}
            </div>

            {/* Visual caption / details */}
            <p className="text-center text-xs text-[#77796F] italic">
              {currentImage.caption} — Unadulterated botanical presentation
            </p>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: PRODUCT DETAILS & PURCHASE PANEL (45-50%)   */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-5 sm:space-y-6">
            {/* Essential Metadata */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap text-xs text-[#77796F]">
                <span className="font-semibold text-[#183F32] uppercase tracking-wider text-[11px]">
                  Ayurvedic Botanical Blend
                </span>
                <span>•</span>
                <span>100g Powder</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-[#285642] font-medium bg-[#A9B7A0]/20 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#285642]" />
                  In Stock (Pan-India)
                </span>
              </div>

              {/* Product Title (H1, Manrope, Clean Size Hierarchy) */}
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#183F32] font-['Manrope'] leading-tight tracking-tight">
                {FLAGSHIP_PRODUCT.name}
              </h1>

              {/* Subtitle */}
              <p className="text-sm text-[#77796F] leading-relaxed">
                {FLAGSHIP_PRODUCT.subtitle}
              </p>
            </div>

            {/* Price Block with Promotional Fake Discount (MRP ₹999 -> ₹500, 50% OFF) */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E5DFD3] shadow-xs space-y-2.5">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                  50% OFF
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-[#183F32] font-['Manrope'] tracking-tight">
                  ₹{FLAGSHIP_PRODUCT.price}
                </span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#77796F]">
                  <span>M.R.P.:</span>
                  <span className="line-through text-[#77796F]/90 font-medium">₹999</span>
                </div>
              </div>

              <div className="space-y-1 pt-1.5 border-t border-[#E5DFD3]/60 text-xs text-[#77796F]">
                <p className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                  <span>You Save: ₹499 (50% off MRP)</span>
                </p>
                <p className="flex items-center gap-1.5 text-[#252923]">
                  <Check className="w-3.5 h-3.5 text-[#285642] shrink-0" />
                  <span>
                    <strong>Inclusive of all domestic taxes</strong> • No hidden checkout fees
                  </span>
                </p>
                <p className="flex items-center gap-1.5 text-[#252923]">
                  <Truck className="w-3.5 h-3.5 text-[#285642] shrink-0" />
                  <span>Eligible for <strong>Free Standard Delivery</strong> across all Indian states</span>
                </p>
              </div>
            </div>

            {/* Delivery & Serviceability Checker */}
            <div className="p-4 rounded-xl bg-[#EFE9DB]/50 border border-[#E5DFD3] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#183F32]">
                  <MapPin className="w-4 h-4 text-[#285642]" />
                  <span>Delivery Availability & Estimate</span>
                </div>
                <span className="text-[11px] text-[#77796F]">All India</span>
              </div>

              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ""));
                    if (pincodeResult) setPincodeResult(null);
                  }}
                  placeholder="Enter 6-digit postal PIN"
                  aria-label="Enter 6-digit Indian PIN code"
                  className="flex-1 px-3 py-2.5 text-xs sm:text-sm rounded-lg bg-white border border-[#A9B7A0] text-[#252923] placeholder-[#77796F]/70 focus:outline-none focus:ring-2 focus:ring-[#183F32] focus:border-[#183F32]"
                />
                <button
                  type="submit"
                  disabled={isCheckingPincode || pincode.length !== 6}
                  className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#183F32] text-[#F8F5ED] hover:bg-[#285642] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center justify-center min-w-[72px] cursor-pointer"
                >
                  {isCheckingPincode ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Check"
                  )}
                </button>
              </form>

              {/* Serviceability Result Feedback */}
              {pincodeResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                    pincodeResult.status === "success"
                      ? "bg-[#285642]/10 text-[#183F32] border border-[#285642]/30"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {pincodeResult.status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-[#285642] shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{pincodeResult.message}</p>
                    {pincodeResult.estimate && (
                      <p className="text-[11px] text-[#285642] mt-0.5">{pincodeResult.estimate}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Purchase Controls Area (Monitored for Sticky Bottom Bar) */}
            <div ref={purchaseActionRef} className="space-y-4 pt-1">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between py-1">
                <label className="text-xs font-bold text-[#183F32] uppercase tracking-wider">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#A9B7A0] rounded-xl bg-white overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="w-10 h-10 flex items-center justify-center text-[#252923] hover:bg-[#EFE9DB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold tabular-nums text-[#183F32]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                      aria-label="Increase quantity"
                      className="w-10 h-10 flex items-center justify-center text-[#252923] hover:bg-[#EFE9DB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-[#77796F]">
                    Total: <strong className="text-[#183F32] font-['Manrope'] font-bold text-sm">₹{FLAGSHIP_PRODUCT.price * quantity}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Primary CTA: Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full h-12 sm:h-[50px] px-6 rounded-xl bg-[#183F32] text-[#F8F5ED] font-semibold text-sm hover:bg-[#285642] focus:outline-none focus:ring-2 focus:ring-[#B49A63] focus:ring-offset-2 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>

                {/* Secondary CTA: Buy Now */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full h-12 sm:h-[50px] px-6 rounded-xl bg-[#EFE9DB] text-[#183F32] border border-[#183F32] font-semibold text-sm hover:bg-[#E5DFD3] focus:outline-none focus:ring-2 focus:ring-[#B49A63] focus:ring-offset-2 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  Buy Now • ₹{FLAGSHIP_PRODUCT.price * quantity}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trust Markers / Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-center text-[11px] text-[#77796F]">
              <div className="p-3 rounded-xl bg-white border border-[#E5DFD3] space-y-1">
                <Truck className="w-4 h-4 mx-auto text-[#183F32]" />
                <p className="font-semibold text-[#183F32]">India Dispatch</p>
                <p className="text-[10px] text-[#77796F]">Within 24–48 hrs</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E5DFD3] space-y-1">
                <RotateCcw className="w-4 h-4 mx-auto text-[#183F32]" />
                <p className="font-semibold text-[#183F32]">7-Day Return</p>
                <p className="text-[10px] text-[#77796F]">Unopened Seal</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E5DFD3] space-y-1">
                <ShieldCheck className="w-4 h-4 mx-auto text-[#183F32]" />
                <p className="font-semibold text-[#183F32]">Authentic Herbs</p>
                <p className="text-[10px] text-[#77796F]">No Fillers</p>
              </div>
            </div>

            {/* Promotional Launch Offer Notice */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-[#183F32] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-emerald-800">Limited Launch Offer:</strong> Flat 50% discount applied automatically on Tulsi Meta Ved Herbal Mix (M.R.P. ₹999 now for ₹500). Includes free pan-India courier delivery.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STRUCTURED INFORMATION SECTIONS (MOBILE-FIRST ACCORDIONS) */}
        {/* ========================================================= */}
        <div className="mt-12 sm:mt-16 lg:mt-20 border-t border-[#E5DFD3] pt-10 sm:pt-14 space-y-6 max-w-4xl mx-auto">
          {/* Section 1: About the Product Description */}
          <div className="bg-white rounded-2xl border border-[#E5DFD3] overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("description")}
              className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-left font-['Manrope'] font-bold text-base sm:text-lg text-[#183F32] hover:bg-[#EFE9DB]/30 transition-colors"
            >
              <span>About Tulsi Meta Ved Herbal Mix</span>
              {openSection === "description" ? (
                <ChevronUp className="w-5 h-5 text-[#77796F]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#77796F]" />
              )}
            </button>

            {openSection === "description" && (
              <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm text-[#252923] leading-relaxed space-y-4 border-t border-[#E5DFD3]/70 pt-4">
                <p>
                  Tulsi Meta Ved Herbal Mix is rooted in classical Indian botanical tradition, centered upon hand-gathered Holy Basil leaves (Krishna and Rama Tulsi). Blended with complementary natural warming herbs, it offers a soothing, grounding daily cup.
                </p>
                <p>
                  Unlike mass-market beverages burdened with synthetic preservatives, artificial sweeteners, or chemical flavor enhancers, our formulation maintains the authentic aroma and natural earthy depth of pure Indian botanicals.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#EFE9DB]/50 border border-[#E5DFD3] space-y-1">
                    <p className="font-semibold text-[#183F32] text-xs uppercase tracking-wider">Morning Ritual</p>
                    <p className="text-xs text-[#77796F]">
                      Integrate into early morning reflection or post-yoga cooldowns to awaken natural digestive warmth.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#EFE9DB]/50 border border-[#E5DFD3] space-y-1">
                    <p className="font-semibold text-[#183F32] text-xs uppercase tracking-wider">Evening Wind-Down</p>
                    <p className="text-xs text-[#77796F]">
                      Sip warm 30 minutes before rest for a gentle, calming transition from a demanding day.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Key Specifications Table */}
          <div className="bg-white rounded-2xl border border-[#E5DFD3] overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("specs")}
              className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-left font-['Manrope'] font-bold text-base sm:text-lg text-[#183F32] hover:bg-[#EFE9DB]/30 transition-colors"
            >
              <span>Product Specifications & Details</span>
              {openSection === "specs" ? (
                <ChevronUp className="w-5 h-5 text-[#77796F]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#77796F]" />
              )}
            </button>

            {openSection === "specs" && (
              <div className="px-5 pb-6 sm:px-6 sm:pb-6 border-t border-[#E5DFD3]/70 pt-4">
                <dl className="divide-y divide-[#E5DFD3] text-xs sm:text-sm">
                  <div className="py-2.5 sm:py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <dt className="font-semibold text-[#183F32]">Product Name</dt>
                    <dd className="sm:col-span-2 text-[#77796F]">Tulsi Meta Ved Herbal Mix</dd>
                  </div>
                  <div className="py-2.5 sm:py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <dt className="font-semibold text-[#183F32]">Maximum Retail Price (MRP)</dt>
                    <dd className="sm:col-span-2 text-[#77796F]"><span className="line-through">₹999</span> (Inclusive of all taxes)</dd>
                  </div>
                  <div className="py-2.5 sm:py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <dt className="font-semibold text-[#183F32]">Special Offer Price</dt>
                    <dd className="sm:col-span-2 text-[#183F32] font-bold"><span className="line-through font-thin">₹999</span> ₹500 <span className="text-emerald-700 font-semibold text-xs ml-1.5 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Save 50% (₹499 OFF)</span></dd>
                  </div>
                  <div className="py-2.5 sm:py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <dt className="font-semibold text-[#183F32]">Form & Texture</dt>
                    <dd className="sm:col-span-2 text-[#77796F]">Fine Botanical Powder / Hot Infusion Mix</dd>
                  </div>
                  <div className="py-2.5 sm:py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <dt className="font-semibold text-[#183F32]">Net Quantity</dt>
                    <dd className="sm:col-span-2 text-[#77796F]">100g (Batch confirmation pending packaging run)</dd>
                  </div>
                  <div className="py-2.5 sm:py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <dt className="font-semibold text-[#183F32]">Country of Origin</dt>
                    <dd className="sm:col-span-2 text-[#77796F]">Sourced, formulated, and packaged in India</dd>
                  </div>
                  <div className="py-2.5 sm:py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <dt className="font-semibold text-[#183F32]">Shelf Life</dt>
                    <dd className="sm:col-span-2 text-[#77796F]">12 Months from packaging date (Stamped on jar base)</dd>
                  </div>
                  <div className="py-2.5 sm:py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <dt className="font-semibold text-[#183F32]">Storage Instructions</dt>
                    <dd className="sm:col-span-2 text-[#77796F]">Store in a cool, dry place away from direct sunlight. Tighten cap securely after use.</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          {/* Section 3: Ingredients, Directions & Precautions */}
          <div className="bg-white rounded-2xl border border-[#E5DFD3] overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("ingredients")}
              className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-left font-['Manrope'] font-bold text-base sm:text-lg text-[#183F32] hover:bg-[#EFE9DB]/30 transition-colors"
            >
              <span>Ingredients, Usage & Safety Information</span>
              {openSection === "ingredients" ? (
                <ChevronUp className="w-5 h-5 text-[#77796F]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#77796F]" />
              )}
            </button>

            {openSection === "ingredients" && (
              <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm text-[#252923] space-y-6 border-t border-[#E5DFD3]/70 pt-4">
                {/* Verified Ingredients */}
                <div className="space-y-3">
                  <h4 className="font-['Manrope'] font-bold text-sm text-[#183F32]">
                    Verified Primary Botanicals
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {FLAGSHIP_PRODUCT.verifiedIngredients.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#EFE9DB]/40 border border-[#E5DFD3]">
                        <CheckCircle2 className="w-4 h-4 text-[#285642] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-[#77796F] italic">
                    *Exact batch certification ratios are finalized upon commercial batch bottling.
                  </p>
                </div>

                {/* Directions for Use */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-['Manrope'] font-bold text-sm text-[#183F32]">
                    Directions for Use
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {FLAGSHIP_PRODUCT.usageInstructions.map((step) => (
                      <div key={step.step} className="p-3.5 rounded-xl bg-[#F8F5ED] border border-[#E5DFD3] space-y-1">
                        <span className="w-6 h-6 rounded-full bg-[#183F32] text-[#F8F5ED] text-xs font-bold inline-flex items-center justify-center">
                          {step.step}
                        </span>
                        <p className="font-semibold text-xs text-[#183F32]">{step.title}</p>
                        <p className="text-[11px] text-[#77796F] leading-relaxed">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety & Precautions */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4" />
                    <span>Important Safety & Precaution Notice</span>
                  </div>
                  <p className="leading-relaxed">
                    This herbal preparation is a dietary botanical food blend and is not intended to diagnose, mitigate, treat, cure, or prevent any illness or disease. If you are pregnant, nursing, taking blood-thinning medications, or receiving medical care, consult your healthcare practitioner prior to use.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Shipping, Returns & Customer Care */}
          <div className="bg-white rounded-2xl border border-[#E5DFD3] overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("shipping")}
              className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-left font-['Manrope'] font-bold text-base sm:text-lg text-[#183F32] hover:bg-[#EFE9DB]/30 transition-colors"
            >
              <span>Delivery, Returns & Customer Support</span>
              {openSection === "shipping" ? (
                <ChevronUp className="w-5 h-5 text-[#77796F]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#77796F]" />
              )}
            </button>

            {openSection === "shipping" && (
              <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm text-[#252923] space-y-4 border-t border-[#E5DFD3]/70 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#F8F5ED] border border-[#E5DFD3] space-y-1.5">
                    <p className="font-semibold text-xs text-[#183F32] uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#285642]" />
                      Shipping & Dispatch
                    </p>
                    <p className="text-xs text-[#77796F] leading-relaxed">
                      Orders are packed and dispatched from our Indian warehouse within 24–48 business hours. Expected delivery is 3–5 business days across major PIN codes.
                    </p>
                    <Link href="/shipping-policy" className="text-xs text-[#183F32] font-medium underline inline-block pt-1">
                      Read full Shipping Policy →
                    </Link>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8F5ED] border border-[#E5DFD3] space-y-1.5">
                    <p className="font-semibold text-xs text-[#183F32] uppercase tracking-wider flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-[#285642]" />
                      7-Day Return Protocol
                    </p>
                    <p className="text-xs text-[#77796F] leading-relaxed">
                      Due to the hygiene nature of botanical consumables, returns are eligible within 7 days of delivery for jars with unopened, intact factory seals.
                    </p>
                    <Link href="/returns-refunds" className="text-xs text-[#183F32] font-medium underline inline-block pt-1">
                      Read Return & Refund Policy →
                    </Link>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#EFE9DB]/50 border border-[#E5DFD3] flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-[#77796F]">
                    Need immediate assistance with an existing order?
                  </span>
                  <Link
                    href="/contact"
                    className="font-semibold text-[#183F32] hover:underline"
                  >
                    Contact Support Team →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Frequently Asked Questions (Accessible Accordions) */}
          <div className="bg-white rounded-2xl border border-[#E5DFD3] overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("faqs")}
              className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-left font-['Manrope'] font-bold text-base sm:text-lg text-[#183F32] hover:bg-[#EFE9DB]/30 transition-colors"
            >
              <span>Frequently Asked Questions</span>
              {openSection === "faqs" ? (
                <ChevronUp className="w-5 h-5 text-[#77796F]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#77796F]" />
              )}
            </button>

            {openSection === "faqs" && (
              <div className="px-5 pb-6 sm:px-6 sm:pb-6 border-t border-[#E5DFD3]/70 pt-4 space-y-3">
                {FAQS.slice(0, 6).map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-[#E5DFD3] rounded-xl overflow-hidden bg-[#F8F5ED]/50"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 hover:bg-[#EFE9DB]/60 transition-colors"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-[#183F32]">
                        {faq.question}
                      </span>
                      {openFaq === faq.id ? (
                        <Minus className="w-4 h-4 text-[#77796F] shrink-0" />
                      ) : (
                        <Plus className="w-4 h-4 text-[#77796F] shrink-0" />
                      )}
                    </button>
                    {openFaq === faq.id && (
                      <div className="px-4 pb-4 pt-1 text-xs text-[#77796F] leading-relaxed border-t border-[#E5DFD3]/60 bg-white">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Verified Reviews Architectural Policy */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#EFE9DB]/50 border border-[#E5DFD3] text-center space-y-2">
            <h4 className="font-['Manrope'] font-bold text-sm text-[#183F32]">
              Customer Reviews Policy
            </h4>
            <p className="text-xs text-[#77796F] max-w-xl mx-auto leading-relaxed">
              Customer review submissions will unlock automatically for verified buyers upon shipment delivery confirmation. To maintain complete integrity, Tulsi Swaraj does not manufacture artificial 5-star ratings or unverified testimonials.
            </p>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 3. STICKY MOBILE PURCHASE BAR (Appears on scroll)         */}
      {/* ========================================================= */}
      {showStickyBar && (
        <aside
          aria-label="Quick Purchase Bar"
          className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#F8F5ED]/95 backdrop-blur-md border-t border-[#E5DFD3] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl animate-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            {/* Price Preview with Fake Discount */}
            <div className="shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold font-['Manrope'] text-[#183F32] leading-tight">
                  ₹{FLAGSHIP_PRODUCT.price * quantity}
                </span>
                <span className="line-through text-xs text-[#77796F]">
                  ₹{999 * quantity}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  50% OFF
                </span>
              </div>
              <span className="text-[10px] text-[#285642] font-medium block">
                Free Delivery
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-2.5 px-3 min-h-[44px] rounded-xl border border-[#183F32] text-[#183F32] text-xs font-semibold hover:bg-[#EFE9DB] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 py-2.5 px-3 min-h-[44px] rounded-xl bg-[#183F32] text-[#F8F5ED] text-xs font-semibold hover:bg-[#285642] transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                Buy Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ========================================================= */}
      {/* 4. FULL-SCREEN IMAGE MODAL VIEWER                         */}
      {/* ========================================================= */}
      {isZoomModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="High-resolution product image gallery"
          className="fixed inset-0 z-50 bg-[#183F32]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsZoomModalOpen(false)}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between text-[#F8F5ED] z-10">
            <div className="text-xs sm:text-sm font-medium">
              <span>{FLAGSHIP_PRODUCT.name}</span>
              <span className="mx-2 text-[#A9B7A0]">•</span>
              <span className="text-[#A9B7A0]">
                {activeImageIndex + 1} of {images.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(false)}
              aria-label="Close image viewer (Press Escape)"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-[#F8F5ED] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Main Image & Controls */}
          <div
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Previous image"
              onClick={() =>
                setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
              }
              className="absolute left-2 sm:left-4 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl select-none"
            />

            <button
              type="button"
              aria-label="Next image"
              onClick={() =>
                setActiveImageIndex((prev) => (prev + 1) % images.length)
              }
              className="absolute right-2 sm:right-4 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Footer Thumbnails */}
          <div
            className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`Switch to image ${idx + 1}`}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-white/10 border-2 transition-all p-1 cursor-pointer shrink-0 ${
                  activeImageIndex === idx
                    ? "border-[#F8F5ED] ring-2 ring-[#B49A63]"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
