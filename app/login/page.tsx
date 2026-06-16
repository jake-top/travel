'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Plane, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@xullu.com', role: 'super_admin' },
  { label: 'Senior Advisor (Gold)', email: 'sarah@xullu.com', role: 'advisor' },
  { label: 'Top Advisor (Platinum)', email: 'james@xullu.com', role: 'advisor' },
  { label: 'New Advisor (Bronze)', email: 'david@xullu.com', role: 'advisor' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      const stored = localStorage.getItem('xullu_user');
      const user = stored ? JSON.parse(stored) : null;
      router.push(user?.role === 'super_admin' ? '/admin' : '/dashboard');
    } else {
      setError('Invalid email address. Use one of the demo accounts below.');
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500 mb-4 shadow-lg">
            <Plane size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Xullu Travel</h1>
          <p className="text-slate-400 mt-1 text-sm">Advisor Network Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 mb-6">Access your advisor dashboard</p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Demo Accounts (any password)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => fillDemo(acc.email)}
                  className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                    {acc.label}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          © 2024 Xullu Travel. All rights reserved.
        </p>
      </div>
    </div>
  );
}
