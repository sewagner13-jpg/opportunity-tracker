'use client';
import { SourcingDashboard } from '@/components/sourcing/SourcingDashboard';

export default function SourcingPage() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sourcing Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track all incoming product sourcing requests from customers and internal teams.
          </p>
        </div>
        <SourcingDashboard />
      </div>
    </div>
  );
}
