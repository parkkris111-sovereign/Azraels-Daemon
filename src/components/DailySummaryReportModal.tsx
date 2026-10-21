import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  Moon,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  ChevronRight,
  Layers,
  Zap,
  FileText,
  Award,
  AlertCircle,
  Activity
} from 'lucide-react';
import { IncompleteTask, DailySummaryReport } from '../types';
import { sounds } from '../utils/audio';
import { ProductivityDashboard } from './ProductivityDashboard';

interface DailySummaryReportModalProps {
  tasks: IncompleteTask[];
  bedtime: string;
  isOpen: boolean;
  onClose: () => void;
  onInspectTask?: (task: IncompleteTask) => void;
}

export const DailySummaryReportModal: React.FC<DailySummaryReportModalProps> = ({
  tasks,
  bedtime,
  isOpen,
  onClose,
  onInspectTask,
}) => {
  const [report, setReport] = useState<DailySummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'tomorrow' | 'trails'>('overview');

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');

  const fetchDailySummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/daemon/daily-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedTasks,
          pendingTasks,
          bedtime,
          date: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setReport(data);
      sounds.playAllClearSleepReady();
    } catch (err) {
      console.error('Error fetching daily summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDailySummary();
    }
  }, [isOpen, completedTasks.length]);

  if (!isOpen) return null;

  const handleCopyReport = () => {
    if (!report) return;

    const md = `# [Integrator Daemon] Daily Productivity & Trend Summary
**Date**: ${report.date} | **Generated**: ${report.generatedAt}
**Bedtime Target**: ${bedtime} | **Productivity Score**: ${report.overallScore}/100 (${report.scoreLabel})
**Cognitive Peace Index**: ${report.cognitivePeaceIndex.score}/100

## Executive Headline
> ${report.headline}

## Executive Summary
${report.executiveSummary}

## Key Metrics
- **Completed Workday Trails**: ${report.metrics.totalTasksResolved}
- **Pending Tasks**: ${report.metrics.pendingTasksRemaining}
- **Average Starting Progress**: ${report.metrics.avgInitialProgress}%
- **Total Delta Closed**: +${report.metrics.totalGapFilledPct}%
- **Estimated Hours Preserved**: ${report.metrics.estimatedHoursSaved} hrs
- **Peak Activity Domain**: ${report.metrics.peakActivityDomain}
- **Downstream Automated Actions**: ${report.metrics.servicesAutomatedCount}

## Productivity Trends
${report.productivityTrends
  .map(
    (t) => `### ${t.title} [${t.impactLabel}]
- Category: ${t.category}
- Insight: ${t.observation}`
  )
  .join('\n\n')}

## Category Breakdown
${report.categoryBreakdown
  .map(
    (c) => `- **${c.categoryLabel}** (${c.taskCount} tasks, avg start ${c.avgStartingProgress}%): Saved ~${c.timeSavedMinutes}m. ${c.highlightAccomplishment}`
  )
  .join('\n')}

## Recommendations for Tomorrow Morning
${report.tomorrowFocusRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-stone-900">
        {/* Header Ribbon */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white relative border-b border-stone-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Gemini Productivity Intelligence
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                    Live Daemon Audit
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
                  Daily Productivity & Trend Report
                </h2>
              </div>
            </div>

            {/* Actions: Refresh & Copy */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={fetchDailySummary}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
                title="Re-run Gemini Productivity Analysis"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Analyzing...' : 'Re-Analyze'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyReport}
                disabled={!report || isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium shadow-2xs transition-colors"
                title="Copy Markdown Report to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Report'}</span>
              </button>
            </div>
          </div>

          {/* Sub-nav tabs */}
          <div className="flex items-center gap-1 mt-5 pt-3 border-t border-stone-800/80 text-xs font-medium overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-stone-800 text-white font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              Executive Overview
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'trends'
                  ? 'bg-stone-800 text-white font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>7-Day Productivity Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('tomorrow')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'tomorrow'
                  ? 'bg-stone-800 text-white font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              Tomorrow's Launchpad
            </button>
            <button
              onClick={() => setActiveTab('trails')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'trails'
                  ? 'bg-stone-800 text-white font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              Closed Trails ({completedTasks.length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-stone-50/60">
          {isLoading && !report ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="relative mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="absolute -inset-1 rounded-2xl border border-indigo-400/30 animate-spin" />
              </div>
              <h3 className="text-sm font-semibold text-stone-900">
                Synthesizing Today's Productivity Insights...
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                Gemini is auditing resolved tasks, quantifying cognitive debt reduction, and mapping focus trends before bedtime.
              </p>
            </div>
          ) : !report ? (
            <div className="py-12 text-center">
              <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-700">No report generated yet</p>
              <button
                onClick={fetchDailySummary}
                className="mt-3 px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-medium"
              >
                Generate Daily Summary
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* TAB 1: EXECUTIVE OVERVIEW */}
              {activeTab === 'overview' && (
                <>
                  {/* Headline & Badges Banner */}
                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" /> Performance Verdict
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {report.scoreLabel}
                        </span>
                        <span className="text-xs text-stone-500">
                          {report.date}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                      "{report.headline}"
                    </h3>
                    <p className="text-sm text-stone-600 mt-2.5 leading-relaxed">
                      {report.executiveSummary}
                    </p>
                  </div>

                  {/* Dual Score Strip: Productivity Score & Cognitive Peace Index */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Productivity Score */}
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-4">
                      <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-xl shrink-0">
                        {report.overallScore}
                        <span className="text-[10px] text-indigo-400 absolute bottom-1 font-semibold">/100</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-stone-800 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Daily Productivity Score
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Calculated from completed scope ({report.metrics.totalTasksResolved} tasks) vs lingering open loops.
                        </p>
                      </div>
                    </div>

                    {/* Cognitive Peace Index */}
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-4">
                      <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold text-xl shrink-0">
                        {report.cognitivePeaceIndex.score}
                        <span className="text-[10px] text-emerald-400 absolute bottom-1 font-semibold">/100</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-stone-800 flex items-center gap-1">
                          <Moon className="w-3.5 h-3.5 text-emerald-600" /> Bedtime Peace of Mind
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                          {report.cognitivePeaceIndex.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4 Key Numerical Metrics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                      <span className="text-[11px] text-stone-500 font-medium block">Trails Resolved</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold text-stone-900">{report.metrics.totalTasksResolved}</span>
                        <span className="text-[11px] text-emerald-600 font-medium">100% done</span>
                      </div>
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        {report.metrics.pendingTasksRemaining} remaining
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                      <span className="text-[11px] text-stone-500 font-medium block">Avg Starting State</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold text-stone-900">{report.metrics.avgInitialProgress}%</span>
                        <span className="text-[11px] text-indigo-600 font-medium">→ 100%</span>
                      </div>
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        +{report.metrics.totalGapFilledPct}% gap resolved
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                      <span className="text-[11px] text-stone-500 font-medium block">Hours Preserved</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold text-emerald-600">{report.metrics.estimatedHoursSaved}</span>
                        <span className="text-xs text-stone-500 font-medium">hrs</span>
                      </div>
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        evening focus saved
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                      <span className="text-[11px] text-stone-500 font-medium block">Services Synced</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold text-indigo-600">{report.metrics.servicesAutomatedCount}</span>
                        <span className="text-[11px] text-stone-500 font-medium">actions</span>
                      </div>
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        Trello, Drive, Gmail
                      </span>
                    </div>
                  </div>

                  {/* Domain Breakdown Snapshot */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center justify-between">
                      <span>Domain Closure Distribution</span>
                      <span className="text-[11px] font-normal text-stone-500">
                        Peak: {report.metrics.peakActivityDomain}
                      </span>
                    </h4>

                    <div className="space-y-3">
                      {report.categoryBreakdown.map((item) => (
                        <div key={item.category} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-stone-800">
                              {item.categoryLabel} ({item.taskCount})
                            </span>
                            <span className="text-stone-500">
                              ~{item.timeSavedMinutes} mins saved • initial {item.avgStartingProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden flex">
                            <div
                              className="bg-stone-300 h-full transition-all"
                              style={{ width: `${item.avgStartingProgress}%` }}
                              title={`User started at ${item.avgStartingProgress}%`}
                            />
                            <div
                              className="bg-emerald-500 h-full transition-all animate-pulse"
                              style={{ width: `${100 - item.avgStartingProgress}%` }}
                              title={`Daemon resolved remaining ${100 - item.avgStartingProgress}%`}
                            />
                          </div>
                          <p className="text-[11px] text-stone-500 italic">
                            {item.highlightAccomplishment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 7-Day Visual Velocity Banner Link */}
                  <div className="bg-linear-to-r from-stone-900 via-indigo-950 to-stone-900 p-4 rounded-xl border border-stone-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                          7-Day Productivity & Velocity Dashboard
                        </h4>
                        <p className="text-xs text-stone-300 mt-0.5">
                          Interactive Recharts telemetry: completion rate, peace trajectory & domain breakdown.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('trends')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0 shadow-2xs"
                    >
                      <span>Explore 7-Day Charts</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}

              {/* TAB 2: 7-DAY VISUAL PRODUCTIVITY DASHBOARD & TRENDS */}
              {activeTab === 'trends' && (
                <div className="space-y-6">
                  {/* Visual Productivity Dashboard with Recharts */}
                  <ProductivityDashboard tasks={tasks} report={report} bedtime={bedtime} />

                  {/* Gemini Analytical Productivity Observations */}
                  <div className="space-y-3 pt-2">
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-indigo-600" />
                          Analytical Productivity Observations
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                          Gemini Intelligence
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Gemini evaluated your multi-tasking patterns, cognitive switching frequency, and trail closures across today's online workday.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {report.productivityTrends.map((trend, idx) => {
                        const isHighPos = trend.impactType === 'high_positive';
                        const isOpt = trend.impactType === 'optimization_area';

                        return (
                          <div
                            key={idx}
                            className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2 hover:border-indigo-200 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                  {trend.category}
                                </span>
                              </div>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  isHighPos
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : isOpt
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-stone-100 text-stone-700 border border-stone-200'
                                }`}
                              >
                                {trend.impactLabel}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-stone-900">
                              {trend.title}
                            </h4>

                            <p className="text-xs text-stone-600 leading-relaxed">
                              {trend.observation}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TOMORROW'S LAUNCHPAD */}
              {activeTab === 'tomorrow' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
                      <Zap className="w-4 h-4" /> Next Morning Trajectory
                    </div>
                    <h3 className="text-base font-bold text-stone-900">
                      Tomorrow's Recommended High-Impact Launchpad
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Because your Integrator Daemon closed out today's pending items, you can wake up tomorrow morning with zero debt and directly target these priority areas.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {report.tomorrowFocusRecommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex items-start gap-3.5"
                      >
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs shrink-0 mt-0.5 border border-indigo-100">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                            {rec}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200/80 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                    <p className="text-xs text-emerald-800 font-medium">
                      All deliverables are synced and accessible via Google Drive and Trello boards. You are fully cleared to disconnect for sleep.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: COMPLETED TRAILS AUDIT */}
              {activeTab === 'trails' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Resolved Workday Trails ({completedTasks.length})
                    </h4>
                    <span className="text-xs text-stone-500">
                      Target: {bedtime} Close-out
                    </span>
                  </div>

                  {completedTasks.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl border border-stone-200 text-center">
                      <Clock className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <p className="text-xs text-stone-600 font-medium">
                        No workday trails marked completed yet today.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {completedTasks.map((t) => (
                        <div
                          key={t.id}
                          className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs hover:border-stone-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-stone-900">{t.title}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-medium uppercase">
                                  {t.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                                {t.completionSummary || 'Daemon resolved open threads and finalized deliverable.'}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-400">
                                <span>Initial: {t.currentProgress}%</span>
                                <span>•</span>
                                <span className="text-emerald-600 font-medium">100% Finalized</span>
                                {t.sourceTrail && (
                                  <>
                                    <span>•</span>
                                    <span>{t.sourceTrail}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {onInspectTask && (
                            <button
                              type="button"
                              onClick={() => {
                                onInspectTask(t);
                                onClose();
                              }}
                              className="self-end sm:self-center px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <span>View Diff</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-indigo-600" />
            <span>Integrator Daemon • Bedtime target: <strong className="text-stone-800">{bedtime}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium transition-colors shadow-2xs"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
