'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, getTierConfig } from '@/lib/mockData';
import { User, Bell, Shield, Mail, CreditCard, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [agency, setAgency] = useState(user?.agency || '');

  const tierCfg = user ? getTierConfig(user.tier) : null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppShell title="Settings" subtitle="Manage your account preferences">
      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User size={18} className="text-slate-500" />
              <CardTitle>Profile Information</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white">
                {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{user?.name}</p>
                <p className="text-sm text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                {tierCfg && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${tierCfg.bgColor} ${tierCfg.color}`}>
                    {tierCfg.label} Advisor — {(tierCfg.rate * 100).toFixed(0)}% commission
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Agency Name" value={agency} onChange={(e) => setAgency(e.target.value)} />
            </div>
            <div className="flex items-center justify-between pt-2">
              {saved && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle size={16} />
                  <span className="text-sm">Changes saved!</span>
                </div>
              )}
              <Button onClick={handleSave} className={saved ? '' : 'ml-auto'}>Save Changes</Button>
            </div>
          </div>
        </Card>

        {/* Commission Summary */}
        {user?.role === 'advisor' && tierCfg && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-slate-500" />
                <CardTitle>Commission Summary</CardTitle>
              </div>
            </CardHeader>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-medium">Current Tier</p>
                <p className={`text-lg font-bold mt-1 ${tierCfg.color}`}>{tierCfg.label}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-medium">Commission Rate</p>
                <p className="text-lg font-bold text-slate-800 mt-1">{(tierCfg.rate * 100).toFixed(0)}%</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-medium">YTD Sales</p>
                <p className="text-lg font-bold text-slate-800 mt-1">{formatCurrency(user.ytdSales)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-slate-500" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {[
              { label: 'Commission approved', desc: 'Get notified when a commission is approved' },
              { label: 'Commission paid', desc: 'Get notified when commission payment is processed' },
              { label: 'Booking status updates', desc: 'Updates on your submitted bookings' },
              { label: 'Tier upgrades', desc: 'Notifications when you reach a new commission tier' },
              { label: 'Monthly summary', desc: 'Monthly performance summary email' },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">{n.label}</p>
                  <p className="text-xs text-slate-400">{n.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-slate-500" />
              <CardTitle>Security</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Change Password</p>
              <div className="space-y-3">
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <Input label="New Password" type="password" placeholder="••••••••" hint="Minimum 8 characters" />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" />
              </div>
              <Button variant="outline" className="mt-4">Update Password</Button>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
