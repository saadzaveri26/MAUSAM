'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, ArrowRight, AlertCircle, CheckCircle2, Home } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please provide the operator admin token.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Access denied: invalid token');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(redirectPath);
        router.refresh();
      }, 400);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 text-text font-sans">
      {/* Top Nav: Back to Home & Dashboard */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-line text-xs font-medium text-ink-1 hover:text-brand-primary hover:border-brand-primary/40 transition-all shadow-xs"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-xs text-ink-2 hover:text-brand-primary transition-colors"
        >
          Public Dashboard &rarr;
        </Link>
      </div>

      {/* Container with UX4G tokens: rounded-lg (12px), shadow-l2, line border */}
      <div className="w-full max-w-md bg-surface border border-line rounded-lg shadow-l2 p-6 sm:p-8">
        {/* Header with operational authority badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-md bg-amber-dim border border-amber/30 flex items-center justify-center text-amber">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg text-ink-0 leading-tight">
              MeghSetu Admin Gate
            </h1>
            <p className="text-xs text-ink-2 mt-0.5 font-medium">
              RESTRICTED OPERATIONAL CONSOLE
            </p>
          </div>
        </div>

        <p className="text-xs text-ink-1 mb-6 leading-relaxed">
          Authorized disaster management operators only. Enter the shared administrative key to access report verification, credibility queues, and source trust management.
        </p>

        {error && (
          <div className="mb-5 p-3 rounded-md bg-red-dim border border-red/40 flex items-start gap-2.5 text-xs text-red">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 rounded-md bg-teal-dim border border-teal/40 flex items-center gap-2.5 text-xs text-teal">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Identity confirmed. Loading operator queue…</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="admin-token"
              className="block text-xs font-semibold text-ink-1 uppercase tracking-wider mb-2"
            >
              Operator Security Key
            </label>
            <input
              id="admin-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="••••••••••••••••••••••••"
              disabled={loading || success}
              autoFocus
              className="w-full bg-white border border-line rounded-md px-3.5 py-2.5 text-sm text-ink-0 placeholder-ink-2 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-brand-primary hover:bg-brand-secondary active:scale-[0.98] text-navy-950 font-semibold text-sm py-2.5 px-4 rounded-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-l2"
          >
            {loading ? (
              <span className="inline-block animate-pulse text-xs">Authenticating…</span>
            ) : (
              <>
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-1 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-ink-2 hover:text-brand-primary transition-colors py-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </form>

        <div className="mt-8 pt-4 border-t border-line-soft flex items-center justify-between text-[11px] text-ink-2 font-medium">
          <span>Authorized Personnel Only</span>
          <span className="text-amber/80">Secured Session</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-line rounded-lg p-8 text-center">
            <span className="text-xs text-ink-2">Loading authentication gate…</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

