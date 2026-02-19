
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { AuthMode } from '../types';
import { useApp } from '../App';

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
  const { user } = useApp();

  // Redirection target after login
  const from = location.state?.from?.pathname || '/profile';

  // If user is already logged in, redirect away from auth page
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (signUpError) throw signUpError;
        alert("Verification email sent! Please check your inbox to confirm your membership.");
      } else if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else if (mode === 'forgot-password') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        if (resetError) throw resetError;
        alert("Password reset instructions sent to your email.");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
       options: { scopes: "",},
      });

      if (authError) {
        if (authError.message.includes("provider is not enabled")) {
          throw new Error("Google Login is not enabled. Please use email/password for the collective.");
        }
        throw authError;
      }
    } catch (err: any) {
      setError(err.message || "Could not initialize Google authentication.");
      setGoogleLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        <div className="mb-8 p-4 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest border border-red-100 rounded-sm animate-shake">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
        </div>
      )}

      <div className="space-y-8">
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full group flex items-center justify-center space-x-4 border border-gray-100 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-500 shadow-sm relative overflow-hidden"
        >
          {googleLoading ? (
            <i className="fa-solid fa-spinner animate-spin text-lg"></i>
          ) : (
            <>
              <i className="fa-brands fa-google text-lg"></i>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-6 text-[8px] text-gray-300 uppercase font-bold tracking-[0.5em]">OR</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-b border-gray-200 focus:border-black outline-none py-3 transition-all text-sm font-medium"
                placeholder="e.g. Aditi Sharma"
              />
            </div>
          )}

          <div className="group">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gray-200 focus:border-black outline-none py-3 transition-all text-sm font-medium"
              placeholder="email@example.com"
            />
          </div>

          {mode !== 'forgot-password' && (
            <div className="group relative">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b border-gray-200 focus:border-black outline-none py-3 pr-10 transition-all text-sm font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors px-2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('forgot-password')}
                className="text-[9px] uppercase font-bold tracking-widest text-vogue-500 hover:text-black underline underline-offset-4"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 disabled:opacity-30 shadow-xl"
          >
            {loading && <i className="fa-solid fa-spinner animate-spin"></i>}
            <span>{mode === 'login' ? 'Authenticate' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</span>
          </button>
        </form>
      </div>

      <div className="mt-16 text-center">
        {mode === 'login' ? (
          <p className="text-xs text-gray-500 font-light">
            New to the collective? {' '}
            <button onClick={() => setMode('signup')} className="font-bold text-black border-b border-black pb-0.5 hover:text-vogue-500 transition-colors">Apply for Membership</button>
          </p>
        ) : (
          <p className="text-xs text-gray-500 font-light">
            Already registered? {' '}
            <button onClick={() => setMode('login')} className="font-bold text-black border-b border-black pb-0.5 hover:text-vogue-500 transition-colors">Sign In</button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;
