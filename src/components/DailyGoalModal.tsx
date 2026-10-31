import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Trophy,
  CheckCircle2,
  Sparkles,
  Plus,
  Minus,
  TrendingUp,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface DailyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyGoal: number;
  completedCount: number;
  totalCount: number;
  onSaveGoal: (newGoal: number) => void;
}

const PRESET_GOALS = [
  { value: 3, label: '3 Tasks', desc: 'Focus Sprint', icon: '🌱' },
  { value: 5, label: '5 Tasks', desc: 'Standard Day', icon: '🎯' },
  { value: 8, label: '8 Tasks', desc: 'Productivity Surge', icon: '⚡' },
  { value: 10, label: '10 Tasks', desc: 'Deep Clearance', icon: '🔥' },
  { value: 15, label: '15 Tasks', desc: 'Hyper Pace', icon: '🚀' },
];

export const DailyGoalModal: React.FC<DailyGoalModalProps> = ({
  isOpen,
  onClose,
  dailyGoal,
  completedCount,
  totalCount,
  onSaveGoal,
}) => {
  const [goalInput, setGoalInput] = useState<number>(dailyGoal);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setGoalInput(dailyGoal);
      setJustSaved(false);
    }
  }, [isOpen, dailyGoal]);

  if (!isOpen) return null;

  const validGoal = Math.max(1, Math.min(100, goalInput || 1));
  const percent = Math.min(100, Math.round((completedCount / validGoal) * 100));
  const isGoalAchieved = completedCount >= validGoal;
  const remaining = Math.max(0, validGoal - completedCount);

  // SVG ring calculations for modal preview (size 120x120)
  const radius = 48;
  const circumference = 2 * Math.PI * radius; // ~301.59
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const handleIncrement = () => {
    setGoalInput((prev) => Math.min(100, (prev || 1) + 1));
  };

  const handleDecrement = () => {
    setGoalInput((prev) => Math.max(1, (prev || 1) - 1));
  };

  const handleApplyPreset = (val: number) => {
    setGoalInput(val);
  };

  const handleSave = () => {
    onSaveGoal(validGoal);
    setJustSaved(true);
    if (isGoalAchieved) {
      sounds.playTaskFinished();
    }
    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  Daily Completion Goal
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider font-semibold">
                  24/7 Daemon
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Set target completed loop closures for today
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
        <div className="p-6 space-y-6">
          {/* Progress Ring & Status Overview */}
          <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
            {/* Circular Progress Ring */}
            <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
              <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  strokeWidth="10"
                  fill="transparent"
                  className="stroke-stone-200"
                />
                {/* Progress Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className={`transition-all duration-700 ease-out ${
                    isGoalAchieved ? 'stroke-emerald-500' : 'stroke-indigo-600'
                  }`}
                />
              </svg>

              {/* Center Content */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                {isGoalAchieved ? (
                  <>
                    <Trophy className="w-6 h-6 text-emerald-600 mb-0.5 animate-bounce" />
                    <span className="text-xs font-bold text-emerald-700 font-mono">100%</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl font-bold font-mono text-stone-900 leading-none">
                      {percent}%
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium mt-1">
                      {completedCount}/{validGoal}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Status Text Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {isGoalAchieved ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Goal Achieved!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    In Progress
                  </span>
                )}
              </div>

              <div className="text-sm font-semibold text-stone-900">
                {completedCount} of {validGoal} tasks closed
              </div>

              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {isGoalAchieved ? (
                  <span>
                    Outstanding! You've met today's target. The daemon continues patrolling the remaining queue.
                  </span>
                ) : (
                  <span>
                    <strong>{remaining}</strong> more loop closure{remaining === 1 ? '' : 's'} needed today to reach your target.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Target Number Stepper & Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2 uppercase tracking-wider">
              Set Daily Target (Tasks Completed)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={validGoal <= 1}
                className="w-11 h-11 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer"
                title="Decrease goal"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={goalInput}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    setGoalInput(isNaN(parsed) ? 1 : Math.max(1, Math.min(100, parsed)));
                  }}
                  className="w-full h-11 text-center font-mono text-lg font-bold bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-900"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-400 pointer-events-none">
                  tasks
                </span>
              </div>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={validGoal >= 100}
                className="w-11 h-11 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer"
                title="Increase goal"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block text-[11px] font-semibold text-stone-500 mb-2 uppercase tracking-wider">
              Quick Presets
            </span>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_GOALS.map((preset) => {
                const isSelected = validGoal === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleApplyPreset(preset.value)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="text-sm mb-0.5">{preset.icon}</span>
                    <span className="text-xs font-bold font-mono">{preset.value}</span>
                    <span className="text-[9px] text-stone-500 leading-tight truncate w-full">
                      {preset.desc.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Persists automatically across sessions</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              {justSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Target Saved!</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Set Goal ({validGoal} Tasks)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
