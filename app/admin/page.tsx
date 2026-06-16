'use client';

import { useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import StatCard from '@/components/ui/StatCard';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import {
  getAllAdvisors,
  getAllBookings,
  formatCurrency,
  getTierConfig,
} from '@/lib/mockData';
import { bookingStatusVariant } from '@/lib/statusHelpers';
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  ArrowRight,
  Award,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
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

export default function AdminDashboard() {
  const advisors = getAllAdvisors();
  const bookings = getAllBookings();

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

  const tierBreakdown = [
    { name: 'Bronze', count: advisors.filter((a) => a.tier === 'bronze').length, color: '#b45309' },
    { name: 'Silver', count: advisors.filter((a) => a.tier === 'silver').length, color: '#64748b' },
    { name: 'Gold', count: advisors.filter((a) => a.tier === 'gold').length, color: '#ca8a04' },
    { name: 'Platinum', count: advisors.filter((a) => a.tier === 'platinum').length, color: '#4f46e5' },
  ];

  const recentBookings = bookings.slice(0, 5);
  const pendingCommBookings = bookings.filter((b) => b.commissionStatus === 'pending').slice(0, 4);

  return (
    <AppShell title="Admin Overview" subtitle="Platform performance at a glance">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={formatCurrency(stats.totalBookingValue)} change="all time" changeType="up" icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-600" />
          <StatCard title="Total Commission" value={formatCurrency(stats.totalCommission)} change="all advisors" changeType="up" icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
          <StatCard title="Active Advisors" value={String(advisors.length)} icon={Users} iconBg="bg-purple-50" iconColor="text-purple-600" />
          <StatCard title="Pending Payouts" value={formatCurrency(stats.pendingComm)} change="awaiting approval" changeType="neutral" icon={AlertTriangle} iconBg="bg-amber-50" iconColor="text-amber-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Revenue & Commission</CardTitle>
              <span className="text-xs text-slate-400">YTD 2024</span>
            </CardHeader>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={((v: number, n: string) => [formatCurrency(v), n === 'revenue' ? 'Revenue' : 'Commission']) as never} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="commission" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Tier Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Advisor Tiers</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {tierBreakdown.map((t) => (
                <div key={t.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{t.name}</span>
                    <span className="text-slate-500">{t.count} advisor{t.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(t.count / advisors.length) * 100}%`, background: t.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link href="/admin/advisors">
                <Button variant="outline" size="sm" className="w-full gap-1">
                  <Users size={14} /> View All Advisors
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Advisor Leaderboard */}
          <Card padding={false}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">Top Advisors</h3>
              <Link href="/admin/advisors">
                <Button variant="ghost" size="sm" className="gap-1">View all <ArrowRight size={14} /></Button>
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {advisorPerformance.map((a, idx) => (
                <div key={a.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                      {a.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{a.name}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${a.tierCfg.bgColor} ${a.tierCfg.color}`}>{a.tierCfg.label}</span>
                        <span className="text-xs text-slate-400">{a.bookingCount} bookings</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(a.ytdSales)}</p>
                    <p className="text-xs text-emerald-600 font-medium">{formatCurrency(a.commission)} comm.</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pending Commissions */}
          <Card padding={false}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">Pending Approvals</h3>
              <Link href="/admin/commissions">
                <Button variant="ghost" size="sm" className="gap-1">View all <ArrowRight size={14} /></Button>
              </Link>
            </div>
            {pendingCommBookings.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No pending commissions</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pendingCommBookings.map((b) => (
                  <div key={b.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{b.clientName}</p>
                      <p className="text-xs text-slate-400">{b.advisorName} · {b.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-amber-600">{formatCurrency(b.commissionAmount)}</p>
                      <Button size="sm" className="text-xs py-1 px-2 bg-emerald-600 hover:bg-emerald-700">Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">Recent Bookings</h3>
            <Link href="/admin/bookings">
              <Button variant="ghost" size="sm" className="gap-1">View all <ArrowRight size={14} /></Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Advisor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Client</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Commission</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-sm font-semibold text-blue-600">{b.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{b.advisorName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{b.clientName}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">{formatCurrency(b.totalValue)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600 hidden md:table-cell">{formatCurrency(b.commissionAmount)}</td>
                    <td className="px-4 py-3 text-center">
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
