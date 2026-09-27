import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/shared/Header';
import AnalyticsDashboardView from '@/components/dashboard/AnalyticsDashboardView';

export const metadata: Metadata = {
  title: 'Analytics Dashboard | MeghSetu',
  description: 'National weather incident situational awareness, multi-source event telemetry, and spatial GIS mapping.',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col text-text font-sans">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnalyticsDashboardView />
      </main>
      <footer className="border-t border-line py-4 px-6 text-center text-xs text-ink-2 bg-surface">
        MeghSetu · National Weather Big Data Analytics Platform
      </footer>
    </div>
  );
}
