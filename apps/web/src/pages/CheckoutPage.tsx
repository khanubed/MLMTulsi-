import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  ArrowRight,
  Lock,
} from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import type { PaymentMethodType, ShippingAddress, Order } from "../types/order";

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user, addOrder } = useAuthStore();

  const subtotal = getSubtotal();
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  // Form states initialized with user profile if available
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: user?.fullName || "Aarav Sharma",
    email: user?.email || "aarav.sharma@example.in",
    mobile: user?.mobile || "9876543210",
    houseFlat: user?.defaultAddress?.houseFlat || "B-402, Green Meadows",
    streetLocality:
      user?.defaultAddress?.streetLocality || "Indiranagar 100ft Road",
    landmark: user?.defaultAddress?.landmark || "Near BDA Complex",
    city: user?.defaultAddress?.city || "Bengaluru",
    state: user?.defaultAddress?.state || "Karnataka",
    pinCode: user?.defaultAddress?.pinCode || "560038",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("upi");
  const [upiId, setUpiId] = useState("aarav@okhdfcbank");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty, redirect
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-lg font-serif text-[#183F32]">
            No items in cart for checkout.
          </p>
          <Link
            to="/products/tulsi-meta-ved-herbal-mix"
            className="inline-block px-6 py-2.5 bg-[#183F32] text-[#F8F5ED] rounded-sm text-sm font-semibold"
          >
            Explore Product
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof ShippingAddress, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!formData.fullName.trim()) err.fullName = "Full Name is required";
    if (!formData.email.trim() || !formData.email.includes("@"))
      err.email = "Valid Email is required";
    if (!formData.mobile.trim() || formData.mobile.length < 10)
      err.mobile = "Valid 10-digit mobile is required";
    if (!formData.houseFlat.trim())
      err.houseFlat = "Flat / House number is required";
    if (!formData.streetLocality.trim())
      err.streetLocality = "Street / Locality is required";
    if (!formData.city.trim()) err.city = "City is required";
    if (!formData.state.trim()) err.state = "State is required";
    if (!formData.pinCode.trim() || formData.pinCode.length !== 6)
      err.pinCode = "Valid 6-digit PIN code is required";
    if (!termsAccepted) err.terms = "Please accept the checkout terms";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = "TS-2026-" + Math.floor(1000 + Math.random() * 9000);
      const newOrder: Order = {
        id: orderId,
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        items: [...items],
        subtotal,
        shippingFee,
        total,
        paymentMethod,
        paymentStatus:
          paymentMethod === "cod" ? "Cash on Delivery" : "Simulated Paid",
        orderStatus: "Confirmed",
        deliveryEstimate: "Expected delivery in 3–5 business days",
        shippingAddress: { ...formData },
        isDemoOrder: true,
      };

      addOrder(newOrder);
      clearCart();
      setIsSubmitting(false);
      navigate(`/order-confirmation/${orderId}`);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#F8F5ED] py-6 sm:py-10">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs text-[#285642] font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Demonstration Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#183F32] mt-1">
            Checkout & Delivery Information
          </h1>
        </div>

        <form
          onSubmit={handlePlaceOrder}
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
                  <label className="text-xs font-semibold text-[#183F32]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                    placeholder="e.g. Aarav Sharma"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) =>
                      handleInputChange(
                        "mobile",
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                    placeholder="10-digit mobile number"
                  />
                  {errors.mobile && (
                    <p className="text-xs text-red-600">{errors.mobile}</p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                    placeholder="name@example.in"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email}</p>
                  )}
                  <p className="text-[11px] text-[#77796F]">
                    Order status tracking and receipt will be dispatched here.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="bg-white rounded-xl border border-[#E5DFD3] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-[#E5DFD3] pb-4">
                <span className="w-7 h-7 rounded-full bg-[#183F32] text-[#F8F5ED] flex items-center justify-center font-bold text-xs">
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
                    value={formData.houseFlat}
                    onChange={(e) =>
                      handleInputChange("houseFlat", e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                    placeholder="e.g. B-402, Green Meadows"
                  />
                  {errors.houseFlat && (
                    <p className="text-xs text-red-600">{errors.houseFlat}</p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">
                    Street, Colony or Sector *
                  </label>
                  <input
                    type="text"
                    value={formData.streetLocality}
                    onChange={(e) =>
                      handleInputChange("streetLocality", e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                    placeholder="e.g. 100ft Road, Indiranagar"
                  />
                  {errors.streetLocality && (
                    <p className="text-xs text-red-600">
                      {errors.streetLocality}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) =>
                      handleInputChange("landmark", e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                    placeholder="e.g. Near BDA Complex"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pinCode}
                    onChange={(e) =>
                      handleInputChange(
                        "pinCode",
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                    placeholder="6-digit PIN"
                  />
                  {errors.pinCode && (
                    <p className="text-xs text-red-600">{errors.pinCode}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                    placeholder="e.g. Bengaluru"
                  />
                  {errors.city && (
                    <p className="text-xs text-red-600">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                    placeholder="e.g. Karnataka"
                  />
                  {errors.state && (
                    <p className="text-xs text-red-600">{errors.state}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Simulated Payment Method */}
            <div className="bg-white rounded-xl border border-[#E5DFD3] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#183F32] text-[#F8F5ED] flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h2 className="text-lg font-serif font-bold text-[#183F32]">
                    Select Payment Mode
                  </h2>
                </div>
                <span className="text-[11px] bg-[#EFE9DB] text-[#285642] px-2.5 py-1 rounded font-medium">
                  Simulated Prototype Gateway
                </span>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "upi", label: "UPI (QR / App)", icon: QrCode },
                  { id: "card", label: "Card (Demo)", icon: CreditCard },
                  { id: "netbanking", label: "Net Banking", icon: Building2 },
                  { id: "cod", label: "Cash on Delivery", icon: Banknote },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        setPaymentMethod(mode.id as PaymentMethodType)
                      }
                      className={`p-3.5 rounded-lg border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === mode.id
                          ? "border-[#183F32] bg-[#EFE9DB]/60 text-[#183F32] ring-1 ring-[#183F32]"
                          : "border-[#E5DFD3] hover:border-[#A9B7A0] text-[#77796F]"
                      }`}
                    >
                      <Icon className="w-5 h-5 text-[#183F32]" />
                      <span className="text-xs font-semibold">
                        {mode.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Payment Details Container */}
              <div className="p-4 rounded-lg bg-[#F8F5ED] border border-[#E5DFD3] text-sm">
                {paymentMethod === "upi" && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-[#183F32]">
                      Simulated Instant UPI Transfer
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <div className="p-2 bg-white rounded-md border border-[#A9B7A0]">
                        <QrCode className="w-20 h-20 text-[#183F32]" />
                      </div>
                      <div className="flex-1 space-y-1 text-xs text-[#77796F]">
                        <p>
                          Scan with any UPI app (GPay, PhonePe, Paytm, BHIM) or
                          verify via VPA:
                        </p>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-sm border border-[#A9B7A0] bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-[#183F32]">
                      Demonstration Card Entry
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          disabled
                          value="•••• •••• •••• 4242 (Simulated Test Card)"
                          className="w-full px-3 py-2 rounded-sm border border-[#A9B7A0] bg-white text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          disabled
                          value="12 / 28"
                          className="w-full px-3 py-2 rounded-sm border border-[#A9B7A0] bg-white text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          disabled
                          value="•••"
                          className="w-full px-3 py-2 rounded-sm border border-[#A9B7A0] bg-white text-xs"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-[#B49A63]">
                      *Never enter real credit card numbers in this development
                      prototype.
                    </p>
                  </div>
                )}

                {paymentMethod === "netbanking" && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-[#183F32]">
                      Select Partner Bank (Demo)
                    </p>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 rounded-sm border border-[#A9B7A0] bg-white text-xs"
                    >
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#183F32]">
                      Pay on Handover (Cash on Delivery)
                    </p>
                    <p className="text-xs text-[#77796F]">
                      Please keep exact cash (₹{total}) ready at the time of
                      parcel delivery.
                    </p>
                  </div>
                )}
              </div>

              {/* Terms Acceptance */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-[#252923] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-[#183F32] focus:ring-[#183F32]"
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      target="_blank"
                      className="underline font-semibold"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      target="_blank"
                      className="underline font-semibold"
                    >
                      Privacy Policy
                    </Link>
                    . I understand this is a simulated order transaction in a
                    prototype environment.
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-xs text-red-600 mt-1">{errors.terms}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Review Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E5DFD3] p-6 sm:p-8 space-y-6 shadow-xs sticky top-28">
            <h2 className="text-xl font-serif font-bold text-[#183F32] border-b border-[#E5DFD3] pb-3">
              Order Review
            </h2>

            {/* Itemized list */}
            <div className="space-y-3 divide-y divide-[#E5DFD3]">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="pt-3 first:pt-0 flex gap-3"
                >
                  <img
                    src={
                      item.product.images[0]?.url ||
                      "/images/product_primary.jpg"
                    }
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-sm border border-[#E5DFD3] bg-[#EFE9DB] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-serif font-bold text-[#183F32] truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-[11px] text-[#77796F]">
                      Qty: {item.quantity} × ₹{item.product.price}
                    </p>
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
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#252923] tabular-nums">
                  ₹{subtotal}
                </span>
              </div>
              <div className="flex justify-between text-[#77796F]">
                <span>Surface Shipping</span>
                <span className="font-semibold text-[#285642]">
                  Complimentary (₹0)
                </span>
              </div>
              <div className="flex justify-between text-[#77796F]">
                <span>GST (All-Inclusive)</span>
                <span className="text-[#252923]">₹0 (Included)</span>
              </div>

              <div className="pt-3 border-t border-[#E5DFD3] flex justify-between text-base font-serif font-bold text-[#183F32]">
                <span>Final Payable</span>
                <span className="tabular-nums">₹{total}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-[#183F32] text-[#F8F5ED] rounded-md font-semibold text-sm hover:bg-[#285642] transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Generating Demo Order...</span>
              ) : (
                <>
                  <span>Place Demo Order • ₹{total}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-[#77796F] space-y-1 text-center">
              <p>Simulated transaction for prototype testing.</p>
              <p>
                Generates an instant order identifier with full account timeline
                tracking.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
