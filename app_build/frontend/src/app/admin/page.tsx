import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth';
import Header from '@/components/shared/Header';
import AdminConsoleView from '@/components/admin/AdminConsoleView';

export const metadata: Metadata = {
  title: 'Admin Verification Console | MeghSetu',
  description: 'Privileged verification queue, ground-truth auditing, and source trust management for IMD operators.',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    redirect('/admin/login?redirect=/admin');
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AdminConsoleView />
      </main>
      <footer className="border-t border-line py-4 px-6 text-center text-xs text-ink-2 font-mono">
        MeghSetu · Privileged Disaster Management Verification Console · Government of India
      </footer>
    </div>
  );
}
