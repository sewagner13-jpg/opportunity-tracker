'use client';
import { create } from 'zustand';
import { Opportunity, UserRole } from './types';
import { generateId, nowISO, todayISO } from './utils';
import { supabase, supabaseConfigured, rowToOpportunity, opportunityToRow } from './supabase';

interface AppStore {
  opportunities: Opportunity[];
  role: UserRole;
  loading: boolean;
  hydrated: boolean;
  connectionError: string | null;
  isConnected: boolean;

  // Load all from Supabase (call once on app mount)
  loadOpportunities: () => Promise<void>;
  setHydrated: () => void;
  clearConnectionError: () => void;

  // CRUD — optimistic: local state updates immediately, Supabase syncs in background
  addOpportunity: (opp: Omit<Opportunity, 'id' | 'dateEntered' | 'lastUpdated'>) => string;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;
  getOpportunity: (id: string) => Opportunity | undefined;

  // Focus management
  toggleFocus: (id: string) => void;
  removeFocus: (id: string) => void;
  reorderFocus: (ids: string[]) => void;
  markCompleteFromFocus: (id: string) => void;

  // Role (local only)
  setRole: (role: UserRole) => void;

  // Reset
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
    if (!supabaseConfigured) {
      set({ loading: false, hydrated: true, isConnected: false, connectionError: 'Supabase is not configured.' });
      return;
    }
    set({ loading: true, connectionError: null });
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('date_entered', { ascending: false });

    if (error) {
      const errorMsg = error.message || 'Failed to connect to database';
      console.error('Failed to load opportunities:', error);
      set({
        loading: false,
        hydrated: true,
        connectionError: errorMsg,
        isConnected: false,
      });
      return;
    }

    set({
      opportunities: (data ?? []).map(rowToOpportunity),
      loading: false,
      hydrated: true,
      connectionError: null,
      isConnected: true,
    });
  },

  addOpportunity: (oppData) => {
    const id = generateId();
    const opp: Opportunity = {
      ...oppData,
      id,
      dateEntered: todayISO(),
      lastUpdated: nowISO(),
    };
    // Optimistic local update
    set((state) => ({ opportunities: [opp, ...state.opportunities] }));
    // Background sync
    supabase.from('opportunities').insert(opportunityToRow(opp)).then(({ error }) => {
      if (error) {
        console.error('Supabase insert failed:', error);
        set({ connectionError: error.message || 'Failed to save opportunity' });
      }
    });
    return id;
  },

  updateOpportunity: (id, updates) => {
    const now = nowISO();
    // Optimistic local update
    set((state) => ({
      opportunities: state.opportunities.map((o) =>
        o.id === id ? { ...o, ...updates, lastUpdated: now } : o
      ),
    }));
    // Background sync
    const updated = get().opportunities.find((o) => o.id === id);
    if (updated) {
      supabase.from('opportunities').update(opportunityToRow(updated)).eq('id', id).then(({ error }) => {
        if (error) {
          console.error('Supabase update failed:', error);
          set({ connectionError: error.message || 'Failed to update opportunity' });
        }
      });
    }
  },

  deleteOpportunity: (id) => {
    // Optimistic local update
    set((state) => ({
      opportunities: state.opportunities.filter((o) => o.id !== id),
    }));
    // Background sync
    supabase.from('opportunities').delete().eq('id', id).then(({ error }) => {
      if (error) {
        console.error('Supabase delete failed:', error);
        set({ connectionError: error.message || 'Failed to delete opportunity' });
      }
    });
  },

  getOpportunity: (id) => {
    return get().opportunities.find((o) => o.id === id);
  },

  toggleFocus: (id) => {
    const opps = get().opportunities;
    const opp = opps.find((o) => o.id === id);
    if (!opp) return;

    if (opp.includeInTodaysFocus) {
      get().updateOpportunity(id, { includeInTodaysFocus: false, todaysFocusRank: 0 });
    } else {
      const focusItems = opps.filter((o) => o.includeInTodaysFocus);
      const maxRank = focusItems.length > 0
        ? Math.max(...focusItems.map((o) => o.todaysFocusRank))
        : 0;
      get().updateOpportunity(id, { includeInTodaysFocus: true, todaysFocusRank: maxRank + 1 });
    }
  },

  removeFocus: (id) => {
    get().updateOpportunity(id, { includeInTodaysFocus: false, todaysFocusRank: 0 });
  },

  reorderFocus: (ids) => {
    // Optimistic local update
    set((state) => ({
      opportunities: state.opportunities.map((o) => {
        const rank = ids.indexOf(o.id);
        return rank >= 0 ? { ...o, todaysFocusRank: rank + 1 } : o;
      }),
    }));
    // Background sync — update each rank in parallel
    ids.forEach((id, index) => {
      supabase.from('opportunities')
        .update({ todays_focus_rank: index + 1 })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Supabase reorder failed:', error);
            set({ connectionError: error.message || 'Failed to reorder focus list' });
          }
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
    supabase.from('opportunities').delete().neq('id', '').then(({ error }) => {
      if (error) console.error('Supabase reset failed:', error);
    });
  },
}));
