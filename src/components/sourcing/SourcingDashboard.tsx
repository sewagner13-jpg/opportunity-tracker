'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Opportunity, OPEN_STATUSES, STATUSES, Status } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { showToast } from '@/components/ui/Toast';
import { formatDate, isOverdue, cn } from '@/lib/utils';
import {
  Search, Eye, Edit2, AlertTriangle, PackageSearch,
  PlusCircle, Clock, CheckCircle2, ChevronDown
} from 'lucide-react';

function KPICard({ label, value, color, alert }: { label: string; value: number | string; color: string; alert?: boolean }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border p-4 flex-1 min-w-0 ${alert ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}>
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</div>
      <div className={`text-3xl font-bold mt-1 ${alert ? 'text-red-600 dark:text-red-400' : color}`}>{value}</div>
    </div>
  );
}

export function SourcingDashboard() {
  const { opportunities, updateOpportunity, role } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  const sourcingRequests = useMemo(() => {
    return opportunities.filter((o) => o.isSourcingRequest);
  }, [opportunities]);

  const filtered = useMemo(() => {
    let list = sourcingRequests;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((o) =>
        [o.productName, o.customerName, o.requestedBy, o.quickNote, o.salesPersonName]
          .join(' ').toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      list = list.filter((o) => o.status === statusFilter);
    }
    // Sort: overdue first, then by priority, then by dateNeeded
    const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    return [...list].sort((a, b) => {
      const aOver = isOverdue(a) ? -1 : 0;
      const bOver = isOverdue(b) ? -1 : 0;
      if (aOver !== bOver) return aOver - bOver;
      const pa = priorityOrder[a.priority] ?? 99;
      const pb = priorityOrder[b.priority] ?? 99;
      if (pa !== pb) return pa - pb;
      return (a.dateNeeded || '').localeCompare(b.dateNeeded || '');
    });
  }, [sourcingRequests, search, statusFilter]);

  const open = sourcingRequests.filter((o) => OPEN_STATUSES.includes(o.status as any) && !o.isCompleted);
  const overdue = sourcingRequests.filter((o) => isOverdue(o));
  const completed = sourcingRequests.filter((o) => o.isCompleted);
  const pending = sourcingRequests.filter((o) => ['New', 'In Review'].includes(o.status));

  const handleStatusChange = (id: string, status: Status) => {
    updateOpportunity(id, { status });
    setEditingStatus(null);
    showToast('Status updated', 'success');
  };

  if (sourcingRequests.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <PackageSearch size={64} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No sourcing requests yet</h2>
        <p className="text-sm text-gray-400 dark:text-gray-600 mb-6 max-w-sm mx-auto">
          When someone asks you to find or source a product, create an opportunity and mark it as a Sourcing Request.
        </p>
        <Link
          href="/opportunities/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <PlusCircle size={16} />
          Add Sourcing Request
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* KPI row */}
      <div className="flex gap-3 mb-6">
        <KPICard label="Total Requests" value={sourcingRequests.length} color="text-orange-600 dark:text-orange-400" />
        <KPICard label="Open / Active" value={open.length} color="text-blue-600 dark:text-blue-400" />
        <KPICard label="Pending Review" value={pending.length} color="text-indigo-600 dark:text-indigo-400" />
        <KPICard label="Overdue" value={overdue.length} color="text-red-600" alert={overdue.length > 0} />
        <KPICard label="Completed" value={completed.length} color="text-green-600 dark:text-green-400" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search product, customer, requested by..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        )}
        <Link
          href="/opportunities/new"
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <PlusCircle size={15} />
          Add Request
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {['Requested By', 'Product', 'Customer', 'Date Needed', 'Status', 'Priority', 'Quick Note', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 dark:text-gray-600">
                    No requests match your filters.
                  </td>
                </tr>
              ) : filtered.map((opp) => {
                const overdue = isOverdue(opp);
                return (
                  <tr
                    key={opp.id}
                    className={cn(
                      'hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors',
                      overdue && 'bg-red-50/40 dark:bg-red-900/10'
                    )}
                  >
                    {/* Requested By */}
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {opp.requestedBy || <span className="text-gray-400 italic font-normal">Not specified</span>}
                      </div>
                      {opp.salesPersonName && (
                        <div className="text-xs text-gray-400 mt-0.5">via {opp.salesPersonName}</div>
                      )}
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3 max-w-[180px]">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate" title={opp.productName}>
                        {opp.productName || '—'}
                      </div>
                      {opp.productCategory && (
                        <div className="text-xs text-gray-400">{opp.productCategory}</div>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {opp.customerName || '—'}
                      </div>
                    </td>

                    {/* Date Needed */}
                    <td className="px-4 py-3">
                      <div className={cn(
                        'text-sm flex items-center gap-1 whitespace-nowrap font-medium',
                        overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                      )}>
                        {overdue && <AlertTriangle size={13} />}
                        {formatDate(opp.dateNeeded)}
                      </div>
                    </td>

                    {/* Status — inline editable */}
                    <td className="px-4 py-3">
                      {editingStatus === opp.id ? (
                        <select
                          autoFocus
                          defaultValue={opp.status}
                          onChange={(e) => handleStatusChange(opp.id, e.target.value as Status)}
                          onBlur={() => setEditingStatus(null)}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <button
                          onClick={() => (role === 'Admin' || role === 'Sales') ? setEditingStatus(opp.id) : undefined}
                          title={role !== 'Viewer' ? 'Click to change status' : undefined}
                          className={cn('text-left', role !== 'Viewer' && 'cursor-pointer hover:opacity-80')}
                        >
                          <StatusBadge status={opp.status} size="sm" />
                        </button>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3">
                      <PriorityBadge priority={opp.priority} size="sm" />
                    </td>

                    {/* Quick Note */}
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate italic" title={opp.quickNote}>
                        {opp.quickNote || '—'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/opportunities/${opp.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          title="View"
                        >
                          <Eye size={15} />
                        </Link>
                        {(role === 'Admin' || role === 'Sales') && (
                          <Link
                            href={`/opportunities/${opp.id}/edit`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
          {filtered.length} of {sourcingRequests.length} sourcing {sourcingRequests.length === 1 ? 'request' : 'requests'}
        </div>
      </div>
    </div>
  );
}
