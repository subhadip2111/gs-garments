
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, RootState, AppDispatch, useAppDispatch, useAppSelector, persistor } from './store';
import { setCurrentUser, setToken, setUser } from './store/authSlice';
import { setProducts, setLoadingProducts } from './store/productSlice';
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  toggleWishlist,
  placeOrder,
  cancelOrder,
  clearCart,
  recalculateDiscounts,
  fetchWishlist,
  fetchCart,
  toggleWishlistServer,
  addToCartServer
} from './store/cartSlice';
import {
  setQuickViewProduct,
  setSharedProduct,
  setUserLocation
} from './store/uiSlice';

import { Product } from './types';
import { auth, onAuthStateChanged, isConfigured } from './services/firebase';
import { getAllProducts } from './api/auth/ProductApi';

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
import Unauthorized from './pages/Unauthorized';
import ErrorPage from './pages/ErrorPage';
import { ToastProvider } from './components/Toast';
import SlowConnectionBanner from './components/SlowConnectionBanner';
import { getProfileDetails, saveSocialLoginUserData } from './api/auth/authApi';
import { PersistGate } from "redux-persist/integration/react";
import AdminDashboard, { AdminHome } from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';


// Admin section managers
import CategoryManager from './components/admin/CategoryManager';
import ProductManager from './components/admin/ProductManager';
import OrderManager from './components/admin/OrderManager';
import BannerManager from './components/admin/BannerManager';
import BrandManager from './components/admin/BrandManager';
import SubcategoryManager from './components/admin/SubcategoryManager';
import ReviewManager from './components/admin/ReviewManager';
import EarningsManager from './components/admin/EarningsManager';
import ProfileManager from './components/admin/ProfileManager';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const returnUrl = sessionStorage.getItem('authReturnUrl');
      const pendingActionStr = sessionStorage.getItem('pendingAction');

      if (pendingActionStr) {
        try {
          const action = JSON.parse(pendingActionStr);
          sessionStorage.removeItem('pendingAction');

          if (action.type === 'WISHLIST_TOGGLE') {
            dispatch(toggleWishlistServer(action.productId));
          } else if (action.type === 'ADD_TO_CART') {
            dispatch(addToCartServer({
              productId: action.productId,
              color: action.color,
              size: action.size,
              quantity: action.quantity
            }));
          }
        } catch (e) {
          console.error("Failed to parse pending action:", e);
        }
      }

      if (returnUrl) {
        sessionStorage.removeItem('authReturnUrl');
        navigate(returnUrl, { replace: true });
      }
    }
  }, [user, navigate, dispatch]);

  // ── Proactive Hash Cleanup ──
  // If the URL contains a legacy hash (e.g., /#/), clean it up immediately.
  useEffect(() => {
    if (window.location.hash.startsWith('#/')) {
      const cleanPath = window.location.hash.replace('#', '');
      window.history.replaceState(null, '', cleanPath || '/');
    }
  }, []);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (accessToken) {
        try {
          const response = await getProfileDetails();
          const latestUser = response.user || response.data || response;
          dispatch(setCurrentUser(latestUser));

          // Proactively sync cart and wishlist on login/app-load
          dispatch(fetchCart());
          dispatch(fetchWishlist());
        } catch (error) {
          console.error("Failed to fetch latest profile:", error);
        }
      }
    };
    fetchLatestProfile();
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (!isConfigured) return;

    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      if (firebaseUser && !accessToken) {
        try {
          const response = await saveSocialLoginUserData({
            email: firebaseUser.email,
            fullName: firebaseUser.displayName,
            avatar: firebaseUser.photoURL,
            role: "user",
            socialId: firebaseUser.uid,
          });

          const tokens = {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken
          };
          dispatch(setToken(tokens));
        } catch (error) {
          console.log("Error syncing user data:", error);
        }
      } else if (!firebaseUser) {
        dispatch(setUser(null));
        dispatch(setToken(null));
      }
    });

    const fetchProductsData = async () => {
      dispatch(setLoadingProducts(true));
      try {
        const response = await getAllProducts();
        const products = response.data || response.items || response;
        if (Array.isArray(products)) {
          dispatch(setProducts(products));
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        dispatch(setLoadingProducts(false));
      }
    };

    fetchProductsData();
    return () => unsubscribe();
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
    <>
      <SlowConnectionBanner />
      <Routes>
        {/* User Routes */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
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
        </Route>

        {/* Admin Routes — AdminDashboard is the layout shell, children use <Outlet /> */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected admin shell */}
          <Route element={<AdminRoute><AdminDashboard /></AdminRoute>}>
            <Route index path="/admin/dashboard" element={<AdminHome />} />
            <Route path="/admin/categories" element={<CategoryManager />} />
            <Route path="/admin/subcategories" element={<SubcategoryManager />} />
            <Route path="/admin/products" element={<ProductManager />} />
            <Route path="/admin/banners" element={<BannerManager />} />
            <Route path="/admin/brands" element={<BrandManager />} />
            <Route path="/admin/orders" element={<OrderManager />} />
            <Route path="/admin/reviews" element={<ReviewManager />} />
            <Route path="/admin/returns" element={<OrderManager />} />
            <Route path="/admin/earnings" element={<EarningsManager />} />
            <Route path="/admin/profile" element={<ProfileManager />} />
            {/* Catch-all: redirect /admin/* → /admin/dashboard */}
            <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>

        {/* Catch-all route for error page */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
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
        <PersistGate loading={null} persistor={persistor}>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </PersistGate>
      </ToastProvider>
    </Provider>
  );
}
