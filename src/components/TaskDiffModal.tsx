import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2,
  Edit3,
  Save,
  Layers,
  FileCheck,
  Send,
  HardDrive,
  CheckSquare,
  BookOpen,
  Terminal,
  Activity,
  Compass,
  Anchor,
  Zap,
  Award,
  Moon
} from 'lucide-react';
import { IncompleteTask } from '../types';
import { NotebookCompletionView } from './NotebookCompletionView';
import { buildTaskMasterCombineTelemetry } from '../utils/masterCombine';

interface TaskDiffModalProps {
  task: IncompleteTask | null;
  onClose: () => void;
  onFinishNow?: (task: IncompleteTask) => void;
  onSaveCompletedContent?: (taskId: string, newContent: string) => void;
  onExecuteServiceAction?: (taskId: string, actionId: string) => void;
  executingActionId?: string | null;
  isResolving?: boolean;
}

export const TaskDiffModal: React.FC<TaskDiffModalProps> = ({
  task,
  onClose,
  onFinishNow,
  onSaveCompletedContent,
  onExecuteServiceAction,
  executingActionId,
  isResolving = false,
}) => {
  if (!task) return null;

  const isNotebook = task.category === 'notebook';
  const [activeTab, setActiveTab] = useState<'sideBySide' | 'finished' | 'original' | 'notebook' | 'masterCombine'>(
    isNotebook ? 'notebook' : 'sideBySide'
  );
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(task.completedContent || '');

  const isCompleted = task.status === 'completed';

  const handleCopy = () => {
    const textToCopy = task.completedContent || task.originalContent;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (onSaveCompletedContent) {
      onSaveCompletedContent(task.id, editedText);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-stone-900 text-stone-100">
              {isNotebook ? (
                <BookOpen className="w-5 h-5 text-amber-400" />
              ) : (
                <Layers className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-stone-900">
                  {task.title}
                </h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  isCompleted 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {isCompleted ? '100% Resolved' : `Left at ${task.currentProgress}%`}
                </span>
                {task.priority && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                    task.priority === 'high'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : task.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-stone-400'
                    }`} />
                    <span className="capitalize">{task.priority} Priority</span>
                  </span>
                )}
                {task.serviceId && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-200/80 text-stone-700">
                    Service: {task.serviceId}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 font-mono flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-stone-400" />
                {task.sourceTrail}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-header Tabs & Actions */}
        <div className="px-6 py-2.5 border-b border-stone-200 bg-white flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            {isNotebook && (
              <button
                onClick={() => setActiveTab('notebook')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'notebook'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Jupyter / Colab Cells
              </button>
            )}
            <button
              onClick={() => setActiveTab('sideBySide')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'sideBySide'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Side-by-Side Comparison
            </button>
            <button
              onClick={() => setActiveTab('finished')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'finished'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              100% Finished Deliverable
            </button>
            <button
              onClick={() => setActiveTab('original')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'original'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Original Draft ({task.currentProgress}%)
            </button>
            <button
              onClick={() => setActiveTab('masterCombine')}
              className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'masterCombine'
                  ? 'bg-stone-900 text-stone-100 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Master Combine Pipeline</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && (
              <>
                {isEditing ? (
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-xs transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Edits</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditedText(task.completedContent || '');
                      setIsEditing(true);
                      setActiveTab('finished');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                    <span>Edit Result</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Artifact'}</span>
            </button>

            {!isCompleted && onFinishNow && (
              <button
                disabled={isResolving}
                onClick={() => onFinishNow(task)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-medium shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isResolving ? 'Resolving...' : 'Close Out Now (to 100%)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Predefined Service Actions Section */}
          {task.predefinedActions && task.predefinedActions.length > 0 && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Predefined Online Service Actions</span>
                </span>
                <span className="text-[11px] font-mono text-stone-500">
                  Target Service: {task.serviceId || 'Connected API'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {task.predefinedActions.map((act) => {
                  const isExecuting = executingActionId === act.id;
                  const isDone = act.status === 'executed';

                  return (
                    <div
                      key={act.id}
                      className={`p-3 rounded-lg border flex flex-col justify-between gap-2 text-xs transition-all ${
                        isDone 
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-900">{act.name}</span>
                          {isDone ? (
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-medium">
                              ✓ Dispatched
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-stone-400">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">{act.description}</p>
                        <p className="text-[10px] font-mono text-stone-400 mt-1">
                          Entity: {act.targetEntity}
                        </p>
                      </div>

                      {act.executionReceipt && (
                        <div className="mt-1 p-2 rounded bg-stone-900 text-emerald-300 font-mono text-[10px] leading-relaxed border border-stone-800">
                          {act.executionReceipt}
                        </div>
                      )}

                      {!isDone && (
                        <div className="pt-2 border-t border-stone-100 flex justify-end">
                          <button
                            type="button"
                            disabled={isExecuting || isResolving}
                            onClick={() => onExecuteServiceAction && onExecuteServiceAction(task.id, act.id)}
                            className="px-3 py-1 rounded-md bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-medium transition-colors"
                          >
                            {isExecuting ? 'Executing in Service...' : 'Execute Predefined Action'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daemon Summary Callout */}
          {isCompleted && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-semibold text-emerald-950 text-sm">
                    Daemon Resolution Overview
                  </h4>
                  <p className="text-emerald-900 leading-relaxed">
                    {task.completionSummary || `Completed all remaining deliverables and verified closure before sleep.`}
                  </p>
                  {task.diffHighlights && (
                    <p className="text-stone-700 pt-1">
                      <strong className="text-stone-900">Finished Remainder:</strong> {task.diffHighlights}
                    </p>
                  )}
                </div>
              </div>

              {/* Identified Gaps that were solved */}
              {task.missingPartsIdentified && task.missingPartsIdentified.length > 0 && (
                <div className="mt-3 pt-3 border-t border-emerald-200/60">
                  <p className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider mb-1.5">
                    Gaps Detected & Closed:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-700">
                    {task.missingPartsIdentified.map((gap, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* View Modes */}
          {activeTab === 'notebook' ? (
            <NotebookCompletionView
              task={task}
              isResolving={isResolving}
            />
          ) : activeTab === 'sideBySide' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Original Half-Finished Work */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/70 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    What You Left Behind ({task.currentProgress}%)
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-mono">
                    Incomplete Draft
                  </span>
                </div>
                <div className="flex-1 bg-white border border-stone-200 rounded-lg p-3 text-xs font-mono text-stone-700 whitespace-pre-wrap overflow-y-auto min-h-[220px]">
                  {task.originalContent}
                </div>
                {task.userNotes && (
                  <p className="text-[11px] text-stone-500 mt-2 italic">
                    Note: {task.userNotes}
                  </p>
                )}
              </div>

              {/* Right: Finished 100% Work */}
              <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/20 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Daemon's 100% Finished Deliverable
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    100% Complete
                  </span>
                </div>
                <div className="flex-1 bg-white border border-emerald-100 rounded-lg p-3 text-xs text-stone-800 whitespace-pre-wrap overflow-y-auto min-h-[220px] font-mono leading-relaxed">
                  {task.completedContent || (
                    <div className="flex flex-col items-center justify-center h-full text-center text-stone-400 py-12">
                      <Sparkles className="w-8 h-8 text-stone-300 mb-2" />
                      <p className="text-sm font-medium text-stone-600">Task has not been swept yet</p>
                      <p className="text-xs mt-1 max-w-xs">Click "Close Out Now" to let the Integrator Daemon finish the remaining {100 - task.currentProgress}%.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'finished' ? (
            <div className="border border-stone-200 rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Final Deliverable (Ready for Use / Closed Out)
                </h4>
                {isCompleted && (
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" /> Verified before sleep
                  </span>
                )}
              </div>

              {isEditing ? (
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={14}
                  className="w-full text-xs font-mono p-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-xs font-mono text-stone-800 whitespace-pre-wrap leading-relaxed">
                  {task.completedContent || 'No completed deliverable yet. Run daemon sweep to finish.'}
                </div>
              )}
            </div>
          ) : activeTab === 'original' ? (
            <div className="border border-stone-200 rounded-xl p-4 bg-white">
              <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                User's Original Incomplete Work ({task.currentProgress}%)
              </h4>
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-xs font-mono text-stone-800 whitespace-pre-wrap leading-relaxed">
                {task.originalContent}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const telemetry = task.masterCombine || buildTaskMasterCombineTelemetry(task, isCompleted ? 'complete' : 'sail');
                return (
                  <div className="space-y-4">
                    <div className="bg-stone-900 text-stone-100 rounded-xl p-4 border border-stone-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          The Master Combine Pipeline Telemetry
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                          {telemetry.aaa.attestationChecksum}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300">
                        Tracks this workday trail through S.A.I.L (Ingestion) ➔ ABIDE (Fidelity) ➔ AZRAEL (Closure) ➔ A.A.A. (Attestation) ➔ Arc of Change (Bedtime Peace).
                      </p>
                    </div>

                    {/* 5 Stages Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* S.A.I.L */}
                      <div className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50/30">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-cyan-800 flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-cyan-600" />
                            S.A.I.L (Sensor Intake)
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                            {telemetry.sail.startingProgress}% Ingested
                          </span>
                        </div>
                        <p className="text-xs text-stone-700">{telemetry.sail.identifiedContext}</p>
                        <div className="mt-2 text-[10px] text-stone-500 font-mono">
                          Sensor: {telemetry.sail.sensorDomain} • Entropy: {telemetry.sail.ingestionEntropy}%
                        </div>
                      </div>

                      {/* ABIDE */}
                      <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                            <Anchor className="w-3.5 h-3.5 text-emerald-600" />
                            ABIDE (Intent & Boundaries)
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {telemetry.abide.toneFidelityScore}% Fidelity
                          </span>
                        </div>
                        <p className="text-xs text-stone-700">{telemetry.abide.boundaryRule}</p>
                        <div className="mt-2 text-[10px] text-stone-500 font-mono">
                          Guardrails: {telemetry.abide.guardrailsPassed.join(' • ')}
                        </div>
                      </div>

                      {/* AZRAEL */}
                      <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/30">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-purple-600" />
                            AZRAEL (Angel of Closure)
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                            {isCompleted ? 'Loop Terminated' : 'Pending Synthesis'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700">{telemetry.azrael.missingDeltaSynthesized}</p>
                        <div className="mt-2 text-[10px] text-stone-500 font-mono">
                          Residual Loops Killed: {telemetry.azrael.residualOpenLoopsKilled} • Velocity: {telemetry.azrael.executionVelocityMs}ms
                        </div>
                      </div>

                      {/* A.A.A. */}
                      <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            A.A.A. (Audit & Attestation)
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            {telemetry.aaa.attestationChecksum}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700">Archived to: {telemetry.aaa.archiveTarget}</p>
                        <div className="mt-2 text-[10px] text-stone-500 font-mono">
                          Certified: {telemetry.aaa.certifiedAt}
                        </div>
                      </div>
                    </div>

                    {/* Arc of Change Card */}
                    <div className="p-4 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/60 to-purple-50/40">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <Moon className="w-3.5 h-3.5 text-indigo-600" />
                          The Arc of Change Transformation
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {isCompleted ? '+100% Peace Achieved' : 'Pending Bedtime Closeout'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700">
                        {telemetry.arcOfChange.cognitivePeaceVerdict}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-[11px] text-stone-600 font-mono">
                        <span>Daytime Entropy: <strong>{telemetry.arcOfChange.dayStateEntropy}%</strong></span>
                        <span>➔</span>
                        <span>Bedtime Peace: <strong>{telemetry.arcOfChange.nightStatePeaceScore}%</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Daemon Actions Trail */}
          {task.daemonActionsTaken && task.daemonActionsTaken.length > 0 && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5">
              <h5 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Integrator Daemon Execution Audit
              </h5>
              <div className="space-y-1.5 text-xs text-stone-600 font-mono">
                {task.daemonActionsTaken.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">[{idx + 1}]</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
          <span className="text-stone-500">
            {isCompleted ? 'Task marked closed for bedtime review.' : 'Task is in the bedtime sweep queue.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
