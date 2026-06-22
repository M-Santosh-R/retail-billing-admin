import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/client';

const statConfig = [
  {
    key: 'totalStores', label: 'Total Stores',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" /></svg>,
    bg: 'bg-slate-100', fg: 'text-slate-600',
  },
  {
    key: 'activeStores', label: 'Active Stores',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    bg: 'bg-emerald-50', fg: 'text-emerald-600',
  },
  {
    key: 'expiredStores', label: 'Expired',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    bg: 'bg-amber-50', fg: 'text-amber-600',
  },
  {
    key: 'totalBills', label: 'Total Bills',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4" /></svg>,
    bg: 'bg-indigo-50', fg: 'text-indigo-600',
  },
];

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.getDashboard,
    refetchInterval: 60000,
  });

  const revenue = Number(data?.totalRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide overview across all registered stores</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statConfig.map(({ key, label, icon, bg, fg }) => (
          <div key={key} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
              <span className={`w-9 h-9 rounded-lg ${bg} ${fg} flex items-center justify-center flex-shrink-0`}>
                {icon}
              </span>
            </div>
            {isLoading
              ? <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
              : <p className="text-3xl font-bold text-slate-900 tracking-tight">{(data as any)?.[key] ?? 0}</p>
            }
          </div>
        ))}
      </div>

      {/* Revenue */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
            {isLoading
              ? <div className="h-10 w-48 bg-gray-100 rounded animate-pulse mt-2" />
              : <p className="text-4xl font-bold text-slate-900 tracking-tight mt-2">&#8377;{revenue}</p>
            }
            <p className="text-sm text-gray-400 mt-2">Cumulative billing across all active stores</p>
          </div>
          <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-xl bg-indigo-50">
            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
