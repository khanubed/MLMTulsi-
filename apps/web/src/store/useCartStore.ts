import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState } from '../types/cart';
import type { Product } from '../types/product';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (product: Product, quantity = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.product.id === product.id);

        if (existingIndex > -1) {
          const updated = [...items];
          updated[existingIndex].quantity += quantity;
          set({ items: updated, isDrawerOpen: true });
        } else {
          set({ items: [...items, { product, quantity }], isDrawerOpen: true });
        }
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((i) => i.product.id !== productId)
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        });
      },

      clearCart: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set({ isDrawerOpen: !get().isDrawerOpen }),

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      }
    }),
    {
      name: 'tulsi_swaraj_cart'
    }
  )
);
