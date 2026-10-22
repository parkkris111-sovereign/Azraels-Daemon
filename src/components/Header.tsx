import React, { useState, useEffect } from 'react';
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
  Zap
} from 'lucide-react';
import { formatCountdownToBedtime } from '../utils/time';
import { sounds } from '../utils/audio';

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
  isDriveConnected?: boolean;
  isSweeping: boolean;
  pendingCount: number;
  completedCount: number;
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
  isDriveConnected = false,
  isSweeping,
  pendingCount,
  completedCount,
  soundEnabled,
  onToggleSound,
  onOpenAudit,
  connectedServicesCount = 7,
}) => {
  const [countdown, setCountdown] = useState(formatCountdownToBedtime(bedtime));
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdownToBedtime(bedtime));
    }, 15000);
    setCountdown(formatCountdownToBedtime(bedtime));
    return () => clearInterval(timer);
  }, [bedtime]);

  const allClear = pendingCount === 0 && completedCount > 0;

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

        {/* Center: 24/7 All-Day Operation Indicator (No Sleep) */}
        <div className="flex items-center gap-2.5 bg-stone-900 text-stone-100 border border-stone-800 px-3.5 py-1.5 rounded-lg text-xs self-start md:self-auto shadow-2xs">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-wide">
              24/7 All-Day Mode
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              No Sleep • Always On
            </span>
          </div>
          <span className="text-stone-700">|</span>
          <span className="font-mono text-stone-300 text-[11px] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            Continuous Patrol Active
          </span>
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

          {onOpenDailySummary && (
            <button
              type="button"
              onClick={onOpenDailySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-900 text-xs font-medium transition-colors"
              title="Analyze completed workday trails and view Gemini productivity trends"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
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
    </header>
  );
};
