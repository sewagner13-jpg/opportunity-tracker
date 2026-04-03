'use client';
import { create } from 'zustand';
import { Opportunity, UserRole, Status, Priority } from './types';
import { generateId, nowISO, todayISO } from './utils';

// Map DB row (snake_case) → Opportunity (camelCase)
function rowToOpportunity(row: Record<string, unknown>): Opportunity {
  return {
    id: (row.id as string) ?? '',
    salesPersonName: (row.sales_person_name as string) ?? '',
    dateEntered: (row.date_entered as string) ?? '',
    dateNeeded: (row.date_needed as string) ?? '',
    targetPrice: row.target_price != null ? Number(row.target_price) : null,
    annualVolume: row.annual_volume != null ? Number(row.annual_volume) : null,
    quickNote: (row.quick_note as string) ?? '',
    customerName: (row.customer_name as string) ?? '',
    productName: (row.product_name as string) ?? '',
    productCategory: (row.product_category as string) ?? '',
    status: (row.status as Status) ?? 'New',
    priority: (row.priority as Priority) ?? 'Medium',
    completionPercent: Number(row.completion_percent) ?? 0,
    assignedOwner: (row.assigned_owner as string) ?? '',
    supplierName: (row.supplier_name as string) ?? '',
    lastUpdated: (row.last_updated as string) ?? '',
    nextAction: (row.next_action as string) ?? '',
    followUpDate: (row.follow_up_date as string) ?? '',
    estimatedMargin: row.estimated_margin != null ? Number(row.estimated_margin) : null,
    actualQuotedPrice: row.actual_quoted_price != null ? Number(row.actual_quoted_price) : null,
    outcomeReason: (row.outcome_reason as string) ?? '',
    internalComments: (row.internal_comments as string) ?? '',
    isCompleted: Boolean(row.is_completed),
    dateCompleted: (row.date_completed as string) ?? '',
    includeInTodaysFocus: Boolean(row.include_in_todays_focus),
    todaysFocusRank: Number(row.todays_focus_rank) ?? 0,
    isSourcingRequest: Boolean(row.is_sourcing_request),
    requestedBy: (row.requested_by as string) ?? '',
  };
}

// Map Opportunity (camelCase) → DB row (snake_case)
function opportunityToRow(opp: Opportunity): Record<string, unknown> {
  return {
    id: opp.id,
    sales_person_name: opp.salesPersonName,
    date_entered: opp.dateEntered || null,
    date_needed: opp.dateNeeded || null,
    target_price: opp.targetPrice,
    annual_volume: opp.annualVolume,
    quick_note: opp.quickNote,
    customer_name: opp.customerName,
    product_name: opp.productName,
    product_category: opp.productCategory,
    status: opp.status,
    priority: opp.priority,
    completion_percent: opp.completionPercent,
    assigned_owner: opp.assignedOwner,
    supplier_name: opp.supplierName,
    last_updated: opp.lastUpdated || null,
    next_action: opp.nextAction,
    follow_up_date: opp.followUpDate || null,
    estimated_margin: opp.estimatedMargin,
    actual_quoted_price: opp.actualQuotedPrice,
    outcome_reason: opp.outcomeReason,
    internal_comments: opp.internalComments,
    is_completed: opp.isCompleted,
    date_completed: opp.dateCompleted || null,
    include_in_todays_focus: opp.includeInTodaysFocus,
    todays_focus_rank: opp.todaysFocusRank,
    is_sourcing_request: opp.isSourcingRequest,
    requested_by: opp.requestedBy,
  };
}

interface AppStore {
  opportunities: Opportunity[];
  role: UserRole;
  loading: boolean;
  hydrated: boolean;
  connectionError: string | null;
  isConnected: boolean;

  loadOpportunities: () => Promise<void>;
  setHydrated: () => void;
  clearConnectionError: () => void;

  addOpportunity: (opp: Omit<Opportunity, 'id' | 'dateEntered' | 'lastUpdated'>) => string;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;
  getOpportunity: (id: string) => Opportunity | undefined;

  toggleFocus: (id: string) => void;
  removeFocus: (id: string) => void;
  reorderFocus: (ids: string[]) => void;
  markCompleteFromFocus: (id: string) => void;

  setRole: (role: UserRole) => void;
  resetToSeedData: () => void;
}

export const useStore = create<AppStore>()((set, get) => ({
  opportunities: [],
  role: 'Admin',
  loading: true,
  hydrated: false,
  connectionError: null,
  isConnected: false,

  setHydrated: () => set({ hydrated: true }),
  clearConnectionError: () => set({ connectionError: null }),

  loadOpportunities: async () => {
    set({ loading: true, connectionError: null });
    try {
      const res = await fetch('/api/opportunities');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      set({
        opportunities: (json.data ?? []).map(rowToOpportunity),
        loading: false,
        hydrated: true,
        connectionError: null,
        isConnected: true,
      });
    } catch (err) {
      console.error('loadOpportunities failed:', err);
      set({
        loading: false,
        hydrated: true,
        connectionError: String(err),
        isConnected: false,
      });
    }
  },

  addOpportunity: (oppData) => {
    const id = generateId();
    const opp: Opportunity = { ...oppData, id, dateEntered: todayISO(), lastUpdated: nowISO() };
    // Optimistic
    set((state) => ({ opportunities: [opp, ...state.opportunities] }));
    // Background sync
    fetch('/api/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opportunityToRow(opp)),
    }).then(async (res) => {
      if (!res.ok) {
        const j = await res.json();
        console.error('Insert failed:', j.error);
        set({ connectionError: j.error || 'Failed to save' });
      }
    });
    return id;
  },

  updateOpportunity: (id, updates) => {
    const now = nowISO();
    set((state) => ({
      opportunities: state.opportunities.map((o) =>
        o.id === id ? { ...o, ...updates, lastUpdated: now } : o
      ),
    }));
    const updated = get().opportunities.find((o) => o.id === id);
    if (updated) {
      fetch(`/api/opportunities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opportunityToRow(updated)),
      }).then(async (res) => {
        if (!res.ok) {
          const j = await res.json();
          console.error('Update failed:', j.error);
          set({ connectionError: j.error || 'Failed to update' });
        }
      });
    }
  },

  deleteOpportunity: (id) => {
    set((state) => ({ opportunities: state.opportunities.filter((o) => o.id !== id) }));
    fetch(`/api/opportunities/${id}`, { method: 'DELETE' }).then(async (res) => {
      if (!res.ok) {
        const j = await res.json();
        console.error('Delete failed:', j.error);
        set({ connectionError: j.error || 'Failed to delete' });
      }
    });
  },

  getOpportunity: (id) => get().opportunities.find((o) => o.id === id),

  toggleFocus: (id) => {
    const opps = get().opportunities;
    const opp = opps.find((o) => o.id === id);
    if (!opp) return;
    if (opp.includeInTodaysFocus) {
      get().updateOpportunity(id, { includeInTodaysFocus: false, todaysFocusRank: 0 });
    } else {
      const maxRank = opps.filter((o) => o.includeInTodaysFocus)
        .reduce((max, o) => Math.max(max, o.todaysFocusRank), 0);
      get().updateOpportunity(id, { includeInTodaysFocus: true, todaysFocusRank: maxRank + 1 });
    }
  },

  removeFocus: (id) => get().updateOpportunity(id, { includeInTodaysFocus: false, todaysFocusRank: 0 }),

  reorderFocus: (ids) => {
    set((state) => ({
      opportunities: state.opportunities.map((o) => {
        const rank = ids.indexOf(o.id);
        return rank >= 0 ? { ...o, todaysFocusRank: rank + 1 } : o;
      }),
    }));
    ids.forEach((id, index) => {
      fetch(`/api/opportunities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todays_focus_rank: index + 1 }),
      });
    });
  },

  markCompleteFromFocus: (id) => {
    get().updateOpportunity(id, {
      isCompleted: true,
      status: 'Completed',
      completionPercent: 100,
      dateCompleted: todayISO(),
      includeInTodaysFocus: false,
      todaysFocusRank: 0,
    });
  },

  setRole: (role) => set({ role }),

  resetToSeedData: () => {
    set({ opportunities: [] });
    fetch('/api/opportunities', { method: 'DELETE' });
  },
}));
