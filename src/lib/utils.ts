import { format, isAfter, isBefore, startOfDay, endOfDay, addDays, isValid, parseISO } from 'date-fns';
import { Opportunity, OPEN_STATUSES, FilterState, SortState } from './types';

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = parseISO(dateStr);
  if (!isValid(d)) return '—';
  return format(d, 'MMM d, yyyy');
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${value}%`;
}

export function isOverdue(opp: Opportunity): boolean {
  if (!opp.dateNeeded) return false;
  if (opp.isCompleted) return false;
  if (!OPEN_STATUSES.includes(opp.status as any)) return false;
  const needed = parseISO(opp.dateNeeded);
  if (!isValid(needed)) return false;
  return isBefore(needed, startOfDay(new Date()));
}

export function isDueThisWeek(opp: Opportunity): boolean {
  if (!opp.dateNeeded) return false;
  if (opp.isCompleted) return false;
  const needed = parseISO(opp.dateNeeded);
  if (!isValid(needed)) return false;
  const today = startOfDay(new Date());
  const weekEnd = endOfDay(addDays(today, 7));
  return !isBefore(needed, today) && !isAfter(needed, weekEnd);
}

export function generateId(): string {
  return `opp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function applyFilters(opportunities: Opportunity[], filters: FilterState): Opportunity[] {
  return opportunities.filter((opp) => {
    // Text search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const searchable = [
        opp.customerName,
        opp.productName,
        opp.quickNote,
        opp.salesPersonName,
        opp.assignedOwner,
        opp.supplierName,
        opp.nextAction,
      ].join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    // Salesperson
    if (filters.salesperson && opp.salesPersonName !== filters.salesperson) return false;

    // Status
    if (filters.status && opp.status !== filters.status) return false;

    // Priority
    if (filters.priority && opp.priority !== filters.priority) return false;

    // Due date range
    if (filters.dueDateFrom && opp.dateNeeded) {
      if (opp.dateNeeded < filters.dueDateFrom) return false;
    }
    if (filters.dueDateTo && opp.dateNeeded) {
      if (opp.dateNeeded > filters.dueDateTo) return false;
    }

    // Overdue only
    if (filters.overdueOnly && !isOverdue(opp)) return false;

    // Open only
    if (filters.openOnly && !OPEN_STATUSES.includes(opp.status as any)) return false;

    // Completed only
    if (filters.completedOnly && !opp.isCompleted) return false;

    return true;
  });
}

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

export function applySort(opportunities: Opportunity[], sort: SortState): Opportunity[] {
  if (!sort.field) return opportunities;
  const sorted = [...opportunities].sort((a, b) => {
    const field = sort.field as keyof Opportunity;
    let av = a[field];
    let bv = b[field];

    // Priority special sort
    if (field === 'priority') {
      av = PRIORITY_ORDER[av as string] ?? 99;
      bv = PRIORITY_ORDER[bv as string] ?? 99;
    }

    // Nulls last
    if (av === null || av === undefined || av === '') return 1;
    if (bv === null || bv === undefined || bv === '') return -1;

    if (typeof av === 'number' && typeof bv === 'number') {
      return sort.direction === 'asc' ? av - bv : bv - av;
    }

    const as = String(av).toLowerCase();
    const bs = String(bv).toLowerCase();
    if (sort.direction === 'asc') return as < bs ? -1 : as > bs ? 1 : 0;
    return as > bs ? -1 : as < bs ? 1 : 0;
  });
  return sorted;
}

export function getUniqueSalespersons(opportunities: Opportunity[]): string[] {
  const names = new Set(opportunities.map((o) => o.salesPersonName).filter(Boolean));
  return Array.from(names).sort();
}

export function totalPotentialValue(opportunities: Opportunity[]): number {
  return opportunities.reduce((sum, o) => {
    if (o.targetPrice != null && o.annualVolume != null) {
      return sum + o.targetPrice * o.annualVolume;
    }
    return sum;
  }, 0);
}

export function totalAnnualVolume(opportunities: Opportunity[]): number {
  return opportunities.reduce((sum, o) => {
    return sum + (o.annualVolume ?? 0);
  }, 0);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
