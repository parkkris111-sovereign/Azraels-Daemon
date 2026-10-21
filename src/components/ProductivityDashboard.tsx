import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Moon,
  Sparkles,
  Layers,
  Calendar,
  Zap,
  BarChart2,
  ArrowUpRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { IncompleteTask, DailySummaryReport } from '../types';

export interface DayProductivityData {
  dayLabel: string; // e.g. "Thu", "Fri", "Today"
  fullDate: string; // e.g. "Oct 18, 2026"
  dateKey: string; // YYYY-MM-DD
  completed: number;
  lingering: number;
  total: number;
  completionRate: number; // 0 - 100%
  gapClosedPct: number; // e.g. 85%
  hoursSaved: number; // e.g. 2.4
  peaceIndex: number; // 0 - 100
  code: number;
  email: number;
  document: number;
  research: number;
  other: number;
  isToday: boolean;
}

interface ProductivityDashboardProps {
  tasks: IncompleteTask[];
  report?: DailySummaryReport | null;
  bedtime?: string;
}

export const ProductivityDashboard: React.FC<ProductivityDashboardProps> = ({
  tasks,
  report,
  bedtime = '23:00',
}) => {
  const [activeChartMode, setActiveChartMode] = useState<'combined' | 'velocity' | 'peace' | 'categories'>('combined');
  const [selectedDay, setSelectedDay] = useState<DayProductivityData | null>(null);

  // Derive 7-Day Trend data anchored to actual current tasks
  const weekData = useMemo<DayProductivityData[]>(() => {
    const today = new Date();
    const days: DayProductivityData[] = [];

    const todayCompletedCount = tasks.filter((t) => t.status === 'completed').length;
    const todayLingeringCount = tasks.filter((t) => t.status !== 'completed').length;
    const todayTotal = todayCompletedCount + todayLingeringCount;
    const todayCompletionRate = todayTotal > 0 ? Math.round((todayCompletedCount / todayTotal) * 100) : 0;

    // Count today's tasks by category
    const catCounts = {
      code: 0,
      email: 0,
      document: 0,
      research: 0,
      other: 0,
    };
    tasks.forEach((t) => {
      if (t.status === 'completed') {
        if (t.category === 'code' || t.category === 'notebook') catCounts.code++;
        else if (t.category === 'email' || t.category === 'communication') catCounts.email++;
        else if (t.category === 'document' || t.category === 'admin') catCounts.document++;
        else if (t.category === 'research' || t.category === 'finance') catCounts.research++;
        else catCounts.other++;
      }
    });

    const todayHoursSaved = report?.metrics.estimatedHoursSaved ?? Number((todayCompletedCount * 0.85 + 0.4).toFixed(1));
    const todayPeaceScore = report?.cognitivePeaceIndex.score ?? (todayLingeringCount === 0 ? 98 : Math.max(65, 95 - todayLingeringCount * 7));
    const todayGapClosed = report?.metrics.totalGapFilledPct ?? 78;

    // Past 6 days baseline model reflecting gradual daemon adoption and workload resolution
    const historicalOffsets = [
      { dayOffset: 6, comp: 3, ling: 4, hours: 1.8, peace: 72, gap: 60, code: 1, email: 1, doc: 1, res: 0, oth: 0 },
      { dayOffset: 5, comp: 4, ling: 3, hours: 2.1, peace: 76, gap: 68, code: 2, email: 1, doc: 0, res: 1, oth: 0 },
      { dayOffset: 4, comp: 5, ling: 3, hours: 2.6, peace: 80, gap: 71, code: 1, email: 2, doc: 1, res: 1, oth: 0 },
      { dayOffset: 3, comp: 6, ling: 2, hours: 3.2, peace: 84, gap: 79, code: 2, email: 2, doc: 1, res: 1, oth: 0 },
      { dayOffset: 2, comp: 5, ling: 2, hours: 2.9, peace: 86, gap: 82, code: 2, email: 1, doc: 1, res: 1, oth: 0 },
      { dayOffset: 1, comp: 7, ling: 1, hours: 3.8, peace: 92, gap: 88, code: 3, email: 2, doc: 1, res: 1, oth: 0 },
    ];

    historicalOffsets.forEach((h) => {
      const d = new Date(today);
      d.setDate(today.getDate() - h.dayOffset);

      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const dateKey = d.toISOString().split('T')[0];
      const total = h.comp + h.ling;
      const rate = Math.round((h.comp / total) * 100);

      days.push({
        dayLabel,
        fullDate,
        dateKey,
        completed: h.comp,
        lingering: h.ling,
        total,
        completionRate: rate,
        gapClosedPct: h.gap,
        hoursSaved: h.hours,
        peaceIndex: h.peace,
        code: h.code,
        email: h.email,
        document: h.doc,
        research: h.res,
        other: h.oth,
        isToday: false,
      });
    });

    // Add Today as the 7th entry
    const todayLabel = 'Today';
    const todayFullDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const todayKey = today.toISOString().split('T')[0];

    days.push({
      dayLabel: todayLabel,
      fullDate: todayFullDate,
      dateKey: todayKey,
      completed: todayCompletedCount,
      lingering: todayLingeringCount,
      total: todayTotal || 1,
      completionRate: todayCompletionRate,
      gapClosedPct: todayGapClosed,
      hoursSaved: todayHoursSaved,
      peaceIndex: todayPeaceScore,
      code: catCounts.code,
      email: catCounts.email,
      document: catCounts.document,
      research: catCounts.research,
      other: catCounts.other,
      isToday: true,
    });

    return days;
  }, [tasks, report]);

  // Aggregate 7-day stats
  const aggregates = useMemo(() => {
    const totalCompleted = weekData.reduce((acc, d) => acc + d.completed, 0);
    const totalLingering = weekData.reduce((acc, d) => acc + d.lingering, 0);
    const totalHoursSaved = weekData.reduce((acc, d) => acc + d.hoursSaved, 0);
    const avgCompletionRate = Math.round(weekData.reduce((acc, d) => acc + d.completionRate, 0) / weekData.length);
    const avgPeaceScore = Math.round(weekData.reduce((acc, d) => acc + d.peaceIndex, 0) / weekData.length);

    // Find peak completion day
    let peakDay = weekData[0];
    weekData.forEach((d) => {
      if (d.completed > peakDay.completed) {
        peakDay = d;
      }
    });

    const peaceTrendDelta = weekData[weekData.length - 1].peaceIndex - weekData[0].peaceIndex;

    return {
      totalCompleted,
      totalLingering,
      totalHoursSaved: totalHoursSaved.toFixed(1),
      avgCompletionRate,
      avgPeaceScore,
      peakDay,
      peaceTrendDelta,
    };
  }, [weekData]);

  // Custom styled Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataItem = payload[0]?.payload as DayProductivityData | undefined;
    if (!dataItem) return null;

    return (
      <div className="bg-stone-900/95 backdrop-blur-md text-white p-3 rounded-xl border border-stone-700 shadow-xl text-xs space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
          <span className="font-bold text-stone-100 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            {dataItem.fullDate} {dataItem.isToday ? '(Today)' : ''}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
            {dataItem.completionRate}% Done
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="bg-stone-800/60 p-2 rounded-lg">
            <div className="text-[10px] text-stone-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Resolved
            </div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">
              {dataItem.completed} <span className="text-[10px] text-stone-400 font-normal">trails</span>
            </div>
          </div>

          <div className="bg-stone-800/60 p-2 rounded-lg">
            <div className="text-[10px] text-stone-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Lingering
            </div>
            <div className="text-sm font-bold text-amber-300 mt-0.5">
              {dataItem.lingering} <span className="text-[10px] text-stone-400 font-normal">items</span>
            </div>
          </div>
        </div>

        <div className="space-y-1 pt-1 text-[11px] text-stone-300 border-t border-stone-800/70">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-stone-400">
              <Moon className="w-3 h-3 text-emerald-400" /> Cognitive Peace:
            </span>
            <span className="font-semibold text-emerald-400">{dataItem.peaceIndex}/100</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-stone-400">
              <Zap className="w-3 h-3 text-indigo-400" /> Hours Preserved:
            </span>
            <span className="font-semibold text-indigo-300">{dataItem.hoursSaved} hrs</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-stone-400">
              <TrendingUp className="w-3 h-3 text-teal-400" /> Gap Closed:
            </span>
            <span className="font-semibold text-stone-200">+{dataItem.gapClosedPct}%</span>
          </div>
        </div>

        {(dataItem.code > 0 || dataItem.email > 0 || dataItem.document > 0 || dataItem.research > 0) && (
          <div className="pt-1.5 border-t border-stone-800/70 text-[10px] flex items-center gap-2 text-stone-400">
            <span>Domains:</span>
            {dataItem.code > 0 && <span className="text-indigo-300">Code: {dataItem.code}</span>}
            {dataItem.email > 0 && <span className="text-emerald-300">Email: {dataItem.email}</span>}
            {dataItem.document > 0 && <span className="text-amber-300">Doc: {dataItem.document}</span>}
            {dataItem.research > 0 && <span className="text-cyan-300">Research: {dataItem.research}</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* 7-Day Performance Metric Banners */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
              7-Day Trails Resolved
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-bold text-stone-900">{aggregates.totalCompleted}</span>
            <span className="text-xs font-semibold text-emerald-600">tasks</span>
          </div>
          <span className="text-[10px] text-stone-400 mt-0.5 block">
            Avg velocity: {(aggregates.totalCompleted / 7).toFixed(1)}/day
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
              Avg Completion Rate
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-bold text-stone-900">{aggregates.avgCompletionRate}%</span>
            <span className="text-xs font-semibold text-indigo-600">resolved</span>
          </div>
          <span className="text-[10px] text-stone-400 mt-0.5 block">
            Peak: {aggregates.peakDay.dayLabel} ({aggregates.peakDay.completed} tasks)
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
              Hours Preserved
            </span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-bold text-amber-600">{aggregates.totalHoursSaved}</span>
            <span className="text-xs font-semibold text-stone-500">hours</span>
          </div>
          <span className="text-[10px] text-stone-400 mt-0.5 block">
            Evening cognitive savings
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
              Peace Index Trend
            </span>
            <Moon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-bold text-emerald-600">{weekData[weekData.length - 1].peaceIndex}</span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              +{aggregates.peaceTrendDelta > 0 ? aggregates.peaceTrendDelta : 0} pts
            </span>
          </div>
          <span className="text-[10px] text-stone-400 mt-0.5 block">
            Bedtime readiness target {bedtime}
          </span>
        </div>
      </div>

      {/* Main Interactive Chart Container */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
        {/* Chart Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> 7-Day Completion Velocity
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                Recharts Visual Telemetry
              </span>
            </div>
            <h3 className="text-base font-bold text-stone-900 mt-0.5">
              Task Resolution & Cognitive Peace Trajectory
            </h3>
          </div>

          {/* Chart View Selector Buttons */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs font-medium self-start sm:self-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveChartMode('combined')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeChartMode === 'combined'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Composed View
            </button>
            <button
              type="button"
              onClick={() => setActiveChartMode('velocity')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeChartMode === 'velocity'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Task Volume
            </button>
            <button
              type="button"
              onClick={() => setActiveChartMode('peace')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeChartMode === 'peace'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Peace & Hours
            </button>
            <button
              type="button"
              onClick={() => setActiveChartMode('categories')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeChartMode === 'categories'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Domain Mix
            </button>
          </div>
        </div>

        {/* Chart Render Area */}
        <div className="pt-4 h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartMode === 'combined' ? (
              <ComposedChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="lingeringGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#cbd5e1" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="dayLabel"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'dataMax + 2']}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#6366f1"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconSize={8}
                />
                <Bar
                  yAxisId="left"
                  dataKey="completed"
                  name="Resolved Trails"
                  fill="url(#completedGrad)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  yAxisId="left"
                  dataKey="lingering"
                  name="Lingering Open Loops"
                  fill="url(#lingeringGrad)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="completionRate"
                  name="Completion Rate %"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 1.5, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            ) : activeChartMode === 'velocity' ? (
              <BarChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barVelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconSize={8} />
                <Bar
                  dataKey="completed"
                  name="Resolved Tasks"
                  fill="url(#barVelGrad)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={40}
                />
                <ReferenceLine y={5} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Daily Target (5)', fill: '#10b981', fontSize: 10, position: 'right' }} />
              </BarChart>
            ) : activeChartMode === 'peace' ? (
              <AreaChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="peaceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="hoursAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis yAxisId="peaceY" stroke="#10b981" fontSize={11} tickLine={false} axisLine={false} domain={[50, 100]} unit="pts" />
                <YAxis yAxisId="hoursY" orientation="right" stroke="#6366f1" fontSize={11} tickLine={false} axisLine={false} unit="h" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconSize={8} />
                <Area
                  yAxisId="peaceY"
                  type="monotone"
                  dataKey="peaceIndex"
                  name="Bedtime Peace Score (0-100)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#peaceAreaGrad)"
                />
                <Area
                  yAxisId="hoursY"
                  type="monotone"
                  dataKey="hoursSaved"
                  name="Hours Preserved (hrs)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#hoursAreaGrad)"
                />
              </AreaChart>
            ) : (
              <BarChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconSize={8} />
                <Bar dataKey="code" name="Code / Notebooks" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} maxBarSize={36} />
                <Bar dataKey="email" name="Email / Comms" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} maxBarSize={36} />
                <Bar dataKey="document" name="Docs / Admin" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} maxBarSize={36} />
                <Bar dataKey="research" name="Research" stackId="a" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Micro-insight callout underneath chart */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>7-Day Cognitive Protection</strong>: Integrator Daemon resolved{' '}
              <strong className="text-stone-800">{aggregates.totalCompleted} open threads</strong>, preserving ~{aggregates.totalHoursSaved} hours of sleep readiness.
            </span>
          </div>
          <span className="text-[11px] text-stone-400 self-end sm:self-auto">
            Updated in real-time
          </span>
        </div>
      </div>

      {/* 7-Day Day-by-Day Micro Table / Inspection Ribbon */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              7-Day Daily Log Breakdown
            </h4>
          </div>
          <span className="text-[11px] text-stone-500">
            Hover or click any day to inspect
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 font-medium text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Resolved</th>
                <th className="py-2.5 px-3">Open Loops</th>
                <th className="py-2.5 px-3">Velocity Rate</th>
                <th className="py-2.5 px-3">Gap Closed</th>
                <th className="py-2.5 px-3">Hours Preserved</th>
                <th className="py-2.5 px-3 text-right">Peace Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {weekData.map((d) => (
                <tr
                  key={d.dateKey}
                  onClick={() => setSelectedDay(d)}
                  className={`cursor-pointer transition-colors ${
                    d.isToday
                      ? 'bg-indigo-50/50 hover:bg-indigo-50 font-medium'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{d.dayLabel}</span>
                    <span className="text-[10px] text-stone-400">({d.fullDate.split(',')[0]})</span>
                    {d.isToday && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-bold uppercase">
                        Current
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {d.completed}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 ${d.lingering > 0 ? 'text-amber-600 font-medium' : 'text-stone-400'}`}>
                      {d.lingering}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${d.completionRate}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-stone-800">{d.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-stone-600 font-medium">
                    +{d.gapClosedPct}%
                  </td>
                  <td className="py-2.5 px-3 text-indigo-600 font-semibold">
                    ~{d.hoursSaved} hrs
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.peaceIndex >= 85
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.peaceIndex >= 75
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {d.peaceIndex}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
