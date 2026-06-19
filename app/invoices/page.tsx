'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getBookingsForAdvisor, getAllBookings, formatDate, formatFileSize, formatCurrency } from '@/lib/mockData';
import { FileText, Download, Upload, Search, Trash2, Eye, FolderOpen, X, CheckCircle, File, Image, Dot } from 'lucide-react';

type DocTypeFilter = 'all' | 'supplier' | 'client' | 'commission';

const DOC_TYPE_COLORS: Record<string, string> = {
  supplier: 'info',
  client: 'neutral',
  commission: 'success',
};

const FILE_ICONS: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  'application/pdf': { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
  'image/jpeg': { icon: Image, color: 'text-blue-500', bg: 'bg-blue-50' },
  'image/png': { icon: Image, color: 'text-blue-500', bg: 'bg-blue-50' },
  default: { icon: File, color: 'text-slate-500', bg: 'bg-slate-50' },
};

export default function InvoicesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocTypeFilter>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

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
    ).filter((inv) => !deletedIds.has(inv.id));
  }, [bookings, deletedIds]);

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

  const handleDownload = (fileName: string) => {
    showToast(`Downloading ${fileName}...`, 'info');
  };

  const handlePreview = (fileName: string) => {
    setPreviewDoc(fileName);
  };

  const handleDelete = (id: string, fileName: string) => {
    setDeletedIds((prev) => new Set([...prev, id]));
    showToast(`Deleted ${fileName}`);
  };

  const handleUpload = () => {
    setShowUpload(false);
    showToast('Document uploaded successfully');
  };

  const getFileIcon = (fileType: string) => {
    return FILE_ICONS[fileType] || FILE_ICONS.default;
  };

  return (
    <AppShell
      title="Documents"
      subtitle="Manage invoices and booking documents"
      actions={
        <Button size="sm" onClick={() => setShowUpload(true)}>
          <Upload size={14} className="mr-1" /> Upload
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-20 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border fade-in-up ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <CheckCircle size={16} />
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setPreviewDoc(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 fade-in-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Document Preview</h3>
                <button onClick={() => setPreviewDoc(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col items-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                <FileText size={48} className="text-red-400 mb-4" />
                <p className="text-sm font-semibold text-slate-700 mb-1">{previewDoc}</p>
                <p className="text-xs text-slate-400 mb-6">Preview not available in demo mode</p>
                <Button size="sm" onClick={() => { handleDownload(previewDoc); setPreviewDoc(null); }}>
                  <Download size={14} className="mr-1" /> Download Instead
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'All Documents', count: stats.total, color: 'bg-slate-100 text-slate-700', active: typeFilter === 'all', filter: 'all' as DocTypeFilter },
            { label: 'Supplier Invoices', count: stats.supplier, color: 'bg-sky-100 text-sky-700', active: typeFilter === 'supplier', filter: 'supplier' as DocTypeFilter },
            { label: 'Client Invoices', count: stats.client, color: 'bg-slate-100 text-slate-700', active: typeFilter === 'client', filter: 'client' as DocTypeFilter },
            { label: 'Commission Docs', count: stats.commission, color: 'bg-emerald-100 text-emerald-700', active: typeFilter === 'commission', filter: 'commission' as DocTypeFilter },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setTypeFilter(s.filter)}
              className={`text-left bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
                s.active ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'
              }`}
            >
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{s.count}</p>
            </button>
          ))}
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <Card className={`border-2 ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-dashed border-slate-300'} transition-colors`}>
            <div
              className="py-8 text-center"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(); }}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Upload size={24} className="text-blue-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">Upload Document</h3>
              <p className="text-sm text-slate-500 mb-4">Drag & drop files here, or click to browse</p>
              <p className="text-xs text-slate-400 mb-4">Supported: PDF, PNG, JPG, DOCX — Max 25MB per file</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
                <Button onClick={handleUpload}>
                  <FolderOpen size={14} className="mr-1" /> Browse Files
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by file name, client, or booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Document List Grouped by Booking */}
        {Object.keys(groupedByBooking).length === 0 ? (
          <Card>
            <div className="text-center py-16">
              <FolderOpen size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500 mb-1">No documents found</p>
              <p className="text-xs text-slate-400">
                {search || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Upload your first document to get started'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByBooking).map(([bookingId, invoices]) => {
              const first = invoices[0];
              return (
                <Card key={bookingId} padding={false}>
                  <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-blue-600 font-mono">{bookingId}</span>
                      <Dot size={16} className="text-slate-300" />
                      <span className="text-sm text-slate-600">{first.clientName}</span>
                      <Dot size={16} className="text-slate-300" />
                      <span className="text-xs text-slate-400">{first.destination}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {invoices.length} file{invoices.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {invoices.map((inv) => {
                      const fileIcon = getFileIcon(inv.fileType);
                      const IconComp = fileIcon.icon;
                      return (
                        <div key={inv.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-10 h-10 rounded-lg ${fileIcon.bg} flex items-center justify-center flex-shrink-0`}>
                              <IconComp size={18} className={fileIcon.color} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800 truncate">{inv.fileName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant={DOC_TYPE_COLORS[inv.type] as 'info'} size="sm">{inv.type}</Badge>
                                <span className="text-xs text-slate-400">{formatFileSize(inv.fileSize)}</span>
                                <span className="text-xs text-slate-400">{formatDate(inv.uploadedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handlePreview(inv.fileName)}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Preview"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleDownload(inv.fileName)}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors"
                              title="Download"
                            >
                              <Download size={15} />
                            </button>
                            {user?.role === 'super_admin' && (
                              <button
                                onClick={() => handleDelete(inv.id, inv.fileName)}
                                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
