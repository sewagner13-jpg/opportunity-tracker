'use client';
import { useMemo } from 'react';
import { Opportunity, OPEN_STATUSES } from '@/lib/types';
import { isOverdue, isDueThisWeek, formatCurrency, totalPotentialValue, totalAnnualVolume } from '@/lib/utils';
import {
  TrendingUp, AlertCircle, Clock, CheckCircle, Users, DollarSign
} from 'lucide-react';
import { startOfMonth, parseISO, isWithinInterval, endOfMonth, isValid } from 'date-fns';

interface KPIBarProps {
  opportunities: Opportunity[];
}

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  alert?: boolean;
}

function KPICard({ label, value, sub, icon, color, alert }: KPICardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border ${alert ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'} p-4 flex items-start gap-3 flex-1 min-w-0`}>
      <div className={`rounded-lg p-2 flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</div>
        <div className={`text-2xl font-bold mt-0.5 ${alert ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
          {value}
        </div>
        {sub && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{sub}</div>}
      </div>
    </div>
  );
}

export function KPIBar({ opportunities }: KPIBarProps) {
  const stats = useMemo(() => {
    const open = opportunities.filter((o) => OPEN_STATUSES.includes(o.status as any) && !o.isCompleted);
    const highPriority = open.filter((o) => o.priority === 'High');
    const overdue = opportunities.filter((o) => isOverdue(o));
    const dueThisWeek = opportunities.filter((o) => isDueThisWeek(o));

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const completedThisMonth = opportunities.filter((o) => {
      if (!o.isCompleted || !o.dateCompleted) return false;
      const d = parseISO(o.dateCompleted);
      if (!isValid(d)) return false;
      return isWithinInterval(d, { start: monthStart, end: monthEnd });
    });

    // By salesperson
    const byPerson: Record<string, number> = {};
    open.forEach((o) => {
      byPerson[o.salesPersonName] = (byPerson[o.salesPersonName] || 0) + 1;
    });
    const topPerson = Object.entries(byPerson).sort((a, b) => b[1] - a[1])[0];

    const potentialValue = totalPotentialValue(open);
    const annualVol = totalAnnualVolume(open);

    return {
      open: open.length,
      highPriority: highPriority.length,
      overdue: overdue.length,
      dueThisWeek: dueThisWeek.length,
      completedThisMonth: completedThisMonth.length,
      topPerson: topPerson ? `${topPerson[0]} (${topPerson[1]})` : '—',
      potentialValue,
      annualVol,
    };
  }, [opportunities]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
      <KPICard
        label="Open Opportunities"
        value={stats.open}
        icon={<TrendingUp size={18} className="text-blue-600" />}
        color="bg-blue-50 dark:bg-blue-900/30"
      />
      <KPICard
        label="High Priority"
        value={stats.highPriority}
        icon={<AlertCircle size={18} className="text-red-600" />}
        color="bg-red-50 dark:bg-red-900/30"
        alert={stats.highPriority > 0}
      />
      <KPICard
        label="Overdue"
        value={stats.overdue}
        icon={<AlertCircle size={18} className="text-orange-600" />}
        color="bg-orange-50 dark:bg-orange-900/30"
        alert={stats.overdue > 0}
      />
      <KPICard
        label="Due This Week"
        value={stats.dueThisWeek}
        icon={<Clock size={18} className="text-yellow-600" />}
        color="bg-yellow-50 dark:bg-yellow-900/30"
      />
      <KPICard
        label="Completed (Month)"
        value={stats.completedThisMonth}
        icon={<CheckCircle size={18} className="text-green-600" />}
        color="bg-green-50 dark:bg-green-900/30"
      />
      <KPICard
        label="Top Salesperson"
        value={stats.topPerson}
        sub="by open count"
        icon={<Users size={18} className="text-purple-600" />}
        color="bg-purple-50 dark:bg-purple-900/30"
      />
      <KPICard
        label="Potential Value"
        value={formatCurrency(stats.potentialValue)}
        sub="open items only"
        icon={<DollarSign size={18} className="text-teal-600" />}
        color="bg-teal-50 dark:bg-teal-900/30"
      />
    </div>
  );
}
