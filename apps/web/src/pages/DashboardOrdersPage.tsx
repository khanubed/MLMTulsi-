import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const DashboardOrdersPage: React.FC = () => {
  const { orders } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DFD3] pb-4">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#183F32]">My Orders</h2>
        <p className="text-xs text-[#77796F] mt-0.5">
          History of all your domestic purchases and deliveries.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Package className="w-12 h-12 text-[#77796F] mx-auto" />
          <h3 className="font-serif text-lg text-[#183F32]">No orders recorded</h3>
          <p className="text-xs text-[#77796F]">
            Once you complete an order, its tracking history will be stored here.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View (< 640px) */}
          <div className="block sm:hidden space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-[#F8F5ED]/50 border border-[#E5DFD3] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#183F32]">{order.id}</span>
                  <span className="px-2 py-0.5 rounded bg-[#285642]/10 text-[#285642] font-semibold text-[10px]">
                    {order.orderStatus}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-medium text-[#252923]">{order.items[0]?.product.name}</p>
                  <p className="text-[#77796F] text-[11px]">{order.date} • Total: <strong>₹{order.total}</strong> ({order.paymentStatus})</p>
                </div>

                <Link
                  to={`/dashboard/orders/${order.id}`}
                  className="w-full py-2 bg-white border border-[#183F32] text-[#183F32] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#EFE9DB] transition-colors"
                >
                  <span>View Details & Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= 640px) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5DFD3] text-[#77796F] font-semibold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD3]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F8F5ED]/60 transition-colors">
                    <td className="py-4 font-serif font-bold text-[#183F32]">
                      {order.id}
                    </td>
                    <td className="py-4 text-[#77796F]">{order.date}</td>
                    <td className="py-4">
                      <span className="font-medium text-[#252923]">
                        {order.items[0]?.product.name}
                      </span>
                      {order.items.length > 1 && (
                        <span className="text-[#77796F] block text-[10px]">
                          +{order.items.length - 1} more item(s)
                        </span>
                      )}
                    </td>
                    <td className="py-4 font-serif font-bold text-[#183F32] tabular-nums">
                      ₹{order.total}
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 rounded bg-[#EFE9DB] text-[#285642] font-medium text-[10px]">
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 rounded bg-[#285642]/10 text-[#285642] font-medium text-[10px]">
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        to={`/dashboard/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-[#183F32] hover:underline font-semibold"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
