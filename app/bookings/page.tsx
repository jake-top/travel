'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getBookingsForAdvisor, getAllBookings, formatCurrency, formatDate } from '@/lib/mockData';
import { bookingStatusVariant, commissionStatusVariant } from '@/lib/statusHelpers';
import { Search, Filter, Plus, MapPin, Calendar, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Booking, BookingStatus } from '@/types';

const STATUS_FILTERS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function BookingsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  const allBookings: Booking[] = useMemo(() => {
    if (!user) return [];
    return user.role === 'super_admin' ? getAllBookings() : getBookingsForAdvisor(user.id);
  }, [user]);

  const filtered = useMemo(() => {
    return allBookings.filter((b) => {
      const matchesSearch =
        !search ||
        b.clientName.toLowerCase().includes(search.toLowerCase()) ||
        b.destination.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.confirmationNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allBookings, search, statusFilter]);

  const totalValue = filtered.reduce((s, b) => s + b.totalValue, 0);
  const totalComm = filtered.reduce((s, b) => s + b.commissionAmount, 0);

  return (
    <AppShell
      title="Bookings"
      subtitle={`${filtered.length} bookings`}
      actions={
        <Link href="/bookings/new">
          <Button size="sm"><Plus size={14} className="mr-1" /> New Booking</Button>
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Summary Bar */}
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
            <p className="text-xs text-slate-500 font-medium">Bookings</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{filtered.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client, destination, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === f.value ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.label}
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Destination</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Travel Dates</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Commission</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-blue-600">{booking.id}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{booking.confirmationNumber}</p>
                      {user?.role === 'super_admin' && (
                        <p className="text-xs text-slate-400">{booking.advisorName}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-slate-800">{booking.clientName}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Users size={11} className="text-slate-400" />
                        <span className="text-xs text-slate-400">{booking.passengers} pax</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex items-start gap-1">
                        <MapPin size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-600 line-clamp-2 max-w-48">{booking.destination}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">{booking.travelType}</p>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar size={11} />
                        {formatDate(booking.departureDate)}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">→ {formatDate(booking.returnDate)}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-sm font-semibold text-slate-800">{formatCurrency(booking.totalValue)}</p>
                    </td>
                    <td className="px-4 py-4 text-right hidden md:table-cell">
                      <p className="text-sm font-semibold text-emerald-600">{formatCurrency(booking.commissionAmount)}</p>
                      <Badge variant={commissionStatusVariant(booking.commissionStatus) as 'success'} size="sm">
                        {booking.commissionStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant={bookingStatusVariant(booking.bookingStatus) as 'success'}>
                        {booking.bookingStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/bookings/${booking.id}`}>
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                          <ExternalLink size={14} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No bookings found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
