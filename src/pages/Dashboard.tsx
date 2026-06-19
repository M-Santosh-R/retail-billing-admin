import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/client';

const StatCard = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${color}`}>
    <p className="text-sm text-gray-500 font-medium">{label}</p>
    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
  </div>
);

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.getDashboard,
    refetchInterval: 60000,
  });

  if (isLoading) return <div className="animate-pulse text-gray-400 text-center mt-20">Loading dashboard...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Stores" value={data?.totalStores ?? 0} color="border-blue-500" />
        <StatCard label="Active Stores" value={data?.activeStores ?? 0} color="border-green-500" />
        <StatCard label="Expired Stores" value={data?.expiredStores ?? 0} color="border-red-500" />
        <StatCard label="Total Bills" value={data?.totalBills ?? 0} color="border-purple-500" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h3>
        <p className="text-4xl font-bold text-green-600">
          ₹{Number(data?.totalRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-gray-400 mt-1">Across all stores</p>
      </div>
    </div>
  );
}
