'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Select, TextArea } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { getTierConfig } from '@/lib/mockData';
import { formatCurrency } from '@/lib/mockData';
import { CheckCircle, ChevronRight, ChevronLeft, Plane, Users, DollarSign, FileText } from 'lucide-react';

type TravelType = 'cruise' | 'resort' | 'tour' | 'flight' | 'hotel' | 'package';

interface FormData {
  // Step 1 - Client Info
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  passengers: string;
  // Step 2 - Trip Details
  travelType: TravelType;
  destination: string;
  departureDate: string;
  returnDate: string;
  supplierName: string;
  confirmationNumber: string;
  // Step 3 - Financials
  totalValue: string;
  notes: string;
}

const STEPS = [
  { id: 1, label: 'Client Info', icon: Users },
  { id: 2, label: 'Trip Details', icon: Plane },
  { id: 3, label: 'Financials', icon: DollarSign },
  { id: 4, label: 'Review', icon: FileText },
];

const TRAVEL_TYPE_OPTIONS = [
  { value: 'cruise', label: 'Cruise' },
  { value: 'resort', label: 'Resort / Hotel' },
  { value: 'tour', label: 'Guided Tour' },
  { value: 'flight', label: 'Flight Only' },
  { value: 'hotel', label: 'Hotel Only' },
  { value: 'package', label: 'Vacation Package' },
];

export default function NewBookingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const tierCfg = user ? getTierConfig(user.tier) : null;
  const commissionRate = tierCfg?.rate || 0.08;

  const [form, setForm] = useState<FormData>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    passengers: '2',
    travelType: 'cruise',
    destination: '',
    departureDate: '',
    returnDate: '',
    supplierName: '',
    confirmationNumber: '',
    totalValue: '',
    notes: '',
  });

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (s: number): boolean => {
    const errs: Partial<FormData> = {};
    if (s === 1) {
      if (!form.clientName.trim()) errs.clientName = 'Client name is required';
      if (!form.clientEmail.trim()) errs.clientEmail = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.clientEmail)) errs.clientEmail = 'Invalid email';
      if (!form.clientPhone.trim()) errs.clientPhone = 'Phone is required';
    }
    if (s === 2) {
      if (!form.destination.trim()) errs.destination = 'Destination is required';
      if (!form.departureDate) errs.departureDate = 'Departure date is required';
      if (!form.returnDate) errs.returnDate = 'Return date is required';
      if (!form.supplierName.trim()) errs.supplierName = 'Supplier name is required';
    }
    if (s === 3) {
      if (!form.totalValue || isNaN(parseFloat(form.totalValue)) || parseFloat(form.totalValue) <= 0)
        errs.totalValue = 'Valid booking value is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(4, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const commissionAmount = form.totalValue ? parseFloat(form.totalValue) * commissionRate : 0;

  if (submitted) {
    return (
      <AppShell title="New Booking" subtitle="Booking submission">
        <div className="max-w-lg mx-auto">
          <Card className="text-center">
            <div className="py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Booking Submitted!</h2>
              <p className="text-slate-500 text-sm mb-1">
                {form.clientName}&apos;s booking to {form.destination} has been submitted successfully.
              </p>
              <p className="text-sm text-slate-400 mb-6">
                Estimated commission: <strong className="text-emerald-600">{formatCurrency(commissionAmount)}</strong>
              </p>
              <div className="bg-slate-50 rounded-lg p-4 text-left mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Booking ID</span>
                  <span className="font-mono font-semibold text-slate-800">BK-2024-011</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="text-amber-600 font-medium">Pending Review</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Commission Rate</span>
                  <span className="font-semibold text-slate-800">{(commissionRate * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => router.push('/bookings')}>
                  View All Bookings
                </Button>
                <Button className="flex-1" onClick={() => { setSubmitted(false); setStep(1); setForm({ clientName: '', clientEmail: '', clientPhone: '', passengers: '2', travelType: 'cruise', destination: '', departureDate: '', returnDate: '', supplierName: '', confirmationNumber: '', totalValue: '', notes: '' }); }}>
                  New Booking
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="New Booking" subtitle="Submit a new travel booking">
      <div className="max-w-2xl mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    done ? 'bg-blue-600 border-blue-600' : active ? 'border-blue-600 bg-white' : 'border-slate-200 bg-white'
                  }`}>
                    {done ? (
                      <CheckCircle size={18} className="text-white" />
                    ) : (
                      <Icon size={16} className={active ? 'text-blue-600' : 'text-slate-400'} />
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${active ? 'text-blue-600' : done ? 'text-slate-500' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 ${done ? 'bg-blue-600' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        <Card>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Client Information</h3>
              <Input label="Client Name" placeholder="e.g. John & Jane Smith" value={form.clientName} onChange={(e) => update('clientName', e.target.value)} error={errors.clientName} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Email Address" type="email" placeholder="client@email.com" value={form.clientEmail} onChange={(e) => update('clientEmail', e.target.value)} error={errors.clientEmail} required />
                <Input label="Phone Number" placeholder="+1 (555) 000-0000" value={form.clientPhone} onChange={(e) => update('clientPhone', e.target.value)} error={errors.clientPhone} required />
              </div>
              <Input label="Number of Passengers" type="number" min="1" max="100" value={form.passengers} onChange={(e) => update('passengers', e.target.value)} required />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Trip Details</h3>
              <Select
                label="Travel Type"
                options={TRAVEL_TYPE_OPTIONS}
                value={form.travelType}
                onChange={(e) => update('travelType', e.target.value)}
                required
              />
              <Input label="Destination" placeholder="e.g. Mediterranean Cruise – Italy, Greece, Croatia" value={form.destination} onChange={(e) => update('destination', e.target.value)} error={errors.destination} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Departure Date" type="date" value={form.departureDate} onChange={(e) => update('departureDate', e.target.value)} error={errors.departureDate} required />
                <Input label="Return Date" type="date" value={form.returnDate} onChange={(e) => update('returnDate', e.target.value)} error={errors.returnDate} required />
              </div>
              <Input label="Supplier Name" placeholder="e.g. Royal Caribbean International" value={form.supplierName} onChange={(e) => update('supplierName', e.target.value)} error={errors.supplierName} required />
              <Input label="Supplier Confirmation Number" placeholder="e.g. RC-887234" value={form.confirmationNumber} onChange={(e) => update('confirmationNumber', e.target.value)} hint="Leave blank if not yet received" />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Financials & Notes</h3>
              <Input label="Total Booking Value (USD)" type="number" min="0" step="0.01" placeholder="0.00" value={form.totalValue} onChange={(e) => update('totalValue', e.target.value)} error={errors.totalValue} required />

              {form.totalValue && parseFloat(form.totalValue) > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-emerald-800 mb-1">Estimated Commission</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatCurrency(commissionAmount)}</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    {(commissionRate * 100).toFixed(0)}% rate based on your{' '}
                    <strong className="capitalize">{user?.tier}</strong> tier
                  </p>
                </div>
              )}

              <TextArea label="Notes" placeholder="Special requests, client preferences, internal notes..." rows={4} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Review & Submit</h3>
              <div className="space-y-3">
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Client</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-slate-400 text-xs">Name</p><p className="font-medium">{form.clientName}</p></div>
                    <div><p className="text-slate-400 text-xs">Email</p><p className="font-medium">{form.clientEmail}</p></div>
                    <div><p className="text-slate-400 text-xs">Phone</p><p className="font-medium">{form.clientPhone}</p></div>
                    <div><p className="text-slate-400 text-xs">Passengers</p><p className="font-medium">{form.passengers}</p></div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Trip</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="col-span-2"><p className="text-slate-400 text-xs">Destination</p><p className="font-medium">{form.destination}</p></div>
                    <div><p className="text-slate-400 text-xs">Departure</p><p className="font-medium">{form.departureDate}</p></div>
                    <div><p className="text-slate-400 text-xs">Return</p><p className="font-medium">{form.returnDate}</p></div>
                    <div><p className="text-slate-400 text-xs">Type</p><p className="font-medium capitalize">{form.travelType}</p></div>
                    <div><p className="text-slate-400 text-xs">Supplier</p><p className="font-medium">{form.supplierName}</p></div>
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-emerald-600 font-medium">Booking Value</p>
                      <p className="text-xl font-bold text-slate-900">{formatCurrency(parseFloat(form.totalValue || '0'))}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-emerald-600 font-medium">Your Commission</p>
                      <p className="text-xl font-bold text-emerald-700">{formatCurrency(commissionAmount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
            <Button variant="outline" onClick={back} disabled={step === 1}>
              <ChevronLeft size={16} className="mr-1" /> Back
            </Button>
            {step < 4 ? (
              <Button onClick={next}>
                Continue <ChevronRight size={16} className="ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
                Submit Booking
              </Button>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
