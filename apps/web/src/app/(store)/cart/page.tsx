'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[70vh] bg-[#F8F5ED] flex items-center justify-center px-4 py-16">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-16 h-16 bg-[#EFE9DB] rounded-full mx-auto" />
          <div className="h-4 w-48 bg-[#EFE9DB] rounded mx-auto" />
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shippingFee = 0; // Complimentary prototype shipping
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#F8F5ED] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md mx-auto space-y-6">
          <div className="w-36 h-36 mx-auto rounded-xl overflow-hidden bg-[#EFE9DB] p-2 border border-[#E5DFD3] shadow-sm">
            <img
              src="/images/empty_cart.jpg"
              alt="Empty Cart Still Life"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#183F32]">Your Cart is Empty</h1>
            <p className="text-sm text-[#77796F] mt-2 leading-relaxed">
              Discover our signature formulation crafted with Indian Ayurvedic botanicals for your
              daily wellness ritual.
            </p>
          </div>
          <div>
            <button
              onClick={() => router.push('/products/tulsi-meta-ved-herbal-mix')}
              className="px-8 py-3.5 bg-[#183F32] text-[#F8F5ED] rounded-xl text-sm font-semibold hover:bg-[#285642] transition-colors inline-flex items-center gap-2 shadow-md cursor-pointer"
            >
              Discover Tulsi Meta Ved (₹500 • 50% OFF)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] py-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B49A63]">
            Shopping Bag
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#183F32] font-bold mt-1">
            Review Your Order
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Items Table */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5DFD3] p-6 sm:p-8 shadow-xs">
            <div className="divide-y divide-[#E5DFD3]">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="py-5 first:pt-0 last:pb-0 flex flex-row gap-3.5 sm:gap-6 items-start"
                >
                  <img
                    src={item.product.images[0]?.url || '/images/product_primary.png'}
                    alt={item.product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-[#E5DFD3] bg-[#EFE9DB] shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h2 className="font-serif text-base sm:text-lg font-bold text-[#183F32] truncate">
                          {item.product.name}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-[#77796F] mt-0.5 flex-wrap">
                          <span>Unit Price:</span>
                          <span className="line-through text-[#77796F]/80 text-[11px]">₹999</span>
                          <span className="font-bold text-[#183F32]">₹{item.product.price}</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold">
                            50% OFF
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-[#77796F] hover:text-red-700 p-1.5 rounded-lg hover:bg-[#EFE9DB] transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                      <div className="flex items-center border border-[#A9B7A0] rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-[#252923] hover:bg-[#EFE9DB] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1 text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-[#252923] hover:bg-[#EFE9DB] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-base sm:text-lg font-bold text-[#183F32] tabular-nums font-['Manrope']">
                          ₹{item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-[#EFE9DB]/70 rounded-2xl border border-[#E5DFD3] p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-serif font-bold text-[#183F32]">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#77796F]">
                <span>Total M.R.P.</span>
                <span className="tabular-nums line-through text-[#77796F]">
                  ₹{999 * items.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Promotional Discount (50%)</span>
                <span className="tabular-nums">
                  -₹{499 * items.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-[#77796F]">
                <span>Items Subtotal</span>
                <span className="tabular-nums font-medium text-[#252923]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#77796F]">
                <span>Standard Delivery (India)</span>
                <span className="text-[#285642] font-semibold">Complimentary (₹0)</span>
              </div>
              <div className="flex justify-between text-[#77796F]">
                <span>Applicable Taxes</span>
                <span className="text-[#252923]">Included in MRP</span>
              </div>

              <div className="pt-4 border-t border-[#E5DFD3] flex justify-between text-lg font-serif font-bold text-[#183F32]">
                <span>Total Amount</span>
                <span className="tabular-nums">₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-4 px-6 bg-[#183F32] text-[#F8F5ED] rounded-xl font-semibold text-sm hover:bg-[#285642] transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Reassurance notes */}
            <div className="space-y-2 pt-2 text-xs text-[#77796F]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#285642] shrink-0" />
                <span>Priority surface dispatch across India</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#285642] shrink-0" />
                <span>Authoritative server pricing & verified checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
