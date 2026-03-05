'use client';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Opportunity, OPEN_STATUSES, STATUS_COLORS_DARK } from '@/lib/types';
import { formatDate, formatCurrency, formatNumber, isOverdue, cn } from '@/lib/utils';
import {
  Play, Pause, ChevronUp, ChevronDown, Gauge, RefreshCw, Monitor
} from 'lucide-react';
import { format } from 'date-fns';

// Priority order for TV board: High → Medium → Low, then by dateNeeded
function sortForBoard(opps: Opportunity[]): Opportunity[] {
  const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
  return [...opps].sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 99;
    const pb = priorityOrder[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    if (a.dateNeeded && b.dateNeeded) return a.dateNeeded.localeCompare(b.dateNeeded);
    if (a.dateNeeded) return -1;
    if (b.dateNeeded) return 1;
    return 0;
  });
}

function StatusDot({ status }: { status: Opportunity['status'] }) {
  const colors: Record<string, string> = {
    'New': 'bg-blue-400',
    'In Review': 'bg-indigo-400',
    'Sourcing': 'bg-purple-400',
    'Waiting on Supplier': 'bg-orange-400',
    'Quoted': 'bg-yellow-400',
    'Awaiting Customer Response': 'bg-cyan-400',
    'Won': 'bg-green-400',
    'Lost': 'bg-red-400',
    'On Hold': 'bg-gray-400',
    'Completed': 'bg-teal-400',
  };
  return <span className={cn('inline-block w-2.5 h-2.5 rounded-full flex-shrink-0', colors[status] || 'bg-gray-400')} />;
}

function PriorityPill({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    High: 'bg-red-500/20 text-red-300 border border-red-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    Low: 'bg-green-500/20 text-green-300 border border-green-500/30',
  };
  return (
    <span className={cn('text-sm font-bold px-2.5 py-1 rounded-full whitespace-nowrap', styles[priority])}>
      {priority === 'High' ? '▲' : priority === 'Medium' ? '●' : '▼'} {priority}
    </span>
  );
}

export function TVBoard() {
  const opportunities = useStore((s) => s.opportunities);
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollSpeed, setScrollSpeed] = useState(1.5); // px per frame interval
  const [now, setNow] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastScrollRef = useRef<number>(0);
  const isPausedRef = useRef(false);

  // Filter to open / active items for TV board
  const boardItems = useMemo(() => {
    const active = opportunities.filter((o) =>
      !o.isCompleted && OPEN_STATUSES.includes(o.status as any)
    );
    return sortForBoard(active);
  }, [opportunities]);

  // Clock tick
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      // Store will re-render naturally via zustand reactivity
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll loop
  useEffect(() => {
    isPausedRef.current = !autoScroll;
  }, [autoScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let lastTime = 0;
    const FPS_INTERVAL = 1000 / 60;

    const scroll = (timestamp: number) => {
      if (!isPausedRef.current) {
        const elapsed = timestamp - lastTime;
        if (elapsed >= FPS_INTERVAL) {
          lastTime = timestamp;
          el.scrollTop += scrollSpeed * (elapsed / FPS_INTERVAL) * 0.5;
          // Loop back to top when we reach the bottom
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
            el.scrollTop = 0;
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(scroll);
    };

    animFrameRef.current = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [scrollSpeed]);

  const scrollManual = (direction: 'up' | 'down') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: direction === 'down' ? 300 : -300, behavior: 'smooth' });
  };

  const timeStr = format(now, 'h:mm:ss aa');
  const dateStr = format(now, 'EEEE, MMMM d, yyyy');

  const highPriorityCount = boardItems.filter((o) => o.priority === 'High').length;
  const overdueCount = boardItems.filter((o) => isOverdue(o)).length;

  return (
    <div className="h-screen w-screen bg-gray-950 text-white flex flex-col overflow-hidden select-none">
      {/* Top header bar */}
      <header className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Monitor size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">Opportunity Board</div>
              <div className="text-xs text-gray-400 leading-tight">Live Operations View</div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-700">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{boardItems.length}</div>
              <div className="text-xs text-gray-400">Open</div>
            </div>
            <div className="text-center">
              <div className={cn('text-xl font-bold', highPriorityCount > 0 ? 'text-red-400' : 'text-gray-400')}>
                {highPriorityCount}
              </div>
              <div className="text-xs text-gray-400">High Priority</div>
            </div>
            <div className="text-center">
              <div className={cn('text-xl font-bold', overdueCount > 0 ? 'text-orange-400' : 'text-gray-400')}>
                {overdueCount}
              </div>
              <div className="text-xs text-gray-400">Overdue</div>
            </div>
          </div>
        </div>

        {/* Clock */}
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-white">{timeStr}</div>
          <div className="text-sm text-gray-400">{dateStr}</div>
        </div>
      </header>

      {/* Controls bar */}
      <div className="flex-shrink-0 bg-gray-900/80 border-b border-gray-800 px-6 py-2 flex items-center gap-4">
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={cn(
            'flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
            autoScroll
              ? 'bg-blue-600/20 text-blue-400 border border-blue-600/40 hover:bg-blue-600/30'
              : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
          )}
        >
          {autoScroll ? <Pause size={14} /> : <Play size={14} />}
          {autoScroll ? 'Pause Scroll' : 'Auto Scroll'}
        </button>

        <div className="flex items-center gap-2">
          <Gauge size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">Speed:</span>
          {[0.5, 1, 1.5, 2.5, 4].map((s) => (
            <button
              key={s}
              onClick={() => setScrollSpeed(s)}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                scrollSpeed === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
              )}
            >
              {s === 0.5 ? 'Slow' : s === 1 ? '1x' : s === 1.5 ? '1.5x' : s === 2.5 ? '2x' : 'Fast'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => scrollManual('up')}
            className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
            title="Scroll up"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={() => scrollManual('down')}
            className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
            title="Scroll down"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Sticky column headers */}
      <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 2fr 2.5fr 1.5fr 1.5fr 1.5fr 1.5fr 1.5fr 2fr' }}>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sales Person</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date Needed</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target Price</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ann. Volume</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Priority</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quick Note</div>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={() => { isPausedRef.current = true; }}
        onMouseLeave={() => { isPausedRef.current = !autoScroll; }}
      >
        {boardItems.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <div className="text-2xl font-bold text-gray-400">All caught up!</div>
              <div className="text-gray-600 mt-2">No open opportunities to display.</div>
            </div>
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {boardItems.map((opp) => {
              const overdue = isOverdue(opp);
              const isHigh = opp.priority === 'High';

              return (
                <div
                  key={opp.id}
                  className={cn(
                    'grid gap-4 px-4 py-4 rounded-xl border transition-colors',
                    overdue
                      ? 'bg-red-900/20 border-red-800/50'
                      : isHigh
                      ? 'bg-gray-800/80 border-gray-700'
                      : 'bg-gray-900/60 border-gray-800/50',
                  )}
                  style={{ gridTemplateColumns: '2fr 2fr 2.5fr 1.5fr 1.5fr 1.5fr 1.5fr 1.5fr 2fr' }}
                >
                  {/* Sales Person */}
                  <div className="text-white text-base font-semibold truncate">
                    {opp.salesPersonName || '—'}
                  </div>

                  {/* Customer */}
                  <div className="text-gray-200 text-base truncate">
                    {opp.customerName || '—'}
                  </div>

                  {/* Product */}
                  <div className="text-gray-200 text-base truncate" title={opp.productName}>
                    {opp.productName || '—'}
                  </div>

                  {/* Date Needed */}
                  <div className={cn(
                    'text-base flex items-center gap-1.5 font-medium',
                    overdue ? 'text-red-400' : 'text-gray-200'
                  )}>
                    {overdue && <span className="text-red-400">⚠</span>}
                    {formatDate(opp.dateNeeded)}
                  </div>

                  {/* Target Price */}
                  <div className="text-gray-200 text-base">
                    {formatCurrency(opp.targetPrice)}
                  </div>

                  {/* Annual Volume */}
                  <div className="text-gray-200 text-base">
                    {formatNumber(opp.annualVolume)}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <StatusDot status={opp.status} />
                    <span className="text-gray-200 text-sm truncate">{opp.status}</span>
                  </div>

                  {/* Priority */}
                  <div>
                    <PriorityPill priority={opp.priority} />
                  </div>

                  {/* Quick Note */}
                  <div className="text-gray-400 text-sm truncate italic" title={opp.quickNote}>
                    {opp.quickNote || '—'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="flex-shrink-0 bg-gray-900 border-t border-gray-800 px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', autoScroll ? 'bg-green-400 animate-pulse' : 'bg-gray-500')} />
          <span className="text-xs text-gray-500">{autoScroll ? 'Live · Auto-scrolling' : 'Paused'}</span>
        </div>
        <span className="text-xs text-gray-600">Opportunity Tracker · hover to pause scroll</span>
      </div>
    </div>
  );
}
