import Link from 'next/link';
import Head from 'next/head';
import { Package, ArrowRight, Search } from 'lucide-react';
import Layout from '@/components/Layout';

const NotFound = () => (
  <Layout>
    <Head>
      <title>Page Not Found | eTrue Mark</title>
      <meta name="robots" content="noindex, follow" />
    </Head>
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-20 lg:py-28">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-xl bg-ink-100 flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-ink-300" />
        </div>
        <p className="text-5xl font-display font-bold text-navy-900 mb-2">404</p>
        <h1 className="text-xl font-bold text-navy-800 mb-2">Page Not Found</h1>
        <p className="text-ink-500 text-sm mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-950 text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors"
          >
            Back to Home <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 border border-ink-200 hover:border-navy-900 hover:text-navy-900 text-ink-600 px-6 py-3 rounded-lg font-bold text-sm transition-colors"
          >
            <Search className="w-4 h-4" /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  </Layout>
);

export default NotFound;
