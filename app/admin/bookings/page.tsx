'use client';

import { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getAllBookings, formatCurrency, formatDate } from '@/lib/mockData';
import { bookingStatusVariant, commissionStatusVariant, exportToCSV } from '@/lib/statusHelpers';
import { Search, Download, ExternalLink, Filter } from 'lucide-react';
import Link from 'next/link';
import { BookingStatus, TravelType } from '@/types';

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  const bookings = getAllBookings();

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch = !search ||
        b.clientName.toLowerCase().includes(search.toLowerCase()) ||
        b.destination.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.advisorName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, search, statusFilter]);

  const handleExport = () => {
    exportToCSV(
      filtered.map((b) => ({
        'Booking ID': b.id,
        'Advisor': b.advisorName,
        'Client': b.clientName,
        'Email': b.clientEmail,
        'Phone': b.clientPhone,
        'Destination': b.destination,
        'Travel Type': b.travelType,
        'Departure': b.departureDate,
        'Return': b.returnDate,
        'Passengers': b.passengers,
        'Total Value': b.totalValue,
        'Commission Rate': `${(b.commissionRate * 100).toFixed(0)}%`,
        'Commission Amount': b.commissionAmount,
        'Commission Status': b.commissionStatus,
        'Booking Status': b.bookingStatus,
        'Supplier': b.supplierName,
        'Confirmation #': b.confirmationNumber,
        'Created': b.createdAt,
      })),
      'xullu-bookings'
    );
  };

  const totalValue = filtered.reduce((s, b) => s + b.totalValue, 0);
  const totalComm = filtered.reduce((s, b) => s + b.commissionAmount, 0);

  return (
    <AppShell
      title="All Bookings"
      subtitle={`${filtered.length} bookings`}
      actions={
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 font-medium">Total Value</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{formatCurrency(totalValue)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 font-medium">Total Commission</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{formatCurrency(totalComm)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 font-medium">Bookings Shown</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{filtered.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client, advisor, destination, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as (BookingStatus | 'all')[]).map((s) => (
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Destination</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Commission</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="text-sm font-semibold text-blue-600">{b.id}</p>
                      <p className="text-xs text-slate-400">{formatDate(b.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{b.advisorName}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{b.clientName}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-sm text-slate-600 max-w-40 truncate">{b.destination}</p>
                      <p className="text-xs text-slate-400 capitalize">{b.travelType}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">{formatCurrency(b.totalValue)}</td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <p className="text-sm font-semibold text-emerald-600">{formatCurrency(b.commissionAmount)}</p>
                      <Badge variant={commissionStatusVariant(b.commissionStatus) as 'success'} size="sm">{b.commissionStatus}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={bookingStatusVariant(b.bookingStatus) as 'success'}>{b.bookingStatus}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/bookings/${b.id}`}>
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                          <ExternalLink size={14} />
                        </button>
                      </Link>
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
