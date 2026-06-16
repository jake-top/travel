'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import { getBookingsForAdvisor, getAllBookings, formatCurrency, formatDate, getTierConfig, TIER_CONFIG } from '@/lib/mockData';
import { commissionStatusVariant } from '@/lib/statusHelpers';
import { DollarSign, TrendingUp, Clock, CheckCircle, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

export default function CommissionsPage() {
  const { user } = useAuth();

  const bookings = useMemo(() => {
    if (!user) return [];
    return user.role === 'super_admin' ? getAllBookings() : getBookingsForAdvisor(user.id);
  }, [user]);

  const commissionStats = useMemo(() => {
    const pending = bookings.filter((b) => b.commissionStatus === 'pending');
    const approved = bookings.filter((b) => b.commissionStatus === 'approved');
    const paid = bookings.filter((b) => b.commissionStatus === 'paid');
    const disputed = bookings.filter((b) => b.commissionStatus === 'disputed');

    return {
      pending: { count: pending.length, amount: pending.reduce((s, b) => s + b.commissionAmount, 0) },
      approved: { count: approved.length, amount: approved.reduce((s, b) => s + b.commissionAmount, 0) },
      paid: { count: paid.length, amount: paid.reduce((s, b) => s + b.commissionAmount, 0) },
      disputed: { count: disputed.length, amount: disputed.reduce((s, b) => s + b.commissionAmount, 0) },
      total: bookings.reduce((s, b) => s + b.commissionAmount, 0),
    };
  }, [bookings]);

  const pieData = [
    { name: 'Pending', value: commissionStats.pending.amount, color: COLORS[0] },
    { name: 'Approved', value: commissionStats.approved.amount, color: COLORS[1] },
    { name: 'Paid', value: commissionStats.paid.amount, color: COLORS[2] },
    { name: 'Disputed', value: commissionStats.disputed.amount, color: COLORS[3] },
  ].filter((d) => d.value > 0);

  const tierCfg = user ? getTierConfig(user.tier) : null;
  const nextTier = tierCfg ? TIER_CONFIG.find((t) => t.minSales > tierCfg.minSales) : null;

  return (
    <AppShell title="Commissions" subtitle="Track your earnings and commission status">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Earned" value={formatCurrency(commissionStats.total)} icon={DollarSign} iconGradient="from-emerald-500 to-teal-600" />
          <StatCard title="Paid Out" value={formatCurrency(commissionStats.paid.amount)} change={`${commissionStats.paid.count} payments`} changeType="up" icon={CheckCircle} iconGradient="from-emerald-500 to-teal-600" />
          <StatCard title="Approved (Pending Payment)" value={formatCurrency(commissionStats.approved.amount)} icon={TrendingUp} iconGradient="from-blue-500 to-blue-700" />
          <StatCard title="Awaiting Approval" value={formatCurrency(commissionStats.pending.amount)} icon={Clock} iconGradient="from-amber-500 to-orange-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Breakdown</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={((v: number) => formatCurrency(v)) as never} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-slate-600">{d.name}</span>
                  <span className="text-xs font-semibold text-slate-800 ml-auto">{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Tier Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Commission Tier Status</CardTitle>
              {tierCfg && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tierCfg.bgColor} ${tierCfg.color} border ${tierCfg.borderColor}`}>
                  {tierCfg.label} — {(tierCfg.rate * 100).toFixed(0)}%
                </span>
              )}
            </CardHeader>
            <div className="space-y-4">
              {TIER_CONFIG.map((t) => {
                const isCurrentTier = user?.tier === t.name;
                const tierSales = user?.ytdSales || 0;
                const isBelowTier = tierSales < t.minSales;
                const isAboveTier = t.maxSales !== null && tierSales >= t.maxSales;
                const progressInTier = isBelowTier ? 0 : isAboveTier ? 100 : t.maxSales
                  ? ((tierSales - t.minSales) / (t.maxSales - t.minSales)) * 100
                  : 100;

                return (
                  <div key={t.name} className={`p-4 rounded-xl border transition-all ${isCurrentTier ? t.bgColor + ' ' + t.borderColor : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award size={16} className={isCurrentTier ? t.color : 'text-slate-400'} />
                        <span className={`font-semibold text-sm ${isCurrentTier ? t.color : 'text-slate-400'}`}>{t.label}</span>
                        {isCurrentTier && <span className="text-xs bg-white rounded-full px-2 py-0.5 font-medium text-slate-600">Current</span>}
                      </div>
                      <span className={`text-sm font-bold ${isCurrentTier ? t.color : 'text-slate-400'}`}>
                        {(t.rate * 100).toFixed(0)}% commission
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">
                      {formatCurrency(t.minSales)} — {t.maxSales ? formatCurrency(t.maxSales) : 'No limit'} YTD sales
                    </div>
                    {isCurrentTier && (
                      <div>
                        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressInTier}%`, background: 'currentColor' }} />
                        </div>
                        <p className="text-xs mt-1 text-slate-500">
                          {formatCurrency(user?.ytdSales || 0)} of {t.maxSales ? formatCurrency(t.maxSales) : 'unlimited'} YTD
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Commission Table */}
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">Commission History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Supplier</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking Value</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Commission</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="text-sm font-semibold text-blue-600">{b.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{b.clientName}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-slate-600">{b.supplierName}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium text-slate-800">{formatCurrency(b.totalValue)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-semibold text-emerald-600">{formatCurrency(b.commissionAmount)}</p>
                      <p className="text-xs text-slate-400">{(b.commissionRate * 100).toFixed(0)}%</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={commissionStatusVariant(b.commissionStatus) as 'success'}>
                        {b.commissionStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-sm text-slate-500">{formatDate(b.createdAt)}</p>
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
