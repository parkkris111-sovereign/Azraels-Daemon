import React from 'react';
import { 
  X, 
  Moon, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  Award,
  ArrowRight,
  Clock,
  BarChart3,
  Zap
} from 'lucide-react';
import { IncompleteTask } from '../types';

interface BedtimeAuditModalProps {
  tasks: IncompleteTask[];
  bedtime: string;
  onClose: () => void;
  onInspectTask: (task: IncompleteTask) => void;
  onOpenDailySummary?: () => void;
  onOpenMasterCombine?: () => void;
}

export const BedtimeAuditModal: React.FC<BedtimeAuditModalProps> = ({
  tasks,
  bedtime,
  onClose,
  onInspectTask,
  onOpenDailySummary,
  onOpenMasterCombine,
}) => {
  const [copied, setCopied] = React.useState(false);

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');

  const totalClosed = completedTasks.length;
  const avgStartingProgress = totalClosed > 0
    ? Math.round(completedTasks.reduce((acc, t) => acc + t.currentProgress, 0) / totalClosed)
    : 0;

  const totalGapFilled = totalClosed > 0
    ? Math.round(completedTasks.reduce((acc, t) => acc + (100 - t.currentProgress), 0))
    : 0;

  const handleCopySummary = () => {
    const summaryText = `[Integrator Daemon] 24/7 Continuous Close-Out Report (${new Date().toLocaleDateString()})\n` +
      `Mode: All-Day Non-Stop Operation (No Sleep Downtime)\n` +
      `Status: All ${totalClosed} tasks closed to 100%. Zero loose ends remaining across 24h.\n\n` +
      completedTasks.map((t, idx) => 
        `${idx + 1}. [${t.category.toUpperCase()}] ${t.title} (${t.currentProgress}% -> 100%)\n` +
        `   • Summary: ${t.completionSummary || 'Resolved'}`
      ).join('\n\n') +
      `\n\nContinuous Workspace Velocity: 100% Guaranteed.`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Continuous Header */}
        <div className="p-6 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-850 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                24/7 All-Day Autonomous Patrol
              </span>
              <h2 className="text-xl font-bold tracking-tight">
                Continuous Workspace Closure Audit
              </h2>
            </div>
          </div>
          <p className="text-xs text-stone-300 max-w-md">
            Your Integrator Daemon operates in 24/7 non-stop mode with zero sleep downtime, continuously resolving incomplete drafts and ensuring zero dangling loops across all connected services.
          </p>

          {/* Metrics summary ribbon */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-800 text-center">
            <div className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-700/50">
              <p className="text-[11px] text-stone-400">Tasks Closed</p>
              <p className="text-lg font-bold text-emerald-400">{totalClosed}</p>
            </div>
            <div className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-700/50">
              <p className="text-[11px] text-stone-400">Avg Starting %</p>
              <p className="text-lg font-bold text-stone-100">{avgStartingProgress}%</p>
            </div>
            <div className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-700/50">
              <p className="text-[11px] text-stone-400">Total Gap Resolved</p>
              <p className="text-lg font-bold text-indigo-300">+{totalGapFilled}%</p>
            </div>
          </div>
        </div>

        {/* List of Closed-Out Deliverables */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-stone-200">
            <span className="font-semibold text-stone-700 uppercase tracking-wider text-[11px]">
              Completed Deliverables Today ({completedTasks.length})
            </span>
            <span className="text-stone-500 text-[11px]">
              All items brought to 100%
            </span>
          </div>

          {completedTasks.length === 0 ? (
            <p className="text-stone-500 py-6 text-center italic">
              No tasks have been completed by the daemon yet. Run a Pre-Sleep Sweep to close out items.
            </p>
          ) : (
            completedTasks.map((t) => (
              <div 
                key={t.id}
                onClick={() => {
                  onClose();
                  onInspectTask(t);
                }}
                className="group border border-stone-200 hover:border-emerald-300 rounded-xl p-3.5 bg-stone-50/50 hover:bg-emerald-50/20 cursor-pointer transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <h4 className="font-semibold text-stone-900 group-hover:text-emerald-950">
                      {t.title}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 font-mono">
                      {t.currentProgress}% → 100%
                    </span>
                  </div>
                  <p className="text-stone-600 line-clamp-1 pl-6">
                    {t.completionSummary || t.diffHighlights || 'Resolved all dangling requirements.'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
              </div>
            ))
          )}

          {pendingTasks.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="font-semibold text-amber-900 text-xs">
                {pendingTasks.length} task(s) still lingering:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-amber-800 text-[11px]">
                {pendingTasks.map((pt) => (
                  <li key={pt.id}>
                    {pt.title} ({pt.currentProgress}% complete)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
              <span>{copied ? 'Copied' : 'Copy Sleep Audit'}</span>
            </button>

            {onOpenDailySummary && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDailySummary();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-medium transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Daily Trends & Productivity</span>
              </button>
            )}

            {onOpenMasterCombine && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMasterCombine();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-medium transition-colors"
                title="Open Master Combine Engine (S.A.I.L > ABIDE > AZRAEL > A.A.A. > Arc of Change)"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Master Combine</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium shadow-xs transition-colors"
          >
            Sleep in Peace
          </button>
        </div>
      </div>
    </div>
  );
};
