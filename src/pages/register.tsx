import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';
import { Package, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout';

const Register = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  if (status === 'loading' || session) {
    return <div className="text-center py-20 text-ink-500">Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/login?registered=1');
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[Register] silent catch:', e);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Register | eTrue Mark</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4 group">
              <Package className="w-10 h-10 text-accent-600 group-hover:text-accent-400 transition-colors" />
              <span className="text-2xl font-bold text-accent-600 group-hover:text-accent-400 transition-colors">eTrue Mark</span>
            </Link>
            <h2 className="text-3xl font-bold text-navy-900">Create your account</h2>
            <p className="mt-2 text-ink-500">Join us and start shopping today!</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-ink-50 rounded-xl p-8 space-y-6 border border-ink-200/20">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-2">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-ink-500">At least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-700 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-10 pr-10 bg-ink-100 border border-ink-200/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-navy-900"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-accent-600 bg-ink-100 border-ink-200/30 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-ink-500">
                I agree to the{' '}
                <Link href="/about" className="text-accent-600 hover:text-accent-600">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/about" className="text-accent-600 hover:text-accent-600">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-accent-500 hover:bg-accent-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-ink-500">
              Already have an account?{' '}
              <Link href="/login" className="text-accent-600 font-medium hover:text-accent-600">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
