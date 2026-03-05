'use client';
import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { KPIBar } from '@/components/dashboard/KPIBar';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { OpportunityTable } from '@/components/dashboard/OpportunityTable';
import { FilterState, SortState } from '@/lib/types';
import { applyFilters, applySort, getUniqueSalespersons } from '@/lib/utils';
import { PlusCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_FILTERS: FilterState = {
  search: '',
  salesperson: '',
  status: '',
  priority: '',
  dueDateFrom: '',
  dueDateTo: '',
  overdueOnly: false,
  openOnly: false,
  completedOnly: false,
};

const DEFAULT_SORT: SortState = {
  field: 'dateNeeded',
  direction: 'asc',
};

export default function DashboardPage() {
  const opportunities = useStore((s) => s.opportunities);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => setLastRefresh(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const salespersons = useMemo(() => getUniqueSalespersons(opportunities), [opportunities]);

  const filtered = useMemo(
    () => applyFilters(opportunities, filters),
    [opportunities, filters]
  );

  const sorted = useMemo(
    () => applySort(filtered, sort),
    [filtered, sort]
  );

  const handleSort = (field: keyof typeof sort.field | any) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            All opportunities · Updated {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLastRefresh(new Date())}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <Link
            href="/opportunities/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <PlusCircle size={16} />
            New Opportunity
          </Link>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* KPI Bar */}
        <KPIBar opportunities={opportunities} />

        {/* Filters */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          salespersons={salespersons}
        />

        {/* Results count */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {sorted.length} {sorted.length === 1 ? 'result' : 'results'}
            {filtered.length !== opportunities.length && ` (filtered from ${opportunities.length})`}
          </div>
        </div>

        {/* Table */}
        <OpportunityTable
          opportunities={sorted}
          sort={sort}
          onSort={handleSort}
        />
      </div>
    </div>
  );
}
