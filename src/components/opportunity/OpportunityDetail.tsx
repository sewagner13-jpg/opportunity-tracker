'use client';
import Link from 'next/link';
import { Opportunity } from '@/lib/types';
import { formatDate, formatCurrency, formatNumber, isOverdue, cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { useStore } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';
import {
  Edit2, Star, AlertTriangle, CheckCircle2, ArrowLeft, MessageSquare
} from 'lucide-react';

interface OpportunityDetailProps {
  opportunity: Opportunity;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  if (value === null || value === undefined || value === '' || value === '—') {
    return (
      <div className="flex gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400 w-40 flex-shrink-0">{label}</span>
        <span className="text-sm text-gray-300 dark:text-gray-600 italic">Not set</span>
      </div>
    );
  }
  return (
    <div className="flex gap-2 items-start">
      <span className="text-sm text-gray-500 dark:text-gray-400 w-40 flex-shrink-0">{label}</span>
      <span className={cn('text-sm font-medium flex-1', highlight ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white')}>
        {value}
      </span>
    </div>
  );
}

export function OpportunityDetail({ opportunity: opp }: OpportunityDetailProps) {
  const { toggleFocus, updateOpportunity, role } = useStore();
  const overdue = isOverdue(opp);

  const potentialValue =
    opp.targetPrice != null && opp.annualVolume != null
      ? opp.targetPrice * opp.annualVolume
      : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-3"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {opp.productName || 'Unnamed Opportunity'}
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <StatusBadge status={opp.status} />
            <PriorityBadge priority={opp.priority} />
            {overdue && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                <AlertTriangle size={12} />
                OVERDUE
              </span>
            )}
            {opp.isCompleted && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                <CheckCircle2 size={12} />
                Completed
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              toggleFocus(opp.id);
              showToast(
                opp.includeInTodaysFocus ? 'Removed from Today\'s Focus' : 'Added to Today\'s Focus',
                'info'
              );
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
              opp.includeInTodaysFocus
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-400'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
            )}
          >
            <Star size={16} fill={opp.includeInTodaysFocus ? 'currentColor' : 'none'} />
            {opp.includeInTodaysFocus ? "In Today's Focus" : "Add to Focus"}
          </button>
          {(role === 'Admin' || role === 'Sales') && (
            <Link
              href={`/opportunities/${opp.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Edit2 size={16} />
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Quick Note Banner */}
      {opp.quickNote && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <MessageSquare size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-300">{opp.quickNote}</p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {!opp.isCompleted && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{opp.completionPercent}%</span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${opp.completionPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <DetailSection title="People">
              <DetailRow label="Sales Person" value={opp.salesPersonName} />
              <DetailRow label="Assigned Owner" value={opp.assignedOwner} />
              <DetailRow label="Customer" value={opp.customerName} />
              <DetailRow label="Supplier" value={opp.supplierName} />
            </DetailSection>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <DetailSection title="Product">
              <DetailRow label="Product Name" value={opp.productName} />
              <DetailRow label="Category" value={opp.productCategory} />
            </DetailSection>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <DetailSection title="Dates">
              <DetailRow label="Date Entered" value={formatDate(opp.dateEntered)} />
              <DetailRow
                label="Date Needed"
                value={
                  overdue
                    ? <span className="flex items-center gap-1 text-red-600 dark:text-red-400"><AlertTriangle size={13} />{formatDate(opp.dateNeeded)} (OVERDUE)</span>
                    : formatDate(opp.dateNeeded)
                }
              />
              <DetailRow label="Follow-Up Date" value={formatDate(opp.followUpDate)} />
              <DetailRow label="Last Updated" value={opp.lastUpdated ? new Date(opp.lastUpdated).toLocaleString() : '—'} />
              {opp.isCompleted && <DetailRow label="Completed On" value={formatDate(opp.dateCompleted)} />}
            </DetailSection>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <DetailSection title="Financials">
              <DetailRow label="Target Price (per lb)" value={formatCurrency(opp.targetPrice)} />
              <DetailRow label="Annual Volume (lbs)" value={formatNumber(opp.annualVolume)} />
              <DetailRow
                label="Total Opportunity Potential"
                value={potentialValue ? formatCurrency(potentialValue) : null}
              />
              <DetailRow label="Quoted Price" value={formatCurrency(opp.actualQuotedPrice)} />
              <DetailRow label="Est. Margin" value={opp.estimatedMargin != null ? `${opp.estimatedMargin}%` : null} />
            </DetailSection>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <DetailSection title="Next Steps">
              <DetailRow label="Next Action" value={opp.nextAction} />
            </DetailSection>
          </div>

          {(opp.outcomeReason || opp.internalComments) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <DetailSection title="Notes">
                {opp.outcomeReason && <DetailRow label="Outcome Reason" value={opp.outcomeReason} />}
                {opp.internalComments && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Internal Comments</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{opp.internalComments}</p>
                  </div>
                )}
              </DetailSection>
            </div>
          )}

          {/* Change history placeholder */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
              Change History
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-600 italic">
              Full audit trail coming soon. Last updated: {opp.lastUpdated ? new Date(opp.lastUpdated).toLocaleString() : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Mark complete quick action */}
      {!opp.isCompleted && role === 'Admin' && (
        <div className="mt-6 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Ready to close this out?</p>
            <p className="text-xs text-green-600 dark:text-green-500">Mark as completed when the opportunity is finished.</p>
          </div>
          <button
            onClick={() => {
              updateOpportunity(opp.id, {
                isCompleted: true,
                status: 'Completed',
                completionPercent: 100,
                dateCompleted: new Date().toISOString().split('T')[0],
                includeInTodaysFocus: false,
                todaysFocusRank: 0,
              });
              showToast('Marked as completed!', 'success');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <CheckCircle2 size={16} />
            Mark Complete
          </button>
        </div>
      )}
    </div>
  );
}
