import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function StoreDetail() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: stores = [] } = useQuery({ queryKey: ['admin-stores'], queryFn: adminApi.getStores });
  const store = stores.find((s: any) => s.id === storeId);

  const { data: devices = [] } = useQuery({
    queryKey: ['store-devices', storeId],
    queryFn: () => adminApi.getStoreDevices(storeId!),
    enabled: !!storeId,
  });

  const [plan, setPlan] = useState(store?.subscriptionPlan || 'monthly');
  const [expiryDate, setExpiryDate] = useState(
    store?.expiryDate ? format(new Date(store.expiryDate), 'yyyy-MM-dd') : '',
  );
  const [isActive, setIsActive] = useState(store?.isActive ?? true);

  const updateSub = useMutation({
    mutationFn: () => adminApi.updateSubscription(storeId!, { plan, expiryDate, isActive }),
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

  if (!store) return <div className="text-center text-gray-400 mt-20">Store not found</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-primary mb-4 flex items-center gap-1 text-sm">
        ← Back to Stores
      </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{store.name}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Subscription Management</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="free">Free (Trial)</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">Store Active</label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => updateSub.mutate()}
                disabled={updateSub.isPending}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
              >
                {updateSub.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => { setPlan('monthly'); setExpiryDate(format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd')); setIsActive(true); }}
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600"
              >
                +30 Days
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Active Devices ({devices.length})</h3>
          {devices.length === 0 ? (
            <p className="text-gray-400 text-sm">No active devices</p>
          ) : (
            <div className="space-y-3">
              {devices.map((device: any) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{device.deviceName || 'Unknown Device'}</p>
                    <p className="text-xs text-gray-400">
                      Last login: {format(new Date(device.lastLogin), 'dd MMM yyyy HH:mm')}
                    </p>
                  </div>
                  <button
                    onClick={() => forceLogout.mutate(device.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Force Logout
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
