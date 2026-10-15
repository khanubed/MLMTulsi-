import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTotalItems,
  } = useCartStore();

  if (!isDrawerOpen) return null;

  const subtotal = getSubtotal();

  const handleCheckout = () => {
    closeDrawer();
    navigate("/checkout");
  };

  const handleViewCart = () => {
    closeDrawer();
    navigate("/cart");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#183F32]/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-[#F8F5ED] shadow-2xl border-l border-[#E5DFD3] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5DFD3] bg-[#EFE9DB]/60">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#183F32]" />
              <h2 className="text-xl font-serif text-[#183F32] font-semibold">
                Your Cart
              </h2>
              <span className="text-xs bg-[#183F32] text-[#F8F5ED] px-2 py-0.5 rounded-full font-sans">
                {getTotalItems()}
              </span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-[#77796F] hover:text-[#183F32] hover:bg-[#E5DFD3] rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden bg-[#EFE9DB] p-2">
                  <img
                    src="/images/empty_cart.jpg"
                    alt="Empty Cart"
                    className="w-full h-full object-cover rounded-md opacity-90"
                  />
                </div>
                <h3 className="text-lg font-serif text-[#183F32]">
                  Your cart is currently empty
                </h3>
                <p className="text-sm text-[#77796F] max-w-xs mx-auto">
                  Experience the calming touch of Indian botanical formulations
                  in your daily routine.
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate("/products/tulsi-meta-ved-herbal-mix");
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#183F32] text-[#F8F5ED] rounded-sm text-sm font-medium hover:bg-[#285642] transition-colors"
                >
                  Discover Tulsi Meta Ved
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-[#E5DFD3]">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="pt-4 first:pt-0 flex gap-4"
                  >
                    <img
                      src={
                        item.product.images[0]?.url ||
                        "/images/product_primary.jpg"
                      }
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-sm border border-[#E5DFD3] bg-[#EFE9DB] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-semibold text-[#183F32] truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-[#77796F] hover:text-red-700 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#77796F] mt-0.5">
                        Unit Price: ₹{item.product.price}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-[#A9B7A0] rounded bg-white overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="px-2 py-1 text-[#252923] hover:bg-[#EFE9DB] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 py-1 text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="px-2 py-1 text-[#252923] hover:bg-[#EFE9DB] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-medium text-sm text-[#183F32] tabular-nums">
                          ₹{item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E5DFD3] bg-[#EFE9DB]/40 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#77796F]">Standard Delivery</span>
                <span className="text-[#285642] font-medium">
                  Complimentary (₹0)
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#183F32] pt-2 border-t border-[#E5DFD3]">
                <span>Subtotal</span>
                <span className="tabular-nums">₹{subtotal}</span>
              </div>
              <p className="text-xs text-[#77796F]">
                Inclusive of all taxes. Fast simulated dispatch across India.
              </p>
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={handleViewCart}
                  className="w-full py-2.5 px-3 border border-[#183F32] text-[#183F32] rounded-sm text-sm font-medium hover:bg-[#EFE9DB] transition-colors text-center"
                >
                  View Cart Page
                </button>
                <button
                  onClick={handleCheckout}
                  className="w-full py-2.5 px-3 bg-[#183F32] text-[#F8F5ED] rounded-sm text-sm font-medium hover:bg-[#285642] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
