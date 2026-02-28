import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { CartItem, Order, Product } from '../types';
import { MOCK_COUPONS, MOCK_COMBO_OFFERS } from '../constants';
import * as cartApi from '../api/auth/cartApi';
import * as wishlistApi from '../api/auth/wishlistApi';
import * as orderApi from '../api/auth/orderApi';

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

// --- Order Thunks ---

export const fetchOrders = createAsyncThunk('cart/fetchOrders', async () => {
  const response = await orderApi.getMyOrders();
  return response.data || response || [];
});

export const createOrderServer = createAsyncThunk(
  'cart/createOrderServer',
  async (payload: Parameters<typeof orderApi.createOrder>[0]) => {
    const response = await orderApi.createOrder(payload);
    return response.data || response;
  }
);

export const cancelOrderServer = createAsyncThunk(
  'cart/cancelOrderServer',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderApi.cancelOrder(orderId);
      return { orderId, data: response.data || response };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Cannot cancel this order.');
    }
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

const normalizeCartItems = (items: any[]): CartItem[] => {
  return items.map(item => ({
    ...item,
    productId: item.productId || item.product?.id || item.product?._id,
    selectedSize: item.selectedSize || item.size,
    selectedColor: item.selectedColor || item.color,
    product: item.product
  }));
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
        const payload = action.payload;
        let cartItems = [];
        if (Array.isArray(payload)) {
          cartItems = payload;
        } else if (payload?.cart && Array.isArray(payload.cart)) {
          cartItems = payload.cart;
        } else if (payload?.items && Array.isArray(payload.items)) {
          cartItems = payload.items;
        } else if (payload?.data && Array.isArray(payload.data)) {
          cartItems = payload.data;
        } else if (payload?.cart?.items && Array.isArray(payload.cart.items)) {
          cartItems = payload.cart.items;
        } else if (payload?.results && Array.isArray(payload.results)) {
          cartItems = payload.results;
        }
        state.cart = normalizeCartItems(cartItems);
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
        const payload = action.payload;
        let cartItems = state.cart;
        if (Array.isArray(payload)) {
          cartItems = payload;
        } else if (payload?.cart && Array.isArray(payload.cart)) {
          cartItems = payload.cart;
        } else if (payload?.items && Array.isArray(payload.items)) {
          cartItems = payload.items;
        } else if (payload?.data && Array.isArray(payload.data)) {
          cartItems = payload.data;
        } else if (payload?.cart?.items && Array.isArray(payload.cart.items)) {
          cartItems = payload.cart.items;
        } else if (payload?.results && Array.isArray(payload.results)) {
          cartItems = payload.results;
        }
        state.cart = normalizeCartItems(cartItems);
        localStorage.setItem('gs_cart', JSON.stringify(state.cart));
      })
      .addCase(updateQuantityServer.fulfilled, (state, action) => {
        const payload = action.payload;
        let cartItems = state.cart;
        if (Array.isArray(payload)) {
          cartItems = payload;
        } else if (payload?.cart && Array.isArray(payload.cart)) {
          cartItems = payload.cart;
        } else if (payload?.items && Array.isArray(payload.items)) {
          cartItems = payload.items;
        } else if (payload?.data && Array.isArray(payload.data)) {
          cartItems = payload.data;
        } else if (payload?.cart?.items && Array.isArray(payload.cart.items)) {
          cartItems = payload.cart.items;
        } else if (payload?.results && Array.isArray(payload.results)) {
          cartItems = payload.results;
        }
        state.cart = normalizeCartItems(cartItems);
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
      })
      // Order Thunks
      .addCase(fetchOrders.fulfilled, (state, action) => {
        const raw = action.payload;
        const orders = Array.isArray(raw) ? raw : (raw?.orders || raw?.data || raw?.results || []);
        state.orders = Array.isArray(orders) ? orders.map((o: any) => ({
          ...o,
          total: o.total ?? o.totalAmount ?? 0,
          date: o.date ?? (o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '')
        })) : [];
      })
      .addCase(createOrderServer.fulfilled, (state, action) => {
        const order = action.payload?.order || action.payload;
        if (order) {
          const normalizedOrder = {
            ...order,
            total: order.total ?? order.totalAmount ?? 0,
            date: order.date ?? (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }))
          };
          state.orders.unshift(normalizedOrder);
        }
        // Cart is cleared server-side; clear locally too
        state.cart = [];
        localStorage.removeItem('gs_cart');
      })
      .addCase(cancelOrderServer.fulfilled, (state, action) => {
        const { orderId } = action.payload;
        const idx = state.orders.findIndex((o: any) => (o._id || o.id) === orderId);
        if (idx !== -1) {
          state.orders[idx] = { ...state.orders[idx], status: 'Cancelled' };
        }
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
