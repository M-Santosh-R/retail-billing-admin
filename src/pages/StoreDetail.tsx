import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

type Tab = 'manage' | 'bills' | 'reports';

const IconBack = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

export default function StoreDetail() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('manage');

  const { data: stores = [] } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: adminApi.getStores,
  });

  const store = stores.find((s: any) => s.id === storeId);

  if (!store) {
    return (
      <div className="flex items-center justify-center mt-20 text-sm text-slate-400">
        Store not found
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'manage', label: 'Manage' },
    { key: 'bills', label: 'Bills' },
    { key: 'reports', label: 'Reports' },
  ];

  return (
    <div>
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
      >
        <IconBack />
        Stores
      </button>

      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">{store.name}</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {store.users?.[0]?.email || 'No owner assigned'}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-slate-200 mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'manage' && (
        <ManageTab storeId={storeId!} store={store} queryClient={queryClient} />
      )}
      {tab === 'bills' && <BillsTab storeId={storeId!} />}
      {tab === 'reports' && <ReportsTab storeId={storeId!} />}
    </div>
  );
}

/* ─── Manage Tab ─────────────────────────────────────────────────── */

function ManageTab({
  storeId,
  store,
  queryClient,
}: {
  storeId: string;
  store: any;
  queryClient: any;
}) {
  const navigate = useNavigate();

  const [name, setName] = useState(store?.name || '');
  const [address, setAddress] = useState(store?.address || '');
  const [phone, setPhone] = useState(store?.phone || '');
  const [gstNumber, setGstNumber] = useState(store?.gstNumber || '');
  const [footerMessage, setFooterMessage] = useState(store?.footerMessage || '');
  const [invoicePrefix, setInvoicePrefix] = useState(store?.invoicePrefix || 'INV');

  const [expiryDate, setExpiryDate] = useState(
    store?.expiryDate ? format(new Date(store.expiryDate), 'yyyy-MM-dd') : '',
  );
  const [isActive, setIsActive] = useState(store?.isActive ?? true);
  const [maxDevices, setMaxDevices] = useState<number>(store?.maxDevices ?? 2);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: devices = [] } = useQuery({
    queryKey: ['store-devices', storeId],
    queryFn: () => adminApi.getStoreDevices(storeId),
  });

  const updateDetails = useMutation({
    mutationFn: () =>
      adminApi.updateStoreDetails(storeId, {
        name,
        address,
        phone,
        gstNumber,
        footerMessage,
        invoicePrefix: invoicePrefix.trim().toUpperCase() || 'INV',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      toast.success('Store details updated');
    },
    onError: () => toast.error('Update failed'),
  });

  const updateSub = useMutation({
    mutationFn: () =>
      adminApi.updateSubscription(storeId, { plan: store?.subscriptionPlan || 'free', expiryDate, isActive, maxDevices }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      toast.success('Subscription updated');
    },
    onError: () => toast.error('Update failed'),
  });

  const forceLogout = useMutation({
    mutationFn: adminApi.forceLogout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-devices', storeId] });
      toast.success('Device logged out');
    },
  });

  const deleteStore = useMutation({
    mutationFn: () => adminApi.deleteStore(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      toast.success('Store deleted');
      navigate('/stores');
    },
    onError: () => toast.error('Delete failed'),
  });

  return (
    <div className="space-y-5">
      {/* Store Details */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Store Details</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Store Name
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="field"
              placeholder="+91 99999 99999"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              GST Number
            </label>
            <input
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="field"
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Invoice Prefix
            </label>
            <div className="flex items-center gap-2">
              <input
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                className="field w-32"
                placeholder="INV"
                maxLength={10}
              />
              <span className="text-xs text-slate-400 whitespace-nowrap">
                e.g. <span className="font-mono text-slate-600">
                  {(invoicePrefix || 'INV').toUpperCase()}-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}-0001
                </span>
              </span>
            </div>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Receipt Footer Message
            </label>
            <input
              value={footerMessage}
              onChange={(e) => setFooterMessage(e.target.value)}
              className="field"
              placeholder="Thank you for shopping with us!"
            />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => updateDetails.mutate()}
            disabled={updateDetails.isPending}
            className="btn-primary"
          >
            {updateDetails.isPending ? 'Saving...' : 'Save Details'}
          </button>
        </div>
      </div>

      {/* Subscription + Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Subscription */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Subscription</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                Max Devices Allowed
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxDevices}
                onChange={(e) => setMaxDevices(Math.max(1, parseInt(e.target.value) || 1))}
                className="field w-24"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                Store Active
              </label>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => updateSub.mutate()}
              disabled={updateSub.isPending}
              className="btn-primary"
            >
              {updateSub.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Devices */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Active Devices
            <span className="ml-1.5 text-xs font-normal text-slate-400">
              ({devices.length})
            </span>
          </h2>
          {devices.length === 0 ? (
            <p className="text-sm text-slate-400">No active devices</p>
          ) : (
            <div className="space-y-2">
              {devices.map((device: any) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-md border border-slate-100"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {device.deviceName || 'Unknown Device'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Last login:{' '}
                      {format(new Date(device.lastLogin), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>
                  <button
                    onClick={() => forceLogout.mutate(device.id)}
                    className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                  >
                    Force logout
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h2>
        <p className="text-sm text-slate-500 mb-4">
          Permanently deletes this store along with all bills, items, and user
          accounts. This action cannot be undone.
        </p>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            Delete Store
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-red-600">
              This cannot be undone. Continue?
            </span>
            <button
              onClick={() => deleteStore.mutate()}
              disabled={deleteStore.isPending}
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleteStore.isPending ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Shared date-range helpers ─────────────────────────────────── */

type Preset = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_30' | 'custom';

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today',      label: 'Today' },
  { key: 'yesterday',  label: 'Yesterday' },
  { key: 'this_week',  label: 'This Week' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_30',    label: 'Last 30 Days' },
  { key: 'custom',     label: 'Custom' },
];

function toYMD(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

function presetDates(key: Preset): { start: string; end: string } | null {
  const now  = new Date();
  const today = toYMD(now);
  if (key === 'today')      return { start: today, end: today };
  if (key === 'yesterday')  { const y = new Date(now); y.setDate(y.getDate() - 1); const d = toYMD(y); return { start: d, end: d }; }
  if (key === 'this_week')  { const w = new Date(now); w.setDate(w.getDate() - 7); return { start: toYMD(w), end: today }; }
  if (key === 'this_month') { return { start: toYMD(new Date(now.getFullYear(), now.getMonth(), 1)), end: today }; }
  if (key === 'last_30')    { const l = new Date(now); l.setDate(l.getDate() - 30); return { start: toYMD(l), end: today }; }
  return null;
}

function DateRangeFilter({
  startDate, endDate, onStart, onEnd, onClear,
  extra,
}: {
  startDate: string; endDate: string;
  onStart: (v: string) => void; onEnd: (v: string) => void; onClear: () => void;
  extra?: React.ReactNode;
}) {
  const [preset, setPreset] = useState<Preset | null>(null);

  const handlePreset = (key: Preset) => {
    setPreset(key);
    const dates = presetDates(key);
    if (dates) { onStart(dates.start); onEnd(dates.end); }
    else { onStart(''); onEnd(''); }
  };

  const handleClear = () => { setPreset(null); onClear(); };

  return (
    <div className="card p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handlePreset(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              preset === key
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            {label}
          </button>
        ))}
        {(startDate || endDate) && (
          <button onClick={handleClear} className="text-xs text-slate-400 hover:text-red-500 transition-colors ml-1">
            Clear
          </button>
        )}
        {extra && <div className="ml-auto">{extra}</div>}
      </div>

      {(preset === 'custom' || preset === null) && (
        <div className="flex flex-wrap gap-3 items-end pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">From</label>
            <input type="date" value={startDate} onChange={(e) => { setPreset('custom'); onStart(e.target.value); }} className="field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">To</label>
            <input type="date" value={endDate}   onChange={(e) => { setPreset('custom'); onEnd(e.target.value); }}   className="field" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Bills Tab ──────────────────────────────────────────────────── */

function BillsTab({ storeId }: { storeId: string }) {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [expandedBill, setExpandedBill] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['store-bills', storeId, search, startDate, endDate, page],
    queryFn: () =>
      adminApi.getStoreBills(storeId, {
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
      }),
  });

  const bills = data?.bills || [];
  const total = data?.total || 0;
  const totalAmount = data?.totalAmount || 0;
  const totalPages = Math.ceil(total / 20);
  const from = (page - 1) * 20 + 1;
  const to   = Math.min(page * 20, total);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const [exporting, setExporting] = useState(false);

  const exportCSV = async () => {
    if (total === 0) return;
    setExporting(true);
    try {
      const all = await adminApi.getStoreBills(storeId, {
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 9999,
        page: 1,
      });

      const allBills: any[] = all?.bills || [];
      const grandTotal: number = all?.totalAmount || 0;
      const rows: string[] = [];

      const period = startDate && endDate
        ? `${format(new Date(startDate), 'dd MMM yyyy')} to ${format(new Date(endDate), 'dd MMM yyyy')}`
        : 'All Time';

      rows.push('BILLS EXPORT');
      rows.push(`Period,${period}`);
      rows.push(`Total Bills,${allBills.length}`);
      rows.push(`Total Revenue,${grandTotal.toFixed(2)}`);
      rows.push('');

      rows.push('BILL SUMMARY');
      rows.push('Invoice Number,Date,Time,No. of Items,Total Amount');
      allBills.forEach((bill: any) => {
        const d = new Date(bill.createdAt);
        rows.push([
          bill.invoiceNumber,
          format(d, 'dd MMM yyyy'),
          format(d, 'HH:mm'),
          bill.items?.length ?? 0,
          parseFloat(bill.totalAmount).toFixed(2),
        ].join(','));
      });
      rows.push('');

      rows.push('LINE ITEMS');
      rows.push('Invoice Number,Item Name,Unit Price,Quantity,Subtotal');
      allBills.forEach((bill: any) => {
        (bill.items || []).forEach((item: any) => {
          rows.push([
            bill.invoiceNumber,
            `"${item.itemName}"`,
            parseFloat(item.itemPrice).toFixed(2),
            item.quantity,
            parseFloat(item.subtotal).toFixed(2),
          ].join(','));
        });
      });
      rows.push('');

      rows.push('TOTALS');
      rows.push(`Grand Total Revenue,${grandTotal.toFixed(2)}`);
      rows.push(`Total Bills,${allBills.length}`);
      if (allBills.length > 0) {
        rows.push(`Average Bill Value,${(grandTotal / allBills.length).toFixed(2)}`);
      }

      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `bills-${storeId}-${startDate || 'all'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search row */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
            Search invoice
          </label>
          <input
            type="text"
            placeholder="INV-000001"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="field"
          />
        </div>
      </div>

      {/* Date range filter */}
      <DateRangeFilter
        startDate={startDate} endDate={endDate}
        onStart={(v) => { setStartDate(v); setPage(1); }}
        onEnd={(v)   => { setEndDate(v);   setPage(1); }}
        onClear={() => { setStartDate(''); setEndDate(''); setPage(1); }}
        extra={
          <button
            onClick={exportCSV}
            disabled={exporting || total === 0}
            className="btn-secondary gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        }
      />

      {/* Summary bar */}
      {!isLoading && total > 0 && (
        <div className="flex items-center gap-6 px-1 text-sm text-slate-500">
          <span><span className="font-semibold text-slate-800">{total}</span> bills</span>
          <span><span className="font-semibold text-slate-800">{fmt(totalAmount)}</span> total</span>
          {(startDate || endDate) && startDate && endDate && (
            <span className="text-xs text-slate-400">
              {format(new Date(startDate), 'dd MMM yyyy')} — {format(new Date(endDate), 'dd MMM yyyy')}
            </span>
          )}
        </div>
      )}

      {/* Bills table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <p className="text-center text-sm text-slate-400 py-14">Loading bills...</p>
        ) : bills.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-14">No bills found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Invoice</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Items</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide">Total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.map((bill: any) => (
                <React.Fragment key={bill.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {bill.invoiceNumber}
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                      {format(new Date(bill.createdAt), 'dd MMM yyyy, HH:mm')}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {bill.items?.length || 0} item{bill.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-800">
                      &#8377;{parseFloat(bill.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() =>
                          setExpandedBill(
                            expandedBill === bill.id ? null : bill.id,
                          )
                        }
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        {expandedBill === bill.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {expandedBill === bill.id && (
                    <tr>
                      <td colSpan={5} className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                        <table className="w-full text-xs">
                          <thead>
                            <tr>
                              <th className="text-left pb-1.5 text-slate-400 font-medium uppercase tracking-wide">Item</th>
                              <th className="text-right pb-1.5 text-slate-400 font-medium uppercase tracking-wide">Price</th>
                              <th className="text-right pb-1.5 text-slate-400 font-medium uppercase tracking-wide">Qty</th>
                              <th className="text-right pb-1.5 text-slate-400 font-medium uppercase tracking-wide">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bill.items?.map((item: any, i: number) => (
                              <tr key={i} className="border-t border-slate-200">
                                <td className="py-1.5 text-slate-700">{item.itemName}</td>
                                <td className="py-1.5 text-right text-slate-600">
                                  &#8377;{parseFloat(item.itemPrice).toFixed(2)}
                                </td>
                                <td className="py-1.5 text-right text-slate-600">
                                  {item.quantity}
                                </td>
                                <td className="py-1.5 text-right font-medium text-slate-700">
                                  &#8377;{parseFloat(item.subtotal).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}

        {total > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            <span>Showing {from}–{to} of {total}</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border border-slate-200 rounded-md font-medium disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Prev
                </button>
                <span>{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-slate-200 rounded-md font-medium disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Reports Tab ────────────────────────────────────────────────── */

function ReportsTab({ storeId }: { storeId: string }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['store-reports', storeId, startDate, endDate],
    queryFn: () =>
      adminApi.getStoreReports(storeId, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const dashboard = data?.dashboard;
  const mostSold = data?.mostSold || [];
  const highestRevenue = data?.highestRevenue || [];

  const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const statCards = [
    {
      label: "Today's Sales",
      value: fmt(dashboard?.todaySales?.total || 0),
      sub: `${dashboard?.todaySales?.count || 0} bills`,
    },
    {
      label: 'Weekly Sales',
      value: fmt(dashboard?.weeklySales?.total || 0),
      sub: `${dashboard?.weeklySales?.count || 0} bills`,
    },
    {
      label: 'Monthly Sales',
      value: fmt(dashboard?.monthlySales?.total || 0),
      sub: `${dashboard?.monthlySales?.count || 0} bills`,
    },
    {
      label: 'Total Bills',
      value: dashboard?.totalBills || 0,
      sub: 'all time',
    },
  ];

  const periodSummary = data?.periodSummary;
  const hasRange = startDate && endDate;

  return (
    <div className="space-y-5">
      <DateRangeFilter
        startDate={startDate} endDate={endDate}
        onStart={setStartDate} onEnd={setEndDate}
        onClear={() => { setStartDate(''); setEndDate(''); }}
      />

      {isLoading ? (
        <div className="py-14 text-center text-sm text-slate-400">
          Loading reports...
        </div>
      ) : (
        <>
          {/* Stat cards — period summary when date range active, fixed periods otherwise */}
          {hasRange && periodSummary ? (
            <div className="card p-5">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                Period Summary
                <span className="ml-2 font-normal text-slate-400 normal-case">
                  {format(new Date(startDate), 'dd MMM yyyy')} — {format(new Date(endDate), 'dd MMM yyyy')}
                </span>
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{fmt(periodSummary.total)}</p>
                  <p className="text-xs text-slate-400 mt-1">Total Revenue</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{periodSummary.count}</p>
                  <p className="text-xs text-slate-400 mt-1">Bills Raised</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">{fmt(periodSummary.average)}</p>
                  <p className="text-xs text-slate-400 mt-1">Avg per Bill</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card) => (
                <div key={card.label} className="card p-5">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                    {card.label}
                  </p>
                  <p className="text-xl font-semibold text-slate-900">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* Item tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Most sold */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">Most Sold Items</h3>
              </div>
              {mostSold.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-10">No data</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Item</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide">Qty</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mostSold.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-slate-700">{item.itemName}</td>
                        <td className="px-5 py-3 text-right text-slate-600">
                          {item.totalQuantity}
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-slate-800">
                          {fmt(parseFloat(item.totalRevenue))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Highest revenue */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">Highest Revenue Items</h3>
              </div>
              {highestRevenue.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-10">No data</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Item</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide">Revenue</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {highestRevenue.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-slate-700">{item.itemName}</td>
                        <td className="px-5 py-3 text-right font-medium text-slate-800">
                          {fmt(parseFloat(item.totalRevenue))}
                        </td>
                        <td className="px-5 py-3 text-right text-slate-600">
                          {item.totalQuantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
