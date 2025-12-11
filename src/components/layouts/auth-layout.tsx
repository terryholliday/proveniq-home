'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProveniqLogo } from '../onboarding/ProveniqLogo';
import { login, signup } from '../../services/mockAuthService';
import { User, AppView } from '../../lib/types';
import { Timestamp } from 'firebase/firestore';
import { Loader2, ArrowRight, Mail, Lock, User as UserIcon } from 'lucide-react';

// --- Social Icons ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.648 0-2.928 1.67-2.928 3.403v1.518h3.949l-.542 3.667h-3.407v7.98H9.101Z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5 text-black fill-current" viewBox="0 0 24 24">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.127 3.675-.548 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.415-2.376-2.003-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
  </svg>
);

// --- Auth Component ---
interface AuthProps {
  onLoginSuccess?: (user: User) => void;
  onNavigateToLegal?: (view: AppView) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess, onNavigateToLegal }) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSuccess = (user: User) => {
    if (onLoginSuccess) {
      onLoginSuccess(user);
    } else {
      // Default behavior if no callback provided (e.g. when used as layout)
      router.push('/dashboard');
    }
  };

  const handleLegalNav = (view: AppView) => {
    if (onNavigateToLegal) {
      onNavigateToLegal(view);
    } else {
      router.push(`/legal/${view}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await login(email, password);
      } else {
        if (!agreedToTerms) {
          throw new Error("You must agree to the Terms of Service to create an account.");
        }
        user = await signup(name, email, password);
      }
      handleSuccess(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An authentication error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setError('');
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user: User = {
        id: `${provider.toLowerCase()}_${Date.now()}`,
        uid: `${provider.toLowerCase()}_${Date.now()}`,
        email: `user@${provider.toLowerCase()}.com`,
        firstName: `${provider}`,
        lastName: 'User',
        tier: 'free',
        subscriptionStatus: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        onboardingCompleted: true,
        isPremium: false,
        aiAccess: true,
        trainingAccess: true,
      };
      // In a real app, we'd verify the token here
      handleSuccess(user);
    } catch (e) {
      console.error(e);
      setError("Social login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex justify-center">
            <ProveniqLogo size={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Enter your credentials to access your inventory.' : 'Start protecting your assets today.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-ne transition-all text-gray-900 placeholder-gray-400"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-3 mt-2">
              {/* Legal Terms Checkbox */}
              <div className="flex items-start gap-3 px-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 shrink-0"
                />
                <label htmlFor="terms" className="text-xs text-gray-500">
                  I agree to the{' '}
                  <button type="button" onClick={() => handleLegalNav('legal-terms')} className="text-indigo-600 hover:underline">Terms of Service</button>
                  ,{' '}
                  <button type="button" onClick={() => handleLegalNav('legal-privacy')} className="text-indigo-600 hover:underline">Privacy Policy</button>
                  , and{' '}
                  <button type="button" onClick={() => handleLegalNav('legal-eula')} className="text-indigo-600 hover:underline">End User License Agreement</button>.
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => handleSocialLogin('Google')} className="py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex justify-center"><GoogleIcon /></button>
          <button onClick={() => handleSocialLogin('Facebook')} className="py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex justify-center"><FacebookIcon /></button>
          <button onClick={() => handleSocialLogin('Apple')} className="py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex justify-center"><AppleIcon /></button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-indigo-600 hover:underline ml-1">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

      </div>

      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
        <button onClick={() => handleLegalNav('legal-terms')} className="hover:text-gray-600">Terms</button>
        <span>&bull;</span>
        <button onClick={() => handleLegalNav('legal-privacy')} className="hover:text-gray-600">Privacy</button>
      </div>
    </div>
  );
};

export default Auth;
