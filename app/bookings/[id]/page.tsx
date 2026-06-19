'use client';

import { use, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { MOCK_BOOKINGS, formatCurrency, formatDate, formatFileSize } from '@/lib/mockData';
import { bookingStatusVariant, commissionStatusVariant } from '@/lib/statusHelpers';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Phone,
  Mail,
  Building,
  Hash,
  FileText,
  Download,
  Upload,
  DollarSign,
  CheckCircle,
  X,
} from 'lucide-react';

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const booking = MOCK_BOOKINGS.find((b) => b.id === id);
  const [toast, setToast] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const showToastMsg = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  if (!booking) {
    return (
      <AppShell title="Booking Not Found">
        <div className="text-center py-16">
          <p className="text-slate-500">Booking {id} not found.</p>
          <Button variant="outline" onClick={() => router.push('/bookings')} className="mt-4">
            Back to Bookings
          </Button>
        </div>
      </AppShell>
    );
  }

  const statusVar = bookingStatusVariant(booking.bookingStatus);
  const commVar = commissionStatusVariant(booking.commissionStatus);

  return (
    <AppShell
      title={booking.id}
      subtitle={booking.clientName}
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push('/bookings')}>
          <ArrowLeft size={14} className="mr-1" /> Back
        </Button>
      }
    >
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-700 fade-in-up">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Trip Overview</CardTitle>
              <Badge variant={statusVar as 'success'}>{booking.bookingStatus}</Badge>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MapPin size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Destination</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{booking.destination}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Calendar size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Travel Dates</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {formatDate(booking.departureDate)} – {formatDate(booking.returnDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Users size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Passengers</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{booking.passengers}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Building size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Supplier</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{booking.supplierName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Hash size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Confirmation #</p>
                  <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">{booking.confirmationNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <FileText size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Travel Type</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{booking.travelType}</p>
                </div>
              </div>
            </div>
            {booking.notes && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium mb-1">Internal Notes</p>
                <p className="text-sm text-slate-600">{booking.notes}</p>
              </div>
            )}
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Documents & Invoices</CardTitle>
              <Button size="sm" variant="outline" onClick={() => showToastMsg('Document uploaded successfully')}>
                <Upload size={13} className="mr-1" /> Upload
              </Button>
            </CardHeader>
            {booking.invoices.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                <Upload size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No documents uploaded yet</p>
                <p className="text-xs text-slate-300 mt-1">Upload supplier invoices, client confirmations, or commission statements</p>
              </div>
            ) : (
              <div className="space-y-2">
                {booking.invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                        <FileText size={16} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{inv.fileName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={inv.type === 'supplier' ? 'info' : inv.type === 'client' ? 'neutral' : 'success'} size="sm">
                            {inv.type}
                          </Badge>
                          <span className="text-xs text-slate-400">{formatFileSize(inv.fileSize)}</span>
                          <span className="text-xs text-slate-400">{formatDate(inv.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => showToastMsg(`Downloading ${inv.fileName}...`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                      <Download size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                  {booking.clientName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{booking.clientName}</p>
                  <p className="text-xs text-slate-400">{booking.passengers} passenger{booking.passengers > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <a href={`mailto:${booking.clientEmail}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                  <Mail size={14} className="text-slate-400" />
                  {booking.clientEmail}
                </a>
                <a href={`tel:${booking.clientPhone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                  <Phone size={14} className="text-slate-400" />
                  {booking.clientPhone}
                </a>
              </div>
            </div>
          </Card>

          {/* Commission */}
          <Card>
            <CardHeader>
              <CardTitle>Commission</CardTitle>
              <Badge variant={commVar as 'success'}>{booking.commissionStatus}</Badge>
            </CardHeader>
            <div className="space-y-3">
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-xs text-emerald-600 font-medium">Commission Amount</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(booking.commissionAmount)}</p>
                <p className="text-xs text-emerald-500 mt-0.5">@ {(booking.commissionRate * 100).toFixed(0)}% rate</p>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                <span className="text-slate-500">Booking Value</span>
                <span className="font-semibold text-slate-800">{formatCurrency(booking.totalValue)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                <span className="text-slate-500">Rate</span>
                <span className="font-semibold text-slate-800">{(booking.commissionRate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-slate-500">Status</span>
                <Badge variant={commVar as 'success'}>{booking.commissionStatus}</Badge>
              </div>
            </div>
          </Card>

          {/* Advisor */}
          <Card>
            <CardHeader>
              <CardTitle>Advisor</CardTitle>
            </CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                {booking.advisorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{booking.advisorName}</p>
                <p className="text-xs text-slate-400">{formatDate(booking.createdAt)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
