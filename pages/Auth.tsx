
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  isConfigured
} from '../services/firebase';
import { AuthMode } from '../types';
import { useAppSelector } from '../store';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  // Redirection target after login
  const from = location.state?.from?.pathname
    || sessionStorage.getItem('authReturnUrl')
    || '/profile';

  // When user+token are set (by onAuthStateChanged in App.tsx), navigate away
  useEffect(() => {
    if (user && accessToken) {
      setGoogleLoading(false);
      setLoading(false);
      sessionStorage.removeItem('authReturnUrl');
      navigate(from, { replace: true });
    }
  }, [user, accessToken, navigate, from]);

  // --- Email/Password Login ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isConfigured) {
        throw new Error("Authentication is currently unavailable.");
      }

      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: fullName });
        }
        // onAuthStateChanged in App.tsx will trigger backend sync + setToken
      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth!, email, password);
        // onAuthStateChanged in App.tsx handles the rest
      } else if (mode === 'forgot-password') {
        await sendPasswordResetEmail(auth!, email);
        alert("Password reset instructions sent to your email.");
        setLoading(false);
      }
      // Don't reset loading for login/signup — the useEffect above redirects when user is set
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : err.code === 'auth/email-already-in-use'
          ? 'This email is already registered. Please log in.'
          : err.code === 'auth/weak-password'
            ? 'Password must be at least 6 characters.'
            : err.message || "An authentication error occurred.";
      setError(msg);
      setLoading(false);
    }
  };

  // --- Google Social Login ---
  const handleGoogleLogin = async () => {
    if (!isConfigured) {
      setError("Social Login is currently unavailable.");
      return;
    }

    sessionStorage.setItem('authReturnUrl', from);
    setGoogleLoading(true);
    setError(null);

    try {
      // signInWithPopup: the COOP console warning is cosmetic and harmless.
      // The sign-in completes successfully, then onAuthStateChanged in App.tsx
      // picks up the Firebase user, syncs with the backend, and sets token+user.
      const result = await signInWithPopup(auth!, googleProvider!);
      console.log("snbdjfskjdfs-->",result )
      // Success! onAuthStateChanged will be triggered → setToken → profile fetch
      // The useEffect above will navigate away once user+accessToken are in Redux.
      if (!result.user) {
        setGoogleLoading(false);
      }
    } catch (err: any) {
      // popup-closed-by-user and cancelled-popup-request are not real errors
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User closed the popup — don't show an error, just reset loading
        setGoogleLoading(false);
        return;
      }
      setError(err.message || "Could not sign in with Google.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 animate-in fade-in duration-1000">
      <div className="text-center mb-12">
        <div className="inline-block px-3 py-1 bg-vogue-50 text-[8px] font-bold uppercase tracking-[0.4em] mb-4 text-vogue-500">
          The GS Collective
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4 tracking-tighter">
          {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join the Collective' : 'Reset Identity'}
        </h1>
        <p className="text-sm text-gray-400 font-light">
          {mode === 'login' ? 'Please enter your credentials' : mode === 'signup' ? 'Create an account to manage your curations' : 'We will send you a secure reset link'}
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest border border-red-100 rounded-sm">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full group flex items-center justify-center space-x-4 border border-gray-100 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-500 shadow-sm relative overflow-hidden rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-spinner animate-spin text-base"></i>
              <span>Connecting to Google...</span>
            </div>
          ) : (
            <>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-[22px] h-[22px]"
              />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        {/* <div className="flex items-center gap-4">
          <div className="flex-grow h-px bg-gray-100"></div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300">or</span>
          <div className="flex-grow h-px bg-gray-100"></div>
        </div> */}

        {/* Email/Password Form */}
        {/* <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full border border-gray-100 px-5 py-4 text-sm focus:border-black focus:outline-none transition-colors rounded-lg"
                placeholder="Your full name"
              />
            </div>
          )}

          {mode !== 'forgot-password' && (
            <>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-100 px-5 py-4 text-sm focus:border-black focus:outline-none transition-colors rounded-lg"
                  placeholder="you@example.com"
                />
              </div>
              <div className="relative">
                <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-100 px-5 py-4 text-sm focus:border-black focus:outline-none transition-colors rounded-lg pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-9 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                </button>
              </div>
            </>
          )}

          {mode === 'forgot-password' && (
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-100 px-5 py-4 text-sm focus:border-black focus:outline-none transition-colors rounded-lg"
                placeholder="you@example.com"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            {loading ? (
              <i className="fa-solid fa-spinner animate-spin text-base"></i>
            ) : (
              mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
            )}
          </button>
        </form> */}

        {/* Mode Toggles
        <div className="text-center space-y-3 pt-4">
          {mode === 'login' && (
            <>
              <button
                onClick={() => { setMode('forgot-password'); setError(null); }}
                className="block w-full text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors"
              >
                Forgot Password?
              </button>
              <p className="text-xs text-gray-400">
                Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setError(null); }} className="font-bold text-black underline underline-offset-4">
                  Sign Up
                </button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(null); }} className="font-bold text-black underline underline-offset-4">
                Sign In
              </button>
            </p>
          )}
          {mode === 'forgot-password' && (
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>Back to Sign In
            </button>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default Auth;