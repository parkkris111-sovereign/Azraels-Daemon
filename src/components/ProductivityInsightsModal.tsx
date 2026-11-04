import React from 'react';
import {
  X,
  TrendingUp,
  Activity,
  Zap,
  CheckCircle2,
  Clock,
  Moon,
  ShieldCheck,
  BarChart2,
  Calendar,
} from 'lucide-react';
import { IncompleteTask, DailySummaryReport } from '../types';
import { ProductivityDashboard } from './ProductivityDashboard';

interface ProductivityInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: IncompleteTask[];
  report?: DailySummaryReport | null;
  bedtime?: string;
  onUpdateBedtime?: (newBedtime: string) => void;
  onInspectTask?: (task: IncompleteTask) => void;
}

export const ProductivityInsightsModal: React.FC<ProductivityInsightsModalProps> = ({
  isOpen,
  onClose,
  tasks,
  report,
  bedtime = '23:00',
  onUpdateBedtime,
  onInspectTask,
}) => {
  if (!isOpen) return null;

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const totalCount = tasks.length;
  const efficiencyRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Productivity Insights & Efficiency Dashboard
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider font-semibold">
                  Recharts Visual Engine
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                7-day tasks completed vs. pending items • Continuous daemon resolution velocity & cognitive peace index
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Bar */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-4 text-stone-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Current Session: <strong>{completedCount} resolved</strong></span>
            </span>
            <span className="text-stone-300">|</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Active Loops: <strong>{pendingCount} lingering</strong></span>
            </span>
            <span className="text-stone-300">|</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Daemon Efficiency Score: <strong className="text-indigo-700 font-bold">{efficiencyRate}%</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-stone-500">
              Bedtime Target: <strong>{bedtime}</strong>
            </span>
          </div>
        </div>

        {/* Scrollable Dashboard Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-50/50">
          <ProductivityDashboard
            tasks={tasks}
            report={report}
            bedtime={bedtime}
            onUpdateBedtime={onUpdateBedtime}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-white flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Telemetry calibrated via continuous background monitoring across online services</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
