'use client';

import { useState, useMemo, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getAllBookings, getAllAdvisors, formatDate, formatFileSize, formatCurrency } from '@/lib/mockData';
import { exportToCSV } from '@/lib/statusHelpers';
import { FileText, Download, Upload, Search, Trash2, Eye, FolderOpen, X, CheckCircle, File, Image, Users } from 'lucide-react';

type DocTypeFilter = 'all' | 'supplier' | 'client' | 'commission';

const DOC_TYPE_COLORS: Record<string, string> = {
  supplier: 'info',
  client: 'neutral',
  commission: 'success',
};

export default function AdminInvoicesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocTypeFilter>('all');
  const [advisorFilter, setAdvisorFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const advisors = getAllAdvisors();
  const bookings = getAllBookings();

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const allInvoices = useMemo(() => {
    return bookings.flatMap((b) =>
      b.invoices.map((inv) => ({
        ...inv,
        bookingId: b.id,
        advisorId: b.advisorId,
        advisorName: b.advisorName,
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
        inv.advisorName.toLowerCase().includes(search.toLowerCase()) ||
        inv.bookingId.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || inv.type === typeFilter;
      const matchAdvisor = advisorFilter === 'all' || inv.advisorId === advisorFilter;
      return matchSearch && matchType && matchAdvisor;
    });
  }, [allInvoices, search, typeFilter, advisorFilter]);

  const stats = {
    total: allInvoices.length,
    supplier: allInvoices.filter((i) => i.type === 'supplier').length,
    client: allInvoices.filter((i) => i.type === 'client').length,
    commission: allInvoices.filter((i) => i.type === 'commission').length,
    totalSize: allInvoices.reduce((s, i) => s + i.fileSize, 0),
  };

  const handleDownload = (fileName: string) => showToast(`Downloading ${fileName}...`, 'info');
  const handlePreview = (fileName: string) => setPreviewDoc(fileName);
  const handleDelete = (id: string, fileName: string) => {
    setDeletedIds((prev) => new Set([...prev, id]));
    showToast(`Deleted ${fileName}`);
  };

  const handleExport = () => {
    exportToCSV(
      filtered.map((inv) => ({
        'File Name': inv.fileName,
        'Type': inv.type,
        'Booking ID': inv.bookingId,
        'Advisor': inv.advisorName,
        'Client': inv.clientName,
        'File Size': formatFileSize(inv.fileSize),
        'Uploaded': inv.uploadedAt,
      })),
      'xullu-documents'
    );
    showToast('CSV exported successfully');
  };

  return (
    <AppShell
      title="Document Management"
      subtitle={`${stats.total} documents - ${formatFileSize(stats.totalSize)} total`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download size={14} className="mr-1" /> Export
          </Button>
          <Button size="sm" onClick={() => setShowUpload(true)}>
            <Upload size={14} className="mr-1" /> Upload
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-20 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border fade-in-up ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <CheckCircle size={16} />
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X size={14} /></button>
          </div>
        )}

        {/* Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setPreviewDoc(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 fade-in-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Document Preview</h3>
                <button onClick={() => setPreviewDoc(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
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

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'All Documents', count: stats.total, filter: 'all' as DocTypeFilter },
            { label: 'Supplier Invoices', count: stats.supplier, filter: 'supplier' as DocTypeFilter },
            { label: 'Client Invoices', count: stats.client, filter: 'client' as DocTypeFilter },
            { label: 'Commission Docs', count: stats.commission, filter: 'commission' as DocTypeFilter },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setTypeFilter(s.filter)}
              className={`text-left bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
                typeFilter === s.filter ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'
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
              onDrop={(e) => { e.preventDefault(); setDragOver(false); setShowUpload(false); showToast('Document uploaded successfully'); }}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Upload size={24} className="text-blue-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">Upload Document</h3>
              <p className="text-sm text-slate-500 mb-4">Drag & drop files here, or click to browse</p>
              <p className="text-xs text-slate-400 mb-4">Supported: PDF, PNG, JPG, DOCX — Max 25MB per file</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
                <Button onClick={() => { setShowUpload(false); showToast('Document uploaded successfully'); }}>
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
              placeholder="Search documents, clients, advisors..."
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
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <select
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
              className="border border-slate-200 rounded-xl text-sm px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Advisors</option>
              {advisors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Document Table */}
        {filtered.length === 0 ? (
          <Card>
            <div className="text-center py-16">
              <FolderOpen size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500 mb-1">No documents found</p>
              <p className="text-xs text-slate-400">
                {search || typeFilter !== 'all' || advisorFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No documents have been uploaded yet'}
              </p>
            </div>
          </Card>
        ) : (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Booking</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Advisor</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Size</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Uploaded</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                            <FileText size={16} className="text-red-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate max-w-48">{inv.fileName}</p>
                            <p className="text-xs text-slate-400">{inv.clientName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={DOC_TYPE_COLORS[inv.type] as 'info'} size="sm">{inv.type}</Badge>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-sm font-mono text-blue-600">{inv.bookingId}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-sm text-slate-600">{inv.advisorName}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-slate-500">{formatFileSize(inv.fileSize)}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-xs text-slate-500">{formatDate(inv.uploadedAt)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handlePreview(inv.fileName)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Preview">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handleDownload(inv.fileName)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors" title="Download">
                            <Download size={14} />
                          </button>
                          <button onClick={() => handleDelete(inv.id, inv.fileName)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400">
              Showing {filtered.length} of {allInvoices.length} documents
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
