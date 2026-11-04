import React, { useState, useMemo } from 'react';
import {
  X,
  Moon,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Check,
  Activity,
  Bed,
  Info,
  Calendar,
} from 'lucide-react';
import { IncompleteTask, PredictivePacingMode, DailySummaryReport } from '../types';
import { calculatePredictiveBedtime } from '../utils/predictiveScheduling';
import { sounds } from '../utils/audio';

interface PredictiveSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: IncompleteTask[];
  currentBedtime: string;
  onUpdateBedtime: (newBedtime: string) => void;
  report?: DailySummaryReport | null;
}

export const PredictiveSchedulingModal: React.FC<PredictiveSchedulingModalProps> = ({
  isOpen,
  onClose,
  tasks,
  currentBedtime,
  onUpdateBedtime,
  report,
}) => {
  const [pacingMode, setPacingMode] = useState<PredictivePacingMode>('balanced');
  const [customTime, setCustomTime] = useState<string>(currentBedtime);
  const [justApplied, setJustApplied] = useState<boolean>(false);

  // Compute recommendation dynamically based on tasks, pacing mode, and productivity insights
  const rec = useMemo(() => {
    return calculatePredictiveBedtime({
      tasks,
      currentBedtime,
      pacingMode,
      report,
    });
  }, [tasks, currentBedtime, pacingMode, report]);

  if (!isOpen) return null;

  const isCurrentBedtimeOptimal = rec.suggestedBedtime === currentBedtime;
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const handleApplyOptimal = () => {
    onUpdateBedtime(rec.suggestedBedtime);
    sounds.playTaskFinished();
    setJustApplied(true);
    setTimeout(() => {
      setJustApplied(false);
      onClose();
    }, 600);
  };

  const handleApplyCustom = () => {
    onUpdateBedtime(customTime);
    sounds.playTaskFinished();
    setJustApplied(true);
    setTimeout(() => {
      setJustApplied(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Moon className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Predictive Scheduling & Bedtime Optimizer
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider font-semibold">
                  Productivity Insights Engine
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Optimal sleep timing derived from your average task completion duration
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 bg-stone-50/50">
          {/* Main Hero: Current vs Suggested Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Target */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  Current Bedtime
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-stone-900">
                    {currentBedtime}
                  </span>
                  <span className="text-xs text-stone-500">configured</span>
                </div>
              </div>
              <p className="text-xs text-stone-500 mt-3 pt-3 border-t border-stone-100">
                Fixed manual threshold currently set for your workday wrap-up.
              </p>
            </div>

            {/* Suggested Bedtime Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900 to-stone-900 text-white border border-indigo-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Sparkles className="w-20 h-20 text-white" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Optimal Suggested Bedtime
                  </span>
                  {rec.differenceMinutes !== 0 ? (
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                        rec.differenceMinutes < 0
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {rec.differenceMinutes < 0
                        ? `${Math.abs(rec.differenceMinutes)}m earlier`
                        : `+${rec.differenceMinutes}m buffer`}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Aligned
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-white">
                    {rec.suggestedBedtime}
                  </span>
                  <span className="text-xs text-indigo-200">predictive</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-indigo-800/60 flex items-center justify-between">
                <span className="text-[11px] text-indigo-200">
                  Wind-down starts at: <strong>{rec.windDownStartTime}</strong> ({rec.windDownMinutes}m)
                </span>
                {!isCurrentBedtimeOptimal && (
                  <button
                    type="button"
                    onClick={handleApplyOptimal}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white transition-colors shadow-2xs cursor-pointer"
                  >
                    {justApplied ? 'Applied!' : 'Apply Bedtime'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Productivity Insights Derivation Breakdown */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Derived From Productivity Insights
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] uppercase font-semibold text-stone-500 block">
                  Avg Task Completion
                </span>
                <span className="text-base font-bold font-mono text-stone-900 mt-0.5 block">
                  {rec.avgDailyTaskCompletionMinutes ?? 16.8}m
                </span>
                <span className="text-[10px] text-stone-400">per task closure</span>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] uppercase font-semibold text-stone-500 block">
                  Pending Loops
                </span>
                <span className="text-base font-bold font-mono text-stone-900 mt-0.5 block">
                  {pendingCount} tasks
                </span>
                <span className="text-[10px] text-stone-400">
                  ~{rec.estimatedResolutionTimeMinutes}m total work
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] uppercase font-semibold text-stone-500 block">
                  Projected Finish
                </span>
                <span className="text-base font-bold font-mono text-indigo-700 mt-0.5 block">
                  {rec.projectedQueueFinishTime ?? '21:45'}
                </span>
                <span className="text-[10px] text-stone-400">evening wrap-up</span>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] uppercase font-semibold text-stone-500 block">
                  Circadian Decel
                </span>
                <span className="text-base font-bold font-mono text-emerald-700 mt-0.5 block">
                  +{rec.windDownMinutes}m
                </span>
                <span className="text-[10px] text-stone-400">melatonin buffer</span>
              </div>
            </div>

            <div className="mt-3.5 p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Predictive Scheduling Formula</strong>:
                <br />
                <span className="font-mono text-[11px] text-indigo-900">
                  Optimal Bedtime ({rec.suggestedBedtime}) = Projected Wrap-Up ({rec.projectedQueueFinishTime}) + Wind-Down ({rec.windDownMinutes}m).
                </span>
                <p className="text-[11px] text-stone-600 mt-1">
                  {rec.insightsSourceSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Pacing Mode Selector */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-stone-500" />
                Workload Resolution Pacing
              </label>
              <span className="text-[11px] text-stone-500 font-mono">
                Multiplier: {pacingMode === 'turbo' ? '0.65x (Fast)' : pacingMode === 'supervised' ? '1.4x (Careful)' : '1.0x (Standard)'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPacingMode('turbo')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  pacingMode === 'turbo'
                    ? 'border-purple-500 bg-purple-50 text-purple-950 ring-1 ring-purple-500 font-semibold'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1">
                  <span>🚀 Turbo</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                  Fast automated closure. Leaves maximum sleep headroom.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPacingMode('balanced')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  pacingMode === 'balanced'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-1 ring-indigo-500 font-semibold'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1">
                  <span>⚖️ Balanced</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                  Standard cadence based on 7-day average completion speed.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPacingMode('supervised')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  pacingMode === 'supervised'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 ring-1 ring-amber-500 font-semibold'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1">
                  <span>🛡️ Supervised</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                  Includes user review buffer before closing out tasks.
                </p>
              </button>
            </div>
          </div>

          {/* Rationale Bullet List */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2.5">
              Circadian & Velocity Rationale
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              {rec.rationalePoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Manual Bedtime Override */}
          <div className="bg-stone-100/70 rounded-xl p-3.5 border border-stone-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <Clock className="w-4 h-4 text-stone-500 shrink-0" />
              <span>Or set custom target:</span>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {customTime !== currentBedtime && (
              <button
                type="button"
                onClick={handleApplyCustom}
                className="px-3 py-1 rounded-lg bg-stone-900 text-white font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Set to {customTime}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-white flex items-center justify-between text-xs">
          <div className="text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Integrator Daemon Predictive Scheduling Engine v2.0</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleApplyOptimal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {justApplied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Applied {rec.suggestedBedtime}!</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-200" />
                  <span>Apply Optimal Bedtime ({rec.suggestedBedtime})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
