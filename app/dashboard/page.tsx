'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import StatCard from '@/components/ui/StatCard';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getBookingsForAdvisor, formatCurrency, formatDate, getTierConfig, TIER_CONFIG } from '@/lib/mockData';
import { bookingStatusVariant, commissionStatusVariant } from '@/lib/statusHelpers';
import {
  DollarSign, FileText, TrendingUp, Award, ArrowRight,
  Calendar, MapPin, Users, Plus, Plane, Clock, CheckCircle2, Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';

const monthlyData = [
  { month: 'Jan', sales: 8200, commission: 984 },
  { month: 'Feb', sales: 12400, commission: 1488 },
  { month: 'Mar', sales: 9800, commission: 1176 },
  { month: 'Apr', sales: 15600, commission: 1872 },
  { month: 'May', sales: 18200, commission: 2184 },
  { month: 'Jun', sales: 14300, commission: 1716 },
  { month: 'Jul', sales: 22100, commission: 2652 },
  { month: 'Aug', sales: 19500, commission: 2340 },
];

export default function AdvisorDashboard() {
  const { user } = useAuth();

  const bookings = useMemo(() => {
    if (!user) return [];
    return getBookingsForAdvisor(user.id);
  }, [user]);

  const stats = useMemo(() => {
    const totalComm = bookings.reduce((sum, b) => sum + b.commissionAmount, 0);
    const paidComm = bookings.filter((b) => b.commissionStatus === 'paid').reduce((sum, b) => sum + b.commissionAmount, 0);
    const pendingComm = bookings.filter((b) => b.commissionStatus === 'pending').reduce((sum, b) => sum + b.commissionAmount, 0);
    const activeBookings = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
    return { totalComm, paidComm, pendingComm, activeBookings };
  }, [bookings]);

  const tierCfg = user ? getTierConfig(user.tier) : TIER_CONFIG[0];
  const nextTier = TIER_CONFIG.find((t) => user && t.minSales > tierCfg.minSales);
  const tierProgress = nextTier
    ? Math.min(100, ((user?.ytdSales || 0) - tierCfg.minSales) / (nextTier.minSales - tierCfg.minSales) * 100)
    : 100;

  const tierGradients: Record<string, string> = {
    bronze: 'from-amber-500 to-amber-700',
    silver: 'from-slate-400 to-slate-600',
    gold: 'from-yellow-400 to-amber-500',
    platinum: 'from-indigo-400 to-violet-600',
  };
  const tierGrad = tierGradients[user?.tier || 'bronze'];

  const recentBookings = bookings.slice(0, 5);

  const travelTypeIcons: Record<string, string> = {
    cruise: '🚢', resort: '🏝️', tour: '🗺️', flight: '✈️', hotel: '🏨', package: '📦',
  };

  return (
    <AppShell
      title={`Good morning, ${user?.name?.split(' ')[0]}`}
      subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
      actions={
        <Link href="/bookings/new" className="inline-flex items-center justify-center font-semibold px-3.5 py-2 text-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-md shadow-blue-200 hover:shadow-lg transition-all active:scale-[0.98]">
          <Plus size={13} className="mr-1.5" /> New Booking
        </Link>
      }
    >
      <div className="space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="YTD Sales"
            value={formatCurrency(user?.ytdSales || 0)}
            change="12.4% vs last year"
            changeType="up"
            icon={TrendingUp}
            iconGradient="from-blue-500 to-blue-700"
          />
          <StatCard
            title="Total Commission"
            value={formatCurrency(stats.totalComm)}
            change={`${formatCurrency(stats.paidComm)} paid`}
            changeType="up"
            icon={DollarSign}
            iconGradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Active Bookings"
            value={String(stats.activeBookings)}
            change={`${bookings.length} total`}
            changeType="neutral"
            icon={FileText}
            iconGradient="from-violet-500 to-purple-700"
          />
          <StatCard
            title="Pending Commission"
            value={formatCurrency(stats.pendingComm)}
            subtitle="Awaiting approval"
            icon={Award}
            iconGradient="from-amber-500 to-orange-600"
          />
        </div>

        {/* Tier Hero Banner */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${tierGrad} p-6 text-white shadow-xl`}>
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)',
            }} />
          <div className="absolute right-0 top-0 bottom-0 w-64 opacity-5"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
              backgroundSize: '20px 20px',
            }} />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-white/80" />
                <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">Commission Tier</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">{tierCfg.label} Advisor</h2>
              <p className="text-white/80 text-sm">
                Earning <strong className="text-white">{(tierCfg.rate * 100).toFixed(0)}%</strong> commission on all bookings
              </p>
            </div>
            {nextTier && (
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 min-w-48">
                <p className="text-white/70 text-xs font-medium mb-2">Progress to {nextTier.label}</p>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${tierProgress}%` }}
                  />
                </div>
                <p className="text-white text-xs font-semibold">
                  {formatCurrency(nextTier.minSales - (user?.ytdSales || 0))} more to unlock {(nextTier.rate * 100).toFixed(0)}% rate
                </p>
              </div>
            )}
            {!nextTier && (
              <div className="bg-white/15 backdrop-blur rounded-2xl p-4">
                <CheckCircle2 size={28} className="text-white mb-1" />
                <p className="text-white text-sm font-bold">Maximum tier achieved!</p>
                <p className="text-white/70 text-xs">Earning the highest rate</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Area Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs text-slate-500">Sales</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-500">Commission</span>
                </div>
              </div>
            </CardHeader>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={((v: number, n: string) => [formatCurrency(v), n === 'sales' ? 'Sales' : 'Commission']) as never}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2.5} fill="url(#salesGrad)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="commission" stroke="#10b981" strokeWidth={2.5} fill="url(#commGrad)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Tier Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>All Tiers</CardTitle>
            </CardHeader>
            <div className="space-y-2.5">
              {TIER_CONFIG.map((t) => {
                const isCurrentTier = user?.tier === t.name;
                const tGrad = tierGradients[t.name];
                return (
                  <div
                    key={t.name}
                    className={`rounded-xl p-3.5 transition-all ${isCurrentTier ? 'shadow-md ring-1 ring-inset ring-white/20' : 'bg-slate-50'}`}
                    style={isCurrentTier ? { background: `linear-gradient(135deg, ${t.name === 'platinum' ? '#6366f1, #4f46e5' : t.name === 'gold' ? '#f59e0b, #d97706' : t.name === 'silver' ? '#64748b, #475569' : '#92400e, #78350f'})` } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCurrentTier && <Sparkles size={13} className="text-white" />}
                        <span className={`text-sm font-bold ${isCurrentTier ? 'text-white' : 'text-slate-600'}`}>{t.label}</span>
                        {isCurrentTier && <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-semibold">Current</span>}
                      </div>
                      <span className={`text-sm font-bold ${isCurrentTier ? 'text-white' : 'text-slate-700'}`}>{(t.rate * 100).toFixed(0)}%</span>
                    </div>
                    <p className={`text-[10px] mt-1 ${isCurrentTier ? 'text-white/70' : 'text-slate-400'}`}>
                      {formatCurrency(t.minSales)} {t.maxSales ? `– ${formatCurrency(t.maxSales)}` : '+'}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5 font-normal">{bookings.length} total bookings</p>
            </div>
            <Link href="/bookings" className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentBookings.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <Plane size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No bookings yet. <Link href="/bookings/new" className="inline-flex items-center gap-1 text-blue-600 hover:underline">Submit your first booking <ArrowRight size={14} /></Link></p>
              </div>
            )}
            {recentBookings.map((booking, idx) => (
              <Link key={booking.id} href={`/bookings/${booking.id}`}>
                <div className="px-6 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer table-row-hover">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-lg flex-shrink-0">
                        {travelTypeIcons[booking.travelType] || '✈️'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">{booking.clientName}</p>
                          <span className="text-[10px] font-mono text-slate-400 hidden sm:block">{booking.id}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={10} /> {booking.destination.split(' - ')[0]}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar size={10} /> {formatDate(booking.departureDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(booking.totalValue)}</p>
                        <p className="text-xs font-semibold text-emerald-600">{formatCurrency(booking.commissionAmount)}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant={bookingStatusVariant(booking.bookingStatus) as 'success'}>
                          {booking.bookingStatus}
                        </Badge>
                        <Badge variant={commissionStatusVariant(booking.commissionStatus) as 'success'}>
                          {booking.commissionStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
