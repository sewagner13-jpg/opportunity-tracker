'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const { isConnected, connectionError, opportunities, loading } = useStore();
  const [testQueryResult, setTestQueryResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('count', { count: 'exact', head: true });

        if (error) {
          setTestError(`Connection test failed: ${error.message}`);
        } else {
          setTestQueryResult(`Successfully connected. Found ${data?.length || 0} opportunities in database.`);
        }
      } catch (e) {
        setTestError(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Debug Information</h1>

        {/* Connection Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connection Status</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Status: {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {connectionError && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                Error: {connectionError}
              </div>
            )}
            {testError && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                Test Error: {testError}
              </div>
            )}
            {testQueryResult && (
              <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded">
                {testQueryResult}
              </div>
            )}
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Environment Variables</h2>
          <div className="space-y-2 text-sm font-mono">
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">URL:</span> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">ANON_KEY:</span> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}
            </div>
          </div>
        </div>

        {/* Store State */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Store State</h2>
          <div className="space-y-2 text-sm">
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Loading:</span> {loading ? 'Yes' : 'No'}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Opportunities Loaded:</span> {opportunities.length}
            </div>
          </div>
        </div>

        {/* Opportunities List */}
        {opportunities.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Opportunities ({opportunities.length})
            </h2>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Product</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {opportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-2 text-gray-900 dark:text-white font-mono text-xs">{opp.id.slice(0, 12)}...</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{opp.customerName}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{opp.productName}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{opp.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loading && opportunities.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <p className="text-sm text-blue-700 dark:text-blue-300">Loading opportunities from Supabase...</p>
          </div>
        )}
      </div>
    </div>
  );
}
