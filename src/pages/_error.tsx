import { NextPageContext } from 'next';
import Link from 'next/link';

function ErrorPage({ statusCode }: { statusCode: number }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-ink-50">
      <div className="max-w-lg w-full bg-white rounded-xl p-8 border border-ink-200 shadow-sm text-center">
        <div className="w-20 h-20 bg-ink-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-ink-400">{statusCode}</span>
        </div>
        <h1 className="text-xl font-bold text-navy-900 mb-2">
          {statusCode === 404 ? 'Page Not Found' : 'Server Error'}
        </h1>
        <p className="text-sm text-ink-500 mb-6">
          {statusCode === 404
            ? 'The page you are looking for does not exist or has been moved.'
            : 'An error occurred on the server. Please try again later.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-navy-900 text-white rounded-lg font-bold text-sm hover:bg-navy-950 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode ?? 500 : 404;
  return { statusCode };
};

export default ErrorPage;
