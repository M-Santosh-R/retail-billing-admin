import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import { format } from 'date-fns';

export default function Stores() {
  const [search, setSearch] = useState('');
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: adminApi.getStores,
  });

  const filtered = stores.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const getStatus = (store: any) => {
    if (!store.isActive) return { label: 'Suspended', cls: 'bg-red-100 text-red-700' };
    if (store.expiryDate && new Date(store.expiryDate) < new Date()) return { label: 'Expired', cls: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Active', cls: 'bg-green-100 text-green-700' };
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Stores</h2>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Store Name</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Plan</th>
                  <th className="px-6 py-3 text-left">Expiry</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((store: any) => {
                  const status = getStatus(store);
                  return (
                    <tr key={store.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{store.name}</div>
                        <div className="text-xs text-gray-400">{store.address || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{store.phone || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full capitalize">
                          {store.subscriptionPlan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {store.expiryDate ? format(new Date(store.expiryDate), 'dd MMM yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/stores/${store.id}`}
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          Manage →
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
    </div>
  );
}
