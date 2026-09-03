import { SessionProvider } from 'next-auth/react';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1F3A2C',
};
import type { AppProps } from 'next/app';
import { Component, ReactNode, ErrorInfo } from 'react';
import Link from 'next/link';
import { CartProvider } from '@/components/CartContext';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import Head from 'next/head';
import '../styles/globals.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class GlobalErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GlobalErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-sand-50">
          <div className="max-w-lg w-full bg-white rounded-3xl p-10 border border-sand-200 shadow-card-lg text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gold-100 to-coral-100 flex items-center justify-center shadow-inner">
              <svg className="w-10 h-10 text-coral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-bold text-navy-900 mb-3">Oops, Something Went Wrong</h1>
            <p className="text-ink-500 mb-8 max-w-md mx-auto">
              An unexpected error occurred while loading this page. Please try refreshing or return to the homepage.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => window.location.reload()}
                className="btn-cta btn-lg"
              >
                ↻ Refresh Page
              </button>
              <Link href="/" className="btn-outline btn-lg">
                🏛 Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <CartProvider>
        <GlobalErrorBoundary>
          <Head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          </Head>
          <Component {...pageProps} />
          <WhatsAppFloat />
        </GlobalErrorBoundary>
      </CartProvider>
    </SessionProvider>
  );
}

export default MyApp;
