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
      <body className="min-h-screen bg-bg text-text antialiased font-sans selection:bg-brand-primary/20 selection:text-brand-primary">
        {children}
      </body>
    </html>
  );
}
