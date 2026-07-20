import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SessionProvider } from '@/components/providers/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'eTruemart - Cross-border Shopping Platform',
    template: '%s | eTruemart',
  },
  description: 'Shop quality products with fast shipping and earn commissions by sharing.',
  keywords: ['cross-border shopping', 'wholesale', 'affiliate', 'fast shipping'],
  authors: [{ name: 'eTruemart' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://etruemart.com',
    siteName: 'eTruemart',
    title: 'eTruemart - Cross-border Shopping Platform',
    description: 'Shop quality products with fast shipping and earn commissions by sharing.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'eTruemart',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'eTruemart - Cross-border Shopping Platform',
    description: 'Shop quality products with fast shipping and earn commissions by sharing.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}