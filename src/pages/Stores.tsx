import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EMPTY_FORM = {
  storeName: '',
  address: '',
  phone: '',
  gstNumber: '',
  ownerName: '',
  ownerEmail: '',
  ownerPassword: '',
};

const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const IconClose = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconArrowRight = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

function getStatus(store: any): { label: string; cls: string } {
  if (!store.isActive) return { label: 'Suspended', cls: 'bg-red-50 text-red-600' };
  if (store.expiryDate && new Date(store.expiryDate) < new Date())
    return { label: 'Expired', cls: 'bg-amber-50 text-amber-700' };
  return { label: 'Active', cls: 'bg-emerald-50 text-emerald-700' };
}


export default function Stores() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: adminApi.getStores,
  });

  const createStore = useMutation({
    mutationFn: () => adminApi.createStore(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      toast.success('Store created successfully');
      setShowCreate(false);
      setForm(EMPTY_FORM);
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || 'Failed to create store'),
  });

  const filtered = stores.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const canCreate =
    form.storeName && form.ownerName && form.ownerEmail && form.ownerPassword;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Stores</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {stores.length} store{stores.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary gap-1.5">
          <IconPlus />
          New Store
        </button>
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">
        {/* Search bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <span className="text-slate-400">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-800"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <IconClose />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading stores...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            {search ? `No stores matching "${search}"` : 'No stores yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Store</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Owner</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Phone</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Devices</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Expiry</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((store: any) => {
                  const status = getStatus(store);
                  const owner = store.users?.[0];
                  return (
                    <tr
                      key={store.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800">{store.name}</div>
                        {store.address && (
                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                            {store.address}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {owner ? (
                          <>
                            <div className="text-slate-700 font-medium">{owner.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{owner.email}</div>
                          </>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {store.phone || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {store.deviceCount > 0 ? (
                          <span className="badge bg-indigo-50 text-indigo-700">
                            {store.deviceCount} active
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                        {store.expiryDate
                          ? format(new Date(store.expiryDate), 'dd MMM yyyy')
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/stores/${store.id}`}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-medium transition-colors"
                        >
                          Manage
                          <IconArrowRight />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Store Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="card p-6 w-full max-w-lg shadow-lg">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Create New Store</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  A free 30-day trial will be applied automatically.
                </p>
              </div>
              <button
                onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); }}
                className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
              >
                <IconClose />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Store Information
              </p>
              <input
                placeholder="Store Name *"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="field"
                required
              />
              <input
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="field"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="field"
                />
                <input
                  placeholder="GST Number"
                  value={form.gstNumber}
                  onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                  className="field"
                />
              </div>

              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider pt-1">
                Owner Account
              </p>
              <input
                placeholder="Owner Name *"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="field"
              />
              <input
                placeholder="Owner Email *"
                type="email"
                value={form.ownerEmail}
                onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                className="field"
              />
              <input
                placeholder="Password *"
                type="password"
                value={form.ownerPassword}
                onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                className="field"
              />
            </div>

            <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-100">
              <button
                onClick={() => createStore.mutate()}
                disabled={createStore.isPending || !canCreate}
                className="btn-primary"
              >
                {createStore.isPending ? 'Creating...' : 'Create Store'}
              </button>
              <button
                onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); }}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
