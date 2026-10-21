import React, { useState, useEffect } from 'react';
import {
  Moon,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ArrowRight,
  Flame,
  Activity,
  Bed,
  Layers,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { 
  IncompleteTask, 
  PredictiveBedtimeRecommendation, 
  PredictivePacingMode, 
  WorkloadIntensityTier 
} from '../types';
import { 
  calculatePredictiveBedtime, 
  fetchAIPredictiveBedtime 
} from '../utils/predictiveScheduling';
import { sounds } from '../utils/audio';

interface PredictiveBedtimePanelProps {
  tasks: IncompleteTask[];
  currentBedtime: string;
  onUpdateBedtime: (newBedtime: string) => void;
  className?: string;
}

export const PredictiveBedtimePanel: React.FC<PredictiveBedtimePanelProps> = ({
  tasks,
  currentBedtime,
  onUpdateBedtime,
  className = '',
}) => {
  const [pacingMode, setPacingMode] = useState<PredictivePacingMode>('balanced');
  const [isCalculating, setIsCalculating] = useState(false);
  const [justApplied, setJustApplied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Initialize with deterministic model, then re-calculate
  const [recommendation, setRecommendation] = useState<PredictiveBedtimeRecommendation>(() =>
    calculatePredictiveBedtime({ tasks, currentBedtime, pacingMode: 'balanced' })
  );

  // Re-calculate when tasks, bedtime, or pacing mode changes
  useEffect(() => {
    const rec = calculatePredictiveBedtime({ tasks, currentBedtime, pacingMode });
    setRecommendation(rec);
    setJustApplied(false);
  }, [tasks, currentBedtime, pacingMode]);

  // Request fresh AI calculation from server
  const handleRecalculateAI = async () => {
    setIsCalculating(true);
    try {
      const rec = await fetchAIPredictiveBedtime({
        tasks,
        currentBedtime,
        pacingMode,
      });
      setRecommendation(rec);
    } catch (e) {
      console.warn('AI calculation error:', e);
    } finally {
      setIsCalculating(false);
    }
  };

  // Apply suggested bedtime into global daemon state
  const handleApplyBedtime = () => {
    if (recommendation.suggestedBedtime === currentBedtime) return;
    onUpdateBedtime(recommendation.suggestedBedtime);
    sounds.playTaskFinished();
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 4000);
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const isMatch = recommendation.suggestedBedtime === currentBedtime;

  // Tier color styling
  const getTierBadgeStyle = (tier: WorkloadIntensityTier) => {
    switch (tier) {
      case 'restorative':
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80';
      case 'moderate':
        return 'bg-cyan-950/40 text-cyan-300 border-cyan-800/80';
      case 'intensive':
        return 'bg-amber-950/40 text-amber-300 border-amber-800/80';
      case 'critical':
        return 'bg-rose-950/40 text-rose-300 border-rose-800/80';
    }
  };

  const getTierGaugeColor = (tier: WorkloadIntensityTier) => {
    switch (tier) {
      case 'restorative':
        return 'from-emerald-500 to-teal-400';
      case 'moderate':
        return 'from-cyan-500 to-blue-500';
      case 'intensive':
        return 'from-amber-500 to-orange-500';
      case 'critical':
        return 'from-rose-500 to-red-600';
    }
  };

  return (
    <div className={`rounded-xl border border-stone-800 bg-stone-900/90 text-stone-100 shadow-xl overflow-hidden backdrop-blur-sm ${className}`}>
      {/* Top Banner & Mode Header */}
      <div className="p-4 sm:p-5 border-b border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-stone-900 via-indigo-950/30 to-stone-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Moon className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Predictive Bedtime Engine
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getTierBadgeStyle(recommendation.intensityTier)}`}>
                {recommendation.intensityTierLabel}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                {recommendation.modeUsed === 'ai' ? '✨ Gemini 3.8 Flash' : '⚡ Circadian Model v3'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Historical task velocity & workload-intensity sleep calibration
            </p>
          </div>
        </div>

        {/* Right Controls: Pacing Mode & AI Refresh */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {/* Pacing Mode Selector */}
          <div className="flex items-center bg-stone-950/90 p-1 rounded-lg border border-stone-800 text-xs">
            <button
              onClick={() => setPacingMode('turbo')}
              title="Fastest AZRAEL closure cadence"
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                pacingMode === 'turbo'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🚀 Turbo
            </button>
            <button
              onClick={() => setPacingMode('balanced')}
              title="Standard daemon closure rhythm"
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                pacingMode === 'balanced'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              ⚖️ Balanced
            </button>
            <button
              onClick={() => setPacingMode('supervised')}
              title="Includes human verification buffer"
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                pacingMode === 'supervised'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🛡️ Supervised
            </button>
          </div>

          <button
            onClick={handleRecalculateAI}
            disabled={isCalculating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Recalculate with AI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Recalculate</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5">
          {/* Main Bedtime Comparison & 1-Click Sync Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Target Bedtime */}
            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                Current Scheduled Bedtime
              </span>
              <div className="my-2">
                <span className="text-2xl font-bold font-mono text-stone-200">
                  {currentBedtime}
                </span>
                <span className="text-xs text-stone-500 ml-2">Target</span>
              </div>
              <p className="text-[11px] text-stone-500">
                User-configured target in daemon status bar
              </p>
            </div>

            {/* AI Suggested Bedtime Hero Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-stone-950 border border-indigo-800/80 shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Predictive Optimal Bedtime
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  recommendation.differenceMinutes > 0
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    : recommendation.differenceMinutes < 0
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                }`}>
                  {recommendation.differenceMinutes > 0
                    ? `+${recommendation.differenceMinutes}m Shift`
                    : recommendation.differenceMinutes < 0
                      ? `${recommendation.differenceMinutes}m Early Rest`
                      : 'Perfect Sync'}
                </span>
              </div>

              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {recommendation.suggestedBedtime}
                </span>
                <span className="text-xs text-indigo-300 font-medium">
                  ({recommendation.confidenceScore}% Confidence)
                </span>
              </div>

              <p className="text-[11px] text-stone-400">
                Calibrated for {recommendation.estimatedResolutionTimeMinutes}m loop closure + {recommendation.windDownMinutes}m wind-down
              </p>
            </div>

            {/* Wind-Down Start & 1-Click Action */}
            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                Arc of Change Wind-Down
              </span>
              <div className="my-2">
                <span className="text-2xl font-bold font-mono text-indigo-300">
                  {recommendation.windDownStartTime}
                </span>
                <span className="text-xs text-stone-500 ml-2">Initiation</span>
              </div>

              <button
                onClick={handleApplyBedtime}
                disabled={isMatch && !justApplied}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                  justApplied
                    ? 'bg-emerald-600 text-white'
                    : isMatch
                      ? 'bg-stone-800/80 text-stone-400 border border-stone-700 cursor-default'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/25'
                }`}
              >
                {justApplied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Applied to Bedtime Target!</span>
                  </>
                ) : isMatch ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Current Bedtime Matches Recommendation</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Apply Suggested ({recommendation.suggestedBedtime})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Workload Intensity Meter & Breakdown */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-stone-200 uppercase tracking-wide">
                  Workload Intensity & Cognitive Fatigue Meter
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white">
                  {recommendation.workloadIntensityScore}/100
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getTierBadgeStyle(recommendation.intensityTier)}`}>
                  {recommendation.intensityTierLabel}
                </span>
              </div>
            </div>

            {/* Gradient Intensity Bar */}
            <div className="relative w-full h-3 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getTierGaugeColor(recommendation.intensityTier)} transition-all duration-500`}
                style={{ width: `${Math.max(5, recommendation.workloadIntensityScore)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="text-emerald-400">0% Restorative Light</span>
              <span className="text-cyan-400">25% Balanced</span>
              <span className="text-amber-400">55% Intensive</span>
              <span className="text-rose-400">80%+ Surge Critical</span>
            </div>

            {/* Key Telemetry Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-800/60 text-xs">
              <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                <span className="text-[10px] text-stone-500 block">Pending Loop Gap</span>
                <span className="text-sm font-bold font-mono text-stone-200">
                  {recommendation.residualGapPoints}% Unfinished
                </span>
                <span className="text-[10px] text-stone-500 block">
                  Across {pendingTasks.length} {pendingTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                <span className="text-[10px] text-stone-500 block">AZRAEL Closure Time</span>
                <span className="text-sm font-bold font-mono text-purple-400">
                  ~{recommendation.estimatedResolutionTimeMinutes} Minutes
                </span>
                <span className="text-[10px] text-stone-500 block">
                  {pacingMode.toUpperCase()} execution
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                <span className="text-[10px] text-stone-500 block">7-Day Closure Velocity</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {recommendation.historicalVelocity.sevenDayCompletionRatePct}% Consistent
                </span>
                <span className="text-[10px] text-stone-500 block">
                  ~{recommendation.historicalVelocity.avgMinutesPerTaskClosure}m / closed loop
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                <span className="text-[10px] text-stone-500 block">Post-Gauntlet Peace</span>
                <span className="text-sm font-bold font-mono text-indigo-400">
                  {recommendation.projectedPeaceScore}% Peace Index
                </span>
                <span className="text-[10px] text-stone-500 block">
                  Zero residual loose ends
                </span>
              </div>
            </div>
          </div>

          {/* Sequential Timeline: Daytime Loop Closure ➔ Arc of Change ➔ Rest */}
          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800">
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wide flex items-center gap-1.5 mb-3">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Circadian Flow & Arc of Change Milestones
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-stone-900 border border-stone-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-amber-400 font-semibold">STAGE 1</span>
                  <span className="text-[10px] text-stone-500">NOW</span>
                </div>
                <span className="font-semibold text-stone-200">S.A.I.L & ABIDE</span>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Sensor audit: {pendingTasks.length} open workday trails mapped.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-stone-900 border border-stone-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-purple-400 font-semibold">STAGE 2</span>
                  <span className="text-[10px] text-stone-500">+{recommendation.estimatedResolutionTimeMinutes}m</span>
                </div>
                <span className="font-semibold text-stone-200">AZRAEL & A.A.A.</span>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Terminates remaining {recommendation.residualGapPoints}% delta. Triple-A attested.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-900/60 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-indigo-400 font-semibold">STAGE 3</span>
                  <span className="text-[10px] font-mono text-indigo-300 font-bold">{recommendation.windDownStartTime}</span>
                </div>
                <span className="font-semibold text-white">Arc of Change</span>
                <p className="text-[10px] text-indigo-200 mt-0.5">
                  Screens dimmed, blue-light cut. Melatonin synthesis begins.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">TARGET</span>
                  <span className="text-[10px] font-mono text-emerald-300 font-bold">{recommendation.suggestedBedtime}</span>
                </div>
                <span className="font-semibold text-white">Sleep Equilibrium</span>
                <p className="text-[10px] text-emerald-200 mt-0.5">
                  Pillow touch with zero debt & 100% peace score.
                </p>
              </div>
            </div>
          </div>

          {/* Scientific Rationale & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-950/50 border border-stone-800 text-xs">
              <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Workload & Historical Rationale
              </span>
              <ul className="space-y-1.5 text-stone-400 text-[11px]">
                {recommendation.rationalePoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/50 border border-stone-800 text-xs">
              <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                Arc of Change Protocol
              </span>
              <ul className="space-y-1.5 text-stone-400 text-[11px]">
                {recommendation.arcOfChangeRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-400 shrink-0 mt-0.5">❯</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
