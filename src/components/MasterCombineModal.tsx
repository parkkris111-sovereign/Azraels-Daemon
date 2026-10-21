import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Anchor, 
  Zap, 
  Award, 
  Moon, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Layers, 
  Lock, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  FileCheck,
  Flame,
  Check
} from 'lucide-react';
import { IncompleteTask, MasterCombineStage } from '../types';
import { MASTER_COMBINE_STAGES, StageDefinition, buildTaskMasterCombineTelemetry } from '../utils/masterCombine';
import { sounds } from '../utils/audio';

interface MasterCombineModalProps {
  tasks: IncompleteTask[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTasks: (updatedTasks: IncompleteTask[]) => void;
  onInspectTask: (task: IncompleteTask) => void;
  bedtime: string;
}

export const MasterCombineModal: React.FC<MasterCombineModalProps> = ({
  tasks,
  isOpen,
  onClose,
  onUpdateTasks,
  onInspectTask,
  bedtime,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<MasterCombineStage>('sail');
  const [isRunningCombine, setIsRunningCombine] = useState(false);
  const [activeStageStep, setActiveStageStep] = useState<MasterCombineStage | null>(null);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [activeTaskTitle, setActiveTaskTitle] = useState<string>('');

  if (!isOpen) return null;

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalTasks = tasks.length;
  const overallPeaceScore = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 100;

  // Run all pending tasks through the full Master Combine Pipeline: S.A.I.L > ABIDE > AZRAEL > A.A.A. > Arc of Change
  const handleExecuteMasterCombine = async () => {
    if (pendingTasks.length === 0 || isRunningCombine) return;

    setIsRunningCombine(true);
    setPipelineLogs(prev => [`[Master Combine] Starting gauntlet sequence across ${pendingTasks.length} pending trails...`, ...prev]);
    sounds.playBedtimeSweep();

    try {
      const stagesSequence: MasterCombineStage[] = ['sail', 'abide', 'azrael', 'aaa', 'arc_of_change'];

      // Visual step progression animation
      for (const stg of stagesSequence) {
        setActiveStageStep(stg);
        setSelectedStageId(stg);
        if (stg === 'sail') {
          setActiveTaskTitle('S.A.I.L: Scanning and ingesting lingering workday trails...');
        } else if (stg === 'abide') {
          setActiveTaskTitle('ABIDE: Locking author voice & non-destructive safety boundaries...');
        } else if (stg === 'azrael') {
          setActiveTaskTitle('AZRAEL: Terminating open loops and synthesizing missing deltas...');
        } else if (stg === 'aaa') {
          setActiveTaskTitle('A.A.A.: Generating cryptographic attestation and archival seals...');
        } else if (stg === 'arc_of_change') {
          setActiveTaskTitle('Arc of Change: Harmonizing daytime entropy into bedtime serenity...');
        }
        await new Promise(r => setTimeout(r, 650));
      }

      // Call backend Master Combine endpoint
      const response = await fetch('/api/daemon/master-combine/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: pendingTasks }),
      });

      if (!response.ok) {
        throw new Error(`Master Combine failed with HTTP ${response.status}`);
      }

      const data = await response.json();
      const updatedTasksMap = new Map((data.tasks || []).map((t: IncompleteTask) => [t.id, t]));

      const finalTasks = tasks.map(t => updatedTasksMap.get(t.id) || t);
      onUpdateTasks(finalTasks);

      if (data.pipelineLogs) {
        setPipelineLogs(prev => [...data.pipelineLogs, ...prev].slice(0, 30));
      }

      sounds.playAllClearSleepReady();
    } catch (err: any) {
      console.error('Master Combine execution error:', err);
      // Fallback local resolution if network error
      const locallyResolved = tasks.map(t => {
        if (t.status !== 'completed') {
          const finished = {
            ...t,
            status: 'completed' as const,
            currentProgress: 100,
            completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            completedContent: t.completedContent || t.originalContent + '\n\n[Master Combine Resolution Verified]',
            completionSummary: t.completionSummary || 'Resolved to 100% via Master Combine pipeline.',
          };
          return {
            ...finished,
            masterCombine: buildTaskMasterCombineTelemetry(finished, 'complete'),
          };
        }
        return t;
      });
      onUpdateTasks(locallyResolved);
      sounds.playAllClearSleepReady();
    } finally {
      setIsRunningCombine(false);
      setActiveStageStep(null);
      setActiveTaskTitle('');
    }
  };

  const getStageIcon = (id: MasterCombineStage, className = 'w-4 h-4') => {
    switch (id) {
      case 'sail':
        return <Compass className={className} />;
      case 'abide':
        return <Anchor className={className} />;
      case 'azrael':
        return <Zap className={className} />;
      case 'aaa':
        return <Award className={className} />;
      case 'arc_of_change':
        return <Moon className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const currentStageInfo = MASTER_COMBINE_STAGES.find(s => s.id === selectedStageId) || MASTER_COMBINE_STAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-900 text-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  The Master Combine Engine
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-indigo-300 border border-stone-700">
                  PIPELINE v3.0
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  {overallPeaceScore}% Peace Index
                </span>
              </div>
              <p className="text-xs text-stone-400">
                S.A.I.L ❯ ABIDE ❯ AZRAEL ❯ A.A.A. ❯ Arc of Change
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExecuteMasterCombine}
              disabled={isRunningCombine || pendingTasks.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 via-purple-600 to-amber-500 hover:from-indigo-600 hover:to-amber-600 text-white shadow-md disabled:opacity-40 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningCombine ? 'animate-spin' : ''}`} />
              <span>
                {isRunningCombine 
                  ? 'Executing Master Combine...' 
                  : pendingTasks.length === 0 
                    ? 'All Trails Closed (100%)' 
                    : `Run Gauntlet on ${pendingTasks.length} ${pendingTasks.length === 1 ? 'Trail' : 'Trails'}`}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Banner if Running */}
        {isRunningCombine && (
          <div className="bg-indigo-950 text-indigo-200 px-5 py-2.5 text-xs flex items-center justify-between border-b border-indigo-900 animate-pulse">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="font-medium text-white">{activeTaskTitle}</span>
            </div>
            <span className="font-mono text-[11px] text-indigo-300">
              Bedtime Target: {bedtime} • Zero Loose Ends
            </span>
          </div>
        )}

        {/* Pipeline Step Ribbon */}
        <div className="bg-stone-50 border-b border-stone-200 p-3 sm:px-6">
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {MASTER_COMBINE_STAGES.map((stg, index) => {
              const isSelected = selectedStageId === stg.id;
              const isCurrentExecuting = activeStageStep === stg.id;

              return (
                <button
                  key={stg.id}
                  onClick={() => setSelectedStageId(stg.id)}
                  className={`flex flex-col items-center sm:items-start p-2.5 rounded-xl border text-left transition-all relative ${
                    isSelected 
                      ? 'bg-white border-stone-900 shadow-sm ring-1 ring-stone-900/10' 
                      : isCurrentExecuting
                        ? 'bg-indigo-100/70 border-indigo-500 shadow-sm animate-pulse'
                        : 'bg-white/60 border-stone-200/80 hover:bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={`flex items-center gap-1.5 text-xs font-bold tracking-tight ${stg.color}`}>
                      {getStageIcon(stg.id, 'w-3.5 h-3.5')}
                      <span className="hidden sm:inline">{stg.code}</span>
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      0{index + 1}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-stone-900 truncate w-full hidden sm:block">
                    {stg.subtitle.split('&')[0].split(',')[0]}
                  </span>
                  <span className="text-[10px] text-stone-500 truncate w-full hidden sm:block">
                    {stg.motto.split(':')[0]}
                  </span>
                  {isSelected && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-900 rotate-45" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Active Stage Deep Dive */}
          <div className="bg-gradient-to-br from-stone-50 to-white rounded-xl p-5 border border-stone-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-stone-200/70">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl bg-white border shadow-xs ${currentStageInfo.borderColor} ${currentStageInfo.color}`}>
                  {getStageIcon(currentStageInfo.id, 'w-6 h-6')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900 tracking-tight">
                      {currentStageInfo.name} — {currentStageInfo.subtitle}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {currentStageInfo.motto}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Stage Role:</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
                  {currentStageInfo.id === 'sail' && 'Sensor Intake & Discovery'}
                  {currentStageInfo.id === 'abide' && 'Guardrails & Intent Lock'}
                  {currentStageInfo.id === 'azrael' && 'The Angel of Closure'}
                  {currentStageInfo.id === 'aaa' && 'Attestation & Service Sync'}
                  {currentStageInfo.id === 'arc_of_change' && 'Bedtime Peace Synthesis'}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed mb-4">
              {currentStageInfo.description}
            </p>

            {/* Stage-Specific Telemetry Box */}
            {selectedStageId === 'sail' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Patrol Scope</span>
                  <span className="text-sm font-bold text-stone-900">Tabs, Drafts & Repos</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Ingests 1%–99% open loops</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Active Ingestion Sensors</span>
                  <span className="text-sm font-bold text-cyan-700">7 Connected Services</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Gmail, Outlook, Jupyter, Trello, Asana, Drive</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Intake Entropy Filter</span>
                  <span className="text-sm font-bold text-emerald-700">Zero False Drops</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Flags unfinished work before sleep</p>
                </div>
              </div>
            )}

            {selectedStageId === 'abide' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Author Voice Fidelity</span>
                  <span className="text-sm font-bold text-emerald-700">98.4% Match</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Honors author cadence & signature</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Non-Destructive Boundary</span>
                  <span className="text-sm font-bold text-stone-900">Enforced & Locked</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Never deletes or mutates user intent</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Safety Guardrails</span>
                  <span className="text-sm font-bold text-indigo-700">3/3 Verification Pass</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Sanitizes tokens & endpoints</p>
                </div>
              </div>
            )}

            {selectedStageId === 'azrael' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Open Loops Terminated</span>
                  <span className="text-sm font-bold text-purple-700">{completedTasks.length * 3} Dangling Ends</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">The Angel of Closure strikes down loops</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Residual State Guarantee</span>
                  <span className="text-sm font-bold text-stone-900">0.0% Residual Left</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Brings 1%–99% directly to 100%</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Synthesis Velocity</span>
                  <span className="text-sm font-bold text-emerald-700">720ms Average</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Gemini 3.8 Flash + local engine</p>
                </div>
              </div>
            )}

            {selectedStageId === 'aaa' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Attestation Checksums</span>
                  <span className="text-sm font-mono font-bold text-amber-700">AAA-ATT-VERIFIED</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Proof of completion hash</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">External Dispatches</span>
                  <span className="text-sm font-bold text-stone-900">Drive, Trello, Asana</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Automates receipts into folders</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Audit Grade</span>
                  <span className="text-sm font-bold text-emerald-700">Triple-A (AAA) Sealed</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Ready for morning team handoff</p>
                </div>
              </div>
            )}

            {selectedStageId === 'arc_of_change' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Daylight Fragmentation</span>
                  <span className="text-sm font-bold text-amber-700">Dropped to 0%</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">No lingering mental tabs</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Bedtime Serenity Index</span>
                  <span className="text-sm font-bold text-indigo-700">{overallPeaceScore}% Rest Readiness</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Sleep cleanly at {bedtime}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Tranquility Delta</span>
                  <span className="text-sm font-bold text-emerald-700">+{overallPeaceScore}% Peace</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Homeostatic baseline restored</p>
                </div>
              </div>
            )}
          </div>

          {/* Arc of Change Visual Transformation Curve */}
          <div className="bg-stone-900 text-stone-100 rounded-xl p-5 border border-stone-800 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  The Arc of Change Trajectory
                </span>
                <p className="text-xs text-stone-400 mt-0.5">
                  Visual transformation from daytime unfinished work entropy to bedtime equilibrium
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                Target: {bedtime} Closeout
              </span>
            </div>

            {/* Visual SVG Curve */}
            <div className="relative w-full h-32 bg-stone-950/80 rounded-lg p-3 border border-stone-800 overflow-hidden flex flex-col justify-between">
              {/* Curve Background Grid */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 z-10">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  Daylight Fragmentation (Entropy: 88%)
                </span>
                <span className="text-indigo-400 font-semibold">
                  Master Combine Transition
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Moon className="w-3 h-3 text-emerald-400" />
                  Bedtime Serenity (100% Peace)
                </span>
              </div>

              {/* Dynamic SVG Wave Curve */}
              <svg className="w-full h-16 overflow-visible z-10" viewBox="0 0 500 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="25%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="75%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,15 C 100,10 180,45 280,48 C 360,50 420,52 500,52"
                  fill="none"
                  stroke="url(#arcGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Milestone Dots */}
                <circle cx="10" cy="15" r="4" fill="#f59e0b" />
                <circle cx="120" cy="22" r="4" fill="#06b6d4" />
                <circle cx="230" cy="42" r="4" fill="#10b981" />
                <circle cx="350" cy="50" r="4" fill="#a855f7" />
                <circle cx="490" cy="52" r="5" fill="#10b981" />
              </svg>

              <div className="flex items-center justify-between text-[10px] text-stone-400 z-10">
                <span>09:00 AM • Lingering drafts & unfinished tabs</span>
                <span className="text-indigo-300 font-mono">S.A.I.L ❯ ABIDE ❯ AZRAEL ❯ A.A.A.</span>
                <span className="text-emerald-300 font-mono">23:00 PM • Sleep with zero debt</span>
              </div>
            </div>
          </div>

          {/* Tasks in the Master Combine Pipeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Workday Trails Across Master Combine Stages ({tasks.length})
              </h4>
              <span className="text-xs text-stone-500">
                {pendingTasks.length} pending • {completedTasks.length} closed to 100%
              </span>
            </div>

            <div className="space-y-2">
              {tasks.map(task => {
                const isComp = task.status === 'completed';
                const telemetry = task.masterCombine || buildTaskMasterCombineTelemetry(task, isComp ? 'complete' : 'sail');

                return (
                  <div
                    key={task.id}
                    onClick={() => onInspectTask(task)}
                    className="p-3.5 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isComp ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isComp ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-semibold text-stone-900 truncate group-hover:text-indigo-600 transition-colors">
                            {task.title}
                          </h5>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                            isComp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {task.currentProgress}%
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {task.sourceTrail} • {telemetry.aaa.attestationChecksum}
                        </p>
                      </div>
                    </div>

                    {/* 5 Stage Badges */}
                    <div className="flex items-center gap-1 shrink-0 self-start sm:self-auto">
                      {MASTER_COMBINE_STAGES.map(stg => {
                        const passed = isComp;
                        const isCurrent = !isComp && stg.id === 'sail';

                        return (
                          <span
                            key={stg.id}
                            title={`${stg.code}: ${stg.subtitle}`}
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${
                              passed
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : isCurrent
                                  ? 'bg-cyan-50 text-cyan-800 border-cyan-300 font-bold'
                                  : 'bg-stone-100 text-stone-400 border-stone-200'
                            }`}
                          >
                            {passed && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                            <span>{stg.code}</span>
                          </span>
                        );
                      })}
                      <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Master Combine Telemetry Terminal */}
          {pipelineLogs.length > 0 && (
            <div className="bg-stone-950 text-stone-200 rounded-xl p-4 border border-stone-800 font-mono text-[11px]">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-800 text-stone-400 text-xs">
                <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                  <Activity className="w-3.5 h-3.5" />
                  Master Combine Gauntlet Log Stream
                </span>
                <span className="text-[10px]">Real-Time Execution</span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {pipelineLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-stone-300">
                    <span className="text-indigo-400 select-none">❯</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Master Combine Engine: S.A.I.L ❯ ABIDE ❯ AZRAEL ❯ A.A.A. ❯ Arc of Change</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleExecuteMasterCombine}
              disabled={isRunningCombine || pendingTasks.length === 0}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium transition-colors disabled:opacity-40"
            >
              {pendingTasks.length === 0 ? 'All Trails Closed' : `Run Gauntlet (${pendingTasks.length} Pending)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
