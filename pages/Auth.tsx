
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { AuthMode } from '../types';
import { useAppSelector } from '../store';
import { SocialIcon } from 'react-social-icons'

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
        options: {
          redirectTo: window.location.origin,
        },
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
          className="w-full group flex items-center justify-center space-x-4 border border-gray-100 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-500 shadow-sm relative overflow-hidden rounded-xl"
        >
          {googleLoading ? (
            <i className="fa-solid fa-spinner animate-spin text-lg"></i>
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


      </div>


    </div>
  );
};

export default Auth;
