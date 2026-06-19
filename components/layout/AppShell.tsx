'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { Menu, Bell, Search, X, DollarSign, CheckCircle, Star, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

interface Notification {
  id: number;
  type: 'commission' | 'booking' | 'payment' | 'tier';
  message: string;
  time: string;
  unread: boolean;
  link: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'commission', message: 'Commission approved: BK-2024-004', time: '2 min ago', unread: true, link: '/bookings/BK-2024-004' },
  { id: 2, type: 'booking', message: 'New booking confirmed: Morrison Wedding Party', time: '1 hr ago', unread: true, link: '/bookings/BK-2024-006' },
  { id: 3, type: 'payment', message: 'Commission paid: BK-2024-001', time: '3 hr ago', unread: true, link: '/commissions' },
  { id: 4, type: 'tier', message: 'Congratulations! You reached Gold tier', time: 'Yesterday', unread: false, link: '/commissions' },
  { id: 5, type: 'booking', message: 'Booking BK-2024-009 marked completed', time: 'Yesterday', unread: false, link: '/bookings/BK-2024-009' },
];

export default function AppShell({ children, title, subtitle, actions }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const { user } = useAuth();
  const router = useRouter();
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const notifColor: Record<string, string> = {
    commission: 'bg-emerald-100 text-emerald-600',
    booking: 'bg-blue-100 text-blue-600',
    payment: 'bg-purple-100 text-purple-600',
    tier: 'bg-amber-100 text-amber-600',
  };

  const notifIcon = (type: string) => {
    switch (type) {
      case 'commission': return <DollarSign size={14} />;
      case 'payment': return <CheckCircle size={14} />;
      case 'tier': return <Star size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  const markAsRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, unread: false } : n)
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const handleNotifClick = useCallback((notif: Notification) => {
    markAsRead(notif.id);
    setShowNotifs(false);
    router.push(notif.link);
  }, [markAsRead, router]);

  const handleViewAll = useCallback(() => {
    setShowNotifs(false);
    router.push(user?.role === 'super_admin' ? '/admin/commissions' : '/commissions');
  }, [router, user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifs]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #e8edf5 0%, #f0f4f8 50%, #e8f0f8 100%)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0 shadow-2xl shadow-slate-900/20 relative z-30">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 h-full shadow-2xl">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20">
              <X size={16} />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="flex-shrink-0 h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-white/60 shadow-sm shadow-slate-200/50 relative z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="fade-in-up">
              {title && <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>}
              {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions && <div className="mr-2">{actions}</div>}

            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
                  <Search size={15} className="text-slate-400 flex-shrink-0" />
                  <input
                    autoFocus
                    placeholder="Search..."
                    className="bg-transparent text-sm text-slate-700 outline-none w-48 placeholder:text-slate-400"
                    onBlur={() => setSearchOpen(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 rounded-xl hover:bg-white hover:shadow-sm text-slate-500 hover:text-slate-700 transition-all"
                >
                  <Search size={18} />
                </button>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2.5 rounded-xl hover:bg-white hover:shadow-sm text-slate-500 hover:text-slate-700 transition-all"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center pulse-dot">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-100 z-40 overflow-hidden fade-in-up">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${n.unread ? 'bg-blue-50/40' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${notifColor[n.type]}`}>
                            {notifIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-snug ${n.unread ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                          </div>
                          {n.unread ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                          ) : (
                            <ExternalLink size={12} className="text-slate-300 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-slate-100 text-center">
                    <button
                      onClick={handleViewAll}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 fade-in-up">
          {children}
        </main>
      </div>
    </div>
  );
}
