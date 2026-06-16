'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import StatCard from '@/components/ui/StatCard';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getBookingsForAdvisor, formatCurrency, formatDate, getTierConfig, TIER_CONFIG } from '@/lib/mockData';
import { bookingStatusVariant, commissionStatusVariant } from '@/lib/statusHelpers';
import {
  DollarSign,
  FileText,
  TrendingUp,
  Award,
  ArrowRight,
  Calendar,
  MapPin,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdvisorDashboard() {
  const { user } = useAuth();

  const bookings = useMemo(() => {
    if (!user) return [];
    return getBookingsForAdvisor(user.id);
  }, [user]);

  const stats = useMemo(() => {
    const totalValue = bookings.reduce((sum, b) => sum + b.totalValue, 0);
    const totalComm = bookings.reduce((sum, b) => sum + b.commissionAmount, 0);
    const paidComm = bookings.filter((b) => b.commissionStatus === 'paid').reduce((sum, b) => sum + b.commissionAmount, 0);
    const pendingComm = bookings.filter((b) => b.commissionStatus === 'pending').reduce((sum, b) => sum + b.commissionAmount, 0);
    const activeBookings = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
    return { totalValue, totalComm, paidComm, pendingComm, activeBookings };
  }, [bookings]);

  const tierCfg = user ? getTierConfig(user.tier) : TIER_CONFIG[0];
  const nextTier = TIER_CONFIG.find((t) => user && t.minSales > (user.ytdSales || 0));
  const tierProgress = nextTier
    ? Math.min(100, ((user?.ytdSales || 0) - tierCfg.minSales) / (nextTier.minSales - tierCfg.minSales) * 100)
    : 100;

  // Monthly sales chart data
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

  const recentBookings = bookings.slice(0, 5);

  return (
    <AppShell
      title={`Welcome back, ${user?.name?.split(' ')[0]}`}
      subtitle="Here's your performance overview"
      actions={
        <Link href="/bookings/new">
          <Button size="sm">+ New Booking</Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="YTD Sales"
            value={formatCurrency(user?.ytdSales || 0)}
            change="vs last year"
            changeType="up"
            icon={TrendingUp}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Total Commission"
            value={formatCurrency(stats.totalComm)}
            change={`${formatCurrency(stats.paidComm)} paid`}
            changeType="up"
            icon={DollarSign}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            title="Active Bookings"
            value={String(stats.activeBookings)}
            change={`${bookings.length} total`}
            changeType="neutral"
            icon={FileText}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Pending Commission"
            value={formatCurrency(stats.pendingComm)}
            change="awaiting payment"
            changeType="neutral"
            icon={Award}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Commission Tier Card */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Tier</CardTitle>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tierCfg.bgColor} ${tierCfg.color} border ${tierCfg.borderColor}`}>
                {tierCfg.label}
              </span>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Rate: <strong className="text-slate-800">{(tierCfg.rate * 100).toFixed(0)}%</strong></span>
                  <span className="text-slate-500">
                    YTD: <strong className="text-slate-800">{formatCurrency(user?.ytdSales || 0)}</strong>
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${tierProgress}%` }}
                  />
                </div>
                {nextTier ? (
                  <p className="text-xs text-slate-500 mt-2">
                    {formatCurrency(nextTier.minSales - (user?.ytdSales || 0))} more to reach{' '}
                    <strong>{nextTier.label}</strong> ({(nextTier.rate * 100).toFixed(0)}% rate)
                  </p>
                ) : (
                  <p className="text-xs text-emerald-600 mt-2 font-medium">Highest tier achieved!</p>
                )}
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">All Tiers</p>
                <div className="space-y-2">
                  {TIER_CONFIG.map((t) => (
                    <div key={t.name} className={`flex items-center justify-between p-2.5 rounded-lg ${t.name === user?.tier ? t.bgColor + ' border ' + t.borderColor : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${t.name === user?.tier ? t.color : 'text-slate-400'}`}>
                          {t.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-700">{(t.rate * 100).toFixed(0)}%</span>
                        <span className="text-xs text-slate-400 ml-1">commission</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Monthly Sales Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Sales & Commission</CardTitle>
              <span className="text-xs text-slate-400">YTD 2024</span>
            </CardHeader>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barSize={18} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={((value: number, name: string) => [formatCurrency(value), name === 'sales' ? 'Sales' : 'Commission']) as never}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="commission" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <span className="text-xs text-slate-500">Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-xs text-slate-500">Commission</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">Recent Bookings</h3>
            <Link href="/bookings">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users size={16} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{booking.clientName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={11} /> {booking.destination}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar size={11} /> {formatDate(booking.departureDate)}
                        </span>
                        <span className="text-xs text-slate-400">{booking.travelType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-slate-800">{formatCurrency(booking.totalValue)}</span>
                    <div className="flex gap-1.5">
                      <Badge variant={bookingStatusVariant(booking.bookingStatus) as 'success'}>
                        {booking.bookingStatus}
                      </Badge>
                      <Badge variant={commissionStatusVariant(booking.commissionStatus) as 'success'}>
                        {formatCurrency(booking.commissionAmount)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
