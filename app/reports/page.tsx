'use client';

import { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getAllAdvisors, getAllBookings, formatCurrency, getTierConfig, TIER_CONFIG } from '@/lib/mockData';
import { exportToCSV } from '@/lib/statusHelpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Download, BarChart3, TrendingUp, Users, FileText, Award, ChevronDown } from 'lucide-react';

type ReportTab = 'sales' | 'commission' | 'advisor_performance' | 'booking_status' | 'tier_summary';

const REPORT_TABS: { id: ReportTab; label: string; icon: React.ElementType }[] = [
  { id: 'sales', label: 'Sales Report', icon: TrendingUp },
  { id: 'commission', label: 'Commission Report', icon: FileText },
  { id: 'advisor_performance', label: 'Advisor Performance', icon: Users },
  { id: 'booking_status', label: 'Booking Status', icon: BarChart3 },
  { id: 'tier_summary', label: 'Tier Summary', icon: Award },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const monthlySalesData = [
  { month: 'Jan', revenue: 142000, bookings: 8 },
  { month: 'Feb', revenue: 198000, bookings: 11 },
  { month: 'Mar', revenue: 167000, bookings: 9 },
  { month: 'Apr', revenue: 224000, bookings: 14 },
  { month: 'May', revenue: 256000, bookings: 16 },
  { month: 'Jun', revenue: 214000, bookings: 13 },
  { month: 'Jul', revenue: 289000, bookings: 18 },
  { month: 'Aug', revenue: 312000, bookings: 20 },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [advisorFilter, setAdvisorFilter] = useState('all');

  const advisors = getAllAdvisors();
  const bookings = getAllBookings();

  // --- Report 1: Sales Report ---
  const salesData = useMemo(() => {
    return bookings.map((b) => ({
      'Booking ID': b.id,
      'Advisor': b.advisorName,
      'Client': b.clientName,
      'Destination': b.destination,
      'Travel Type': b.travelType,
      'Departure': b.departureDate,
      'Total Value': b.totalValue,
      'Commission': b.commissionAmount,
      'Status': b.bookingStatus,
    }));
  }, [bookings]);

  // --- Report 2: Commission Report ---
  const commissionData = useMemo(() => {
    return bookings.map((b) => ({
      'Booking ID': b.id,
      'Advisor': b.advisorName,
      'Client': b.clientName,
      'Booking Value': b.totalValue,
      'Rate': `${(b.commissionRate * 100).toFixed(0)}%`,
      'Commission': b.commissionAmount,
      'Status': b.commissionStatus,
      'Date': b.createdAt,
    }));
  }, [bookings]);

  // --- Report 3: Advisor Performance ---
  const advisorPerformanceData = useMemo(() => {
    return advisors.map((a) => {
      const aBooks = bookings.filter((b) => b.advisorId === a.id);
      const totalValue = aBooks.reduce((s, b) => s + b.totalValue, 0);
      const totalComm = aBooks.reduce((s, b) => s + b.commissionAmount, 0);
      const paidComm = aBooks.filter((b) => b.commissionStatus === 'paid').reduce((s, b) => s + b.commissionAmount, 0);
      const tierCfg = getTierConfig(a.tier);
      return {
        name: a.name,
        agency: a.agency || '',
        tier: a.tier,
        rate: `${(tierCfg.rate * 100).toFixed(0)}%`,
        ytdSales: a.ytdSales,
        totalBookings: aBooks.length,
        totalValue,
        totalCommission: totalComm,
        paidCommission: paidComm,
      };
    }).sort((a, b) => b.ytdSales - a.ytdSales);
  }, [advisors, bookings]);

  // --- Report 4: Booking Status ---
  const bookingStatusData = useMemo(() => {
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
    return statuses.map((s) => {
      const sb = bookings.filter((b) => b.bookingStatus === s);
      return {
        status: s,
        count: sb.length,
        value: sb.reduce((sum, b) => sum + b.totalValue, 0),
        commission: sb.reduce((sum, b) => sum + b.commissionAmount, 0),
      };
    });
  }, [bookings]);

  // --- Report 5: Tier Summary ---
  const tierSummaryData = useMemo(() => {
    return TIER_CONFIG.map((t) => {
      const tierAdvisors = advisors.filter((a) => a.tier === t.name);
      const tierBookings = bookings.filter((b) => tierAdvisors.some((a) => a.id === b.advisorId));
      return {
        tier: t.label,
        rate: `${(t.rate * 100).toFixed(0)}%`,
        advisorCount: tierAdvisors.length,
        bookingCount: tierBookings.length,
        totalSales: tierBookings.reduce((s, b) => s + b.totalValue, 0),
        totalCommission: tierBookings.reduce((s, b) => s + b.commissionAmount, 0),
        avgSalesPerAdvisor: tierAdvisors.length > 0 ? tierAdvisors.reduce((s, a) => s + a.ytdSales, 0) / tierAdvisors.length : 0,
      };
    });
  }, [advisors, bookings]);

  const travelTypeBreakdown = useMemo(() => {
    const types = ['cruise', 'resort', 'tour', 'flight', 'hotel', 'package'] as const;
    return types.map((t) => {
      const tb = bookings.filter((b) => b.travelType === t);
      return { name: t, value: tb.reduce((s, b) => s + b.totalValue, 0), count: tb.length };
    }).filter((t) => t.count > 0);
  }, [bookings]);

  const handleExport = () => {
    const exportMap: Record<ReportTab, { data: Record<string, unknown>[]; filename: string }> = {
      sales: { data: salesData, filename: 'xullu-sales-report' },
      commission: { data: commissionData, filename: 'xullu-commission-report' },
      advisor_performance: { data: advisorPerformanceData as unknown as Record<string, unknown>[], filename: 'xullu-advisor-performance' },
      booking_status: { data: bookingStatusData as unknown as Record<string, unknown>[], filename: 'xullu-booking-status' },
      tier_summary: { data: tierSummaryData as unknown as Record<string, unknown>[], filename: 'xullu-tier-summary' },
    };
    const { data, filename } = exportMap[activeTab];
    exportToCSV(data, filename);
  };

  const activeTabConfig = REPORT_TABS.find((t) => t.id === activeTab)!;

  return (
    <AppShell
      title="Reports"
      subtitle="Analytics and performance reporting"
      actions={
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download size={14} className="mr-1" /> Export {activeTabConfig.label} CSV
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Date Filters */}
        <div className="flex items-center gap-3 flex-wrap bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-sm font-medium text-slate-600">Date Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-slate-400">→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={advisorFilter}
            onChange={(e) => setAdvisorFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Advisors</option>
            {advisors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <Button size="sm">Apply Filters</Button>
        </div>

        {/* Report Tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1.5 flex-wrap">
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Report 1: Sales */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(bookings.reduce((s, b) => s + b.totalValue, 0))}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Avg Booking Value</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(bookings.reduce((s, b) => s + b.totalValue, 0) / bookings.length)}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={((v: number) => [formatCurrency(v), 'Revenue']) as never} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <CardHeader><CardTitle>Sales by Travel Type</CardTitle></CardHeader>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={travelTypeBreakdown} cx="50%" cy="50%" outerRadius={85} dataKey="value" nameKey="name" label={((p: { name?: string; percent?: number }) => `${p.name ?? ''} ${((p.percent ?? 0) * 100).toFixed(0)}%`) as never} labelLine={false} fontSize={11}>
                      {travelTypeBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={((v: number) => formatCurrency(v)) as never} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
            <Card padding={false}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800">Sales Detail</h3>
                <span className="text-xs text-slate-400">{bookings.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Advisor</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Client</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Destination</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-sm font-semibold text-blue-600">{b.id}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{b.advisorName}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{b.clientName}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell max-w-40 truncate">{b.destination}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">{formatCurrency(b.totalValue)}</td>
                        <td className="px-4 py-3 text-center"><Badge variant={b.bookingStatus === 'completed' ? 'success' : b.bookingStatus === 'confirmed' ? 'info' : b.bookingStatus === 'cancelled' ? 'danger' : 'warning'}>{b.bookingStatus}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Report 2: Commission */}
        {activeTab === 'commission' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {['pending', 'approved', 'paid', 'disputed'].map((s) => {
                const filtered = bookings.filter((b) => b.commissionStatus === s);
                const amt = filtered.reduce((sum, b) => sum + b.commissionAmount, 0);
                const colors: Record<string, string> = { pending: 'text-amber-700 bg-amber-50', approved: 'text-blue-700 bg-blue-50', paid: 'text-emerald-700 bg-emerald-50', disputed: 'text-red-700 bg-red-50' };
                return (
                  <div key={s} className={`rounded-xl border p-4 ${colors[s]}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider capitalize">{s}</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(amt)}</p>
                    <p className="text-xs mt-0.5 opacity-75">{filtered.length} commissions</p>
                  </div>
                );
              })}
            </div>
            <Card>
              <CardHeader><CardTitle>Commission by Advisor</CardTitle></CardHeader>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={advisorPerformanceData.map((a) => ({ name: a.name.split(' ')[0], commission: a.totalCommission }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={((v: number) => [formatCurrency(v), 'Commission']) as never} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="commission" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card padding={false}>
              <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-base font-semibold text-slate-800">Commission Detail</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Advisor</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking Value</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Commission</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-sm font-semibold text-blue-600">{b.id}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{b.advisorName}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-700">{formatCurrency(b.totalValue)}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-700">{(b.commissionRate * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">{formatCurrency(b.commissionAmount)}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={b.commissionStatus === 'paid' ? 'success' : b.commissionStatus === 'approved' ? 'info' : b.commissionStatus === 'disputed' ? 'danger' : 'warning'}>{b.commissionStatus}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Report 3: Advisor Performance */}
        {activeTab === 'advisor_performance' && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>YTD Sales by Advisor</CardTitle></CardHeader>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={advisorPerformanceData.map((a) => ({ name: a.name.split(' ')[0], sales: a.ytdSales, commission: a.totalCommission }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={((v: number, n: string) => [formatCurrency(v), n === 'sales' ? 'YTD Sales' : 'Commission']) as never} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="commission" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card padding={false}>
              <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-base font-semibold text-slate-800">Advisor Performance Detail</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Advisor</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tier</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">YTD Sales</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bookings</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Commission</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {advisorPerformanceData.map((a, i) => {
                      const tierCfg = getTierConfig(a.tier as 'bronze');
                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-6 py-3">
                            <p className="text-sm font-semibold text-slate-800">{a.name}</p>
                            <p className="text-xs text-slate-400">{a.agency}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tierCfg.bgColor} ${tierCfg.color}`}>{tierCfg.label}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{a.rate}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">{formatCurrency(a.ytdSales)}</td>
                          <td className="px-4 py-3 text-right text-sm text-slate-700">{a.totalBookings}</td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">{formatCurrency(a.totalCommission)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Report 4: Booking Status */}
        {activeTab === 'booking_status' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {bookingStatusData.map((s) => {
                const colorMap: Record<string, string> = { pending: 'bg-amber-50 text-amber-700 border-amber-200', confirmed: 'bg-blue-50 text-blue-700 border-blue-200', completed: 'bg-emerald-50 text-emerald-700 border-emerald-200', cancelled: 'bg-red-50 text-red-700 border-red-200' };
                return (
                  <div key={s.status} className={`rounded-xl border p-4 ${colorMap[s.status]}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider capitalize">{s.status}</p>
                    <p className="text-2xl font-bold mt-1">{s.count}</p>
                    <p className="text-xs mt-0.5 opacity-75">{formatCurrency(s.value)}</p>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Booking Count by Status</CardTitle></CardHeader>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={bookingStatusData.filter((s) => s.count > 0)} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={85} label={((p: { name?: string; percent?: number }) => `${p.name ?? ''} ${((p.percent ?? 0) * 100).toFixed(0)}%`) as never} labelLine={false} fontSize={11}>
                      {bookingStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <CardHeader><CardTitle>Revenue by Status</CardTitle></CardHeader>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={bookingStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={((v: number) => [formatCurrency(v), 'Revenue']) as never} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {bookingStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
            <Card padding={false}>
              <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-base font-semibold text-slate-800">Booking Status Summary</h3></div>
              <table className="w-full">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Count</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Value</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Commission</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {bookingStatusData.map((s) => (
                    <tr key={s.status} className="hover:bg-slate-50">
                      <td className="px-6 py-3 capitalize text-sm font-semibold text-slate-800">{s.status}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">{s.count}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">{formatCurrency(s.value)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">{formatCurrency(s.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* Report 5: Tier Summary */}
        {activeTab === 'tier_summary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {tierSummaryData.map((t) => {
                const tierCfg = TIER_CONFIG.find((tc) => tc.label === t.tier)!;
                return (
                  <div key={t.tier} className={`rounded-xl border p-4 ${tierCfg.bgColor} ${tierCfg.borderColor}`}>
                    <p className={`text-sm font-bold ${tierCfg.color}`}>{t.tier}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{t.advisorCount}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.rate} commission</p>
                  </div>
                );
              })}
            </div>
            <Card>
              <CardHeader><CardTitle>Revenue by Tier</CardTitle></CardHeader>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={tierSummaryData.map((t) => ({ tier: t.tier, sales: t.totalSales, commission: t.totalCommission }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="tier" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={((v: number, n: string) => [formatCurrency(v), n === 'sales' ? 'Total Sales' : 'Commission']) as never} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="commission" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card padding={false}>
              <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-base font-semibold text-slate-800">Tier Summary Detail</h3></div>
              <table className="w-full">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tier</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Advisors</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bookings</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Commission</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Avg Sales/Advisor</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {tierSummaryData.map((t) => {
                    const tierCfg = TIER_CONFIG.find((tc) => tc.label === t.tier)!;
                    return (
                      <tr key={t.tier} className="hover:bg-slate-50">
                        <td className="px-6 py-3">
                          <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${tierCfg.bgColor} ${tierCfg.color} border ${tierCfg.borderColor}`}>{t.tier}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{t.rate}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-700">{t.advisorCount}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-700">{t.bookingCount}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">{formatCurrency(t.totalSales)}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">{formatCurrency(t.totalCommission)}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-700 hidden lg:table-cell">{formatCurrency(t.avgSalesPerAdvisor)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
