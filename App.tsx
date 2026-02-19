
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, RootState, AppDispatch, useAppDispatch, useAppSelector } from './store';
import { setUser } from './store/authSlice';
import { setProducts, setLoadingProducts } from './store/productSlice';
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  toggleWishlist,
  placeOrder,
  cancelOrder,
  clearCart,
  recalculateDiscounts
} from './store/cartSlice';
import {
  setQuickViewProduct,
  setSharedProduct,
  setUserLocation
} from './store/uiSlice';

import { Product } from './types';
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
import OurStory from './pages/OurStory';
import Careers from './pages/Careers';
import Sustainability from './pages/Sustainability';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import TrackOrder from './pages/TrackOrder';
import { ToastProvider } from './components/Toast';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (!error && data?.session) {
        const user = data.session.user;
        dispatch(setUser(user));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      dispatch(setUser(user));
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
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Provider>
  );
}
