import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Terminal, 
  Moon, 
  Sparkles, 
  Activity, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { DaemonLog } from '../types';

interface DaemonStatusBarProps {
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  avgProgress: number;
  isSweeping: boolean;
  activeLog: string;
  logs: DaemonLog[];
  onOpenAudit: () => void;
  onOpenDailySummary?: () => void;
  onOpenMasterCombine?: () => void;
}

export const DaemonStatusBar: React.FC<DaemonStatusBarProps> = ({
  totalCount,
  pendingCount,
  completedCount,
  avgProgress,
  isSweeping,
  activeLog,
  logs,
  onOpenAudit,
  onOpenDailySummary,
  onOpenMasterCombine,
}) => {
  const readinessPercentage = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 100;

  return (
    <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-xs mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Metric 1: Sleep Readiness */}
        <div className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200 pb-3 md:pb-0 md:pr-4">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              Pre-Sleep Readiness
            </span>
            <span className="font-semibold text-stone-900">{readinessPercentage}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                readinessPercentage === 100 
                  ? 'bg-emerald-500' 
                  : readinessPercentage > 50 
                    ? 'bg-indigo-600' 
                    : 'bg-amber-500'
              }`}
              style={{ width: `${readinessPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5 flex items-center justify-between">
            <span>{pendingCount} lingering {pendingCount === 1 ? 'task' : 'tasks'}</span>
            {readinessPercentage === 100 ? (
              <button 
                onClick={onOpenAudit}
                className="text-emerald-700 font-medium hover:underline flex items-center gap-0.5"
              >
                Review audit <ArrowRight className="w-2.5 h-2.5" />
              </button>
            ) : onOpenMasterCombine ? (
              <button
                onClick={onOpenMasterCombine}
                className="text-indigo-600 font-medium hover:underline flex items-center gap-0.5"
                title="Open Master Combine Predictive Bedtime Engine"
              >
                Predict Bedtime <ArrowRight className="w-2.5 h-2.5" />
              </button>
            ) : null}
          </p>
        </div>

        {/* Metric 2: Lingering Trails Monitored */}
        <div className="border-b md:border-b-0 md:border-r border-stone-200 pb-3 md:pb-0 md:px-4">
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-0.5">
            <Layers className="w-3.5 h-3.5 text-stone-400" />
            <span>Trails Tracked (1%–99%)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-stone-900 tracking-tight">{totalCount}</span>
            <span className="text-xs text-stone-500">
              Avg started at <span className="font-semibold text-stone-700">{avgProgress}%</span>
            </span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[11px] text-stone-400">
              Gmail, PRs, Slack & Docs
            </p>
            {onOpenMasterCombine && (
              <button
                type="button"
                onClick={onOpenMasterCombine}
                className="text-[11px] text-purple-600 hover:text-purple-800 font-medium hover:underline flex items-center gap-0.5"
                title="Open Master Combine Engine (S.A.I.L > ABIDE > AZRAEL > A.A.A. > Arc of Change)"
              >
                <span>S.A.I.L❯Arc</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Metric 3: Daemon Closed Deliverables */}
        <div className="border-b md:border-b-0 md:border-r border-stone-200 pb-3 md:pb-0 md:px-4">
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Closed Out to 100%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-700 tracking-tight">
              {completedCount}
            </span>
            <span className="text-xs text-stone-500">
              / {totalCount} closed
            </span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[11px] text-emerald-600 font-medium">
              Zero loose ends
            </span>
            {completedCount > 0 && onOpenDailySummary && (
              <button
                type="button"
                onClick={onOpenDailySummary}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center gap-0.5"
              >
                <span>Daily Trends</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Metric 4: Real-Time Patrol Terminal Snippet */}
        <div className="md:pl-4">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="flex items-center gap-1 font-mono text-[11px] text-stone-600">
              <Activity className="w-3 h-3 text-indigo-500 animate-pulse" />
              daemon.telemetry
            </span>
            <span className="text-[10px] font-mono text-stone-400">
              {isSweeping ? 'SWEEPING' : 'LISTENING'}
            </span>
          </div>
          <div className="bg-stone-900 text-stone-200 font-mono text-[11px] px-2.5 py-1.5 rounded-lg truncate border border-stone-800 shadow-inner flex items-center gap-2">
            <span className="text-emerald-400 select-none">❯</span>
            <span className="truncate text-stone-300">
              {activeLog || 'Daemon patrolling active workday trails for incomplete items...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
