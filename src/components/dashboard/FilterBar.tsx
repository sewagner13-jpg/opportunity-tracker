'use client';
import { FilterState, STATUSES, PRIORITIES, Status, Priority } from '@/lib/types';
import { Search, X, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  salespersons: string[];
}

function Select({
  value,
  onChange,
  children,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export function FilterBar({ filters, onChange, salespersons }: FilterBarProps) {
  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  const hasActiveFilters =
    filters.search ||
    filters.salesperson ||
    filters.status ||
    filters.priority ||
    filters.dueDateFrom ||
    filters.dueDateTo ||
    filters.overdueOnly ||
    filters.openOnly ||
    filters.completedOnly;

  const clearAll = () =>
    onChange({
      search: '',
      salesperson: '',
      status: '',
      priority: '',
      dueDateFrom: '',
      dueDateTo: '',
      overdueOnly: false,
      openOnly: false,
      completedOnly: false,
    });

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer, product, note..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Salesperson */}
        <Select value={filters.salesperson} onChange={(v) => update({ salesperson: v })} className="min-w-40">
          <option value="">All Salespeople</option>
          {salespersons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        {/* Status */}
        <Select value={filters.status} onChange={(v) => update({ status: v })} className="min-w-48">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        {/* Priority */}
        <Select value={filters.priority} onChange={(v) => update({ priority: v })} className="min-w-32">
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>

        {/* Due date range */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Due:</label>
          <input
            type="date"
            value={filters.dueDateFrom}
            onChange={(e) => update({ dueDateFrom: e.target.value })}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={filters.dueDateTo}
            onChange={(e) => update({ dueDateTo: e.target.value })}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Toggle filters */}
      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quick filters:</span>
        {[
          { key: 'overdueOnly' as const, label: '🔴 Overdue' },
          { key: 'openOnly' as const, label: '📂 Open Only' },
          { key: 'completedOnly' as const, label: '✅ Completed' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => update({ [key]: !filters[key], openOnly: key === 'completedOnly' && !filters.completedOnly ? false : filters.openOnly, completedOnly: key === 'openOnly' && !filters.openOnly ? false : filters.completedOnly })}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filters[key]
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-400'
            }`}
          >
            {label}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
          >
            <X size={12} />
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
