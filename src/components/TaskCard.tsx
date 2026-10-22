import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  FileText, 
  Code2, 
  Mail, 
  DollarSign, 
  MessageSquare, 
  Compass, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Undo2,
  BookOpen,
  Layers,
  HardDrive,
  Send,
  Cloud,
  CheckSquare,
  Play,
} from 'lucide-react';
import { IncompleteTask, TaskCategory, OnlineServiceId, TaskPriority } from '../types';

interface TaskCardProps {
  task: IncompleteTask;
  onFinishTask: (task: IncompleteTask) => void;
  onOpenInspect: (task: IncompleteTask) => void;
  onReopenTask?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
  onExecuteServiceAction?: (taskId: string, actionId: string) => void;
  executingActionId?: string | null;
}

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  email: { label: 'Email Draft', icon: Mail, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  code: { label: 'Code / PR', icon: Code2, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  document: { label: 'Doc / Notes', icon: FileText, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  finance: { label: 'Finance / Expense', icon: DollarSign, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  communication: { label: 'Slack / Chat', icon: MessageSquare, color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  research: { label: 'Research / Tabs', icon: Compass, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  admin: { label: 'Admin / Form', icon: FileText, color: 'bg-stone-50 text-stone-700 border-stone-200' },
  notebook: { label: 'Jupyter / Colab Notebook', icon: BookOpen, color: 'bg-amber-50 text-amber-900 border-amber-300' },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onFinishTask,
  onOpenInspect,
  onReopenTask,
  onExecuteServiceAction,
  executingActionId,
}) => {
  const [copied, setCopied] = useState(false);

  const config = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.document;
  const CategoryIcon = config.icon;
  const isCompleted = task.status === 'completed';
  const isResolving = task.status === 'resolving';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const content = task.completedContent || task.originalContent;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getServiceBadge = (serviceId?: OnlineServiceId) => {
    if (!serviceId) return null;
    switch (serviceId) {
      case 'trello':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <Layers className="w-3 h-3" /> Trello
          </span>
        );
      case 'asana':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            <CheckSquare className="w-3 h-3" /> Asana
          </span>
        );
      case 'google_drive':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <HardDrive className="w-3 h-3" /> Google Drive
          </span>
        );
      case 'dropbox':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
            <Cloud className="w-3 h-3" /> Dropbox
          </span>
        );
      case 'jupyter':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
            <BookOpen className="w-3 h-3" /> JupyterLab
          </span>
        );
      case 'gmail':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
            <Mail className="w-3 h-3" /> Gmail
          </span>
        );
      case 'outlook':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
            <Mail className="w-3 h-3" /> Outlook
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority?: TaskPriority) => {
    const p = priority || 'medium';
    switch (p) {
      case 'high':
        return (
          <span 
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border bg-rose-50 text-rose-700 border-rose-200"
            title="Priority: High"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span 
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200"
            title="Priority: Medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Medium
          </span>
        );
      case 'low':
        return (
          <span 
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border bg-stone-50 text-stone-600 border-stone-200"
            title="Priority: Low"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`border rounded-xl transition-all duration-200 flex flex-col justify-between ${
      isCompleted 
        ? 'bg-emerald-50/25 border-emerald-200 hover:border-emerald-300' 
        : isResolving
          ? 'bg-indigo-50/30 border-indigo-200 shadow-sm'
          : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs'
    }`}>
      {/* Top Banner / Progress Indicator */}
      <div className="p-4 sm:p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md border font-medium ${config.color}`}>
              <CategoryIcon className="w-3.5 h-3.5" />
              {config.label}
            </span>
            {getPriorityBadge(task.priority)}
            {getServiceBadge(task.serviceId)}
            {task.notebookData && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-mono">
                {task.notebookData.kernel}
              </span>
            )}
          </div>

          {/* Status Badge */}
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              100% Closed Out
            </span>
          ) : isResolving ? (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              Daemon Finishing...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
              Left at {task.currentProgress}%
            </span>
          )}
        </div>

        {/* Source Trail & Detected Time */}
        <div className="text-xs text-stone-500 font-mono flex items-center gap-1 mb-2">
          <Clock className="w-3 h-3 text-stone-400" />
          <span className="truncate">{task.sourceTrail}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-stone-900 mb-2 leading-snug">
          {task.title}
        </h3>

        {/* Progress bar comparison */}
        <div className="mb-3.5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-500 font-medium">
              Completion Progress:
            </span>
            <span className="font-semibold text-stone-700">
              {isCompleted ? '100% Completed' : `${task.currentProgress}% → 100% Target`}
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-700 rounded-full ${
                isCompleted 
                  ? 'bg-emerald-500' 
                  : isResolving 
                    ? 'bg-indigo-600 animate-pulse' 
                    : 'bg-amber-500'
              }`}
              style={{ width: `${isCompleted ? 100 : task.currentProgress}%` }}
            />
          </div>
        </div>

        {/* Master Combine 5-Stage Mini Pipeline */}
        <div className="mb-3 flex items-center justify-between bg-stone-50/90 border border-stone-200/70 px-2.5 py-1.5 rounded-lg text-[10px] font-mono">
          <span className="text-stone-500 font-semibold tracking-wider text-[9px] uppercase">
            Master Combine:
          </span>
          <div className="flex items-center gap-1">
            <span className={`px-1.5 py-0.5 rounded ${isCompleted ? 'bg-cyan-100/70 text-cyan-800' : 'bg-cyan-50 text-cyan-700 font-bold'}`}>
              S.A.I.L
            </span>
            <span className="text-stone-300">❯</span>
            <span className={`px-1.5 py-0.5 rounded ${isCompleted ? 'bg-emerald-100/70 text-emerald-800' : 'bg-stone-100 text-stone-400'}`}>
              ABIDE
            </span>
            <span className="text-stone-300">❯</span>
            <span className={`px-1.5 py-0.5 rounded ${isCompleted ? 'bg-purple-100/70 text-purple-800' : 'bg-stone-100 text-stone-400'}`}>
              AZRAEL
            </span>
            <span className="text-stone-300">❯</span>
            <span className={`px-1.5 py-0.5 rounded ${isCompleted ? 'bg-amber-100/70 text-amber-800' : 'bg-stone-100 text-stone-400'}`}>
              A.A.A.
            </span>
            <span className="text-stone-300">❯</span>
            <span className={`px-1.5 py-0.5 rounded ${isCompleted ? 'bg-indigo-100/70 text-indigo-800' : 'bg-stone-100 text-stone-400'}`}>
              Arc
            </span>
          </div>
        </div>

        {/* Original Draft Excerpt or Completed Highlight */}
        {isCompleted ? (
          <div className="bg-white/80 border border-emerald-100 rounded-lg p-3 text-xs text-stone-700 mb-3 space-y-2">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-900">
                  {task.completionSummary || 'Daemon finished all pending deliverables and verified closure.'}
                </p>
                {task.diffHighlights && (
                  <p className="text-stone-600 mt-1">
                    <strong className="text-stone-700">Finished Remainder:</strong> {task.diffHighlights}
                  </p>
                )}
              </div>
            </div>

            {/* Micro Daemon Actions Checklist */}
            {task.daemonActionsTaken && task.daemonActionsTaken.length > 0 && (
              <div className="pt-2 border-t border-emerald-100/60 mt-2">
                <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Actions Executed in Continuous Loop
                </p>
                <div className="grid grid-cols-1 gap-1 text-[11px] text-stone-600">
                  {task.daemonActionsTaken.map((action, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-emerald-500">✓</span>
                      <span className="truncate">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-stone-50 border border-stone-200/80 rounded-lg p-3 text-xs text-stone-600 font-mono mb-3 max-h-28 overflow-y-auto whitespace-pre-wrap">
            {task.originalContent}
          </div>
        )}

        {/* Predefined Online Service Actions Ribbon */}
        {task.predefinedActions && task.predefinedActions.length > 0 && (
          <div className="bg-stone-50/80 border border-stone-200/90 rounded-lg p-2.5 mb-3 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>Predefined Service Actions</span>
              </span>
              <span className="text-stone-400 font-mono text-[10px]">
                {task.predefinedActions.filter(a => a.status === 'executed').length}/{task.predefinedActions.length} Executed
              </span>
            </div>

            <div className="space-y-1.5">
              {task.predefinedActions.map((act) => {
                const isExecutingThis = executingActionId === act.id;
                const isExecuted = act.status === 'executed';

                return (
                  <div
                    key={act.id}
                    className={`flex items-center justify-between gap-2 p-2 rounded-md border text-xs transition-colors ${
                      isExecuted 
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-white border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {isExecuted ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Send className="w-3 h-3 text-stone-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="font-medium truncate leading-tight">{act.name}</p>
                        <p className="text-[10px] text-stone-500 truncate">{act.targetEntity}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isExecuted ? (
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">
                          Dispatched
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isExecutingThis || isResolving}
                          onClick={() => onExecuteServiceAction && onExecuteServiceAction(task.id, act.id)}
                          className="px-2 py-0.5 text-[10px] font-medium rounded bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white transition-colors"
                        >
                          {isExecutingThis ? 'Dispatching...' : 'Dispatch Action'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* User Context/Notes if present */}
        {task.userNotes && !isCompleted && (
          <div className="text-xs text-stone-500 bg-amber-50/50 border border-amber-100 rounded-md px-2.5 py-1.5 mb-2 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong className="font-medium text-amber-900">User Guideline:</strong> {task.userNotes}
            </span>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-stone-100 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-stone-500">
            {isCompleted ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Closed at {task.completedAt || 'today'}
              </span>
            ) : (
              <span className="text-stone-400">
                Lingering {100 - task.currentProgress}% gap left to resolve
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isCompleted ? (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors"
                  title="Copy 100% finished deliverable"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-500" />}
                  <span>{copied ? 'Copied!' : 'Copy Result'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenInspect(task)}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md bg-stone-900 hover:bg-stone-800 text-white transition-colors"
                >
                  <span>{task.category === 'notebook' ? 'Inspect Notebook' : 'Inspect Diff'}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>

                {onReopenTask && (
                  <button
                    type="button"
                    onClick={() => onReopenTask(task.id)}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                    title="Re-open task as incomplete"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onOpenInspect(task)}
                  className="px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  {task.category === 'notebook' ? 'View Notebook' : 'Preview Details'}
                </button>

                <button
                  type="button"
                  disabled={isResolving}
                  onClick={() => onFinishTask(task)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white shadow-2xs transition-all"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{isResolving ? 'Finishing...' : 'Close Out (to 100%)'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
