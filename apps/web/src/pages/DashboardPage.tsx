import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders } = useAuthStore();

  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (o) =>
      o.orderStatus === "Confirmed" ||
      o.orderStatus === "Processing" ||
      o.orderStatus === "Dispatched",
  ).length;
  const deliveredOrders = orders.filter(
    (o) => o.orderStatus === "Delivered",
  ).length;
  const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#183F32]">
          Account Overview
        </h2>
        <p className="text-xs text-[#77796F] mt-0.5">
          Summary of your orders and active wellness deliveries.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#EFE9DB]/50 border border-[#E5DFD3] space-y-1">
          <span className="text-[11px] text-[#77796F] uppercase font-semibold">
            Total Orders
          </span>
          <p className="text-2xl font-serif font-bold text-[#183F32]">
            {totalOrders}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#EFE9DB]/50 border border-[#E5DFD3] space-y-1">
          <span className="text-[11px] text-[#77796F] uppercase font-semibold">
            In Transit
          </span>
          <p className="text-2xl font-serif font-bold text-[#285642]">
            {activeOrders}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#EFE9DB]/50 border border-[#E5DFD3] space-y-1">
          <span className="text-[11px] text-[#77796F] uppercase font-semibold">
            Delivered
          </span>
          <p className="text-2xl font-serif font-bold text-[#183F32]">
            {deliveredOrders}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#EFE9DB]/50 border border-[#E5DFD3] space-y-1">
          <span className="text-[11px] text-[#77796F] uppercase font-semibold">
            Total Invested
          </span>
          <p className="text-2xl font-serif font-bold text-[#183F32] tabular-nums">
            ₹{totalSpend}
          </p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
          <h3 className="font-serif text-lg font-bold text-[#183F32]">
            Recent Orders
          </h3>
          <Link
            to="/dashboard/orders"
            className="text-xs font-semibold text-[#183F32] hover:underline flex items-center gap-1"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 bg-[#F8F5ED] rounded-lg p-6">
            <Package className="w-10 h-10 text-[#77796F] mx-auto mb-2" />
            <p className="text-sm font-serif text-[#183F32]">
              No orders placed yet.
            </p>
            <button
              onClick={() => navigate("/products/tulsi-meta-ved-herbal-mix")}
              className="mt-3 px-5 py-2 bg-[#183F32] text-[#F8F5ED] rounded-sm text-xs font-semibold"
            >
              Order Tulsi Meta Ved (₹500)
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-lg border border-[#E5DFD3] hover:border-[#A9B7A0] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5ED]/40"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-md bg-[#EFE9DB] flex items-center justify-center border border-[#E5DFD3]">
                    <Package className="w-6 h-6 text-[#183F32]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-[#183F32]">
                        {order.id}
                      </span>
                      <span className="text-[10px] bg-[#285642]/10 text-[#285642] px-2 py-0.5 rounded font-medium">
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#77796F] mt-0.5">
                      {order.date} • {order.items.length} item(s) • Total: ₹
                      {order.total}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/dashboard/orders/${order.id}`}
                  className="px-4 py-2 border border-[#183F32] text-[#183F32] rounded-sm text-xs font-semibold hover:bg-[#EFE9DB] transition-colors text-center"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Profile Completeness */}
      <div className="p-5 rounded-lg bg-[#EFE9DB]/40 border border-[#A9B7A0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#183F32] flex items-center justify-center text-[#F8F5ED]">
            <ShieldCheck className="w-5 h-5 text-[#B49A63]" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#183F32]">
              Customer Profile Verified
            </h4>
            <p className="text-xs text-[#77796F]">
              Primary delivery address saved for Indiranagar, Bengaluru.
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/profile"
          className="px-4 py-2 bg-[#183F32] text-[#F8F5ED] rounded-sm text-xs font-semibold hover:bg-[#285642]"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
};
