import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { CartItem, Order, Product } from '../types';
import { MOCK_COUPONS, MOCK_COMBO_OFFERS } from '../constants';
import * as cartApi from '../api/auth/cartApi';
import * as wishlistApi from '../api/auth/wishlistApi';

const storedCart = localStorage.getItem('gs_cart');
const storedWishlist = localStorage.getItem('gs_wishlist');
const storedOrders = localStorage.getItem('gs_orders');

// --- Async Thunks ---

export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const response = await cartApi.getCart();
  return response.data || response;
});

export const addToCartServer = createAsyncThunk(
  'cart/addToCartServer',
  async (payload: { productId: string; quantity: number; color: string; size: string }) => {
    const response = await cartApi.addToCartApi(payload);
    return response.data || response;
  }
);

export const updateQuantityServer = createAsyncThunk(
  'cart/updateQuantityServer',
  async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
    const response = await cartApi.updateCartQuantityApi(itemId, quantity);
    return response.data || response;
  }
);

export const removeFromCartServer = createAsyncThunk(
  'cart/removeFromCartServer',
  async (itemId: string) => {
    await cartApi.removeFromCartApi(itemId);
    return itemId;
  }
);

export const clearCartServer = createAsyncThunk('cart/clearCartServer', async () => {
  await cartApi.clearCartApi();
});

export const fetchWishlist = createAsyncThunk('cart/fetchWishlist', async () => {
  const response = await wishlistApi.getWishlist();
  return response.data || response;
});

export const toggleWishlistServer = createAsyncThunk(
  'cart/toggleWishlistServer',
  async (productId: string) => {
    const response = await wishlistApi.toggleWishlistApi(productId);
    return { productId, data: response.data || response };
  }
);

interface CartState {
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  appliedCouponId: string | null;
  comboDiscount: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: storedCart ? JSON.parse(storedCart) : [],
  wishlist: storedWishlist ? JSON.parse(storedWishlist) : [],
  orders: storedOrders ? JSON.parse(storedOrders) : [],
  appliedCouponId: null,
  comboDiscount: 0,
  loading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Keep local ones for non-logged-in users if needed or optimistic UI
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
    recalculateDiscounts: (state, action: PayloadAction<Product[]>) => {
      const products = action.payload;
      const baseTotal = state.cart.reduce((acc, item) => {
        const product = products.find(p => (p._id || p.id) === item.productId);
        return acc + (product ? product.price * item.quantity : 0);
      }, 0);

      let bestCombo = 0;
      MOCK_COMBO_OFFERS.forEach(offer => {
        if (baseTotal >= offer.threshold) {
          bestCombo = Math.max(bestCombo, offer.discount);
        }
      });
      state.comboDiscount = bestCombo;

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
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        localStorage.setItem('gs_cart', JSON.stringify(state.cart));
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      // Fetch Wishlist
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload.map((item: any) => item.productId?._id || item.productId || item);
        localStorage.setItem('gs_wishlist', JSON.stringify(state.wishlist));
      })
      // Toggle Wishlist
      .addCase(toggleWishlistServer.fulfilled, (state, action) => {
        const { productId } = action.payload;
        if (state.wishlist.includes(productId)) {
          state.wishlist = state.wishlist.filter(id => id !== productId);
        } else {
          state.wishlist.push(productId);
        }
        localStorage.setItem('gs_wishlist', JSON.stringify(state.wishlist));
      })
      // Server-side Cart Actions
      .addCase(addToCartServer.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.cart = action.payload;
        }
        localStorage.setItem('gs_cart', JSON.stringify(state.cart));
      })
      .addCase(updateQuantityServer.fulfilled, (state, action) => {
        // If API returns item or cart, update accordingly. 
        // For simplicity, just reload the cart or use returned cart if available.
        if (Array.isArray(action.payload)) {
          state.cart = action.payload;
        }
        localStorage.setItem('gs_cart', JSON.stringify(state.cart));
      })
      .addCase(removeFromCartServer.fulfilled, (state, action) => {
        const itemId = action.payload;
        state.cart = state.cart.filter(item => item.id !== itemId && item._id !== itemId);
        localStorage.setItem('gs_cart', JSON.stringify(state.cart));
      })
      .addCase(clearCartServer.fulfilled, (state) => {
        state.cart = [];
        localStorage.removeItem('gs_cart');
      });
  }
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
