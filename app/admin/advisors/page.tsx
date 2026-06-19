'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getAllAdvisors, getAllBookings, formatCurrency, getTierConfig } from '@/lib/mockData';
import { exportToCSV } from '@/lib/statusHelpers';
import { Search, Download, Mail, Phone, Calendar, TrendingUp, Award } from 'lucide-react';

export default function AdminAdvisorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const advisors = getAllAdvisors();
  const bookings = getAllBookings();

  const enriched = advisors.map((a) => {
    const aBooks = bookings.filter((b) => b.advisorId === a.id);
    const paidComm = aBooks.filter((b) => b.commissionStatus === 'paid').reduce((s, b) => s + b.commissionAmount, 0);
    const pendingComm = aBooks.filter((b) => b.commissionStatus === 'pending').reduce((s, b) => s + b.commissionAmount, 0);
    const tierCfg = getTierConfig(a.tier);
    return { ...a, bookingCount: aBooks.length, paidComm, pendingComm, tierCfg };
  });

  const filtered = enriched.filter((a) => {
    const matchSearch = !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.agency || '').toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === 'all' || a.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const handleExport = () => {
    exportToCSV(
      filtered.map((a) => ({
        Name: a.name,
        Email: a.email,
        Phone: a.phone || '',
        Agency: a.agency || '',
        Tier: a.tier,
        'Commission Rate': `${(a.tierCfg.rate * 100).toFixed(0)}%`,
        'YTD Sales': a.ytdSales,
        'Total Sales': a.totalSales,
        'Total Bookings': a.bookingCount,
        'Paid Commission': a.paidComm,
        'Pending Commission': a.pendingComm,
        'Joined': a.joinedAt,
      })),
      'xullu-advisors'
    );
  };

  return (
    <AppShell
      title="Advisors"
      subtitle={`${filtered.length} travel advisors`}
      actions={
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Advisors', value: advisors.length.toString() },
            { label: 'Platinum', value: advisors.filter((a) => a.tier === 'platinum').length.toString() },
            { label: 'Gold', value: advisors.filter((a) => a.tier === 'gold').length.toString() },
            { label: 'Avg YTD Sales', value: formatCurrency(advisors.reduce((s, a) => s + a.ytdSales, 0) / advisors.length) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search advisors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {['all', 'bronze', 'silver', 'gold', 'platinum'].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  tierFilter === t ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Advisor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                    {a.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{a.name}</p>
                    <p className="text-xs text-slate-400">{a.agency}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${a.tierCfg.bgColor} ${a.tierCfg.color} border ${a.tierCfg.borderColor}`}>
                  {a.tierCfg.label}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <a href={`mailto:${a.email}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors">
                  <Mail size={12} /> {a.email}
                </a>
                <a href={`tel:${a.phone}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors">
                  <Phone size={12} /> {a.phone}
                </a>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={12} /> Joined {a.joinedAt}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-xs text-slate-400">YTD Sales</p>
                  <p className="text-sm font-bold text-slate-800">{formatCurrency(a.ytdSales)}</p>
                </div>
                <div className="text-center border-x border-slate-100">
                  <p className="text-xs text-slate-400">Bookings</p>
                  <p className="text-sm font-bold text-slate-800">{a.bookingCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">Rate</p>
                  <p className="text-sm font-bold text-emerald-600">{(a.tierCfg.rate * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => router.push('/admin/bookings')}>View Bookings</Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => window.open(`mailto:${a.email}`)}>
                  <Mail size={13} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
