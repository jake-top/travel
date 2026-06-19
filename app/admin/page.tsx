'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import StatCard from '@/components/ui/StatCard';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { getAllAdvisors, getAllBookings, formatCurrency, formatDate, getTierConfig } from '@/lib/mockData';
import { bookingStatusVariant } from '@/lib/statusHelpers';
import { Users, DollarSign, FileText, TrendingUp, ArrowRight, AlertTriangle, CheckCircle2, Sparkles, Activity, Dot } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';

const monthlyRevenue = [
  { month: 'Jan', revenue: 142000, commission: 16400 },
  { month: 'Feb', revenue: 198000, commission: 22800 },
  { month: 'Mar', revenue: 167000, commission: 19200 },
  { month: 'Apr', revenue: 224000, commission: 25800 },
  { month: 'May', revenue: 256000, commission: 29400 },
  { month: 'Jun', revenue: 214000, commission: 24600 },
  { month: 'Jul', revenue: 289000, commission: 33200 },
  { month: 'Aug', revenue: 312000, commission: 35800 },
];

const TIER_COLORS: Record<string, string> = {
  bronze: '#b45309',
  silver: '#64748b',
  gold: '#ca8a04',
  platinum: '#4f46e5',
};

export default function AdminDashboard() {
  const router = useRouter();
  const advisors = getAllAdvisors();
  const bookings = getAllBookings();
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  const stats = useMemo(() => {
    const totalBookingValue = bookings.reduce((s, b) => s + b.totalValue, 0);
    const totalCommission = bookings.reduce((s, b) => s + b.commissionAmount, 0);
    const pendingComm = bookings.filter((b) => b.commissionStatus === 'pending').reduce((s, b) => s + b.commissionAmount, 0);
    const activeBookings = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
    return { totalBookingValue, totalCommission, pendingComm, activeBookings };
  }, [bookings]);

  const advisorPerformance = advisors.map((a) => {
    const aBooks = bookings.filter((b) => b.advisorId === a.id);
    const commission = aBooks.reduce((s, b) => s + b.commissionAmount, 0);
    const tierCfg = getTierConfig(a.tier);
    return { ...a, bookingCount: aBooks.length, commission, tierCfg };
  }).sort((a, b) => b.ytdSales - a.ytdSales);

  const tierBreakdown = ['bronze', 'silver', 'gold', 'platinum'].map((tier) => ({
    name: tier.charAt(0).toUpperCase() + tier.slice(1),
    count: advisors.filter((a) => a.tier === tier).length,
    color: TIER_COLORS[tier],
  }));

  const pendingCommBookings = bookings.filter((b) => b.commissionStatus === 'pending' && !approvedIds.has(b.id)).slice(0, 5);
  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  return (
    <AppShell title="Admin Overview" subtitle="Platform performance dashboard">
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={formatCurrency(stats.totalBookingValue)} change="8.2% vs last month" changeType="up" icon={TrendingUp} iconGradient="from-blue-500 to-blue-700" />
          <StatCard title="Total Commission" value={formatCurrency(stats.totalCommission)} change="all advisors" changeType="up" icon={DollarSign} iconGradient="from-emerald-500 to-teal-600" />
          <StatCard title="Active Advisors" value={String(advisors.length)} subtitle="across 4 tiers" icon={Users} iconGradient="from-violet-500 to-purple-700" />
          <StatCard title="Pending Payouts" value={formatCurrency(stats.pendingComm)} subtitle="awaiting approval" icon={AlertTriangle} iconGradient="from-amber-500 to-orange-600" />
        </div>

        {/* Revenue Area Chart + Tier Dist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue & Commission Trend</CardTitle>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-xs text-slate-400">Revenue</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-xs text-slate-400">Commission</span></div>
              </div>
            </CardHeader>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="commGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={((v: number, n: string) => [formatCurrency(v), n === 'revenue' ? 'Revenue' : 'Commission']) as never} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="commission" stroke="#10b981" strokeWidth={2.5} fill="url(#commGrad2)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advisor Tiers</CardTitle>
            </CardHeader>
            <div className="space-y-3 mb-4">
              {tierBreakdown.map((t) => (
                <div key={t.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">{t.name}</span>
                    <span className="text-slate-400">{t.count} advisor{t.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(t.count / advisors.length) * 100}%`, background: t.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400">Total Revenue</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(stats.totalBookingValue)}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400">Avg per Advisor</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(stats.totalBookingValue / advisors.length)}</p>
              </div>
            </div>
            <Link href="/admin/advisors" className="block mt-3 w-full inline-flex items-center justify-center gap-1.5 font-semibold px-3.5 py-2 text-xs rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
              <Users size={13} /> View All Advisors
            </Link>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Advisor Leaderboard */}
          <Card padding={false}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <CardTitle>Advisor Leaderboard</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5 font-normal">Ranked by YTD sales</p>
              </div>
              <Link href="/admin/advisors" className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl text-blue-600 hover:bg-blue-50 transition-all">
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {advisorPerformance.map((a, idx) => (
                <div key={a.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50/80 transition-colors table-row-hover">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    idx === 0 ? 'bg-amber-100 text-amber-700' :
                    idx === 1 ? 'bg-slate-100 text-slate-600' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
                    style={{ background: TIER_COLORS[a.tier] }}>
                    {a.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{a.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: TIER_COLORS[a.tier], background: TIER_COLORS[a.tier] + '20' }}>
                        {a.tierCfg.label}
                      </span>
                      <span className="text-[10px] text-slate-400">{a.bookingCount} bookings</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(a.ytdSales)}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold">{formatCurrency(a.commission)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pending Commissions */}
          <Card padding={false}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <CardTitle>Pending Approvals</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5 font-normal">{pendingCommBookings.length} commissions awaiting review</p>
              </div>
              <Link href="/admin/commissions" className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl text-blue-600 hover:bg-blue-50 transition-all">
                View all <ArrowRight size={13} />
              </Link>
            </div>
            {pendingCommBookings.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-slate-400">
                <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
                <p className="text-sm font-medium">All commissions approved!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pendingCommBookings.map((b) => (
                  <div key={b.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{b.clientName}</p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">{b.advisorName} <Dot size={14} className="text-slate-300" /> <span className="font-mono">{b.id}</span></p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-amber-600">{formatCurrency(b.commissionAmount)}</p>
                        <p className="text-[10px] text-slate-400">{(b.commissionRate * 100).toFixed(0)}% rate</p>
                      </div>
                      <Button size="xs" variant="success" onClick={() => setApprovedIds(prev => new Set([...prev, b.id]))}>Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-slate-400" />
              <CardTitle>Recent Bookings</CardTitle>
            </div>
            <Link href="/admin/bookings" className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl text-blue-600 hover:bg-blue-50 transition-all">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Advisor</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Client</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Destination</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Value</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Commission</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer table-row-hover" onClick={() => router.push(`/bookings/${b.id}`)}>
                      <td className="px-6 py-3.5">
                        <p className="text-xs font-bold text-blue-600 font-mono">{b.id}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(b.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{b.advisorName.split(' ')[0]}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 hidden md:table-cell">{b.clientName}</td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <p className="text-xs text-slate-600 max-w-36 truncate">{b.destination}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{b.travelType}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-bold text-slate-900">{formatCurrency(b.totalValue)}</td>
                      <td className="px-4 py-3.5 text-right hidden md:table-cell">
                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(b.commissionAmount)}</p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge variant={bookingStatusVariant(b.bookingStatus) as 'success'}>{b.bookingStatus}</Badge>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
