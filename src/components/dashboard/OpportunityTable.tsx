'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Opportunity, SortState } from '@/lib/types';
import { formatDate, formatCurrency, formatNumber, isOverdue, cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { useStore } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';
import {
  ArrowUpDown, ArrowUp, ArrowDown, Star, StarOff,
  Eye, Edit2, Trash2, AlertTriangle, ChevronDown
} from 'lucide-react';

interface OpportunityTableProps {
  opportunities: Opportunity[];
  sort: SortState;
  onSort: (field: keyof Opportunity) => void;
}

const SORTABLE_COLUMNS: { field: keyof Opportunity; label: string; width?: string }[] = [
  { field: 'salesPersonName', label: 'Sales Person' },
  { field: 'customerName', label: 'Customer' },
  { field: 'productName', label: 'Product' },
  { field: 'dateEntered', label: 'Date Entered', width: 'w-28' },
  { field: 'dateNeeded', label: 'Date Needed', width: 'w-28' },
  { field: 'targetPrice', label: 'Target Price', width: 'w-28' },
  { field: 'annualVolume', label: 'Ann. Volume (lbs)', width: 'w-32' },
  { field: 'status', label: 'Status', width: 'w-40' },
  { field: 'priority', label: 'Priority', width: 'w-24' },
  { field: 'quickNote', label: 'Quick Note' },
];

function SortIcon({ field, sort }: { field: keyof Opportunity; sort: SortState }) {
  if (sort.field !== field) return <ArrowUpDown size={14} className="opacity-40" />;
  return sort.direction === 'asc'
    ? <ArrowUp size={14} className="text-blue-500" />
    : <ArrowDown size={14} className="text-blue-500" />;
}

function ConfirmDeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Delete Opportunity?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Are you sure you want to delete <strong>{name}</strong>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function OpportunityTable({ opportunities, sort, onSort }: OpportunityTableProps) {
  const { toggleFocus, deleteOpportunity, role } = useStore();
  const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);

  const handleDelete = (opp: Opportunity) => {
    deleteOpportunity(opp.id);
    setDeleteTarget(null);
    showToast('Opportunity deleted', 'success');
  };

  const handleToggleFocus = (opp: Opportunity) => {
    toggleFocus(opp.id);
    showToast(
      opp.includeInTodaysFocus ? 'Removed from Today\'s Focus' : 'Added to Today\'s Focus',
      'info'
    );
  };

  if (opportunities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-16 text-center">
        <div className="text-gray-400 dark:text-gray-500 text-lg">No opportunities match your filters.</div>
        <p className="text-gray-400 dark:text-gray-600 text-sm mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {/* Focus star */}
                <th className="w-10 px-3 py-3 text-left">
                  <Star size={14} className="text-gray-300" />
                </th>
                {SORTABLE_COLUMNS.map(({ field, label, width }) => (
                  <th
                    key={field}
                    className={`px-3 py-3 text-left ${width || ''}`}
                  >
                    <button
                      onClick={() => onSort(field)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition-colors whitespace-nowrap"
                    >
                      {label}
                      <SortIcon field={field} sort={sort} />
                    </button>
                  </th>
                ))}
                <th className="px-3 py-3 text-right">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {opportunities.map((opp) => {
                const overdue = isOverdue(opp);
                return (
                  <tr
                    key={opp.id}
                    className={cn(
                      'hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors',
                      overdue && 'bg-red-50/50 dark:bg-red-900/10'
                    )}
                  >
                    {/* Focus */}
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleToggleFocus(opp)}
                        title={opp.includeInTodaysFocus ? 'Remove from Today\'s Focus' : 'Add to Today\'s Focus'}
                        className={cn(
                          'w-7 h-7 flex items-center justify-center rounded-full transition-colors',
                          opp.includeInTodaysFocus
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-300 hover:text-yellow-400'
                        )}
                      >
                        <Star
                          size={16}
                          fill={opp.includeInTodaysFocus ? 'currentColor' : 'none'}
                        />
                      </button>
                    </td>

                    {/* Salesperson */}
                    <td className="px-3 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {opp.salesPersonName || '—'}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-3 py-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {opp.customerName || '—'}
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-3 py-3 max-w-[160px]">
                      <div className="text-sm text-gray-700 dark:text-gray-300 truncate" title={opp.productName}>
                        {opp.productName || '—'}
                      </div>
                    </td>

                    {/* Date Entered */}
                    <td className="px-3 py-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(opp.dateEntered)}
                      </div>
                    </td>

                    {/* Date Needed */}
                    <td className="px-3 py-3">
                      <div className={cn(
                        'text-sm whitespace-nowrap flex items-center gap-1',
                        overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'
                      )}>
                        {overdue && <AlertTriangle size={13} />}
                        {formatDate(opp.dateNeeded)}
                      </div>
                    </td>

                    {/* Target Price */}
                    <td className="px-3 py-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {formatCurrency(opp.targetPrice)}
                      </div>
                    </td>

                    {/* Annual Volume */}
                    <td className="px-3 py-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {formatNumber(opp.annualVolume)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      <StatusBadge status={opp.status} size="sm" />
                    </td>

                    {/* Priority */}
                    <td className="px-3 py-3">
                      <PriorityBadge priority={opp.priority} size="sm" />
                    </td>

                    {/* Quick Note */}
                    <td className="px-3 py-3 max-w-[200px]">
                      <div
                        className="text-sm text-gray-600 dark:text-gray-400 truncate"
                        title={opp.quickNote}
                      >
                        {opp.quickNote || '—'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/opportunities/${opp.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          title="View details"
                        >
                          <Eye size={16} />
                        </Link>
                        {(role === 'Admin' || role === 'Sales') && (
                          <Link
                            href={`/opportunities/${opp.id}/edit`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </Link>
                        )}
                        {role === 'Admin' && (
                          <button
                            onClick={() => setDeleteTarget(opp)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
          Showing {opportunities.length} {opportunities.length === 1 ? 'opportunity' : 'opportunities'}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          name={`${deleteTarget.productName || 'this opportunity'} for ${deleteTarget.customerName || 'unknown customer'}`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
