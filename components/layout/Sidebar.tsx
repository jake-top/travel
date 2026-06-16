'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Upload,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Plane,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const advisorNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bookings', label: 'Bookings', icon: FileText },
  { href: '/bookings/new', label: 'New Booking', icon: Plane },
  { href: '/commissions', label: 'Commissions', icon: DollarSign },
  { href: '/invoices', label: 'Invoices', icon: Upload },
];

const adminNav = [
  { href: '/admin', label: 'Admin Overview', icon: LayoutDashboard },
  { href: '/admin/advisors', label: 'Advisors', icon: Users },
  { href: '/admin/bookings', label: 'All Bookings', icon: FileText },
  { href: '/admin/commissions', label: 'Commissions', icon: DollarSign },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/invoices', label: 'Invoices', icon: Upload },
];

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const nav = user?.role === 'super_admin' ? adminNav : advisorNav;

  return (
    <div
      className={`flex flex-col h-full bg-slate-900 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
          <Plane size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-white text-sm">Xullu Travel</p>
            <p className="text-xs text-slate-400">Advisor Platform</p>
          </div>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight size={14} />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-slate-700/50 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
