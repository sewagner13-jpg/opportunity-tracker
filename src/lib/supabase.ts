import { createClient } from '@supabase/supabase-js';
import { Opportunity, Status, Priority } from './types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

// Map DB row (snake_case) → Opportunity (camelCase)
export function rowToOpportunity(row: Record<string, unknown>): Opportunity {
  return {
    id: (row.id as string) ?? '',
    salesPersonName: (row.sales_person_name as string) ?? '',
    dateEntered: (row.date_entered as string) ?? '',
    dateNeeded: (row.date_needed as string) ?? '',
    targetPrice: (row.target_price as number) ?? null,
    annualVolume: (row.annual_volume as number) ?? null,
    quickNote: (row.quick_note as string) ?? '',
    customerName: (row.customer_name as string) ?? '',
    productName: (row.product_name as string) ?? '',
    productCategory: (row.product_category as string) ?? '',
    status: (row.status as Status) ?? 'New',
    priority: (row.priority as Priority) ?? 'Medium',
    completionPercent: (row.completion_percent as number) ?? 0,
    assignedOwner: (row.assigned_owner as string) ?? '',
    supplierName: (row.supplier_name as string) ?? '',
    lastUpdated: (row.last_updated as string) ?? '',
    nextAction: (row.next_action as string) ?? '',
    followUpDate: (row.follow_up_date as string) ?? '',
    estimatedMargin: (row.estimated_margin as number) ?? null,
    actualQuotedPrice: (row.actual_quoted_price as number) ?? null,
    outcomeReason: (row.outcome_reason as string) ?? '',
    internalComments: (row.internal_comments as string) ?? '',
    isCompleted: (row.is_completed as boolean) ?? false,
    dateCompleted: (row.date_completed as string) ?? '',
    includeInTodaysFocus: (row.include_in_todays_focus as boolean) ?? false,
    todaysFocusRank: (row.todays_focus_rank as number) ?? 0,
    isSourcingRequest: (row.is_sourcing_request as boolean) ?? false,
    requestedBy: (row.requested_by as string) ?? '',
  };
}

// Map Opportunity (camelCase) → DB row (snake_case)
export function opportunityToRow(opp: Opportunity): Record<string, unknown> {
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
