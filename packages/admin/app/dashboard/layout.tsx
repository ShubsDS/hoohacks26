'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { clearToken } from '@/lib/api';

const NAV = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/reports', label: 'Reports' },
  { href: '/dashboard/users', label: 'Users' },
  { href: '/dashboard/broadcast', label: 'Broadcast' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  return (
    <AuthGuard>
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-56 bg-[#232D4B] flex flex-col shrink-0">
          <div className="px-6 py-5 border-b border-white/10">
            <h1 className="text-white font-bold text-lg">HoosAlert</h1>
            <p className="text-blue-300 text-xs mt-0.5">Admin Dashboard</p>
          </div>
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            {NAV.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#E57200] text-white'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="px-3 py-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 rounded text-sm text-blue-300 hover:bg-white/10 hover:text-white transition-colors text-left"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}
