
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState, AppDispatch } from './store';
import { setUser } from './store/authSlice';
import { setProducts, setLoadingProducts } from './store/productSlice';
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  toggleWishlist,
  placeOrder,
  clearCart,
  recalculateDiscounts
} from './store/cartSlice';
import {
  setQuickViewProduct,
  setSharedProduct,
  setIsStyleAssistantOpen,
  setUserStyleProfile,
  setUserLocation
} from './store/uiSlice';

import { Product, StyleProfile } from './types';
import { supabase } from './services/supabase';
import { MOCK_PRODUCTS } from './constants';

// --- Components ---
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import QuickViewModal from './components/QuickViewModal';
import StyleAssistant from './components/StyleAssistant';
import OurStory from './pages/OurStory';
import Careers from './pages/Careers';
import Sustainability from './pages/Sustainability';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import TrackOrder from './pages/TrackOrder';

// --- Redux-Backed Hook ---
export const useApp = () => {
  const dispatch = useDispatch<AppDispatch>();

  const cart = useSelector((state: RootState) => state.cart.cart);
  const wishlist = useSelector((state: RootState) => state.cart.wishlist);
  const orders = useSelector((state: RootState) => state.cart.orders);
  const user = useSelector((state: RootState) => state.auth.user);
  const products = useSelector((state: RootState) => state.products.items);
  const isLoadingProducts = useSelector((state: RootState) => state.products.isLoading);
  const quickViewProduct = useSelector((state: RootState) => state.ui.quickViewProduct);
  const sharedProduct = useSelector((state: RootState) => state.ui.sharedProduct);
  const isStyleAssistantOpen = useSelector((state: RootState) => state.ui.isStyleAssistantOpen);
  const userStyleProfile = useSelector((state: RootState) => state.ui.userStyleProfile);
  const userLocation = useSelector((state: RootState) => state.ui.userLocation);
  const appliedCouponId = useSelector((state: RootState) => state.cart.appliedCouponId);
  const comboDiscount = useSelector((state: RootState) => state.cart.comboDiscount);

  return {
    cart, wishlist, orders, user, products, isLoadingProducts, quickViewProduct, sharedProduct,
    isStyleAssistantOpen, userStyleProfile, userLocation,

    // Actions
    addToCart: (productId: string, size: string, color: string, quantity: number) => {
      dispatch(addToCart({ productId, size, color, quantity }));
      dispatch(recalculateDiscounts());
    },
    removeFromCart: (productId: string, size: string, color: string) => {
      dispatch(removeFromCart({ productId, size, color }));
      dispatch(recalculateDiscounts());
    },
    updateCartQuantity: (productId: string, size: string, color: string, delta: number) => {
      dispatch(updateCartQuantity({ productId, size, color, delta }));
      dispatch(recalculateDiscounts());
    },
    toggleWishlist: (productId: string) => dispatch(toggleWishlist(productId)),
    placeOrder: (order: any) => dispatch(placeOrder(order)),
    clearCart: () => {
      dispatch(clearCart());
      dispatch(recalculateDiscounts());
    },
    appliedCouponId,
    comboDiscount,
    setQuickViewProduct: (product: Product | null) => dispatch(setQuickViewProduct(product)),
    setSharedProduct: (product: Product | null) => dispatch(setSharedProduct(product)),
    setIsStyleAssistantOpen: (isOpen: boolean) => dispatch(setIsStyleAssistantOpen(isOpen)),
    setUserStyleProfile: (profile: StyleProfile) => dispatch(setUserStyleProfile(profile)),
    logout: async () => {
      await supabase.auth.signOut();
      dispatch(setUser(null));
    }
  };
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (!error && data?.session) {
        const user = data.session.user;
        dispatch(setUser(user));
        // Hydrate style profile from saved metadata
        if (user.user_metadata?.style_profile) {
          dispatch(setUserStyleProfile(user.user_metadata.style_profile));
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      dispatch(setUser(user));
      if (user?.user_metadata?.style_profile) {
        dispatch(setUserStyleProfile(user.user_metadata.style_profile));
      }
    });

    const fetchProducts = async () => {
      dispatch(setLoadingProducts(true));
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          dispatch(setProducts(data as Product[]));
        } else {
          dispatch(setProducts(MOCK_PRODUCTS));
        }
      } catch (err) {
        dispatch(setProducts(MOCK_PRODUCTS));
      } finally {
        dispatch(setLoadingProducts(false));
      }
    };

    fetchProducts();
    return () => subscription?.unsubscribe?.();
  }, [dispatch]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        dispatch(setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }));
      });
    }
  }, [dispatch]);

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-28">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/auth" element={<Auth />} />

            {/* Freely view products */}
            <Route path="/product/:id" element={<ProductDetail />} />

            {/* Freely manage bag */}
            <Route path="/cart" element={<Cart />} />

            {/* Authenticated routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

            <Route path="/about" element={<OurStory />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/track-order" element={<TrackOrder />} />
          </Routes>
        </main>
        <Footer />
        <QuickViewModal />
        <StyleAssistant />
      </div>
    </Router>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
