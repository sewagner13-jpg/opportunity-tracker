'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Opportunity } from '@/lib/types';
import { useStore } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { formatDate, isOverdue, cn } from '@/lib/utils';
import {
  Star, GripVertical, CheckCircle2, X, ExternalLink,
  AlertTriangle, ArrowUp, ArrowDown, Info
} from 'lucide-react';

interface FocusCardProps {
  opp: Opportunity;
  rank: number;
  totalCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onComplete: () => void;
}

function FocusCard({ opp, rank, totalCount, onMoveUp, onMoveDown, onRemove, onComplete }: FocusCardProps) {
  const overdue = isOverdue(opp);

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl border shadow-sm transition-all',
      overdue
        ? 'border-red-300 dark:border-red-700'
        : 'border-gray-200 dark:border-gray-700'
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Rank + drag handle */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-600 w-5 text-center">
              {rank}
            </span>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={onMoveUp}
                disabled={rank === 1}
                className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed"
                title="Move up"
              >
                <ArrowUp size={13} />
              </button>
              <button
                onClick={onMoveDown}
                disabled={rank === totalCount}
                className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed"
                title="Move down"
              >
                <ArrowDown size={13} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white text-base truncate">
                  {opp.productName || 'Unnamed Product'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {opp.customerName} {opp.salesPersonName ? `· ${opp.salesPersonName}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={opp.status} size="sm" />
                <PriorityBadge priority={opp.priority} size="sm" />
              </div>
            </div>

            {/* Details row */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
              {opp.dateNeeded && (
                <span className={cn(
                  'flex items-center gap-1',
                  overdue && 'text-red-500 dark:text-red-400 font-medium'
                )}>
                  {overdue && <AlertTriangle size={11} />}
                  Due: {formatDate(opp.dateNeeded)}
                </span>
              )}
              {opp.nextAction && (
                <span className="flex items-center gap-1 max-w-xs truncate">
                  → {opp.nextAction}
                </span>
              )}
            </div>

            {opp.quickNote && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic truncate">
                &ldquo;{opp.quickNote}&rdquo;
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <Link
              href={`/opportunities/${opp.id}`}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              title="View details"
            >
              <ExternalLink size={15} />
            </Link>
            <button
              onClick={onComplete}
              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
              title="Mark complete"
            >
              <CheckCircle2 size={15} />
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              title="Remove from focus"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TodaysFocus() {
  const { opportunities, removeFocus, reorderFocus, markCompleteFromFocus } = useStore();

  const focusItems = useMemo(() => {
    return [...opportunities]
      .filter((o) => o.includeInTodaysFocus)
      .sort((a, b) => a.todaysFocusRank - b.todaysFocusRank);
  }, [opportunities]);

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const ids = focusItems.map((o) => o.id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    reorderFocus(ids);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === focusItems.length - 1) return;
    const ids = focusItems.map((o) => o.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    reorderFocus(ids);
  };

  const handleRemove = (id: string) => {
    removeFocus(id);
    showToast('Removed from Today\'s Focus', 'info');
  };

  const handleComplete = (id: string) => {
    markCompleteFromFocus(id);
    showToast('Marked as completed!', 'success');
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Star size={28} className="text-yellow-500" fill="currentColor" />
          Today&apos;s Focus
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{today}</p>
      </div>

      {focusItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Star size={48} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No items in Today&apos;s Focus
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-600 max-w-sm mx-auto mb-4">
            Star any opportunity from the dashboard to add it here as a daily priority.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Info size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {focusItems.length} {focusItems.length === 1 ? 'item' : 'items'} · Use arrows to reorder · Click ✓ to complete · Click × to remove
            </span>
          </div>
          <div className="space-y-3">
            {focusItems.map((opp, idx) => (
              <FocusCard
                key={opp.id}
                opp={opp}
                rank={idx + 1}
                totalCount={focusItems.length}
                onMoveUp={() => handleMoveUp(idx)}
                onMoveDown={() => handleMoveDown(idx)}
                onRemove={() => handleRemove(opp.id)}
                onComplete={() => handleComplete(opp.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
