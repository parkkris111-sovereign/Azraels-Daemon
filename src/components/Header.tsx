import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Moon, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  PlusCircle, 
  Clock, 
  Play, 
  RotateCcw, 
  Settings2,
  Layers,
  BookOpen,
  BarChart3,
  HardDrive,
  Zap,
  TrendingUp,
  FileText,
  Target,
  Check,
  Trophy
} from 'lucide-react';
import { formatCountdownToBedtime } from '../utils/time';
import { sounds } from '../utils/audio';
import { IncompleteTask, DailySummaryReport } from '../types';
import { calculatePredictiveBedtime } from '../utils/predictiveScheduling';
import { DailyGoalModal } from './DailyGoalModal';
import { PredictiveSchedulingModal } from './PredictiveSchedulingModal';

interface HeaderProps {
  bedtime: string;
  onBedtimeChange: (time: string) => void;
  onOpenCapture: () => void;
  onRunBedtimeSweep: () => void;
  onResetSampleData: () => void;
  onOpenServicesHub?: () => void;
  onOpenDailySummary?: () => void;
  onOpenMasterCombine?: () => void;
  onOpenGoogleDrive?: () => void;
  onOpenGoogleKeep?: () => void;
  onOpenProductivityInsights?: () => void;
  isDriveConnected?: boolean;
  isSweeping: boolean;
  pendingCount: number;
  completedCount: number;
  dailyGoal?: number;
  onDailyGoalChange?: (newGoal: number) => void;
  tasks?: IncompleteTask[];
  report?: DailySummaryReport | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAudit: () => void;
  connectedServicesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  bedtime,
  onBedtimeChange,
  onOpenCapture,
  onRunBedtimeSweep,
  onResetSampleData,
  onOpenServicesHub,
  onOpenDailySummary,
  onOpenMasterCombine,
  onOpenGoogleDrive,
  onOpenGoogleKeep,
  onOpenProductivityInsights,
  isDriveConnected = false,
  isSweeping,
  pendingCount,
  completedCount,
  dailyGoal = 5,
  onDailyGoalChange,
  tasks = [],
  report,
  soundEnabled,
  onToggleSound,
  onOpenAudit,
  connectedServicesCount = 7,
}) => {
  const [countdown, setCountdown] = useState(formatCountdownToBedtime(bedtime));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isPredictiveModalOpen, setIsPredictiveModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdownToBedtime(bedtime));
    }, 15000);
    setCountdown(formatCountdownToBedtime(bedtime));
    return () => clearInterval(timer);
  }, [bedtime]);

  const allClear = pendingCount === 0 && completedCount > 0;

  // Daily Goal Progress Ring Geometry
  const safeDailyGoal = Math.max(1, dailyGoal);
  const goalPercent = Math.min(100, Math.round((completedCount / safeDailyGoal) * 100));
  const isGoalReached = completedCount >= safeDailyGoal;
  const ringRadius = 14;
  const ringCircumference = 2 * Math.PI * ringRadius; // ~87.96
  const ringStrokeDashoffset = ringCircumference - (goalPercent / 100) * ringCircumference;

  // Predictive Bedtime Recommendation derived from average task completion velocity
  const predRec = useMemo(() => {
    return calculatePredictiveBedtime({
      tasks: tasks || [],
      currentBedtime: bedtime,
      report,
    });
  }, [tasks, bedtime, report]);

  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-stone-900 text-stone-100 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSweeping ? 'bg-amber-400' : allClear ? 'bg-emerald-400' : 'bg-indigo-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isSweeping ? 'bg-amber-500' : allClear ? 'bg-emerald-500' : 'bg-indigo-600'}`}></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-stone-900 tracking-tight">
                Integrator Daemon
              </h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium tracking-wide ${
                isSweeping 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : allClear 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-stone-100 text-stone-700 border border-stone-200'
              }`}>
                {isSweeping ? '⚡ All-Day Sweep Active' : allClear ? '✨ 100% Cleared · Continuous Watch Active' : '● 24/7 Daemon Patrolling'}
              </span>
            </div>
            <p className="text-xs text-stone-500 line-clamp-1">
              All-Day Autonomous Engine (No Sleep) • Continuous background resolution of 1%–99% open loops across all services
            </p>
          </div>
        </div>

        {/* Center: 24/7 All-Day Operation Indicator & Daily Goal Progress Ring */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap self-start md:self-auto">
          {/* 24/7 All-Day Mode (No Sleep) */}
          <div className="flex items-center gap-2.5 bg-stone-900 text-stone-100 border border-stone-800 px-3.5 py-1.5 rounded-xl text-xs shadow-2xs">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white tracking-wide">
                24/7 All-Day Mode
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                No Sleep • Always On
              </span>
            </div>
            <span className="hidden xl:inline text-stone-700">|</span>
            <span className="hidden xl:flex font-mono text-stone-300 text-[11px] items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              Continuous Patrol
            </span>
          </div>

          {/* Daily Goal Setting & Circular Progress Ring */}
          <button
            type="button"
            onClick={() => setIsGoalModalOpen(true)}
            className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer shadow-2xs select-none ${
              isGoalReached
                ? 'bg-emerald-50/90 border-emerald-300 hover:bg-emerald-100/90 text-emerald-950 ring-1 ring-emerald-400/50'
                : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-800'
            }`}
            title={`Daily Target: ${completedCount} of ${safeDailyGoal} tasks completed (${goalPercent}%). Click to set daily goal.`}
          >
            {/* SVG Circular Progress Ring */}
            <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
              <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
                {/* Background Ring Track */}
                <circle
                  cx="18"
                  cy="18"
                  r={ringRadius}
                  strokeWidth="3.5"
                  fill="transparent"
                  className={isGoalReached ? 'stroke-emerald-200' : 'stroke-stone-200'}
                />
                {/* Dynamic Progress Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r={ringRadius}
                  strokeWidth="3.5"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringStrokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className={`transition-all duration-500 ease-out ${
                    isGoalReached ? 'stroke-emerald-500' : 'stroke-indigo-600'
                  }`}
                />
              </svg>

              {/* Center percentage or checkmark */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isGoalReached ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                ) : (
                  <span className="text-[9px] font-bold font-mono text-stone-700">
                    {goalPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Label and Goal count */}
            <div className="text-left leading-tight">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-stone-500 group-hover:text-stone-800 transition-colors">
                <Target className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Daily Goal</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold font-mono text-stone-900 text-xs">
                  {completedCount}/{safeDailyGoal}
                </span>
                {isGoalReached ? (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200/80 px-1 py-0.5 rounded">
                    Met! 🎯
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-500 font-medium">
                    done
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Bedtime & Predictive Scheduling Button */}
          <button
            type="button"
            onClick={() => setIsPredictiveModalOpen(true)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer shadow-2xs select-none ${
              predRec.differenceMinutes !== 0
                ? 'bg-indigo-50/80 border-indigo-200 hover:bg-indigo-100/80 text-indigo-950 ring-1 ring-indigo-300/40'
                : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-800'
            }`}
            title={`Predictive Scheduling: Target ${bedtime} (Optimal suggested: ${predRec.suggestedBedtime} based on ${predRec.avgDailyTaskCompletionMinutes ?? 16.8}m avg completion time). Click to inspect & apply.`}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0">
              <Moon className="w-4 h-4" />
            </div>

            <div className="text-left leading-tight">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-stone-500 group-hover:text-stone-800 transition-colors">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Bedtime</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold font-mono text-stone-900 text-xs">
                  {bedtime}
                </span>
                {predRec.differenceMinutes !== 0 ? (
                  <span
                    className={`text-[10px] font-bold font-mono px-1 py-0.2 rounded border ${
                      predRec.differenceMinutes < 0
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                  >
                    Opt: {predRec.suggestedBedtime}
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1 rounded">
                    optimal
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onOpenServicesHub && (
            <button
              type="button"
              onClick={onOpenServicesHub}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
              title="View connected online services (Gmail, Trello, Asana, Drive, Notebooks)"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Services ({connectedServicesCount})</span>
            </button>
          )}

          {onOpenGoogleDrive && (
            <button
              type="button"
              onClick={onOpenGoogleDrive}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                isDriveConnected
                  ? 'border-emerald-300 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
              title="Open Google Drive Workspace Cloud Storage"
            >
              <HardDrive className={`w-3.5 h-3.5 ${isDriveConnected ? 'text-emerald-600' : 'text-stone-500'}`} />
              <span>Drive</span>
              {isDriveConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          )}

          {onOpenGoogleKeep && (
            <button
              type="button"
              onClick={onOpenGoogleKeep}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-xs font-medium transition-colors cursor-pointer"
              title="Open Google Keep Notes & Checklists"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Keep</span>
            </button>
          )}

          {onOpenProductivityInsights && (
            <button
              type="button"
              onClick={onOpenProductivityInsights}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-900 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Launch Recharts Productivity Insights Dashboard (7-Day Completion vs Pending)"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Insights</span>
            </button>
          )}

          {onOpenDailySummary && (
            <button
              type="button"
              onClick={onOpenDailySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors"
              title="Analyze completed workday trails and view Gemini productivity trends"
            >
              <BarChart3 className="w-3.5 h-3.5 text-stone-600" />
              <span>Daily Trends</span>
            </button>
          )}

          {onOpenMasterCombine && (
            <button
              type="button"
              onClick={onOpenMasterCombine}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-purple-900 text-xs font-semibold shadow-2xs transition-colors"
              title="Launch The Master Combine Engine (S.A.I.L > ABIDE > AZRAEL > A.A.A. > Arc of Change)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Master Combine</span>
              <span className="hidden lg:inline text-[10px] font-mono text-purple-600/80 ml-0.5">
                [S.A.I.L❯Arc]
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-600'
            }`}
            title={soundEnabled ? 'Mute synthesized cues' : 'Unmute synthesized cues'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenCapture}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium shadow-2xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-stone-600" />
            <span>Capture Trail</span>
          </button>

          {allClear ? (
            <button
              type="button"
              onClick={onOpenAudit}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium shadow-sm transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Continuous Audit (0 Pending)</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isSweeping || pendingCount === 0}
              onClick={onRunBedtimeSweep}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-medium shadow-sm transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSweeping ? 'Sweeping All Day...' : `Execute All-Day Sweep (${pendingCount})`}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onResetSampleData}
            title="Reset to fresh online workday trails"
            className="p-2 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-500 hover:text-stone-800 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Daily Goal Setting Modal */}
      <DailyGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        dailyGoal={safeDailyGoal}
        completedCount={completedCount}
        totalCount={completedCount + pendingCount}
        onSaveGoal={(newGoal) => {
          if (onDailyGoalChange) {
            onDailyGoalChange(newGoal);
          }
        }}
      />

      {/* Predictive Scheduling Modal */}
      <PredictiveSchedulingModal
        isOpen={isPredictiveModalOpen}
        onClose={() => setIsPredictiveModalOpen(false)}
        tasks={tasks || []}
        currentBedtime={bedtime}
        onUpdateBedtime={onBedtimeChange}
        report={report}
      />
    </header>
  );
};
