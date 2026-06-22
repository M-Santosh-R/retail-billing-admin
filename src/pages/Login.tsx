import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/client';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await adminApi.login(email, password, 'admin-browser');
      if (result.user?.role !== 'admin') {
        toast.error('Access denied. Admin accounts only.');
        return;
      }
      localStorage.setItem('admin_token', result.token);
      localStorage.setItem('admin_role', result.user.role);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-white font-semibold text-[15px]">BillSwift</span>
          </div>
        </div>
        <div className="relative z-10 space-y-5">
          <h1 className="text-3xl font-semibold text-white leading-tight">
            Control your entire<br />retail network.
          </h1>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-xs">
            Manage store subscriptions, review billing history, and oversee platform activity — all from one place.
          </p>
          <div className="flex gap-6 pt-2">
            {[['Stores', 'Multi-store management'], ['Bills', 'Per-store billing history'], ['Reports', 'Revenue analytics']].map(([t, d]) => (
              <div key={t}>
                <p className="text-white text-sm font-medium">{t}</p>
                <p className="text-slate-500 text-xs mt-0.5">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Restricted to authorised personnel
          </span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gray-50">
        <div className="w-full max-w-[360px]">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-500 rounded flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900">BillSwift</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Sign in to Admin</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your credentials to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="field" placeholder="admin@example.com" required autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="field" placeholder="••••••••" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-1">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            BillSwift Admin Portal &mdash; Authorised access only
          </p>
        </div>
      </div>
    </div>
  );
}
