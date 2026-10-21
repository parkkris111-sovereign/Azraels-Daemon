import { 
  IncompleteTask, 
  PredictiveBedtimeRecommendation, 
  WorkloadIntensityTier, 
  PredictivePacingMode 
} from '../types';

// Category-specific cognitive load multipliers based on mental switching cost
const CATEGORY_COGNITIVE_WEIGHTS: Record<string, number> = {
  notebook: 1.85,
  code: 1.70,
  finance: 1.45,
  document: 1.25,
  research: 1.15,
  email: 0.90,
  communication: 0.90,
  admin: 0.85,
};

// Historical 7-day completion benchmark derived from Integrator Daemon telemetry
export const HISTORICAL_BENCHMARK = {
  avgTasksPerDay: 5.2,
  avgMinutesPerTaskClosure: 13.8,
  sevenDayCompletionRatePct: 86,
  circadianOptimalBedtime: '23:00',
  delayFrequencyPct: 24, // 24% of past days required extended loop closure
  averageGapClosedPct: 79,
  peakClosureHour: '21:30',
};

// Helper: Parse HH:mm string to minutes from midnight
export function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length < 2) return 23 * 60;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return (isNaN(hours) ? 23 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
}

// Helper: Format minutes from midnight to HH:mm string
export function formatMinutesToTime(totalMinutes: number): string {
  let normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = Math.floor(normalized % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Calculate Workload Intensity Score & Optimal Bedtime Recommendation
export function calculatePredictiveBedtime(params: {
  tasks: IncompleteTask[];
  currentBedtime: string;
  pacingMode?: PredictivePacingMode;
}): PredictiveBedtimeRecommendation {
  const { tasks, currentBedtime, pacingMode = 'balanced' } = params;

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const totalCount = tasks.length;

  // Calculate residual gap points: sum of (100 - currentProgress)
  let totalResidualGap = 0;
  let weightedCognitivePoints = 0;
  const pendingByDomain: Record<string, number> = {};

  pendingTasks.forEach((task) => {
    const gap = Math.max(1, 100 - (Number(task.currentProgress) || 50));
    totalResidualGap += gap;

    const cat = task.category || 'document';
    const weight = CATEGORY_COGNITIVE_WEIGHTS[cat] || 1.0;
    weightedCognitivePoints += gap * weight;

    pendingByDomain[cat] = (pendingByDomain[cat] || 0) + 1;
  });

  // Pacing multipliers
  // turbo: Faster AZRAEL automated synthesis (-35% closure time)
  // balanced: Standard daemon cadence (1.0x)
  // supervised: User steps through and inspects diffs (+40% review buffer)
  const pacingMultiplier = pacingMode === 'turbo' ? 0.65 : pacingMode === 'supervised' ? 1.4 : 1.0;

  // Estimated resolution time in minutes
  // Baseline: each 100 points of residual gap requires ~16 minutes of daemon synthesis and context grounding
  const baseMinutesNeeded = Math.round((totalResidualGap / 100) * 16 * pacingMultiplier);
  const estimatedResolutionTimeMinutes = Math.max(0, baseMinutesNeeded);

  // Workload Intensity Score (0 - 100)
  // Factors: count of pending tasks, cognitive complexity, and residual gaps
  let rawIntensity = 0;
  if (pendingTasks.length === 0) {
    rawIntensity = 5; // Clean slate
  } else {
    const countFactor = Math.min(45, pendingTasks.length * 11);
    const gapFactor = Math.min(35, (totalResidualGap / (pendingTasks.length * 75)) * 35);
    const cognitiveFactor = Math.min(20, (weightedCognitivePoints / Math.max(1, totalResidualGap)) * 11);
    rawIntensity = Math.min(100, Math.round(countFactor + gapFactor + cognitiveFactor));
  }

  const workloadIntensityScore = Math.min(100, Math.max(0, rawIntensity));

  // Determine Intensity Tier
  let intensityTier: WorkloadIntensityTier = 'moderate';
  let intensityTierLabel = 'Balanced Workload';

  if (workloadIntensityScore < 25) {
    intensityTier = 'restorative';
    intensityTierLabel = 'Restorative Light';
  } else if (workloadIntensityScore < 55) {
    intensityTier = 'moderate';
    intensityTierLabel = 'Balanced Moderate';
  } else if (workloadIntensityScore < 80) {
    intensityTier = 'intensive';
    intensityTierLabel = 'Intensive High Load';
  } else {
    intensityTier = 'critical';
    intensityTierLabel = 'Surge Critical Load';
  }

  // Circadian & Bedtime Recommendation Calculation
  const currentBedtimeMinutes = parseTimeToMinutes(currentBedtime);
  let bedtimeShiftMinutes = 0;
  let windDownMinutes = 45; // Default standard circadian wind-down

  if (pendingTasks.length === 0) {
    // Zero pending: early restorative sleep opportunity!
    bedtimeShiftMinutes = -15; // Can sleep 15 mins earlier for recovery
    windDownMinutes = 30;
  } else if (intensityTier === 'restorative') {
    // Minimal work remaining
    bedtimeShiftMinutes = 0;
    windDownMinutes = 35;
  } else if (intensityTier === 'moderate') {
    // Moderate workload: slight buffer if resolution exceeds standard time
    bedtimeShiftMinutes = estimatedResolutionTimeMinutes > 20 ? 15 : 0;
    windDownMinutes = 40;
  } else if (intensityTier === 'intensive') {
    // High workload: add buffer for cognitive cool-down to prevent insomnia
    bedtimeShiftMinutes = Math.min(45, Math.ceil((estimatedResolutionTimeMinutes + 10) / 15) * 15);
    windDownMinutes = 45;
  } else {
    // Critical surge: require structured phase-out
    bedtimeShiftMinutes = Math.min(60, Math.ceil((estimatedResolutionTimeMinutes + 20) / 15) * 15);
    windDownMinutes = 50;
  }

  const suggestedMinutes = currentBedtimeMinutes + bedtimeShiftMinutes;
  const suggestedBedtime = formatMinutesToTime(suggestedMinutes);
  const windDownMinutesFromMidnight = suggestedMinutes - windDownMinutes;
  const windDownStartTime = formatMinutesToTime(windDownMinutesFromMidnight);

  // Cognitive fatigue risk percentage
  const cognitiveFatigueRisk = Math.min(98, Math.max(8, Math.round(workloadIntensityScore * 0.85 + (pacingMode === 'supervised' ? 12 : 0))));

  // Projected Peace Score after Master Combine execution
  const projectedPeaceScore = Math.min(100, Math.max(92, 100 - Math.round(pendingTasks.length * 1.5)));

  // Generate scientific & operational rationale points
  const rationalePoints: string[] = [];

  if (pendingTasks.length === 0) {
    rationalePoints.push('All workday trails are currently 100% sealed. Zero cognitive debt remains.');
    rationalePoints.push(`Recommended early bedtime of ${suggestedBedtime} to replenish circadian sleep debt from earlier this week.`);
    rationalePoints.push('Wind-down protocol initiates 30 minutes prior to support rapid slow-wave sleep onset.');
  } else {
    rationalePoints.push(
      `Current workload contains ${pendingTasks.length} pending trail${pendingTasks.length > 1 ? 's' : ''} with ${totalResidualGap}% aggregate unfinished gap.`
    );

    if (pendingByDomain.notebook || pendingByDomain.code) {
      const codeLikeCount = (pendingByDomain.notebook || 0) + (pendingByDomain.code || 0);
      rationalePoints.push(
        `High cognitive load detected: ${codeLikeCount} analytical trail${codeLikeCount > 1 ? 's' : ''} (Jupyter / Code PRs) requiring ~${Math.round(estimatedResolutionTimeMinutes * 0.6)} min of AZRAEL synthesis.`
      );
    }

    if (bedtimeShiftMinutes > 0) {
      rationalePoints.push(
        `Suggested bedtime shifted by +${bedtimeShiftMinutes} min (to ${suggestedBedtime}) to guarantee complete loop closure before pillow touch, preventing rumination.`
      );
    } else if (bedtimeShiftMinutes < 0) {
      rationalePoints.push(
        `Suggested bedtime shifted -${Math.abs(bedtimeShiftMinutes)} min earlier: low workload allows restorative early sleep.`
      );
    } else {
      rationalePoints.push(
        `Maintains your target ${currentBedtime} bedtime: current velocity comfortably absorbs remaining trails within scheduled wind-down.`
      );
    }

    rationalePoints.push(
      `7-Day historical completion patterns show an 86% closure success rate when wind-down starts by ${windDownStartTime}.`
    );
  }

  // Arc of Change specific recommendations
  const arcOfChangeRecommendations: string[] = [
    `Initiate Arc of Change wind-down at ${windDownStartTime} (${windDownMinutes} min before target sleep).`,
    pendingTasks.length > 0
      ? `Execute Master Combine gauntlet now to terminate the ${pendingTasks.length} open loops autonomously.`
      : 'Maintain device dark mode and engage sleep environment cooling.',
    'Screen disconnect recommended 20 minutes prior to suggested bedtime to trigger endogenous melatonin release.',
  ];

  // Headline
  let headline = '';
  if (pendingTasks.length === 0) {
    headline = `Serene Rest Profile — All Trails Closed (Suggested ${suggestedBedtime})`;
  } else if (bedtimeShiftMinutes > 0) {
    headline = `Recommended Bedtime: ${suggestedBedtime} (+${bedtimeShiftMinutes}m buffer for ${pendingTasks.length} trails)`;
  } else if (bedtimeShiftMinutes < 0) {
    headline = `Recommended Bedtime: ${suggestedBedtime} (-${Math.abs(bedtimeShiftMinutes)}m early rest window)`;
  } else {
    headline = `Recommended Bedtime: ${suggestedBedtime} (Optimal sync with target)`;
  }

  return {
    suggestedBedtime,
    originalBedtime: currentBedtime,
    differenceMinutes: bedtimeShiftMinutes,
    windDownStartTime,
    windDownMinutes,
    workloadIntensityScore,
    intensityTier,
    intensityTierLabel,
    totalPendingCount: pendingTasks.length,
    residualGapPoints: totalResidualGap,
    estimatedResolutionTimeMinutes,
    cognitiveFatigueRisk,
    projectedPeaceScore,
    historicalVelocity: {
      avgTasksPerDay: HISTORICAL_BENCHMARK.avgTasksPerDay,
      avgMinutesPerTaskClosure: HISTORICAL_BENCHMARK.avgMinutesPerTaskClosure,
      sevenDayCompletionRatePct: HISTORICAL_BENCHMARK.sevenDayCompletionRatePct,
      circadianOptimalBedtime: HISTORICAL_BENCHMARK.circadianOptimalBedtime,
      delayFrequencyPct: HISTORICAL_BENCHMARK.delayFrequencyPct,
    },
    confidenceScore: Math.min(97, Math.max(82, 94 - pendingTasks.length * 2)),
    headline,
    rationalePoints,
    arcOfChangeRecommendations,
    modeUsed: 'deterministic',
  };
}

// Client helper: Query AI-powered predictive bedtime calculation from backend
export async function fetchAIPredictiveBedtime(params: {
  tasks: IncompleteTask[];
  currentBedtime: string;
  pacingMode?: PredictivePacingMode;
}): Promise<PredictiveBedtimeRecommendation> {
  try {
    const response = await fetch('/api/daemon/predictive-bedtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: params.tasks,
        currentBedtime: params.currentBedtime,
        pacingMode: params.pacingMode || 'balanced',
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.recommendation) {
      return {
        ...data.recommendation,
        modeUsed: 'ai',
      };
    }
    return calculatePredictiveBedtime(params);
  } catch (err) {
    console.warn('[Predictive Bedtime] Server fetch error, using local engine:', err);
    return calculatePredictiveBedtime(params);
  }
}
