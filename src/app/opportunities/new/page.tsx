import { OpportunityForm } from '@/components/opportunity/OpportunityForm';

export default function NewOpportunityPage() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Opportunity</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fill in the essential fields to get started. You can add more details later.
          </p>
        </div>
        <OpportunityForm />
      </div>
    </div>
  );
}
