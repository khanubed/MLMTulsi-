'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, User, Menu, X, Leaf, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { openDrawer, getTotalItems } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Our Story", path: "/about" },
    { name: "Product", path: "/products/tulsi-meta-ved-herbal-mix" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F8F5ED]/95 backdrop-blur-md border-b border-[#E5DFD3] transition-all">
        {/* Top subtle notification bar */}
        <div className="bg-[#183F32] text-[#F8F5ED] text-[11px] sm:text-xs py-1.5 px-3 text-center tracking-wide font-medium flex items-center justify-center gap-1.5">
          <Leaf className="w-3.5 h-3.5 text-[#A9B7A0] shrink-0" />
          <span className="truncate">
            Flagship: Tulsi Meta Ved Herbal Mix • <span className="line-through font-thin">₹999</span> ₹500 (50% OFF) • Free All-India Delivery
          </span>
        </div>

        <div className="max-w-8xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center shrink-0 py-1 transition-opacity hover:opacity-90"
            >
              <img
                src="/images/logo.png"
                alt="Tulsi Swarojgar Pvt. Limited"
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`text-sm font-medium transition-colors hover:text-[#183F32] relative py-1 ${
                      isActive
                        ? "text-[#183F32] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#183F32]"
                        : "text-[#77796F]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Account icon */}
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center text-[#252923] hover:text-[#183F32] hover:bg-[#EFE9DB] rounded-xl transition-colors text-sm"
                title={
                  isAuthenticated
                    ? `Logged in as ${user?.fullName}`
                    : "Login / Account"
                }
                aria-label="Account"
              >
                <User className="w-5 h-5" />
                <span className="hidden lg:inline text-xs font-medium ml-1.5">
                  {isAuthenticated ? user?.fullName?.split(" ")[0] : "Account"}
                </span>
              </Link>

              {/* Cart trigger button */}
              <button
                onClick={openDrawer}
                className="relative min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center text-[#252923] hover:text-[#183F32] hover:bg-[#EFE9DB] rounded-xl transition-colors cursor-pointer"
                aria-label={`Open shopping cart with ${totalItems} items`}
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#183F32] text-[#F8F5ED] text-[10px] font-bold rounded-full flex items-center justify-center animate-scaleIn">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Shop Now Primary CTA */}
              <button
                onClick={() => router.push("/products/tulsi-meta-ved-herbal-mix")}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#183F32] text-[#F8F5ED] text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#285642] transition-colors shadow-xs cursor-pointer"
              >
                Shop Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center text-[#252923] hover:bg-[#EFE9DB] rounded-xl cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5DFD3] bg-[#F8F5ED] px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium ${
                      isActive
                        ? "bg-[#EFE9DB] text-[#183F32] font-semibold"
                        : "text-[#252923] hover:bg-[#EFE9DB]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E5DFD3] space-y-2">
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-[#252923] hover:bg-[#EFE9DB]"
              >
                <User className="w-5 h-5 text-[#183F32]" />
                <span>
                  {isAuthenticated
                    ? `Dashboard (${user?.fullName})`
                    : "Account Login / Register"}
                </span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/products/tulsi-meta-ved-herbal-mix");
                }}
                className="w-full py-3.5 bg-[#183F32] text-[#F8F5ED] text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                Shop Tulsi Meta Ved (₹500 • 50% OFF)
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
