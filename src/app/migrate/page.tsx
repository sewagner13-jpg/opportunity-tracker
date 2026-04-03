'use client';
import { useState, useEffect } from 'react';
import { Opportunity } from '@/lib/types';

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

interface MigrateState {
  status: 'idle' | 'scanning' | 'ready' | 'migrating' | 'done' | 'error' | 'empty';
  found: number;
  migrated: number;
  skipped: number;
  error: string;
  opportunities: Opportunity[];
}

export default function MigratePage() {
  const [state, setState] = useState<MigrateState>({
    status: 'scanning',
    found: 0,
    migrated: 0,
    skipped: 0,
    error: '',
    opportunities: [],
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('opportunity-tracker-v2');
      if (!raw) {
        setState((s) => ({ ...s, status: 'empty' }));
        return;
      }
      const parsed = JSON.parse(raw);
      const opps: Opportunity[] = parsed?.state?.opportunities ?? [];
      if (opps.length === 0) {
        setState((s) => ({ ...s, status: 'empty' }));
      } else {
        setState((s) => ({ ...s, status: 'ready', found: opps.length, opportunities: opps }));
      }
    } catch {
      setState((s) => ({ ...s, status: 'error', error: 'Could not read local storage data.' }));
    }
  }, []);

  const handleMigrate = async () => {
    setState((s) => ({ ...s, status: 'migrating' }));
    let migrated = 0;
    let skipped = 0;

    for (const opp of state.opportunities) {
      try {
        const res = await fetch('/api/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opportunityToRow(opp)),
        });
        if (!res.ok) throw new Error(await res.text());
        migrated++;
      } catch (err) {
        console.error('Failed to migrate:', opp.id, err);
        skipped++;
      }
    }

    setState((s) => ({ ...s, status: 'done', migrated, skipped }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
            <span className="text-white font-bold text-lg">OT</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Migrate Local Data</h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload your browser&apos;s saved opportunities to the shared database.
          </p>
        </div>

        {state.status === 'scanning' && (
          <div className="text-gray-500 text-sm animate-pulse">Scanning local storage…</div>
        )}

        {state.status === 'empty' && (
          <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
            <p className="font-medium">No local data found.</p>
            <p className="mt-1 text-gray-500">
              This browser has no saved opportunities — nothing to migrate.
            </p>
          </div>
        )}

        {state.status === 'ready' && (
          <>
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-6">
              <p className="text-blue-800 font-medium text-sm">
                Found <span className="text-2xl font-bold">{state.found}</span> opportunities
                in this browser.
              </p>
              <p className="text-blue-600 text-xs mt-1">
                New records will be added to the shared database.
              </p>
            </div>
            <button
              onClick={handleMigrate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Upload to Shared Database
            </button>
          </>
        )}

        {state.status === 'migrating' && (
          <div className="text-center py-4">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-600 text-sm">Uploading opportunities…</p>
          </div>
        )}

        {state.status === 'done' && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-green-800 font-semibold">Migration complete!</p>
            <ul className="mt-2 text-sm text-green-700 space-y-1">
              <li>✓ {state.migrated} opportunities uploaded</li>
              {state.skipped > 0 && (
                <li className="text-red-600">✗ {state.skipped} failed — check console</li>
              )}
            </ul>
            <a
              href="/dashboard"
              className="mt-4 block text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Go to Dashboard
            </a>
          </div>
        )}

        {state.status === 'error' && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {state.error}
          </div>
        )}
      </div>
    </div>
  );
}
