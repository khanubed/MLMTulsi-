'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, Package, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface Props {
  params: Promise<{
    orderId: string;
  }>;
}

export default function OrderConfirmationPage({ params }: Props) {
  const { orderId } = use(params);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { orders } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#183F32', '#285642', '#B49A63', '#A9B7A0'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 bg-[#F8F5ED]">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-16 h-16 bg-[#EFE9DB] rounded-full mx-auto" />
          <div className="h-4 w-40 bg-[#EFE9DB] rounded mx-auto" />
        </div>
      </div>
    );
  }

  const currentOrder = orders.find((o) => o.id === orderId) || orders[0];

  if (!currentOrder) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 bg-[#F8F5ED]">
        <div className="text-center space-y-4">
          <p className="text-lg font-serif text-[#183F32]">Order not found.</p>
          <Link href="/" className="text-sm font-semibold underline text-[#183F32]">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#E5DFD3] p-8 sm:p-12 shadow-sm text-center space-y-6">
          {/* Order Illustration */}
          <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden bg-[#EFE9DB] p-2 border border-[#A9B7A0]/50 shadow-2xs">
            <img
              src="/images/order_confirmation.jpg"
              alt="Order Success Illustration"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE9DB] text-[#285642] text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#285642]" />
              <span>Order Confirmed</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#183F32]">
              Thank You for Your Order
            </h1>
            <p className="text-sm text-[#77796F] max-w-md mx-auto">
              Your preparation of Tulsi Meta Ved Herbal Mix has been scheduled for dispatch.
            </p>
          </div>

          {/* Order Details Badge */}
          <div className="p-4 rounded-xl bg-[#EFE9DB]/50 border border-[#E5DFD3] flex flex-wrap items-center justify-around gap-4 text-xs">
            <div>
              <span className="text-[#77796F] block">Order Identifier</span>
              <strong className="text-sm font-serif text-[#183F32]">{currentOrder.id}</strong>
            </div>
            <div>
              <span className="text-[#77796F] block">Order Date</span>
              <strong className="text-sm text-[#252923]">{currentOrder.date}</strong>
            </div>
            <div>
              <span className="text-[#77796F] block">Payment Status</span>
              <span className="text-xs font-semibold text-[#285642] bg-[#A9B7A0]/30 px-2 py-0.5 rounded-full">
                {currentOrder.paymentStatus}
              </span>
            </div>
            <div>
              <span className="text-[#77796F] block">Total Amount</span>
              <strong className="text-sm font-serif text-[#183F32] font-['Manrope']">
                ₹{currentOrder.total}
              </strong>
            </div>
          </div>

          {/* Item Breakdown */}
          <div className="text-left pt-4 border-t border-[#E5DFD3] space-y-4">
            <h3 className="font-serif text-base font-bold text-[#183F32]">Items in Parcel</h3>
            <div className="space-y-3 divide-y divide-[#E5DFD3]">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images[0]?.url || '/images/product_primary.png'}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-[#E5DFD3] bg-[#EFE9DB]"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-[#183F32]">{item.product.name}</h4>
                      <p className="text-[11px] text-[#77796F]">
                        Qty: {item.quantity} • ₹{item.product.price} each
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-serif font-bold text-[#183F32] tabular-nums font-['Manrope']">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address Preview */}
          <div className="text-left pt-4 border-t border-[#E5DFD3] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#183F32]">
              <MapPin className="w-4 h-4 text-[#285642]" />
              <span>Delivery Address</span>
            </div>
            <p className="text-xs text-[#77796F] leading-relaxed pl-6">
              {currentOrder.shippingAddress.fullName}
              <br />
              {currentOrder.shippingAddress.houseFlat}, {currentOrder.shippingAddress.streetLocality}
              {currentOrder.shippingAddress.landmark
                ? `, Near ${currentOrder.shippingAddress.landmark}`
                : ''}
              <br />
              {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} —{' '}
              {currentOrder.shippingAddress.pinCode}
              <br />
              Contact: {currentOrder.shippingAddress.mobile}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-[#E5DFD3] flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard/orders')}
              className="px-6 py-3 bg-[#183F32] text-[#F8F5ED] rounded-xl text-xs font-semibold hover:bg-[#285642] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Package className="w-4 h-4" />
              View in Customer Portal
            </button>

            <Link
              href="/"
              className="px-6 py-3 border border-[#183F32] text-[#183F32] rounded-xl text-xs font-semibold hover:bg-[#EFE9DB] transition-colors flex items-center justify-center gap-2"
            >
              Continue Exploring
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
