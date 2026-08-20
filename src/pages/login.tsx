import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Package, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout';

const Login = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  if (status === 'loading') {
    return <div className="text-center py-20 text-ink-500">Loading...</div>;
  }

  if (session) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        router.push('/');
      }
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[Login] silent catch:', e);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Sign In | eTrue Mart</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4 group">
              <Package className="w-10 h-10 text-accent-600 group-hover:text-accent-400 transition-colors" />
              <span className="text-2xl font-bold text-accent-600 group-hover:text-accent-400 transition-colors">eTrue Mart</span>
            </Link>
            <h2 className="text-3xl font-bold text-navy-900">Sign in to your account</h2>
            <p className="mt-2 text-ink-500">Welcome back! Please sign in to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-ink-50 rounded-xl p-8 space-y-6 border border-ink-200/20">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-10 pr-10 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-accent-600 bg-ink-100 border-ink-200/30 rounded" />
                <span className="ml-2 text-sm text-ink-500">Remember me</span>
              </label>
              <a href="#" className="text-sm text-accent-600 hover:text-accent-600">
                Forgot your password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-accent-500 hover:bg-accent-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-ink-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-accent-600 font-medium hover:text-accent-600">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink-200/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-ink-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-ink-50 border border-ink-200/30 rounded-lg hover:bg-ink-50 transition-colors text-ink-700">
                <span className="text-xl">F</span>
                <span className="font-medium">Facebook</span>
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-ink-50 border border-ink-200/30 rounded-lg hover:bg-ink-50 transition-colors text-ink-700">
                <span className="text-xl">G</span>
                <span className="font-medium">Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
