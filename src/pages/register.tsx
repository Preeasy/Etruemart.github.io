import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Package, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout';

const Register = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Registration failed');
      return;
    }

    router.push('/login');
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
            <h2 className="text-3xl font-bold text-dark-50">Create your account</h2>
            <p className="mt-2 text-dark-300">Join us and start shopping or selling today!</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl shadow-lg p-8 space-y-6 border border-dark-500/20">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark-200 mb-2">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-dark-400">At least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-200 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-10 pr-10 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-dark-50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-500/30 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-dark-300">
                I agree to the{' '}
                <a href="#" className="text-primary-500 hover:text-primary-400">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-primary-500 hover:text-primary-400">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-3 bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold rounded-lg transition-colors"
            >
              Create account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-300">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-500 font-medium hover:text-primary-400">
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

export const getServerSideProps = () => ({ props: {} });
