import { create } from 'zustand';
import { api } from '@/lib/api';
import { Cart } from '@/types/cart';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  
  fetchCart: () => Promise<void>;
  addToCart: (productVariantId: string, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Cart>('/cart');
      set({ cart: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch cart', isLoading: false });
    }
  },

  addToCart: async (productVariantId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Cart>('/cart/items', { productVariantId, quantity });
      set({ cart: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to add item', isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (cartItemId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<Cart>(`/cart/items/${cartItemId}`, { quantity });
      set({ cart: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update item', isLoading: false });
    }
  },

  removeFromCart: async (cartItemId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/cart/items/${cartItemId}`);
      // Optimistically update or refetch. Let's just refetch.
      await get().fetchCart();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to remove item', isLoading: false });
    }
  }
}));
