import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const IcoDashboard = () => (
  <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const IcoStores = () => (
  <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
  </svg>
);

const IcoSignOut = () => (
  <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

const nav = [
  { label: 'Dashboard', href: '/dashboard', Icon: IcoDashboard },
  { label: 'Stores',    href: '/stores',    Icon: IcoStores },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate  = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col bg-slate-900">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/8 flex-shrink-0">
          <div className="w-7 h-7 bg-indigo-500 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-[14px] h-[14px] text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="leading-none">
            <p className="text-white text-sm font-semibold">BillSwift</p>
            <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-widest font-medium">Admin</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2.5 pt-4 pb-2 space-y-0.5">
          {nav.map(({ label, href, Icon }) => {
            const active = location.pathname.startsWith(href);
            return (
              <Link key={href} to={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors ${
                  active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={active ? 'text-white' : 'text-slate-500'}><Icon /></span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-2.5 py-3 border-t border-white/8 flex-shrink-0">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="text-slate-500"><IcoSignOut /></span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center px-8">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            {location.pathname.startsWith('/stores/') && (
              <><Link to="/stores" className="hover:text-gray-800 transition-colors">Stores</Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-800 font-medium">Store Detail</span></>
            )}
            {location.pathname === '/stores' && <span className="text-gray-800 font-medium">Stores</span>}
            {location.pathname === '/dashboard' && <span className="text-gray-800 font-medium">Dashboard</span>}
          </nav>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
