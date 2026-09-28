import type { Metadata } from 'next';
import { notoSans, notoSansDisplay, ibmPlexMono, newsreader } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'MeghSetu — National Weather Big Data Analytics Platform',
  description: 'National Weather Big Data Analytics Platform | Real-Time Weather Intelligence & Incident Analytics',
  icons: {
    icon: '/brand/meghsetu-emblem.png',
    shortcut: '/brand/meghsetu-emblem.png',
    apple: '/brand/meghsetu-emblem.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoSansDisplay.variable} ${ibmPlexMono.variable} ${newsreader.variable}`}
    >
      <body className="min-h-screen bg-bg text-text antialiased font-sans selection:bg-brand-primary/20 selection:text-brand-primary">
        {children}
      </body>
    </html>
  );
}
