'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getBookingsForAdvisor, getAllBookings, formatDate, formatFileSize, formatCurrency } from '@/lib/mockData';
import { Invoice } from '@/types';
import { FileText, Download, Upload, Search, Filter, Trash2, Eye, FolderOpen } from 'lucide-react';

type DocTypeFilter = 'all' | 'supplier' | 'client' | 'commission';

const DOC_TYPE_COLORS: Record<string, string> = {
  supplier: 'info',
  client: 'neutral',
  commission: 'success',
};

export default function InvoicesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocTypeFilter>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const bookings = useMemo(() => {
    if (!user) return [];
    return user.role === 'super_admin' ? getAllBookings() : getBookingsForAdvisor(user.id);
  }, [user]);

  const allInvoices = useMemo(() => {
    return bookings.flatMap((b) =>
      b.invoices.map((inv) => ({
        ...inv,
        bookingId: b.id,
        clientName: b.clientName,
        destination: b.destination,
        bookingValue: b.totalValue,
      }))
    );
  }, [bookings]);

  const filtered = useMemo(() => {
    return allInvoices.filter((inv) => {
      const matchSearch = !search ||
        inv.fileName.toLowerCase().includes(search.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
        inv.bookingId.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || inv.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [allInvoices, search, typeFilter]);

  const groupedByBooking = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((inv) => {
      if (!groups[inv.bookingId]) groups[inv.bookingId] = [];
      groups[inv.bookingId].push(inv);
    });
    return groups;
  }, [filtered]);

  const stats = {
    total: allInvoices.length,
    supplier: allInvoices.filter((i) => i.type === 'supplier').length,
    client: allInvoices.filter((i) => i.type === 'client').length,
    commission: allInvoices.filter((i) => i.type === 'commission').length,
  };

  return (
    <AppShell
      title="Invoices & Documents"
      subtitle="Secure document storage"
      actions={
        <Button size="sm" onClick={() => setShowUpload(true)}>
          <Upload size={14} className="mr-1" /> Upload Document
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'All Documents', count: stats.total, color: 'bg-slate-100 text-slate-700' },
            { label: 'Supplier Invoices', count: stats.supplier, color: 'bg-sky-100 text-sky-700' },
            { label: 'Client Invoices', count: stats.client, color: 'bg-slate-100 text-slate-700' },
            { label: 'Commission Docs', count: stats.commission, color: 'bg-emerald-100 text-emerald-700' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{s.count}</p>
            </div>
          ))}
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <Card className={`border-2 ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-dashed border-slate-300'} transition-colors`}>
            <div
              className="py-8 text-center"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); setShowUpload(false); }}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Upload size={24} className="text-blue-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">Upload Document</h3>
              <p className="text-sm text-slate-500 mb-4">Drag & drop files here, or click to browse</p>
              <p className="text-xs text-slate-400 mb-4">Supported: PDF, PNG, JPG, DOCX — Max 25MB per file</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
                <Button onClick={() => setShowUpload(false)}>
                  <FolderOpen size={14} className="mr-1" /> Browse Files
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {(['all', 'supplier', 'client', 'commission'] as DocTypeFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  typeFilter === t ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Document List Grouped by Booking */}
        {Object.keys(groupedByBooking).length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FileText size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">No documents found</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByBooking).map(([bookingId, invoices]) => {
              const first = invoices[0];
              return (
                <Card key={bookingId} padding={false}>
                  <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-xl">
                    <div>
                      <span className="text-sm font-semibold text-blue-600">{bookingId}</span>
                      <span className="text-xs text-slate-400 ml-3">{first.clientName}</span>
                    </div>
                    <span className="text-xs text-slate-400">{invoices.length} file{invoices.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                            <FileText size={16} className="text-red-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{inv.fileName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant={DOC_TYPE_COLORS[inv.type] as 'info'} size="sm">{inv.type}</Badge>
                              <span className="text-xs text-slate-400">{formatFileSize(inv.fileSize)}</span>
                              <span className="text-xs text-slate-400">{formatDate(inv.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Preview">
                            <Eye size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Download">
                            <Download size={14} />
                          </button>
                          {user?.role === 'super_admin' && (
                            <button className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
