import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  CreditCard,
  LifeBuoy,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export const DashboardOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders } = useAuthStore();

  const order = orders.find((o) => o.id === orderId) || orders[0];

  if (!order) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-[#77796F]">Order not found.</p>
        <Link
          to="/dashboard/orders"
          className="text-xs font-semibold text-[#183F32] underline"
        >
          &larr; Back to Order History
        </Link>
      </div>
    );
  }

  const timelineSteps = [
    { label: "Order Received", date: order.date, completed: true },
    {
      label: "Formulation Prepared & Sealed",
      date: order.date,
      completed: true,
    },
    {
      label: "Dispatched via Courier",
      date: "In Transit",
      completed:
        order.orderStatus === "Dispatched" || order.orderStatus === "Delivered",
    },
    {
      label: "Delivered",
      date: order.deliveryEstimate,
      completed: order.orderStatus === "Delivered",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top back navigation */}
      <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
        <Link
          to="/dashboard/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77796F] hover:text-[#183F32]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>

        <span className="text-xs bg-[#EFE9DB] text-[#285642] px-3 py-1 rounded-full font-semibold">
          {order.orderStatus}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#183F32]">
            Order #{order.id}
          </h2>
          <p className="text-xs text-[#77796F]">
            Placed on {order.date} • Simulated Payment: {order.paymentStatus}
          </p>
        </div>

        <Link
          to="/dashboard/support"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#A9B7A0] text-xs font-medium text-[#183F32] hover:bg-[#EFE9DB]"
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Help with this order</span>
        </Link>
      </div>

      {/* Progress Timeline */}
      <div className="p-6 bg-[#F8F5ED] rounded-lg border border-[#E5DFD3] space-y-4">
        <h3 className="font-serif text-sm font-bold text-[#183F32]">
          Delivery Progress
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {timelineSteps.map((step, idx) => (
            <div key={idx} className="space-y-1 relative">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.completed
                      ? "bg-[#183F32] text-[#F8F5ED]"
                      : "bg-[#E5DFD3] text-[#77796F]"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-xs font-semibold ${step.completed ? "text-[#183F32]" : "text-[#77796F]"}`}
                >
                  {step.label}
                </span>
              </div>
              <p className="text-[10px] text-[#77796F] pl-8">{step.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Item Breakdown */}
      <div className="space-y-3">
        <h3 className="font-serif text-base font-bold text-[#183F32]">
          Parcel Items
        </h3>
        <div className="divide-y divide-[#E5DFD3] border-y border-[#E5DFD3]">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={
                    item.product.images[0]?.url || "/images/product_primary.jpg"
                  }
                  alt={item.product.name}
                  className="w-16 h-16 rounded-md object-cover border border-[#E5DFD3] bg-[#EFE9DB]"
                />
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#183F32]">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-[#77796F]">
                    Qty: {item.quantity} × ₹{item.product.price}
                  </p>
                </div>
              </div>
              <span className="font-serif font-bold text-sm text-[#183F32] tabular-nums">
                ₹{item.product.price * item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Address & Payment Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        <div className="p-5 rounded-lg bg-[#F8F5ED] border border-[#E5DFD3] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#183F32]">
            <MapPin className="w-4 h-4 text-[#285642]" />
            <span>Shipping Destination</span>
          </div>
          <p className="text-xs text-[#77796F] leading-relaxed">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.houseFlat},{" "}
            {order.shippingAddress.streetLocality}
            {order.shippingAddress.landmark
              ? `, Near ${order.shippingAddress.landmark}`
              : ""}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
            {order.shippingAddress.pinCode}
            <br />
            Phone: {order.shippingAddress.mobile}
          </p>
        </div>

        <div className="p-5 rounded-lg bg-[#F8F5ED] border border-[#E5DFD3] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#183F32]">
            <CreditCard className="w-4 h-4 text-[#285642]" />
            <span>Payment Summary</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-[#77796F]">
              <span>Payment Mode:</span>
              <span className="uppercase font-semibold text-[#252923]">
                {order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-[#77796F]">
              <span>Status:</span>
              <span className="font-semibold text-[#285642]">
                {order.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between text-[#77796F] pt-1 border-t border-[#E5DFD3]">
              <span className="font-bold text-[#183F32]">Total Paid:</span>
              <span className="font-serif font-bold text-sm text-[#183F32]">
                ₹{order.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
