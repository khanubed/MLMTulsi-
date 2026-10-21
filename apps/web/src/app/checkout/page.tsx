'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { PaymentMethodType, Order } from '@/types/order';

const CheckoutFormSchema = z.object({
  fullName: z.string().min(2, 'Full Name is required (minimum 2 characters)'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile number starting with 6-9 is required'),
  email: z.string().email('Valid email address is required'),
  houseFlat: z.string().min(3, 'Flat / House / Building information is required'),
  streetLocality: z.string().min(3, 'Street, colony or locality is required'),
  landmark: z.string().optional(),
  pinCode: z.string().regex(/^\d{6}$/, 'Valid 6-digit Indian PIN code is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().default('India'),
  paymentMethod: z.enum(['upi', 'card', 'netbanking', 'cod']),
  upiId: z.string().optional(),
  selectedBank: z.string().optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the checkout terms to complete your order' }),
  }),
});

type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user, addOrder } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = mounted ? getSubtotal() : 0;
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      fullName: user?.fullName || 'Aarav Sharma',
      email: user?.email || 'aarav.sharma@example.in',
      mobile: user?.mobile || '9876543210',
      houseFlat: user?.defaultAddress?.houseFlat || 'B-402, Green Meadows',
      streetLocality: user?.defaultAddress?.streetLocality || 'Indiranagar 100ft Road',
      landmark: user?.defaultAddress?.landmark || 'Near BDA Complex',
      city: user?.defaultAddress?.city || 'Bengaluru',
      state: user?.defaultAddress?.state || 'Karnataka',
      pinCode: user?.defaultAddress?.pinCode || '560038',
      country: 'India',
      paymentMethod: 'upi',
      upiId: 'aarav@okhdfcbank',
      selectedBank: 'HDFC Bank',
      termsAccepted: true,
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');
  const upiIdValue = watch('upiId');
  const selectedBankValue = watch('selectedBank');

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 bg-[#F8F5ED]">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-12 h-12 bg-[#EFE9DB] rounded-full mx-auto" />
          <div className="h-4 w-40 bg-[#EFE9DB] rounded mx-auto" />
        </div>
      </div>
    );
  }

  // If cart is empty, show empty state
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 bg-[#F8F5ED]">
        <div className="text-center space-y-4">
          <p className="text-lg font-serif text-[#183F32]">No items in cart for checkout.</p>
          <Link
            href="/products/tulsi-meta-ved-herbal-mix"
            className="inline-block px-6 py-2.5 bg-[#183F32] text-[#F8F5ED] rounded-xl text-sm font-semibold hover:bg-[#285642] transition-colors"
          >
            Explore Product
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    // Simulate order placement
    await new Promise((res) => setTimeout(res, 900));

    const orderId = 'TS-2026-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: orderId,
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      items: [...items],
      subtotal,
      shippingFee,
      total,
      paymentMethod: data.paymentMethod as PaymentMethodType,
      paymentStatus: data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Simulated Paid',
      orderStatus: 'Confirmed',
      deliveryEstimate: 'Expected delivery in 3–5 business days',
      shippingAddress: {
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        houseFlat: data.houseFlat,
        streetLocality: data.streetLocality,
        landmark: data.landmark,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        country: data.country,
      },
      isDemoOrder: true,
    };

    addOrder(newOrder);
    clearCart();
    router.push(`/order-confirmation/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F5ED] py-6 sm:py-10">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs text-[#285642] font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#183F32] mt-1">
            Checkout & Delivery Information
          </h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start"
        >
          {/* Left Column: Multi-step checkout fields */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {/* Step 1: Contact Details */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5DFD3] p-4 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-[#E5DFD3] pb-3 sm:pb-4">
                <span className="w-7 h-7 rounded-full bg-[#183F32] text-[#F8F5ED] flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#183F32]">
                  Contact Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    {...register('fullName')}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                      errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    {...register('mobile')}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                      errors.mobile ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                    }`}
                  />
                  {errors.mobile && (
                    <p className="text-xs text-red-600">{errors.mobile.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">Email Address *</label>
                  <input
                    type="email"
                    placeholder="name@example.in"
                    {...register('email')}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                      errors.email ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email.message}</p>
                  )}
                  <p className="text-[11px] text-[#77796F]">
                    Order status tracking and receipt will be dispatched here.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5DFD3] p-4 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-[#E5DFD3] pb-4">
                <span className="w-7 h-7 rounded-full bg-[#183F32] text-[#F8F5ED] flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <h2 className="text-lg font-serif font-bold text-[#183F32]">
                  Shipping Destination (India)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">
                    Flat / House / Building *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B-402, Green Meadows"
                    {...register('houseFlat')}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                      errors.houseFlat ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                    }`}
                  />
                  {errors.houseFlat && (
                    <p className="text-xs text-red-600">{errors.houseFlat.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">
                    Street, Colony or Sector *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100ft Road, Indiranagar"
                    {...register('streetLocality')}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                      errors.streetLocality ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                    }`}
                  />
                  {errors.streetLocality && (
                    <p className="text-xs text-red-600">{errors.streetLocality.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near BDA Complex"
                    {...register('landmark')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">PIN Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="6-digit PIN"
                    {...register('pinCode')}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                      errors.pinCode ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                    }`}
                  />
                  {errors.pinCode && (
                    <p className="text-xs text-red-600">{errors.pinCode.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    {...register('city')}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                      errors.city ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                    }`}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">State *</label>
                  <input
                    type="text"
                    placeholder="e.g. Karnataka"
                    {...register('state')}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                      errors.state ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                    }`}
                  />
                  {errors.state && (
                    <p className="text-xs text-red-600">{errors.state.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5DFD3] p-4 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#183F32] text-[#F8F5ED] flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </span>
                  <h2 className="text-lg font-serif font-bold text-[#183F32]">
                    Select Payment Mode
                  </h2>
                </div>
                <span className="text-[11px] bg-[#EFE9DB] text-[#285642] px-2.5 py-1 rounded-full font-medium">
                  Authoritative Checkout
                </span>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'upi', label: 'UPI (QR / App)', icon: QrCode },
                  { id: 'card', label: 'Card (Demo)', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                  { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedPaymentMethod === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setValue('paymentMethod', mode.id as any)}
                      className={`p-3.5 rounded-xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#183F32] bg-[#EFE9DB]/60 text-[#183F32] ring-1 ring-[#183F32]'
                          : 'border-[#E5DFD3] hover:border-[#A9B7A0] text-[#77796F]'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-[#183F32]" />
                      <span className="text-xs font-semibold">{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Payment Details Container */}
              <div className="p-4 rounded-xl bg-[#F8F5ED] border border-[#E5DFD3] text-sm">
                {selectedPaymentMethod === 'upi' && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-[#183F32]">Instant UPI Transfer</p>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <div className="p-2 bg-white rounded-lg border border-[#A9B7A0]">
                        <QrCode className="w-20 h-20 text-[#183F32]" />
                      </div>
                      <div className="flex-1 space-y-1 text-xs text-[#77796F]">
                        <p>Scan with any UPI app (GPay, PhonePe, Paytm, BHIM) or verify via VPA:</p>
                        <input
                          type="text"
                          value={upiIdValue}
                          {...register('upiId')}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#A9B7A0] bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === 'card' && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-[#183F32]">Demonstration Card Entry</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          disabled
                          value="•••• •••• •••• 4242 (Simulated Test Card)"
                          className="w-full px-3 py-2 rounded-lg border border-[#A9B7A0] bg-white text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          disabled
                          value="12 / 28"
                          className="w-full px-3 py-2 rounded-lg border border-[#A9B7A0] bg-white text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          disabled
                          value="•••"
                          className="w-full px-3 py-2 rounded-lg border border-[#A9B7A0] bg-white text-xs"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-[#B49A63]">
                      *Never enter real credit card numbers in this development prototype.
                    </p>
                  </div>
                )}

                {selectedPaymentMethod === 'netbanking' && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-[#183F32]">Select Partner Bank (Demo)</p>
                    <select
                      value={selectedBankValue}
                      {...register('selectedBank')}
                      className="w-full px-3 py-2 rounded-lg border border-[#A9B7A0] bg-white text-xs"
                    >
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {selectedPaymentMethod === 'cod' && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#183F32]">
                      Pay on Handover (Cash on Delivery)
                    </p>
                    <p className="text-xs text-[#77796F]">
                      Please keep exact cash (₹{total}) ready at the time of parcel delivery.
                    </p>
                  </div>
                )}
              </div>

              {/* Terms Acceptance */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-[#252923] cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('termsAccepted')}
                    className="mt-0.5 rounded text-[#183F32] focus:ring-[#183F32]"
                  />
                  <span>
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" className="underline font-semibold">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy-policy" target="_blank" className="underline font-semibold">
                      Privacy Policy
                    </Link>
                    . I understand this order will be processed with verified server pricing.
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="text-xs text-red-600 mt-1">{errors.termsAccepted.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Review Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl border border-[#E5DFD3] p-6 sm:p-8 space-y-6 shadow-xs sticky top-28">
            <h2 className="text-xl font-serif font-bold text-[#183F32] border-b border-[#E5DFD3] pb-3">
              Order Review
            </h2>

            {/* Itemized list */}
            <div className="space-y-3 divide-y divide-[#E5DFD3]">
              {items.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3">
                  <img
                    src={item.product.images[0]?.url || '/images/product_primary.png'}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-xl border border-[#E5DFD3] bg-[#EFE9DB] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-serif font-bold text-[#183F32] truncate">
                      {item.product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#77796F] flex-wrap">
                      <span>Qty: {item.quantity} ×</span>
                      <span className="line-through text-[10px]">₹999</span>
                      <span className="font-semibold text-[#183F32]">₹{item.product.price}</span>
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 font-bold">
                        50% OFF
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#183F32] mt-0.5 tabular-nums">
                      ₹{item.product.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-3 border-t border-[#E5DFD3] text-xs">
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
                <span className="font-semibold text-[#252923] tabular-nums">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#77796F]">
                <span>Surface Shipping</span>
                <span className="font-semibold text-[#285642]">Complimentary (₹0)</span>
              </div>
              <div className="flex justify-between text-[#77796F]">
                <span>GST (All-Inclusive)</span>
                <span className="text-[#252923]">₹0 (Included)</span>
              </div>

              <div className="pt-3 border-t border-[#E5DFD3] flex justify-between text-base font-serif font-bold text-[#183F32]">
                <span>Final Payable</span>
                <span className="tabular-nums font-['Manrope']">₹{total}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-[#183F32] text-[#F8F5ED] rounded-xl font-semibold text-sm hover:bg-[#285642] transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Order • ₹{total}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-[#77796F] space-y-1 text-center">
              <p>Simulated transaction for prototype testing.</p>
              <p>Generates an instant order identifier with full account timeline tracking.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
