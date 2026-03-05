'use client';
import { use } from 'react';
import { useStore } from '@/lib/store';
import { OpportunityDetail } from '@/components/opportunity/OpportunityDetail';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const opportunity = useStore((s) => s.opportunities.find((o) => o.id === id));

  if (!opportunity) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Opportunity Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            This opportunity may have been deleted or the link is incorrect.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <OpportunityDetail opportunity={opportunity} />
    </div>
  );
}
