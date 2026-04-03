'use client';
import { useEffect } from 'react';
import { Navigation } from './Navigation';
import { ToastContainer } from '@/components/ui/Toast';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const loadOpportunities = useStore((s) => s.loadOpportunities);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);
  // TV board gets full-screen treatment
  const isBoard = pathname === '/board';

  if (isBoard) {
    return (
      <>
        <ConnectionStatus />
        {children}
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Navigation />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ConnectionStatus />
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}
