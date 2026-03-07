'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Tv2,
  Star,
  PlusCircle,
  PackageSearch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sourcing', label: 'Sourcing Requests', icon: PackageSearch },
  { href: '/focus', label: "Today's Focus", icon: Star },
  { href: '/board', label: 'TV Board', icon: Tv2 },
];

export function Navigation() {
  const pathname = usePathname();
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);

  return (
    <nav className="h-full flex flex-col bg-gray-900 text-white w-60 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">OT</span>
          </div>
          <div>
            <div className="font-bold text-sm text-white leading-tight">Opportunity</div>
            <div className="font-bold text-sm text-blue-400 leading-tight">Tracker</div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}

        <div className="pt-2 border-t border-gray-700 mt-2">
          <Link
            href="/opportunities/new"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            <PlusCircle size={18} />
            New Opportunity
          </Link>
        </div>
      </div>

      {/* Role Switcher */}
      <div className="px-3 py-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 px-1">
          Role
        </div>
        <div className="flex flex-col gap-1">
          {(['Admin', 'Sales', 'Viewer'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors',
                role === r
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              )}
            >
              <span className={cn(
                'w-2 h-2 rounded-full',
                r === 'Admin' ? 'bg-blue-400' : r === 'Sales' ? 'bg-green-400' : 'bg-gray-400'
              )} />
              {r}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
