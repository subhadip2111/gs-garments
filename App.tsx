
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
  placeOrder,
  cancelOrder,
  clearCart,
  recalculateDiscounts,
  fetchCart,
  addToCartServer
} from './store/cartSlice';
import { fetchWishlist, toggleWishlistServer, setWishlistFromUser, clearWishlist } from './store/wishlistSlice';
import {
  setQuickViewProduct,
  setSharedProduct,
  setUserLocation
} from './store/uiSlice';

import { Product } from './types';
import { auth, onAuthStateChanged, isConfigured, requestNotificationPermission } from './services/firebase';
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
import PromoCodeDetail from './pages/PromoCodeDetail';


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
import CuponManager from './components/admin/CuponsManager';
import UserManagement from './components/admin/UserManagement';

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

          // Seed wishlist immediately from user object (instant, no API wait)
          if (latestUser?.wishlist && Array.isArray(latestUser.wishlist)) {
            dispatch(setWishlistFromUser(latestUser.wishlist));
          }

          // Then confirm with server (will overwrite with authoritative data)
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
      console.log("[App] 🔔 onAuthStateChanged triggered. FirebaseUser:", firebaseUser?.email, "| AccessToken:", !!accessToken, "| UserState:", !!user);
      
      // CRITICAL FIX: Sync if we have a Firebase user but are missing backend session OR profile
      // We also check if the firebase user is DIFFERENT from the one currently in state (if any)
      const isWrongUser = user && firebaseUser && user.email !== firebaseUser.email;
      
      if (firebaseUser && (!accessToken || !user || isWrongUser)) {
        try {
          if (isWrongUser) console.log("[App] 🔄 User mismatch detected. Current:", user.email, "New:", firebaseUser.email);
          console.log("[App] ⏳ Starting social login synchronization for:", firebaseUser.email);
          
          let fcmToken = null;
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              fcmToken = await requestNotificationPermission();
            }
          }
          const fcmTokensArray = fcmToken ? [fcmToken] : [];
          
          const response = await saveSocialLoginUserData({
            email: firebaseUser.email,
            fullName: firebaseUser.displayName,
            avatar: firebaseUser.photoURL,
            role: "user",
            socialId: firebaseUser.uid,
            fcmTokens: fcmTokensArray,
          });
          
          console.log("[App] ✅ Social login API sync successful. Tokens received.");

          const tokens = {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken
          };
          
          if (response.user) {
            console.log("[App] 📦 Setting user in Redux store:", response.user.email);
            dispatch(setUser(response.user));
          } else {
            console.warn("[App] ⚠️ No user object returned from social-login API.");
          }
          
          console.log("[App] 🔑 Setting tokens in Redux store.");
          dispatch(setToken(tokens));
        } catch (error) {
          console.error("[App] ❌ Social login sync failed:", error);
        }
      } else if (!firebaseUser && !accessToken) {
        console.log("[App] 🚪 No Firebase user and no token. Clearing state.");
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
  }, [dispatch, accessToken, user]);

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
          <Route path="/promocodes/:promoCodeId" element={<PromoCodeDetail />} />
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
            <Route path="/admin/promocodes" element={<CuponManager />} />
            <Route path="/admin/users" element={<UserManagement />} />


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
