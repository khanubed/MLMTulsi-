'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, ShoppingBag, Leaf } from "lucide-react";
import { FLAGSHIP_PRODUCT } from "@/data/productData";
import { useCartStore } from "@/store/useCartStore";

export const HomePurchasePopup: React.FC = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { addItem, closeDrawer, isDrawerOpen, items } = useCartStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 1. Check if already dismissed or checkout initiated in current session
    if (typeof window === "undefined") return;
    const isDismissed = sessionStorage.getItem("tulsi_home_popup_dismissed") === "true";
    const isCheckoutInitiated = sessionStorage.getItem("tulsi_checkout_initiated") === "true";

    if (isDismissed || isCheckoutInitiated) {
      return;
    }

    // 2. Scroll listener to trigger at 15–20% of page or 300–450px on desktop
    let hasTriggered = false;

    const handleScroll = () => {
      if (hasTriggered) return;

      // Do not trigger if cart drawer or another overlay is open
      if (isDrawerOpen) return;

      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
      const isMobile = window.innerWidth < 640;

      // Responsive threshold: 250px on mobile or 350px on desktop, or ~15% of scrollable page
      const thresholdReached = isMobile
        ? scrollY >= 250 || scrollPercent >= 0.15
        : scrollY >= 350 || scrollPercent >= 0.15;

      if (thresholdReached) {
        hasTriggered = true;
        setIsOpen(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isDrawerOpen]);

  // Focus management & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus primary CTA when opened
    const timer = setTimeout(() => {
      primaryButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem("tulsi_home_popup_dismissed", "true");
  };

  const handleBuyNow = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Mark as dismissed & checkout initiated in session
      sessionStorage.setItem("tulsi_home_popup_dismissed", "true");
      sessionStorage.setItem("tulsi_checkout_initiated", "true");

      // 2. Ensure product is in cart (prevent duplicate additions if already present)
      const alreadyInCart = items.some((item) => item.product.id === FLAGSHIP_PRODUCT.id);
      if (!alreadyInCart) {
        addItem(FLAGSHIP_PRODUCT, 1);
      }

      // 3. Close cart drawer if opened automatically
      closeDrawer();

      // 4. Close popup and navigate to checkout
      setIsOpen(false);
      router.push("/checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not mounted or closed or cart drawer is open, do not render
  if (!mounted || !isOpen || isDrawerOpen) return null;

  const productImg = FLAGSHIP_PRODUCT.images[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-popup-title"
      aria-describedby="home-popup-desc"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-[#183F32]/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Card / Bottom Sheet */}
      <div
        ref={modalRef}
        className="relative z-10 w-full sm:max-w-md md:max-w-lg bg-[#F8F5ED] rounded-t-2xl sm:rounded-2xl border border-[#E5DFD3] shadow-2xl p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-[#252923] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close popup"
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 rounded-full text-[#77796F] hover:text-[#183F32] hover:bg-[#EFE9DB] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Eyebrow */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#183F32] uppercase tracking-wider mb-3">
          <Leaf className="w-3.5 h-3.5 text-[#285642]" />
          <span>Tulsi Swaraj</span>
        </div>

        {/* Content Layout: Responsive (stacked on mobile, side-by-side on sm/desktop) */}
        <div className="flex flex-row items-center gap-4 sm:gap-5 mb-5">
          {/* Product Image */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-white border border-[#E5DFD3] overflow-hidden shrink-0 shadow-2xs flex items-center justify-center p-1.5">
            <img
              src={productImg.url}
              alt={productImg.alt}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0 pr-4">
            <h3
              id="home-popup-title"
              className="font-serif text-lg sm:text-xl font-bold text-[#183F32] leading-tight truncate"
            >
              {FLAGSHIP_PRODUCT.name}
            </h3>

            <p
              id="home-popup-desc"
              className="text-xs text-[#77796F] mt-1 line-clamp-2 leading-relaxed"
            >
              Discover Tulsi Swaraj’s herbal blend.
            </p>

            <div className="mt-2 flex items-baseline gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-bold text-[#183F32] font-['Manrope']">
                ₹{FLAGSHIP_PRODUCT.price}
              </span>
              <span className="line-through text-xs text-[#77796F] font-medium">₹999</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                50% OFF
              </span>
              <span className="text-[11px] text-[#285642] font-medium bg-[#A9B7A0]/20 px-2 py-0.5 rounded ml-auto">
                Free Dispatch
              </span>
            </div>
          </div>
        </div>

        {/* Actions Cluster */}
        <div className="space-y-2 pt-1 border-t border-[#E5DFD3]/80">
          <button
            ref={primaryButtonRef}
            type="button"
            onClick={handleBuyNow}
            disabled={isSubmitting}
            className="w-full py-3.5 px-5 rounded-xl bg-[#183F32] text-[#F8F5ED] text-sm font-semibold hover:bg-[#285642] focus:outline-none focus:ring-2 focus:ring-[#B49A63] focus:ring-offset-2 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buy Now — ₹{FLAGSHIP_PRODUCT.price} (50% OFF)</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2 text-xs font-semibold text-[#77796F] hover:text-[#183F32] transition-colors text-center cursor-pointer"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
