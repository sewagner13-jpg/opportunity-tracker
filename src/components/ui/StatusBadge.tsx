'use client';
import { Status, STATUS_COLORS, STATUS_COLORS_DARK } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: Status;
  dark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, dark = false, size = 'md' }: StatusBadgeProps) {
  const colors = dark ? STATUS_COLORS_DARK[status] : STATUS_COLORS[status];
  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap',
        sizeClass,
        colors.bg,
        colors.text
      )}
    >
      {!dark && <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_COLORS[status].dot)} />}
      {status}
    </span>
  );
}
