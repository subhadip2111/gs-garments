
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../types';

interface CartState {
  cart: CartItem[];
  wishlist: string[];
  comparisonList: string[];
}

const initialState: CartState = {
  cart: [],
  wishlist: [],
  comparisonList: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ productId: string; size: string; color: string; quantity: number }>) => {
      const { productId, size, color, quantity } = action.payload;
      const existingIndex = state.cart.findIndex(
        item => item.productId === productId && item.selectedSize === size && item.selectedColor === color
      );
      if (existingIndex > -1) {
        state.cart[existingIndex].quantity += quantity;
      } else {
        state.cart.push({ productId, selectedSize: size, selectedColor: color, quantity });
      }
    },
    removeFromCart: (state, action: PayloadAction<{ productId: string; size: string; color: string }>) => {
      const { productId, size, color } = action.payload;
      state.cart = state.cart.filter(
        item => !(item.productId === productId && item.selectedSize === size && item.selectedColor === color)
      );
    },
    updateCartQuantity: (state, action: PayloadAction<{ productId: string; size: string; color: string; delta: number }>) => {
      const { productId, size, color, delta } = action.payload;
      const item = state.cart.find(
        i => i.productId === productId && i.selectedSize === size && i.selectedColor === color
      );
      if (item) {
        item.quantity = Math.max(1, item.quantity + delta);
      }
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (state.wishlist.includes(productId)) {
        state.wishlist = state.wishlist.filter(id => id !== productId);
      } else {
        state.wishlist.push(productId);
      }
    },
    toggleComparison: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (state.comparisonList.includes(productId)) {
        state.comparisonList = state.comparisonList.filter(id => id !== productId);
      } else {
        if (state.comparisonList.length < 4) {
          state.comparisonList.push(productId);
        }
      }
    },
    clearComparison: (state) => {
      state.comparisonList = [];
    }
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateCartQuantity, 
  toggleWishlist, 
  toggleComparison,
  clearComparison
} = cartSlice.actions;
export default cartSlice.reducer;
