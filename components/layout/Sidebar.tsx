'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  FolderOpen,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Plane,
  Plus,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getTierConfig } from '@/lib/mockData';
import { formatCurrency } from '@/lib/mockData';

const advisorNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { href: '/bookings', label: 'Bookings', icon: FileText, badge: null },
  { href: '/commissions', label: 'Commissions', icon: DollarSign, badge: '3' },
  { href: '/invoices', label: 'Documents', icon: FolderOpen, badge: null },
];

const adminNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, badge: null },
  { href: '/admin/advisors', label: 'Advisors', icon: Users, badge: null },
  { href: '/admin/bookings', label: 'All Bookings', icon: FileText, badge: null },
  { href: '/admin/commissions', label: 'Commissions', icon: DollarSign, badge: '5' },
  { href: '/reports', label: 'Reports', icon: BarChart3, badge: null },
  { href: '/admin/invoices', label: 'Documents', icon: FolderOpen, badge: null },
];

const tierGradients: Record<string, string> = {
  bronze: 'from-amber-600 to-amber-400',
  silver: 'from-slate-400 to-slate-300',
  gold: 'from-yellow-500 to-amber-300',
  platinum: 'from-indigo-500 to-purple-400',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const nav = user?.role === 'super_admin' ? adminNav : advisorNav;
  const tierCfg = user ? getTierConfig(user.tier) : null;
  const tierGrad = user ? tierGradients[user.tier] : 'from-slate-500 to-slate-400';

  return (
    <div className="flex flex-col h-full w-64 sidebar-gradient text-white">

      {/* Logo Header */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Plane size={17} className="text-white" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 pulse-dot" />
          </div>
          <div>
            <p className="font-bold text-white text-[15px] tracking-tight">Xullu Travel</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Advisor Platform</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="mx-3 mb-4 rounded-xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tierGrad} flex items-center justify-center text-sm font-bold text-white shadow-lg flex-shrink-0`}>
            {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate leading-tight">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
          </div>
        </div>
        {user?.role === 'advisor' && tierCfg && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles size={11} className="text-yellow-400" />
                <span className={`text-[11px] font-bold bg-gradient-to-r ${tierGrad} bg-clip-text text-transparent`}>
                  {tierCfg.label} Tier
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400">{(tierCfg.rate * 100).toFixed(0)}% rate</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${tierGrad} rounded-full transition-all duration-1000`}
                style={{ width: `${Math.min(100, ((user.ytdSales || 0) / (tierCfg.maxSales || user.ytdSales || 1)) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">{formatCurrency(user.ytdSales)} YTD</p>
          </div>
        )}
        {user?.role === 'super_admin' && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
            <Shield size={12} className="text-indigo-400" />
            <span className="text-[11px] font-semibold text-indigo-300">Super Administrator</span>
          </div>
        )}
      </div>

      {/* Quick Action */}
      {user?.role === 'advisor' && (
        <div className="mx-3 mb-4">
          <Link href="/bookings/new">
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-900/30 cursor-pointer group">
              <Plus size={15} className="text-white" />
              <span className="text-sm font-semibold text-white">New Booking</span>
            </div>
          </Link>
        </div>
      )}

      {/* Nav Section Label */}
      <div className="px-5 mb-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Navigation</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/90 to-blue-500/80 text-white shadow-md shadow-blue-900/30 nav-active'
                  : 'text-slate-400 hover:text-white hover:bg-white/8'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-300 rounded-r-full" />
              )}
              <Icon
                size={17}
                className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-400'}`}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight size={13} className="text-blue-200 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Performance Snapshot (advisor only) */}
      {user?.role === 'advisor' && (
        <div className="mx-3 my-4 rounded-xl bg-white/5 border border-white/10 p-3.5">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp size={12} className="text-emerald-400" />
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quick Stats</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-slate-500">Total Sales</p>
              <p className="text-xs font-bold text-white">{formatCurrency(user.totalSales)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">YTD</p>
              <p className="text-xs font-bold text-emerald-400">{formatCurrency(user.ytdSales)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="px-3 pb-5 space-y-0.5 border-t border-white/10 pt-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/8 transition-all group"
        >
          <Settings size={17} className="flex-shrink-0 text-slate-500 group-hover:text-white group-hover:rotate-45 transition-transform duration-300" />
          <span>Settings</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut size={17} className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
