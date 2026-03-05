'use client';
import { Priority, PRIORITY_COLORS } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: Priority;
  dark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const DARK_COLORS: Record<Priority, string> = {
  High: 'bg-red-900/50 text-red-300',
  Medium: 'bg-yellow-900/50 text-yellow-300',
  Low: 'bg-green-900/50 text-green-300',
};

const ICONS: Record<Priority, string> = {
  High: '▲',
  Medium: '●',
  Low: '▼',
};

export function PriorityBadge({ priority, dark = false, size = 'md' }: PriorityBadgeProps) {
  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }[size];

  if (dark) {
    return (
      <span className={cn('inline-flex items-center gap-1 font-medium rounded-full', sizeClass, DARK_COLORS[priority])}>
        <span className="text-[0.6em]">{ICONS[priority]}</span>
        {priority}
      </span>
    );
  }

  const colors = PRIORITY_COLORS[priority];
  return (
    <span className={cn('inline-flex items-center gap-1 font-medium rounded-full border', sizeClass, colors.bg, colors.text, colors.border)}>
      <span className="text-[0.6em]">{ICONS[priority]}</span>
      {priority}
    </span>
  );
}
