'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Opportunity, STATUSES, PRIORITIES, PRODUCT_CATEGORIES, Status, Priority } from '@/lib/types';
import { useStore } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';
import { todayISO, nowISO } from '@/lib/utils';
import { ChevronDown, ChevronUp, Save, X, Wand2, Loader2, CheckCircle2 } from 'lucide-react';
import type { ParsedOpportunity } from '@/app/api/parse-call-report/route';

type FormData = Omit<Opportunity, 'id' | 'lastUpdated'>;

const EMPTY_FORM: FormData = {
  salesPersonName: '',
  dateEntered: todayISO(),
  dateNeeded: '',
  targetPrice: null,
  annualVolume: null,
  quickNote: '',
  customerName: '',
  productName: '',
  productCategory: '',
  status: 'New',
  priority: 'Medium',
  completionPercent: 0,
  assignedOwner: '',
  supplierName: '',
  nextAction: '',
  followUpDate: '',
  estimatedMargin: null,
  actualQuotedPrice: null,
  outcomeReason: '',
  internalComments: '',
  isCompleted: false,
  dateCompleted: '',
  includeInTodaysFocus: false,
  todaysFocusRank: 0,
  isSourcingRequest: false,
  requestedBy: '',
};

const FIELD_LABELS: Record<string, string> = {
  salesPersonName: 'Sales Person',
  customerName: 'Customer Name',
  productName: 'Product Name',
  productCategory: 'Product Category',
  dateNeeded: 'Date Needed',
  targetPrice: 'Target Price',
  annualVolume: 'Annual Volume',
  quickNote: 'Quick Note',
  priority: 'Priority',
  status: 'Status',
  isSourcingRequest: 'Sourcing Request',
  requestedBy: 'Requested By',
  nextAction: 'Next Action',
  supplierName: 'Supplier Name',
  assignedOwner: 'Assigned Owner',
  followUpDate: 'Follow-Up Date',
  internalComments: 'Internal Comments',
};

interface OpportunityFormProps {
  existing?: Opportunity;
  onCancel?: () => void;
  onSuccess?: (id: string) => void;
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const INPUT_CLS = 'w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const SELECT_CLS = `${INPUT_CLS} cursor-pointer`;

// ── Parse modal ───────────────────────────────────────────────────────────────

function ParseModal({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (data: ParsedOpportunity) => void;
}) {
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<ParsedOpportunity | null>(null);
  const [error, setError] = useState('');

  const handleParse = async () => {
    if (!text.trim()) return;
    setParsing(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/parse-call-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callReport: text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Parse failed');
      setResult(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setParsing(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApply(result);
      onClose();
    }
  };

  const fieldsFound = result?.fieldsFound ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 size={20} className="text-blue-600" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Parse from Call Report</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Paste area */}
          {!result && (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Paste any call notes, email, or meeting summary — ChatGPT will extract the relevant fields and pre-fill the form.
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Called Mike at Acme Industrial today. They need 50,000 units of M8 hex bolts by April 15. Target price is $2.80/unit. Urgent — competitor quoted $3.10. I'll follow up with FastenPro for a quote by Friday..."
                rows={8}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </>
          )}

          {/* Result preview */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 size={18} />
                <span className="text-sm font-semibold">
                  {fieldsFound.length} field{fieldsFound.length !== 1 ? 's' : ''} extracted
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/50">
                {fieldsFound.map((field) => {
                  const val = result[field as keyof ParsedOpportunity];
                  if (val === undefined || val === null) return null;
                  return (
                    <div key={field} className="px-4 py-2.5 flex items-start justify-between gap-3">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0 pt-0.5">
                        {FIELD_LABELS[field] ?? field}
                      </span>
                      <span className="text-xs text-gray-800 dark:text-gray-200 text-right">
                        {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ← Paste different text
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            Cancel
          </button>
          {!result ? (
            <button
              type="button"
              onClick={handleParse}
              disabled={!text.trim() || parsing}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {parsing ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
              {parsing ? 'Parsing…' : 'Parse'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <CheckCircle2 size={15} />
              Apply to Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export function OpportunityForm({ existing, onCancel, onSuccess }: OpportunityFormProps) {
  const router = useRouter();
  const { addOpportunity, updateOpportunity } = useStore();
  const [showMore, setShowMore] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showParseModal, setShowParseModal] = useState(false);

  const [form, setForm] = useState<FormData>(() => {
    if (existing) {
      const { id, lastUpdated, ...rest } = existing;
      return rest;
    }
    return { ...EMPTY_FORM, dateEntered: todayISO() };
  });

  const update = (field: keyof FormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleApplyParsed = (data: ParsedOpportunity) => {
    const { fieldsFound, ...fields } = data;
    const updates: Partial<FormData> = {};
    for (const field of (fieldsFound ?? [])) {
      const val = fields[field as keyof typeof fields];
      if (val !== undefined && val !== null && val !== '') {
        (updates as Record<string, unknown>)[field] = val;
      }
    }
    setForm((prev) => ({ ...prev, ...updates }));
    if ((fieldsFound ?? []).length > 0) setShowMore(true);
    showToast(`Auto-filled ${(fieldsFound ?? []).length} fields from call report`, 'success');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.salesPersonName.trim()) newErrors.salesPersonName = 'Sales person name is required.';
    if (!form.customerName.trim()) newErrors.customerName = 'Customer name is required.';
    if (!form.productName.trim()) newErrors.productName = 'Product name is required.';
    if (!form.dateNeeded) newErrors.dateNeeded = 'Date needed is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the highlighted fields.', 'error');
      return;
    }

    if (existing) {
      updateOpportunity(existing.id, { ...form, lastUpdated: nowISO() });
      showToast('Opportunity updated!', 'success');
      if (onSuccess) onSuccess(existing.id);
      else router.push(`/opportunities/${existing.id}`);
    } else {
      const id = addOpportunity(form as any);
      showToast('Opportunity created!', 'success');
      if (onSuccess) onSuccess(id);
      else router.push(`/opportunities/${id}`);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else router.back();
  };

  return (
    <>
      {showParseModal && (
        <ParseModal onClose={() => setShowParseModal(false)} onApply={handleApplyParsed} />
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Parse from call report button */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl">
          <Wand2 size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Have call notes or an email?</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">ChatGPT can read them and auto-fill this form.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowParseModal(true)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Wand2 size={14} />
            Auto-fill
          </button>
        </div>

        {/* Essential fields */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Essential Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Sales Person" required>
              <input
                type="text"
                value={form.salesPersonName}
                onChange={(e) => update('salesPersonName', e.target.value)}
                placeholder="e.g. Mike Torres"
                className={`${INPUT_CLS} ${errors.salesPersonName ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.salesPersonName && <p className="text-xs text-red-500 mt-1">{errors.salesPersonName}</p>}
            </Field>

            <Field label="Customer Name" required>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => update('customerName', e.target.value)}
                placeholder="e.g. Acme Industrial"
                className={`${INPUT_CLS} ${errors.customerName ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
            </Field>

            <Field label="Product Name" required>
              <input
                type="text"
                value={form.productName}
                onChange={(e) => update('productName', e.target.value)}
                placeholder="e.g. 304 SS Hex Bolt M8"
                className={`${INPUT_CLS} ${errors.productName ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.productName && <p className="text-xs text-red-500 mt-1">{errors.productName}</p>}
            </Field>

            <Field label="Product Category">
              <select
                value={form.productCategory}
                onChange={(e) => update('productCategory', e.target.value)}
                className={SELECT_CLS}
              >
                <option value="">Select category…</option>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Date Needed" required>
              <input
                type="date"
                value={form.dateNeeded}
                onChange={(e) => update('dateNeeded', e.target.value)}
                className={`${INPUT_CLS} ${errors.dateNeeded ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.dateNeeded && <p className="text-xs text-red-500 mt-1">{errors.dateNeeded}</p>}
            </Field>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value as Status)}
                className={SELECT_CLS}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(e) => update('priority', e.target.value as Priority)}
                className={SELECT_CLS}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>

            <Field label="Target Price (per lb)" hint="Leave blank if not yet determined">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.targetPrice ?? ''}
                  onChange={(e) => update('targetPrice', e.target.value === '' ? null : parseFloat(e.target.value))}
                  placeholder="0.00"
                  className={`${INPUT_CLS} pl-7`}
                />
              </div>
            </Field>

            <Field label="Annual Volume (lbs)" hint="Expected annual order quantity">
              <input
                type="number"
                min="0"
                step="1"
                value={form.annualVolume ?? ''}
                onChange={(e) => update('annualVolume', e.target.value === '' ? null : parseInt(e.target.value))}
                placeholder="0"
                className={INPUT_CLS}
              />
            </Field>

            {form.targetPrice != null && form.annualVolume != null && form.targetPrice > 0 && form.annualVolume > 0 && (
              <Field label="Total Opportunity Potential" hint="Target price × annual volume">
                <div className={`${INPUT_CLS} bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 font-semibold`}>
                  ${(form.targetPrice * form.annualVolume).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </Field>
            )}

            <Field label="Quick Note" hint="Short summary visible in the main table">
              <input
                type="text"
                value={form.quickNote}
                onChange={(e) => update('quickNote', e.target.value)}
                placeholder="Key info at a glance…"
                maxLength={200}
                className={INPUT_CLS}
              />
            </Field>
          </div>

          {/* Sourcing Request */}
          <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isSourcingRequest}
                onChange={(e) => update('isSourcingRequest', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🔍 This is a Sourcing Request
              </span>
            </label>
            <p className="text-xs text-gray-400 mt-1 ml-7">
              Mark this if someone has asked you to find or source a product.
            </p>
            {form.isSourcingRequest && (
              <div className="mt-3 ml-7">
                <Field label="Requested By" hint="Who asked for this to be sourced?">
                  <input
                    type="text"
                    value={form.requestedBy}
                    onChange={(e) => update('requestedBy', e.target.value)}
                    placeholder="e.g. Sarah Chen, customer, management..."
                    className={INPUT_CLS}
                  />
                </Field>
              </div>
            )}
          </div>

          {/* Add to Focus */}
          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.includeInTodaysFocus}
                onChange={(e) => update('includeInTodaysFocus', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                ⭐ Add to Today&apos;s Focus list
              </span>
            </label>
          </div>
        </div>

        {/* More Details toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
          >
            {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showMore ? 'Hide' : 'Show'} More Details (optional)
          </button>
        </div>

        {showMore && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
              Additional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Assigned Owner">
                <input
                  type="text"
                  value={form.assignedOwner}
                  onChange={(e) => update('assignedOwner', e.target.value)}
                  placeholder="Who is managing this?"
                  className={INPUT_CLS}
                />
              </Field>

              <Field label="Supplier Name">
                <input
                  type="text"
                  value={form.supplierName}
                  onChange={(e) => update('supplierName', e.target.value)}
                  placeholder="Supplier / vendor name"
                  className={INPUT_CLS}
                />
              </Field>

              <Field label="Next Action">
                <input
                  type="text"
                  value={form.nextAction}
                  onChange={(e) => update('nextAction', e.target.value)}
                  placeholder="What needs to happen next?"
                  className={INPUT_CLS}
                />
              </Field>

              <Field label="Follow-Up Date">
                <input
                  type="date"
                  value={form.followUpDate}
                  onChange={(e) => update('followUpDate', e.target.value)}
                  className={INPUT_CLS}
                />
              </Field>

              <Field label="Estimated Margin %" hint="Expected profit margin">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={form.estimatedMargin ?? ''}
                    onChange={(e) => update('estimatedMargin', e.target.value === '' ? null : parseFloat(e.target.value))}
                    placeholder="0"
                    className={`${INPUT_CLS} pr-8`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </Field>

              <Field label="Actual Quoted Price">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.actualQuotedPrice ?? ''}
                    onChange={(e) => update('actualQuotedPrice', e.target.value === '' ? null : parseFloat(e.target.value))}
                    placeholder="0.00"
                    className={`${INPUT_CLS} pl-7`}
                  />
                </div>
              </Field>

              <Field label="Completion %" hint="How far along is this opportunity?">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={form.completionPercent}
                    onChange={(e) => update('completionPercent', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10 text-right">
                    {form.completionPercent}%
                  </span>
                </div>
              </Field>

              <Field label="Date Entered">
                <input
                  type="date"
                  value={form.dateEntered}
                  onChange={(e) => update('dateEntered', e.target.value)}
                  className={INPUT_CLS}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Outcome / Reason" hint="Why did we win or lose? Any important context.">
                  <input
                    type="text"
                    value={form.outcomeReason}
                    onChange={(e) => update('outcomeReason', e.target.value)}
                    placeholder="Context about the outcome…"
                    className={INPUT_CLS}
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Internal Comments">
                  <textarea
                    value={form.internalComments}
                    onChange={(e) => update('internalComments', e.target.value)}
                    placeholder="Internal notes, strategy, concerns…"
                    rows={3}
                    className={INPUT_CLS}
                  />
                </Field>
              </div>

              {/* Completion fields */}
              <div className="md:col-span-2 border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none mb-3">
                  <input
                    type="checkbox"
                    checked={form.isCompleted}
                    onChange={(e) => update('isCompleted', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mark as Completed</span>
                </label>
                {form.isCompleted && (
                  <Field label="Date Completed">
                    <input
                      type="date"
                      value={form.dateCompleted}
                      onChange={(e) => update('dateCompleted', e.target.value)}
                      className={INPUT_CLS}
                    />
                  </Field>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Save size={16} />
            {existing ? 'Save Changes' : 'Create Opportunity'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
