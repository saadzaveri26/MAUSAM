import type { Metadata } from 'next';
import { notoSans, notoSansDisplay, ibmPlexMono } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'MeghSetu — National Weather Big Data Analytics Platform',
  description: 'Ministry of Earth Sciences — India Meteorological Department | National Weather Big Data Analytics Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoSansDisplay.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen bg-navy-950 text-ink-0 antialiased font-sans selection:bg-amber-dim selection:text-amber">
        {children}
      </body>
    </html>
  );
}
