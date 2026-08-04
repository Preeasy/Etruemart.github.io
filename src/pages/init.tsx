import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

const InitPage = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = router.query.token as string;
    if (token) {
      initialize(token);
    }
  }, [router.query.token]);

  const initialize = async (token?: string) => {
    setStatus('loading');
    setMessage('Initializing database...');

    try {
      const res = await fetch('/api/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-init-token': token } : {}),
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(
          data.alreadyInitialized
            ? `Database already initialized with ${data.users} users. Ready to login!`
            : `Database initialized successfully! Created ${data.users} users, ${data.categories} categories, ${data.products} products.`
        );
      } else {
        setStatus('error');
        setMessage(`Error: ${data.error || 'Unknown'}`);
      }
    } catch (err) {
      setStatus('error');
      setMessage(`Network error: ${(err as Error).message}`);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-lg w-full bg-white rounded-xl p-8 border border-ink-200 shadow-sm">
          <h1 className="text-2xl font-bold text-navy-900 mb-4">Database Initialization</h1>
          
          {status === 'idle' && (
            <div>
              <p className="text-ink-600 mb-6">
                Click the button below to initialize the database with default accounts and products.
              </p>
              <button
                onClick={() => initialize()}
                className="w-full bg-accent-500 hover:bg-accent-400 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Initialize Database
              </button>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center py-8">
              <div className="animate-spin w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-ink-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700 text-center mb-4">{message}</p>
              <div className="bg-ink-50 rounded-lg p-4 text-sm">
                <p className="font-bold text-navy-900 mb-2">Login Account:</p>
                <p className="text-ink-700">📧 yeatrusourcing@gmail.com (Admin)</p>
                <p className="text-ink-400 text-xs mt-1">Use the password configured in your environment.</p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full mt-6 bg-navy-900 hover:bg-navy-950 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-700 text-center mb-4">{message}</p>
              <button
                onClick={() => initialize()}
                className="w-full bg-accent-500 hover:bg-accent-400 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InitPage;
