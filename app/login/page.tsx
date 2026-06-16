'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, AlertCircle, Plane, TrendingUp, Award, Shield, ArrowRight, Sparkles } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@xullu.com', role: 'Full Platform Access', color: 'from-indigo-500 to-purple-600', icon: Shield },
  { label: 'Platinum Advisor', email: 'james@xullu.com', role: '15% Commission Rate', color: 'from-violet-500 to-indigo-500', icon: Sparkles },
  { label: 'Gold Advisor', email: 'sarah@xullu.com', role: '12% Commission Rate', color: 'from-amber-500 to-yellow-400', icon: Award },
  { label: 'Bronze Advisor', email: 'david@xullu.com', role: '8% Commission Rate', color: 'from-amber-700 to-amber-600', icon: TrendingUp },
];

const FEATURES = [
  { icon: TrendingUp, title: 'Real-time Commission Tracking', desc: 'Monitor earnings with live tier progression' },
  { icon: Award, title: 'Multi-tier Reward System', desc: 'Bronze to Platinum with escalating rates up to 15%' },
  { icon: Shield, title: 'Secure Document Vault', desc: 'Server-side encrypted invoice storage' },
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
      setError('Email not found. Please use one of the demo accounts below.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)' }}>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }} />
          {/* Grid lines */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-900/50">
              <Plane size={22} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-xl tracking-tight">Xullu Travel</p>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Advisor Network</p>
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Your travel business,{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                elevated.
              </span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              The all-in-one platform built for elite travel advisors. Track commissions, manage bookings, and grow with confidence.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/12 transition-colors">
                    <Icon size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: '$2.4M+', label: 'Platform Revenue' },
            { value: '5', label: 'Active Advisors' },
            { value: '15%', label: 'Max Commission' },
          ].map((s) => (
            <div key={s.label} className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Plane size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Xullu Travel</p>
              <p className="text-xs text-slate-400">Advisor Platform</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to your advisor account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 mb-5">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="advisor@xullu.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <span className="text-xs text-blue-600 cursor-pointer hover:text-blue-700 font-medium">Forgot password?</span>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm pr-11 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">Demo Accounts</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Demo Accounts */}
          <div className="grid grid-cols-2 gap-2.5">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword('demo1234'); setError(''); }}
                  className="group flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all text-left"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${acc.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 truncate">{acc.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{acc.role}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            © 2024 Xullu Travel · Internal Platform · v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
