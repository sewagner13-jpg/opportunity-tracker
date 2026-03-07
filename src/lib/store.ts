'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Opportunity, UserRole } from './types';
import { generateId, nowISO, todayISO } from './utils';

interface AppStore {
  // Data
  opportunities: Opportunity[];
  role: UserRole;

  // Hydration flag
  hydrated: boolean;

  // CRUD
  addOpportunity: (opp: Omit<Opportunity, 'id' | 'dateEntered' | 'lastUpdated'>) => string;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;
  getOpportunity: (id: string) => Opportunity | undefined;

  // Focus management
  toggleFocus: (id: string) => void;
  removeFocus: (id: string) => void;
  reorderFocus: (ids: string[]) => void;
  markCompleteFromFocus: (id: string) => void;

  // Role
  setRole: (role: UserRole) => void;

  // Reset
  resetToSeedData: () => void;
  setHydrated: () => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      opportunities: [],
      role: 'Admin',
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      addOpportunity: (oppData) => {
        const id = generateId();
        const now = nowISO();
        const today = todayISO();
        const opp: Opportunity = {
          ...oppData,
          id,
          dateEntered: today,
          lastUpdated: now,
        };
        set((state) => ({ opportunities: [opp, ...state.opportunities] }));
        return id;
      },

      updateOpportunity: (id, updates) => {
        set((state) => ({
          opportunities: state.opportunities.map((o) =>
            o.id === id ? { ...o, ...updates, lastUpdated: nowISO() } : o
          ),
        }));
      },

      deleteOpportunity: (id) => {
        set((state) => ({
          opportunities: state.opportunities.filter((o) => o.id !== id),
        }));
      },

      getOpportunity: (id) => {
        return get().opportunities.find((o) => o.id === id);
      },

      toggleFocus: (id) => {
        const opps = get().opportunities;
        const opp = opps.find((o) => o.id === id);
        if (!opp) return;

        if (opp.includeInTodaysFocus) {
          // Remove from focus
          set((state) => ({
            opportunities: state.opportunities.map((o) =>
              o.id === id
                ? { ...o, includeInTodaysFocus: false, todaysFocusRank: 0, lastUpdated: nowISO() }
                : o
            ),
          }));
        } else {
          // Add to focus
          const focusItems = opps.filter((o) => o.includeInTodaysFocus);
          const maxRank = focusItems.length > 0
            ? Math.max(...focusItems.map((o) => o.todaysFocusRank))
            : 0;
          set((state) => ({
            opportunities: state.opportunities.map((o) =>
              o.id === id
                ? { ...o, includeInTodaysFocus: true, todaysFocusRank: maxRank + 1, lastUpdated: nowISO() }
                : o
            ),
          }));
        }
      },

      removeFocus: (id) => {
        set((state) => ({
          opportunities: state.opportunities.map((o) =>
            o.id === id
              ? { ...o, includeInTodaysFocus: false, todaysFocusRank: 0, lastUpdated: nowISO() }
              : o
          ),
        }));
      },

      reorderFocus: (ids) => {
        set((state) => ({
          opportunities: state.opportunities.map((o) => {
            const rank = ids.indexOf(o.id);
            return rank >= 0 ? { ...o, todaysFocusRank: rank + 1 } : o;
          }),
        }));
      },

      markCompleteFromFocus: (id) => {
        set((state) => ({
          opportunities: state.opportunities.map((o) =>
            o.id === id
              ? {
                  ...o,
                  isCompleted: true,
                  status: 'Completed',
                  completionPercent: 100,
                  dateCompleted: todayISO(),
                  includeInTodaysFocus: false,
                  todaysFocusRank: 0,
                  lastUpdated: nowISO(),
                }
              : o
          ),
        }));
      },

      setRole: (role) => set({ role }),

      resetToSeedData: () => set({ opportunities: [] }),
    }),
    {
      name: 'opportunity-tracker-v2',
      storage: createJSONStorage(() => {
        // Safe localStorage access
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated();
      },
    }
  )
);
