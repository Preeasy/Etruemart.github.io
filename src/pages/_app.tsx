import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { Component, ReactNode, ErrorInfo } from 'react';
import Link from 'next/link';
import { CartProvider } from '@/components/CartContext';
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
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-white rounded-xl p-8 border border-red-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-navy-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-ink-500 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-accent-500 text-white rounded-lg font-bold text-sm hover:bg-accent-600 transition-colors mr-3"
            >
              Refresh Page
            </button>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-ink-200 text-ink-700 rounded-lg font-bold text-sm hover:border-navy-900 transition-colors"
            >
              Back to Home
            </Link>
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
          <Component {...pageProps} />
        </GlobalErrorBoundary>
      </CartProvider>
    </SessionProvider>
  );
}

export default MyApp;
