import React from "react";
import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, Truck, Mail, Phone, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#183F32] text-[#F8F5ED] border-t border-[#285642]">
      {/* Brand values / trust ribbon */}
      <div className="border-b border-[#285642] py-8">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start p-4 rounded-md bg-[#285642]/40 border border-[#285642]">
              <Leaf className="w-8 h-8 text-[#A9B7A0] shrink-0" />
              <div>
                <h4 className="font-serif text-base font-semibold">
                  Ayurvedic Heritage
                </h4>
                <p className="text-xs text-[#A9B7A0] mt-0.5">
                  Rooted in time-honoured Indian botanical wisdom
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start p-4 rounded-md bg-[#285642]/40 border border-[#285642]">
              <Truck className="w-8 h-8 text-[#A9B7A0] shrink-0" />
              <div>
                <h4 className="font-serif text-base font-semibold">
                  All-India Dispatch
                </h4>
                <p className="text-xs text-[#A9B7A0] mt-0.5">
                  Reliable surface delivery across major postal codes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start p-4 rounded-md bg-[#285642]/40 border border-[#285642]">
              <ShieldCheck className="w-8 h-8 text-[#A9B7A0] shrink-0" />
              <div>
                <h4 className="font-serif text-base font-semibold">
                  Transparent Standards
                </h4>
                <p className="text-xs text-[#A9B7A0] mt-0.5">
                  Uncompromising clarity on ingredients and pricing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer navigation */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#285642] flex items-center justify-center text-[#F8F5ED]">
                <Leaf className="w-5 h-5 text-[#A9B7A0]" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#F8F5ED]">
                Tulsi Swaraj
              </span>
            </div>
            <p className="text-sm text-[#A9B7A0] max-w-sm leading-relaxed">
              A contemporary Indian botanical wellness house presenting pure
              herbal preparations designed to enrich everyday rituals with
              balance, warmth, and mindfulness.
            </p>
            <div className="pt-2 text-xs text-[#A9B7A0] space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B49A63]" />
                <span>support@tulsiswaraj.example.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B49A63]" />
                <span>+91 (080) 4920-8000 (Mon–Sat, 9AM–6PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B49A63]" />
                <span>Bengaluru, Karnataka, India</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#B49A63] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-[#F8F5ED]/80">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors"
                >
                  Our Story & Philosophy
                </Link>
              </li>
              <li>
                <Link
                  to="/products/tulsi-meta-ved-herbal-mix"
                  className="hover:text-white transition-colors"
                >
                  Tulsi Meta Ved Mix (₹500)
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/checkout"
                  className="hover:text-white transition-colors"
                >
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#B49A63] mb-4">
              Customer Desk
            </h4>
            <ul className="space-y-2.5 text-sm text-[#F8F5ED]/80">
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-white transition-colors"
                >
                  Account Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/orders"
                  className="hover:text-white transition-colors"
                >
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/support"
                  className="hover:text-white transition-colors"
                >
                  Help & Inquiries
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-white transition-colors"
                >
                  Member Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#B49A63] mb-4">
              Policies & Compliance
            </h4>
            <ul className="space-y-2.5 text-sm text-[#F8F5ED]/80">
              <li>
                <Link
                  to="/shipping-policy"
                  className="hover:text-white transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/returns-refunds"
                  className="hover:text-white transition-colors"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Prototype Disclaimer & Copyright */}
        <div className="mt-12 pt-8 border-t border-[#285642] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#A9B7A0]">
          <p>© 2026 Tulsi Swaraj. All rights reserved. Made in India.</p>
          <p className="bg-[#285642] px-3 py-1.5 rounded-full text-[11px] text-[#F8F5ED]/90">
            Frontend Prototype • Flagship Selling Price: ₹500 • Simulated
            Commerce Workflow
          </p>
        </div>
      </div>
    </footer>
  );
};
