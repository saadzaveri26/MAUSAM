import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileSpreadsheet,
  ShieldCheck,
  ArrowRight,
  Radio,
  Compass,
  Cpu,
  Activity,
} from 'lucide-react';
import Header from '@/components/shared/Header';

export const metadata: Metadata = {
  title: 'MeghSetu — National Weather Big Data Analytics Platform',
  description:
    'National Weather Big Data Analytics Platform · Ministry of Earth Sciences (MoES) — India Meteorological Department. Multi-source weather intelligence, operational incident classification, and GIS situational awareness.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col text-ink-0 selection:bg-brand-primary/20 selection:text-brand-primary font-sans">
      {/* Global Institutional Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section — Strict Layout Discipline: max 2 lines headline, <=20 words subtext, max 2 CTAs */}
        <section className="relative border-b border-line pt-14 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 overflow-hidden bg-bg">
          {/* Subtle radial gradient for depth — Soft Coral Pink Tint */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(236,111,142,0.06),transparent)] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Essential Hero Stack */}
            <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
              {/* Eyebrow / Identity Strip */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 pb-1">
                <div className="h-10 sm:h-11 w-28 sm:w-32 relative shrink-0 bg-surface rounded-md p-1 border border-line shadow-sm">
                  <Image
                    src="/brand/meghsetu-logo.png"
                    alt="MeghSetu National Weather Intelligence Platform"
                    fill
                    sizes="128px"
                    className="object-contain object-left px-2"
                    priority
                  />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line text-xs font-mono text-ink-1 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                  <span>MoES — India Meteorological Department</span>
                </div>
              </div>

              {/* Headline: Max 2 lines desktop */}
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-ink-0 tracking-tight leading-[1.08]" style={{ textWrap: 'balance' } as React.CSSProperties}>
                India&apos;s weather signal, unified from ground truth to radar.
              </h1>

              {/* Subtext: Strictly under 20 words per tasteskill rule */}
              <p className="text-base sm:text-lg text-ink-1 leading-relaxed font-sans max-w-[58ch]">
                Citizen reports, social posts tagged #IMD, and meteorological feeds—ML-classified, verified for credibility, and mapped in real time.
              </p>

              {/* CTAs: 1 primary + max 1 secondary, no wrapping at desktop */}
              <div className="pt-1 flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-md bg-brand-primary hover:bg-brand-secondary text-navy-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-l2 transition-all active:scale-[0.98] whitespace-nowrap"
                >
                  <span>Explore Analytics Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/report"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-md bg-surface hover:bg-surface-alt border border-brand-primary/30 hover:border-brand-primary text-ink-0 font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-l1 whitespace-nowrap"
                >
                  <FileSpreadsheet className="w-4 h-4 text-brand-secondary" />
                  <span>Submit Weather Report</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Live Operational Situational Monitor Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-surface border border-line rounded-lg p-5 shadow-l2 space-y-4">
                {/* Header status bar */}
                <div className="flex items-center justify-between border-b border-line-soft pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-primary" />
                    <span className="font-mono text-xs font-semibold text-ink-0 uppercase tracking-wider">
                      Situational Monitor
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-teal-dim text-teal border border-teal/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                    Live Ingestion Active
                  </span>
                </div>

                {/* IMD 4-Tier Severity Distribution */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-mono text-ink-2">
                    <span>IMD 4-TIER ALERT SEVERITY MATRIX</span>
                    <span className="text-ink-1">248 Active Reports</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-0.5">
                    <div className="bg-white border border-teal/30 rounded p-2 text-center shadow-xs">
                      <span className="block text-xs font-bold font-mono text-teal">114</span>
                      <span className="text-[10px] font-mono text-ink-2 uppercase">Low</span>
                    </div>
                    <div className="bg-white border border-amber/30 rounded p-2 text-center shadow-xs">
                      <span className="block text-xs font-bold font-mono text-amber">82</span>
                      <span className="text-[10px] font-mono text-ink-2 uppercase">Watch</span>
                    </div>
                    <div className="bg-white border border-orange-400/30 rounded p-2 text-center shadow-xs">
                      <span className="block text-xs font-bold font-mono text-orange-400">38</span>
                      <span className="text-[10px] font-mono text-ink-2 uppercase">Alert</span>
                    </div>
                    <div className="bg-white border border-red/30 rounded p-2 text-center shadow-xs">
                      <span className="block text-xs font-bold font-mono text-red">14</span>
                      <span className="text-[10px] font-mono text-ink-2 uppercase">Severe</span>
                    </div>
                  </div>
                </div>

                {/* Live Geographic Incident Clusters */}
                <div className="space-y-2 pt-1 border-t border-line-soft">
                  <span className="text-[11px] font-mono text-ink-2 block">
                    ACTIVE FIELD OBSERVATION CLUSTERS
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-line shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red" />
                        <span className="font-medium text-ink-0">Mumbai MMR</span>
                      </div>
                      <span className="font-mono text-[11px] text-red font-semibold">
                        Urban Flooding · High Water
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-line shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        <span className="font-medium text-ink-0">Bikaner, Rajasthan</span>
                      </div>
                      <span className="font-mono text-[11px] text-orange-400 font-semibold">
                        Dust Storm · Gusts 58km/h
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-line shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber" />
                        <span className="font-medium text-ink-0">Coastal Odisha</span>
                      </div>
                      <span className="font-mono text-[11px] text-amber font-semibold">
                        Convective Thunderstorms
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom link to console */}
                <div className="pt-2 border-t border-line-soft flex items-center justify-between text-xs font-mono">
                  <span className="text-ink-2 text-[11px]">20s Automated Polling</span>
                  <Link
                    href="/dashboard"
                    className="text-brand-primary hover:text-brand-secondary inline-flex items-center gap-1 font-semibold transition-colors"
                  >
                    <span>Launch National GIS Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Institutional Accreditation & Telemetry Band (Directly below hero, not inside it) */}
        <section className="bg-surface border-b border-line py-5 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6 text-xs font-mono">
            <div className="flex items-center gap-3 text-ink-2">
              <span className="text-ink-0 font-semibold uppercase tracking-wider">Accreditation</span>
              <span>·</span>
              <span className="text-ink-1">Ministry of Earth Sciences</span>
              <span>·</span>
              <span className="text-ink-1">India Meteorological Department</span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-ink-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                <span className="text-ink-1 font-semibold">200+</span>
                <span>Validated Incidents</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-primary" />
                <span className="text-ink-1 font-semibold">20s</span>
                <span>Telemetry Cycle</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber" />
                <span className="text-ink-1 font-semibold">4-Tier</span>
                <span>IMD Alert Matrix</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Stage Operational Pipeline — Asymmetric Bento Grid Rhythm */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 border-b border-line bg-bg">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="max-w-2xl">
              <span className="text-xs font-mono text-brand-primary uppercase tracking-wider block mb-1">
                Automated Processing Engine
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-ink-0 tracking-tight leading-tight" style={{ textWrap: 'balance' } as React.CSSProperties}>
                From informal citizen report to authenticated national dispatch
              </h2>
              <p className="text-xs sm:text-sm text-ink-2 mt-2 leading-relaxed font-sans">
                Every citizen report and social dispatch moves through a four-tier automated pipeline before reaching operational disaster management centers.
              </p>
            </div>

            {/* Asymmetric 4-Stage Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Stage 1 */}
              <div className="bg-surface border border-line rounded-lg p-5 shadow-l1 hover:shadow-l2 space-y-3 flex flex-col justify-between transition-all">
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-brand-primary font-semibold flex items-center justify-between">
                    <span>01 · INGEST</span>
                    <Radio className="w-3.5 h-3.5 text-brand-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-base text-ink-0">
                    Multi-Channel Ingestion
                  </h3>
                  <p className="text-xs text-ink-1 leading-relaxed">
                    Stream ingestion pulls citizen mobile reports, public APIs, and social feeds tagged #IMD into a normalized operational queue.
                  </p>
                </div>
                <div className="pt-3 border-t border-line-soft font-mono text-[10px] text-ink-2">
                  Citizen GPS + Geo-Hashtags
                </div>
              </div>

              {/* Stage 2 */}
              <div className="bg-surface border border-line rounded-lg p-5 shadow-l1 hover:shadow-l2 space-y-3 flex flex-col justify-between transition-all">
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-teal font-semibold flex items-center justify-between">
                    <span>02 · CLASSIFY</span>
                    <Cpu className="w-3.5 h-3.5 text-teal" />
                  </div>
                  <h3 className="font-display font-semibold text-base text-ink-0">
                    Event Categorization
                  </h3>
                  <p className="text-xs text-ink-1 leading-relaxed">
                    Automated classification algorithms process incoming reports into rainfall, flooding, storm, or heatwave categories with real-time confidence scores.
                  </p>
                </div>
                <div className="pt-3 border-t border-line-soft font-mono text-[10px] text-ink-2">
                  Automated Incident Classification
                </div>
              </div>

              {/* Stage 3 */}
              <div className="bg-surface border border-line rounded-lg p-5 shadow-l1 hover:shadow-l2 space-y-3 flex flex-col justify-between transition-all">
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-amber font-semibold flex items-center justify-between">
                    <span>03 · VERIFY</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber" />
                  </div>
                  <h3 className="font-display font-semibold text-base text-ink-0">
                    Credibility & Duplication
                  </h3>
                  <p className="text-xs text-ink-1 leading-relaxed">
                    Source trust history calculates reliability. Pattern-matching algorithms cluster repetitive re-shares within spatial-temporal windows.
                  </p>
                </div>
                <div className="pt-3 border-t border-line-soft font-mono text-[10px] text-ink-2">
                  Spatial-Temporal Deduplication
                </div>
              </div>

              {/* Stage 4 */}
              <div className="bg-surface border border-line rounded-lg p-5 shadow-l1 hover:shadow-l2 space-y-3 flex flex-col justify-between transition-all">
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-brand-primary font-semibold flex items-center justify-between">
                    <span>04 · VISUALIZE</span>
                    <Compass className="w-3.5 h-3.5 text-brand-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-base text-ink-0">
                    Spatial GIS Dispatches
                  </h3>
                  <p className="text-xs text-ink-1 leading-relaxed">
                    Verified incidents plot onto interactive GIS maps with IMD 4-tier alert colors, updating operational monitors every 20 seconds.
                  </p>
                </div>
                <div className="pt-3 border-t border-line-soft font-mono text-[10px] text-ink-2">
                  Operational GIS Mapping
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Purpose-Built Operational Capabilities */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 border-b border-line bg-bg">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="max-w-2xl">
              <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-ink-0 tracking-tight leading-tight" style={{ textWrap: 'balance' } as React.CSSProperties}>
                Designed for official disaster response coordinators
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Capability 1 */}
              <div className="bg-surface border border-line rounded-lg p-6 shadow-l1 hover:shadow-l2 space-y-3.5 flex flex-col hover:border-brand-primary/40 transition-all">
                <div className="w-9 h-9 rounded-md bg-white border border-line flex items-center justify-center text-brand-primary shadow-sm">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="font-display font-semibold text-base text-ink-0">
                  Live Geospatial Monitoring
                </h3>
                <p className="text-xs text-ink-1 leading-relaxed">
                  Interactive geospatial situational map. Incident clusters categorized by IMD 4-tier alert severity with geocoded field metadata.
                </p>
                <div className="pt-2 mt-auto text-[11px] font-mono text-brand-primary">
                  <Link href="/dashboard" className="inline-flex items-center gap-1 hover:text-brand-secondary transition-colors font-medium">
                    View Live GIS Map <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Capability 2 */}
              <div className="bg-surface border border-line rounded-lg p-6 shadow-l1 hover:shadow-l2 space-y-3.5 flex flex-col hover:border-brand-primary/40 transition-all">
                <div className="w-9 h-9 rounded-md bg-white border border-line flex items-center justify-center text-amber shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-display font-semibold text-base text-ink-0">
                  Human-in-the-Loop Triage
                </h3>
                <p className="text-xs text-ink-1 leading-relaxed">
                  Dense table-first queue for meteorologists. One-click verify and reject actions that dynamically update source trust ratings and blacklist abusive accounts.
                </p>
                <div className="pt-2 mt-auto text-[11px] font-mono text-brand-primary">
                  <Link href="/admin" className="inline-flex items-center gap-1 hover:text-brand-secondary transition-colors font-medium">
                    Operator Console <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Capability 3 */}
              <div className="bg-surface border border-line rounded-lg p-6 shadow-l1 hover:shadow-l2 space-y-3.5 flex flex-col hover:border-brand-primary/40 transition-all">
                <div className="w-9 h-9 rounded-md bg-white border border-line flex items-center justify-center text-brand-primary shadow-sm">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="font-display font-semibold text-base text-ink-0">
                  Explainable AI Scoring
                </h3>
                <p className="text-xs text-ink-1 leading-relaxed">
                  Plain-language breakdown of model predictions. Provides confidence percentages, source credibility weights, and spatial deduplication links.
                </p>
                <div className="pt-2 mt-auto text-[11px] font-mono text-brand-primary">
                  <Link href="/report" className="inline-flex items-center gap-1 hover:text-brand-secondary transition-colors font-medium">
                    Test Report Classification <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Reliability & Service Standards */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 border-b border-line bg-surface/50">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-ink-0">
                Operational Reliability &amp; Service Standards
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 bg-surface border border-line rounded-lg shadow-sm">
                <span className="text-ink-2 text-[10px] block mb-1 uppercase">Dispatch Latency</span>
                <span className="text-ink-0 font-semibold block">&lt; 20 Seconds</span>
                <span className="text-ink-2 text-[11px]">Real-Time Streaming Sync</span>
              </div>
              <div className="p-4 bg-surface border border-line rounded-lg shadow-sm">
                <span className="text-ink-2 text-[10px] block mb-1 uppercase">Data Verification</span>
                <span className="text-ink-0 font-semibold block">Multi-Source</span>
                <span className="text-ink-2 text-[11px]">Cross-Corroborated Feeds</span>
              </div>
              <div className="p-4 bg-surface border border-line rounded-lg shadow-sm">
                <span className="text-ink-2 text-[10px] block mb-1 uppercase">Alert Indexing</span>
                <span className="text-ink-0 font-semibold block">4-Tier IMD Scale</span>
                <span className="text-ink-2 text-[11px]">Green · Yellow · Orange · Red</span>
              </div>
              <div className="p-4 bg-surface border border-line rounded-lg shadow-sm">
                <span className="text-ink-2 text-[10px] block mb-1 uppercase">Availability</span>
                <span className="text-ink-0 font-semibold block">24 / 7 Readiness</span>
                <span className="text-ink-2 text-[11px]">Mission-Critical Operations</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Institutional Footer */}
      <footer className="py-8 px-4 sm:px-6 bg-surface border-t border-line text-xs font-mono text-ink-2">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-ink-1 font-medium">
              MeghSetu · National Weather Big Data Analytics Platform
            </div>
            <p className="text-[11px] text-ink-2">
              Ministry of Earth Sciences (MoES) — India Meteorological Department
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/dashboard" className="hover:text-ink-0 transition-colors">
              Analytics Dashboard
            </Link>
            <Link href="/report" className="hover:text-ink-0 transition-colors">
              Citizen Report
            </Link>
            <Link href="/admin" className="hover:text-ink-0 transition-colors">
              Operator Portal
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-5 mt-5 border-t border-line-soft text-center text-[10px] text-ink-2">
          Official Weather Intelligence Portal · Ministry of Earth Sciences, Government of India. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
