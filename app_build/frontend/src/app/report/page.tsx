import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/shared/Header';
import CitizenReportForm from '@/components/report/CitizenReportForm';

export const metadata: Metadata = {
  title: 'Submit Weather Report | MeghSetu',
  description: 'Submit ground-truth weather observations and severe weather incident reports to IMD.',
};

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col text-text font-sans">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-10">
        <CitizenReportForm />
      </main>
      <footer className="border-t border-line py-4 px-6 text-center text-xs text-ink-2 font-mono bg-surface">
        MeghSetu · National Weather Big Data Analytics Platform · Ministry of Earth Sciences (MoES)
      </footer>
    </div>
  );
}
