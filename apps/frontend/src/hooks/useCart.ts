import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import cartService from '../services/cartService';
import { CartState, CartItem } from '../types';

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: async (productId: string, quantity: number = 1) => {
        try {
          const cartItem = await cartService.addToCart({ productId, quantity });
          const currentItems = get().items;
          const existingItemIndex = currentItems.findIndex(
            (item) => item.productId === productId
          );

          let newItems: CartItem[];
          if (existingItemIndex >= 0) {
            // 更新现有商品数量
            newItems = currentItems.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // 添加新商品
            newItems = [...currentItems, cartItem];
          }

          const newTotal = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          const newItemCount = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          set({
            items: newItems,
            total: newTotal,
            itemCount: newItemCount,
          });
        } catch (error) {
          console.error('Add to cart failed:', error);
          throw error;
        }
      },

      removeItem: async (productId: string) => {
        try {
          await cartService.removeFromCart(productId);
          const currentItems = get().items;
          const newItems = currentItems.filter(
            (item) => item.productId !== productId
          );

          const newTotal = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          const newItemCount = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          set({
            items: newItems,
            total: newTotal,
            itemCount: newItemCount,
          });
        } catch (error) {
          console.error('Remove from cart failed:', error);
          throw error;
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        try {
          if (quantity <= 0) {
            await get().removeItem(productId);
            return;
          }

          await cartService.updateCartItem(productId, { quantity });
          const currentItems = get().items;
          const newItems = currentItems.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          );

          const newTotal = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          const newItemCount = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          set({
            items: newItems,
            total: newTotal,
            itemCount: newItemCount,
          });
        } catch (error) {
          console.error('Update quantity failed:', error);
          throw error;
        }
      },

      clearCart: () => {
        cartService.clearCart().catch(console.error);
        set({
          items: [],
          total: 0,
          itemCount: 0,
        });
      },

      loadCart: async () => {
        try {
          const items = await cartService.getCartItems();
          const total = items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

          set({
            items,
            total,
            itemCount,
          });
        } catch (error) {
          console.error('Load cart failed:', error);
          // 如果加载失败，使用本地状态
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      }),
    }
  )
);
