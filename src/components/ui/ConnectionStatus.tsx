'use client';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { useStore } from '@/lib/store';

export function ConnectionStatus() {
  const connectionError = useStore((s) => s.connectionError);
  const isConnected = useStore((s) => s.isConnected);
  const loading = useStore((s) => s.loading);
  const clearConnectionError = useStore((s) => s.clearConnectionError);

  // Show error banner if there's a connection error
  if (connectionError) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Connection Error
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-0.5 break-words">
              {connectionError}
            </p>
          </div>
          <button
            onClick={clearConnectionError}
            className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mt-0.5"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Show loading indicator while connecting
  if (loading && !isConnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Loader2 size={18} className="text-blue-600 dark:text-blue-400 animate-spin" />
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Connecting to database...
          </p>
        </div>
      </div>
    );
  }

  // Show success indicator when connected (optional, only show briefly or on demand)
  // For now, we only show errors and loading states to reduce noise
  return null;
}
