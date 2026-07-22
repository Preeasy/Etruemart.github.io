import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Package, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout';

const Login = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (status === 'loading') {
    return <div className="text-center py-20 text-dark-400">Loading...</div>;
  }

  if (session) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4 group">
              <Package className="w-10 h-10 text-primary-500 group-hover:text-primary-400 transition-colors" />
              <span className="text-2xl font-bold text-primary-500 group-hover:text-primary-400 transition-colors">eTruemart</span>
            </Link>
            <h2 className="text-3xl font-bold text-dark-50">Sign in to your account</h2>
            <p className="mt-2 text-dark-300">Welcome back! Please sign in to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl shadow-lg p-8 space-y-6 border border-dark-500/20">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-200 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-10 pr-10 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-500/30 rounded" />
                <span className="ml-2 text-sm text-dark-300">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-500 hover:text-primary-400">
                Forgot your password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-3 bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold rounded-lg transition-colors"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-300">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary-500 font-medium hover:text-primary-400">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-500/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-dark-900 text-dark-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-dark-800 border border-dark-500/30 rounded-lg hover:bg-dark-700 transition-colors text-dark-200">
                <span className="text-xl">F</span>
                <span className="font-medium">Facebook</span>
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-dark-800 border border-dark-500/30 rounded-lg hover:bg-dark-700 transition-colors text-dark-200">
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

export const getServerSideProps = () => ({ props: {} });
