'use client';

import { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getAllBookings, formatCurrency, formatDate } from '@/lib/mockData';
import { commissionStatusVariant, exportToCSV } from '@/lib/statusHelpers';
import { Search, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { CommissionStatus } from '@/types';

export default function AdminCommissionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | 'all'>('all');
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  const bookings = getAllBookings();

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const effectiveStatus = approvedIds.has(b.id) ? 'approved' : b.commissionStatus;
      const matchSearch = !search ||
        b.clientName.toLowerCase().includes(search.toLowerCase()) ||
        b.advisorName.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || effectiveStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, search, statusFilter, approvedIds]);

  const stats = useMemo(() => {
    const pending = bookings.filter((b) => !approvedIds.has(b.id) && b.commissionStatus === 'pending');
    const approved = bookings.filter((b) => approvedIds.has(b.id) || b.commissionStatus === 'approved');
    const paid = bookings.filter((b) => b.commissionStatus === 'paid');
    return {
      pendingAmount: pending.reduce((s, b) => s + b.commissionAmount, 0),
      approvedAmount: approved.reduce((s, b) => s + b.commissionAmount, 0),
      paidAmount: paid.reduce((s, b) => s + b.commissionAmount, 0),
      pendingCount: pending.length,
    };
  }, [bookings, approvedIds]);

  const approveComm = (id: string) => setApprovedIds((prev) => new Set([...prev, id]));

  const handleExport = () => {
    exportToCSV(
      filtered.map((b) => ({
        'Booking ID': b.id,
        'Advisor': b.advisorName,
        'Client': b.clientName,
        'Booking Value': b.totalValue,
        'Commission Rate': `${(b.commissionRate * 100).toFixed(0)}%`,
        'Commission Amount': b.commissionAmount,
        'Status': approvedIds.has(b.id) ? 'approved' : b.commissionStatus,
        'Date': b.createdAt,
      })),
      'xullu-commissions'
    );
  };

  return (
    <AppShell
      title="Commission Management"
      subtitle="Approve and track advisor commissions"
      actions={
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-amber-600" />
              <p className="text-xs font-semibold text-amber-700">Pending Approval</p>
            </div>
            <p className="text-2xl font-bold text-amber-800">{formatCurrency(stats.pendingAmount)}</p>
            <p className="text-xs text-amber-600 mt-0.5">{stats.pendingCount} commissions</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-blue-600" />
              <p className="text-xs font-semibold text-blue-700">Approved</p>
            </div>
            <p className="text-2xl font-bold text-blue-800">{formatCurrency(stats.approvedAmount)}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-emerald-600" />
              <p className="text-xs font-semibold text-emerald-700">Paid Out</p>
            </div>
            <p className="text-2xl font-bold text-emerald-800">{formatCurrency(stats.paidAmount)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {(['all', 'pending', 'approved', 'paid', 'disputed'] as (CommissionStatus | 'all')[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  statusFilter === s ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Advisor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Client</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking Value</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Commission</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((b) => {
                  const effectiveStatus = approvedIds.has(b.id) ? 'approved' : b.commissionStatus;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <p className="text-sm font-semibold text-blue-600">{b.id}</p>
                        <p className="text-xs text-slate-400">{formatDate(b.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{b.advisorName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{b.clientName}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">{formatCurrency(b.totalValue)}</td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(b.commissionAmount)}</p>
                        <p className="text-xs text-slate-400">{(b.commissionRate * 100).toFixed(0)}%</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={commissionStatusVariant(effectiveStatus as 'pending') as 'success'}>
                          {effectiveStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {effectiveStatus === 'pending' && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                            onClick={() => approveComm(b.id)}
                          >
                            <CheckCircle size={12} className="mr-1" /> Approve
                          </Button>
                        )}
                        {effectiveStatus === 'approved' && (
                          <span className="text-xs text-emerald-600 font-medium">Ready to pay</span>
                        )}
                        {effectiveStatus === 'paid' && (
                          <span className="text-xs text-slate-400">Paid</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
