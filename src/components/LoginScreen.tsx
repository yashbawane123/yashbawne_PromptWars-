import React, { useState } from 'react';
import {
  Compass,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  EyeOff,
  AlertTriangle,
  Quote,
  Zap,
} from 'lucide-react';

interface LoginScreenProps {
  onSignIn: () => Promise<void>;
  onExploreDemo: () => void;
  isLoadingDemo?: boolean;
}

export function LoginScreen({
  onSignIn,
  onExploreDemo,
  isLoadingDemo = false,
}: LoginScreenProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleGoogleClick = async () => {
    setIsSigningIn(true);
    setLoginError('');
    try {
      await onSignIn();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setLoginError(
        err?.message || 'Could not complete Google Sign-in. Please try again or test the interactive demo.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-950 text-stone-100">
      <div className="w-full max-w-lg space-y-8">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-2xl shadow-amber-500/20 mb-2">
            <div className="w-full h-full bg-stone-950 rounded-[22px] flex items-center justify-center">
              <Compass className="w-9 h-9 text-amber-400" />
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-100">
            The Blind Spot
          </h1>

          <p className="text-sm sm:text-base text-stone-400 max-w-sm mx-auto font-sans leading-relaxed">
            An AI thinking partner that illuminates hidden assumptions, overlooked factors, and contradictions in your reasoning.
          </p>

          <div className="inline-block pt-1">
            <span className="font-serif italic text-sm text-amber-300/90 border-b border-amber-500/30 pb-0.5">
              "It will never decide for you."
            </span>
          </div>
        </div>

        {/* Core Principles Card */}
        <div className="rounded-2xl bg-stone-900/80 border border-stone-800 p-6 space-y-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            The Constitutional Rules
          </div>

          <div className="space-y-3 text-xs text-stone-300">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-stone-950 border border-stone-800 text-stone-400 flex items-center justify-center shrink-0 font-mono text-[10px]">
                1
              </span>
              <p>
                <strong className="text-stone-100 font-medium">0 Advice Guarantee:</strong>{' '}
                No "you should", no recommendations, no judgment. Only observations, test questions, and verification steps.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-stone-950 border border-stone-800 text-stone-400 flex items-center justify-center shrink-0 font-mono text-[10px]">
                2
              </span>
              <p>
                <strong className="text-stone-100 font-medium">Two-Layer Guardrail:</strong>{' '}
                Every inference is scanned and verified before display. Prescriptive clauses are audited and rewritten.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-stone-950 border border-stone-800 text-stone-400 flex items-center justify-center shrink-0 font-mono text-[10px]">
                3
              </span>
              <p>
                <strong className="text-stone-100 font-medium">Private Sandbox:</strong> Each
                user's decisions and reasoning maps are strictly isolated to their own authenticated session.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {loginError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs">
              {loginError}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleClick}
            disabled={isSigningIn}
            className="w-full py-3.5 px-4 rounded-xl bg-stone-100 hover:bg-white text-stone-900 font-mono text-xs font-semibold tracking-wide transition flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isSigningIn ? (
              <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.59H1.26C.46 8.19 0 10.04 0 12s.46 3.81 1.26 5.41l4.02-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.64 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>

          {/* Interactive Demo Loader Button */}
          <button
            onClick={onExploreDemo}
            disabled={isLoadingDemo}
            type="button"
            className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-stone-200 font-mono text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md group"
          >
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>
              {isLoadingDemo ? 'Loading Internship Case...' : 'Explore Demo: 6-Month Tech Internship'}
            </span>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer philosophy */}
        <div className="text-center text-[11px] font-mono text-stone-400">
          Built for deep contemplation • Calibrate your blind spots before committing
        </div>
      </div>
    </div>
  );
}
