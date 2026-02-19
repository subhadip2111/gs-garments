import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Order } from '../types';
import { MOCK_COUPONS, MOCK_COMBO_OFFERS, MOCK_PRODUCTS } from '../constants';

const storedCart = localStorage.getItem('gs_cart');
const storedWishlist = localStorage.getItem('gs_wishlist');
const storedOrders = localStorage.getItem('gs_orders');

interface CartState {
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  appliedCouponId: string | null;
  comboDiscount: number;
}

const initialState: CartState = {
  cart: storedCart ? JSON.parse(storedCart) : [],
  wishlist: storedWishlist ? JSON.parse(storedWishlist) : [],
  orders: storedOrders ? JSON.parse(storedOrders) : [],
  appliedCouponId: null,
  comboDiscount: 0
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
      localStorage.setItem('gs_cart', JSON.stringify(state.cart));
    },
    removeFromCart: (state, action: PayloadAction<{ productId: string; size: string; color: string }>) => {
      const { productId, size, color } = action.payload;
      state.cart = state.cart.filter(
        item => !(item.productId === productId && item.selectedSize === size && item.selectedColor === color)
      );
      localStorage.setItem('gs_cart', JSON.stringify(state.cart));
    },
    updateCartQuantity: (state, action: PayloadAction<{ productId: string; size: string; color: string; delta: number }>) => {
      const { productId, size, color, delta } = action.payload;
      const item = state.cart.find(
        i => i.productId === productId && i.selectedSize === size && i.selectedColor === color
      );
      if (item) {
        item.quantity = Math.max(1, item.quantity + delta);
        localStorage.setItem('gs_cart', JSON.stringify(state.cart));
      }
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (state.wishlist.includes(productId)) {
        state.wishlist = state.wishlist.filter(id => id !== productId);
      } else {
        state.wishlist.push(productId);
      }
      localStorage.setItem('gs_wishlist', JSON.stringify(state.wishlist));
    },
    clearCart: (state) => {
      state.cart = [];
      localStorage.removeItem('gs_cart');
    },
    placeOrder: (state, action: PayloadAction<Order>) => {
      // If order ID exists, update it, otherwise unshift
      const index = state.orders.findIndex(o => o.id === action.payload.id);
      if (index > -1) {
        state.orders[index] = action.payload;
      } else {
        state.orders.unshift(action.payload);
      }
      state.cart = [];
      state.appliedCouponId = null;
      state.comboDiscount = 0;
      localStorage.setItem('gs_orders', JSON.stringify(state.orders));
      localStorage.removeItem('gs_cart');
    },
    cancelOrder: (state, action: PayloadAction<{ orderId: string; reason?: string }>) => {
      const { orderId } = action.payload;
      state.orders = state.orders.filter(o => o.id !== orderId);
      localStorage.setItem('gs_orders', JSON.stringify(state.orders));
    },
    recalculateDiscounts: (state) => {
      // 1. Calculate Base Total (Selling Price)
      const baseTotal = state.cart.reduce((acc, item) => {
        const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
        return acc + (product ? product.price * item.quantity : 0);
      }, 0);

      // 2. Combo Offers (Threshold based)
      let bestCombo = 0;
      MOCK_COMBO_OFFERS.forEach(offer => {
        if (baseTotal >= offer.threshold) {
          bestCombo = Math.max(bestCombo, offer.discount);
        }
      });
      state.comboDiscount = bestCombo;

      // 3. Auto-Coupon (Best fit)
      const totalAfterCombo = baseTotal - bestCombo;
      let bestCouponId = null;
      let maxDiscount = 0;

      MOCK_COUPONS.forEach(coupon => {
        if (totalAfterCombo >= coupon.minPurchase) {
          let currentDiscount = 0;
          if (coupon.discountType === 'percentage') {
            currentDiscount = (totalAfterCombo * coupon.discountValue) / 100;
          } else {
            currentDiscount = coupon.discountValue;
          }

          if (currentDiscount > maxDiscount) {
            maxDiscount = currentDiscount;
            bestCouponId = coupon.id;
          }
        }
      });

      state.appliedCouponId = bestCouponId;
    }
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  toggleWishlist,
  placeOrder,
  cancelOrder,
  clearCart,
  recalculateDiscounts
} = cartSlice.actions;
export default cartSlice.reducer;
