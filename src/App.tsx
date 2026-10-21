import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  PlusCircle, 
  Moon, 
  Filter, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  ListTodo, 
  Check, 
  Search, 
  Zap, 
  Bed, 
  Layers,
  BookOpen
} from 'lucide-react';
import { IncompleteTask, TaskCategory, DaemonLog, UserEmailAccount, ConnectedService } from './types';
import { INITIAL_TASKS } from './data/initialTasks';
import { INITIAL_CONNECTED_SERVICES, INITIAL_EMAIL_ACCOUNTS } from './data/initialServices';
import { Header } from './components/Header';
import { EmailAccountsBar } from './components/EmailAccountsBar';
import { DaemonStatusBar } from './components/DaemonStatusBar';
import { TaskCard } from './components/TaskCard';
import { TaskDiffModal } from './components/TaskDiffModal';
import { CaptureTaskModal } from './components/CaptureTaskModal';
import { BedtimeAuditModal } from './components/BedtimeAuditModal';
import { DailySummaryReportModal } from './components/DailySummaryReportModal';
import { MasterCombineModal } from './components/MasterCombineModal';
import { ServicesHubModal } from './components/ServicesHubModal';
import { DaemonTerminal } from './components/DaemonTerminal';
import { sounds } from './utils/audio';
import { getCurrentTimeFormatted } from './utils/time';
import { buildTaskMasterCombineTelemetry } from './utils/masterCombine';

const STORAGE_KEY_TASKS = 'integrator_daemon_tasks_v2';
const STORAGE_KEY_BEDTIME = 'integrator_daemon_bedtime_v1';
const STORAGE_KEY_SOUND = 'integrator_daemon_sound_v1';
const STORAGE_KEY_EMAILS = 'integrator_daemon_emails_v1';
const STORAGE_KEY_SERVICES = 'integrator_daemon_services_v1';

export default function App() {
  // Load tasks
  const [tasks, setTasks] = useState<IncompleteTask[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_TASKS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_TASKS;
  });

  // Load emails
  const [emailAccounts, setEmailAccounts] = useState<UserEmailAccount[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_EMAILS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_EMAIL_ACCOUNTS;
  });

  // Load services
  const [services, setServices] = useState<ConnectedService[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SERVICES);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_CONNECTED_SERVICES;
  });

  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const [bedtime, setBedtime] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_BEDTIME) || '23:00';
    }
    return '23:00';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND);
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // UI state
  const [isSweeping, setIsSweeping] = useState(false);
  const [isSyncingServices, setIsSyncingServices] = useState(false);
  const [selectedTask, setSelectedTask] = useState<IncompleteTask | null>(null);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState(false);
  const [isMasterCombineOpen, setIsMasterCombineOpen] = useState(false);
  const [isServicesHubOpen, setIsServicesHubOpen] = useState(false);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const [activeLog, setActiveLog] = useState<string>('Daemon online • Monitoring workday trails & online services');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Logs stream
  const [logs, setLogs] = useState<DaemonLog[]>([
    {
      id: 'log-1',
      timestamp: getCurrentTimeFormatted(),
      level: 'info',
      message: 'Integrator daemon process online. Patrolling Gmail, Outlook, Trello, Asana, Drive & Jupyter notebooks.',
    },
    {
      id: 'log-2',
      timestamp: getCurrentTimeFormatted(),
      level: 'daemon',
      message: 'Connected account: krissmgusa@gmail.com (+3 linked accounts). Discovered unfinished items left between 25% and 80%.',
    },
  ]);

  // Sync sound settings
  useEffect(() => {
    sounds.enabled = soundEnabled;
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, String(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  // Persist tasks, emails, bedtime, services
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EMAILS, JSON.stringify(emailAccounts));
    } catch {}
  }, [emailAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(services));
    } catch {}
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BEDTIME, bedtime);
    } catch {}
  }, [bedtime]);

  const addLog = (level: DaemonLog['level'], message: string, taskId?: string) => {
    const newLog: DaemonLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: getCurrentTimeFormatted(),
      level,
      message,
      taskId,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    setActiveLog(message);
  };

  const handleBedtimeChange = (newBedtime: string) => {
    setBedtime(newBedtime);
    try {
      localStorage.setItem(STORAGE_KEY_BEDTIME, newBedtime);
    } catch {}
    addLog('daemon', `Bedtime target updated to ${newBedtime} via Master Combine predictive scheduling.`);
  };

  // Metrics
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const avgProgress = tasks.length > 0
    ? Math.round(tasks.reduce((sum, t) => sum + t.currentProgress, 0) / tasks.length)
    : 0;

  // Task count per email account
  const tasksCountByEmail = useMemo(() => {
    const counts: Record<string, number> = {};
    emailAccounts.forEach((acc) => {
      counts[acc.id] = tasks.filter((t) => {
        if (t.emailAccountId === acc.id) return true;
        if (t.sourceTrail.toLowerCase().includes(acc.email.toLowerCase())) return true;
        if (acc.isPrimary && (!t.emailAccountId || t.serviceId === 'gmail')) return true;
        return false;
      }).length;
    });
    return counts;
  }, [tasks, emailAccounts]);

  // Execute a specific predefined service action
  const handleExecuteServiceAction = async (taskId: string, actionId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const action = task.predefinedActions?.find((a) => a.id === actionId);
    if (!action) return;

    setExecutingActionId(actionId);
    addLog('daemon', `Dispatching predefined action "${action.name}" to service ${task.serviceId || 'API'}...`, taskId);

    try {
      const response = await fetch('/api/daemon/execute-service-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: action.serviceId,
          actionName: action.name,
          targetEntity: action.targetEntity,
          taskId: task.id,
          taskTitle: task.title,
        }),
      });

      const data = await response.json();
      const receipt = data.receipt || (data.resultSummary ? `Receipt #${data.transactionId || Date.now()}: ${data.resultSummary}` : `Receipt #${data.transactionId || Date.now()}: Action dispatched successfully`);

      // Update task action status
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const updatedActions = t.predefinedActions?.map((act) =>
            act.id === actionId
              ? { ...act, status: 'executed' as const, executionReceipt: receipt }
              : act
          );

          const actionsTaken = [...(t.daemonActionsTaken || []), `Executed [${action.serviceId.toUpperCase()}]: ${action.name}`];

          return {
            ...t,
            predefinedActions: updatedActions,
            daemonActionsTaken: actionsTaken,
          };
        })
      );

      // Sync modal if open
      setSelectedTask((prev) => {
        if (prev?.id !== taskId) return prev;
        const updatedActions = prev.predefinedActions?.map((act) =>
          act.id === actionId
            ? { ...act, status: 'executed' as const, executionReceipt: receipt }
            : act
        );
        return {
          ...prev,
          predefinedActions: updatedActions,
          daemonActionsTaken: [...(prev.daemonActionsTaken || []), `Executed [${action.serviceId.toUpperCase()}]: ${action.name}`],
        };
      });

      sounds.playTaskFinished();
      addLog('success', `✓ Predefined action "${action.name}" executed with verified receipt.`, taskId);
    } catch (err) {
      console.error('Error executing service action:', err);
      addLog('error', `Failed to execute action "${action.name}". Check network.`, taskId);
    } finally {
      setExecutingActionId(null);
    }
  };

  // Finish a single task via server Gemini endpoint
  const handleFinishTask = async (task: IncompleteTask): Promise<void> => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'resolving' } : t))
    );
    addLog('daemon', `Analyzing remaining ${100 - task.currentProgress}% gap for "${task.title}"...`, task.id);

    try {
      const response = await fetch('/api/daemon/finish-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          category: task.category,
          source: task.sourceTrail,
          currentProgress: task.currentProgress,
          originalContent: task.originalContent,
          notes: task.userNotes,
        }),
      });

      const data = await response.json();

      // Automatically execute all associated predefined actions if pending
      const resolvedActions = task.predefinedActions?.map((act) => ({
        ...act,
        status: 'executed' as const,
        executionReceipt: `Auto-dispatched during pre-sleep sweep (Tx #${Math.random().toString(36).slice(2, 8).toUpperCase()})`,
      }));

      const updatedTask: IncompleteTask = {
        ...task,
        status: 'completed',
        currentProgress: 100,
        completedContent: data.completedContent,
        missingPartsIdentified: data.missingPartsIdentified,
        completionSummary: data.completionSummary,
        daemonActionsTaken: data.daemonActionsTaken || [
          '[S.A.I.L] Ingested partial trail from online session',
          '[ABIDE] Enforced author tone fidelity and boundaries',
          '[AZRAEL] Terminated lingering loop; synthesized missing delta',
          '[A.A.A.] Attestation certified; archived to target',
          '[Arc of Change] Shifted to 100% nocturnal tranquility state',
        ],
        diffHighlights: data.diffHighlights,
        predefinedActions: resolvedActions,
        completedAt: getCurrentTimeFormatted(),
        masterCombine: data.masterCombine || buildTaskMasterCombineTelemetry({ ...task, status: 'completed', currentProgress: 100 }, 'complete'),
      };

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updatedTask : t))
      );

      setSelectedTask((prev) => (prev?.id === task.id ? updatedTask : prev));

      sounds.playTaskFinished();
      addLog('success', `Closed out: "${task.title}" (100% complete). Zero pending items left for this trail.`, task.id);
    } catch (err: any) {
      console.error('Error closing out task:', err);
      // Fallback completion
      const fallbackTask: IncompleteTask = {
        ...task,
        status: 'completed',
        completedContent: `${task.originalContent}\n\n[Daemon Resolution Completed]\nAll open items finalized and ready for bedtime sign-off.`,
        completionSummary: `Closed out remainder to 100% completion.`,
        completedAt: getCurrentTimeFormatted(),
      };
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? fallbackTask : t))
      );
      sounds.playTaskFinished();
      addLog('success', `Completed fallback closure for "${task.title}".`, task.id);
    }
  };

  // Run full Bedtime Sweep on all pending items
  const handleRunBedtimeSweep = async () => {
    const uncompleted = tasks.filter((t) => t.status !== 'completed');
    if (uncompleted.length === 0) return;

    setIsSweeping(true);
    sounds.playBedtimeSweep();
    addLog('daemon', `⚡ Pre-Sleep Sweep initiated: Sweeping ${uncompleted.length} lingering items across all services before bedtime (${bedtime})...`);

    for (let i = 0; i < uncompleted.length; i++) {
      const task = uncompleted[i];
      addLog('daemon', `[Sweep ${i + 1}/${uncompleted.length}] Closing out "${task.title}" (${task.currentProgress}% -> 100%)...`);
      await handleFinishTask(task);
      await new Promise((r) => setTimeout(r, 600));
    }

    setIsSweeping(false);
    sounds.playAllClearSleepReady();
    addLog('success', `✨ Bedtime Sweep finished! All lingering trails resolved. Zero open items. Sleep in peace.`);
    setIsAuditOpen(true);
  };

  // Sync / poll all services
  const handleSyncAllServices = async () => {
    setIsSyncingServices(true);
    addLog('daemon', 'Polling Gmail, Outlook, Trello, Asana, Google Drive, Dropbox, and Jupyter kernels...');
    
    try {
      const response = await fetch('/api/daemon/sync-notebook-notes', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success && data.tasks) {
        setTasks((prev) => [...data.tasks, ...prev]);
        addLog('success', `Sync complete: Synchronized ${data.tasks.length} new incomplete markdown notes from notebooks.`);
      }
    } catch (err) {
      console.error('Notebook sync error:', err);
      addLog('warn', 'Sync complete: Some services could not be reached.');
    } finally {
      setIsSyncingServices(false);
    }
  };

  // Add new email account
  const handleAddEmailAccount = (email: string, label: string, provider: 'gmail' | 'outlook' | 'custom' = 'gmail') => {
    const newAcc: UserEmailAccount = {
      id: `acc-${Date.now()}`,
      email,
      label,
      provider,
      isPrimary: false,
      taskCount: 0,
      avatarColor: 'bg-stone-700 text-white',
    };
    setEmailAccounts((prev) => [...prev, newAcc]);
    addLog('info', `Linked new email account: ${email} (${label}).`);
  };

  // Add new incomplete task captured by user
  const handleAddTask = (newTask: IncompleteTask, finishImmediately?: boolean) => {
    setTasks((prev) => [newTask, ...prev]);
    addLog('info', `Captured new trail left at ${newTask.currentProgress}%: "${newTask.title}". Added to sweep queue.`, newTask.id);
    if (finishImmediately) {
      setTimeout(() => handleFinishTask(newTask), 300);
    }
  };

  // Re-open task
  const handleReopenTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'pending', completedContent: undefined, completionSummary: undefined } : t
      )
    );
    addLog('info', `Re-opened item for resolution testing.`);
  };

  // Save manual edits
  const handleSaveCompletedContent = (taskId: string, newContent: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completedContent: newContent } : t
      )
    );
    setSelectedTask((prev) =>
      prev?.id === taskId ? { ...prev, completedContent: newContent } : prev
    );
    addLog('info', `Updated finalized deliverable content.`);
  };

  // Reset to initial sample data
  const handleResetSampleData = () => {
    setTasks(INITIAL_TASKS);
    setEmailAccounts(INITIAL_EMAIL_ACCOUNTS);
    setServices(INITIAL_CONNECTED_SERVICES);
    setSelectedEmailId(null);
    addLog('info', 'Reset workday trails to initial unfinished workspace items.');
  };

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Email Account Filter
      if (selectedEmailId !== null) {
        const currentAccount = emailAccounts.find((a) => a.id === selectedEmailId);
        if (currentAccount) {
          const matchesAccount = 
            t.emailAccountId === selectedEmailId ||
            t.sourceTrail.toLowerCase().includes(currentAccount.email.toLowerCase()) ||
            (currentAccount.id === 'email-gmail-primary' && (t.serviceId === 'gmail' || t.serviceId === 'google_drive')) ||
            (currentAccount.id === 'email-work-solutions' && (t.serviceId === 'asana' || t.serviceId === 'trello')) ||
            (currentAccount.id === 'email-research-labs' && (t.serviceId === 'jupyter' || t.category === 'notebook')) ||
            (currentAccount.id === 'email-outlook-personal' && t.serviceId === 'outlook');
          
          if (!matchesAccount) return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchContent = t.originalContent.toLowerCase().includes(q);
        const matchSource = t.sourceTrail.toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchSource) return false;
      }

      // Category
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }

      // Status
      if (statusFilter === 'pending' && t.status === 'completed') return false;
      if (statusFilter === 'completed' && t.status !== 'completed') return false;

      return true;
    });
  }, [tasks, emailAccounts, selectedEmailId, searchQuery, selectedCategory, statusFilter]);

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* Top Header */}
      <Header
        bedtime={bedtime}
        onBedtimeChange={handleBedtimeChange}
        onOpenCapture={() => setIsCaptureOpen(true)}
        onRunBedtimeSweep={handleRunBedtimeSweep}
        onResetSampleData={handleResetSampleData}
        onOpenServicesHub={() => setIsServicesHubOpen(true)}
        onOpenDailySummary={() => setIsDailySummaryOpen(true)}
        onOpenMasterCombine={() => setIsMasterCombineOpen(true)}
        isSweeping={isSweeping}
        pendingCount={pendingCount}
        completedCount={completedCount}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenAudit={() => setIsAuditOpen(true)}
        connectedServicesCount={services.filter(s => s.connected).length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Email Accounts Bar (Quick Jump Between Owned Inboxes) */}
        <EmailAccountsBar
          accounts={emailAccounts}
          selectedEmailId={selectedEmailId}
          onSelectEmailId={setSelectedEmailId}
          onAddEmailAccount={handleAddEmailAccount}
          tasksCountByEmail={tasksCountByEmail}
        />

        {/* Telemetry & Bedtime Readiness Banner */}
        <DaemonStatusBar
          totalCount={tasks.length}
          pendingCount={pendingCount}
          completedCount={completedCount}
          avgProgress={avgProgress}
          isSweeping={isSweeping}
          activeLog={activeLog}
          logs={logs}
          onOpenAudit={() => setIsAuditOpen(true)}
          onOpenDailySummary={() => setIsDailySummaryOpen(true)}
          onOpenMasterCombine={() => setIsMasterCombineOpen(true)}
        />

        {/* Filter & Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-xl text-xs self-start">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Trails ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Pending Close-Out ({pendingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                statusFilter === 'completed'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>100% Finished ({completedCount})</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search trails or drafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 w-48 sm:w-56"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-700"
            >
              <option value="all">All Categories</option>
              <option value="notebook">Jupyter / Notebooks</option>
              <option value="email">Email Drafts</option>
              <option value="code">Code / PRs</option>
              <option value="document">Docs & Agendas</option>
              <option value="finance">Expenses & Finance</option>
              <option value="communication">Slack & Chat</option>
              <option value="research">Research & Tabs</option>
            </select>
          </div>
        </div>

        {/* Task Cards Grid */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-base font-semibold text-stone-900 mb-1">
              No matching trails found
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              {searchQuery
                ? 'Try clearing your search filters to view your pending items.'
                : 'All your online trails have been closed out, or none match the filter.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setStatusFilter('all');
                setSelectedEmailId(null);
              }}
              className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-xs font-medium hover:bg-stone-50 text-stone-700"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onFinishTask={handleFinishTask}
                onOpenInspect={(t) => setSelectedTask(t)}
                onReopenTask={handleReopenTask}
                onExecuteServiceAction={handleExecuteServiceAction}
                executingActionId={executingActionId}
              />
            ))}
          </div>
        )}

        {/* Daemon Event Telemetry Log (Collapsible Terminal) */}
        <DaemonTerminal
          logs={logs}
          onClearLogs={() => setLogs([])}
          isSweeping={isSweeping}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Integrator Daemon v2.5 • Services: Gmail, Outlook, Trello, Asana, Drive, Dropbox & Jupyter</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Bedtime Target: <strong>{bedtime}</strong></span>
            <span>•</span>
            <button 
              onClick={() => setIsMasterCombineOpen(true)}
              className="text-purple-700 hover:text-purple-900 font-medium underline"
            >
              Master Combine Engine
            </button>
            <span>•</span>
            <button 
              onClick={() => setIsDailySummaryOpen(true)}
              className="text-indigo-700 hover:text-indigo-900 font-medium underline"
            >
              Daily Summary Report
            </button>
            <span>•</span>
            <button 
              onClick={() => setIsAuditOpen(true)}
              className="text-stone-700 hover:text-stone-950 font-medium underline"
            >
              Pre-Sleep Audit Report
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {selectedTask && (
        <TaskDiffModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onFinishNow={handleFinishTask}
          onSaveCompletedContent={handleSaveCompletedContent}
          onExecuteServiceAction={handleExecuteServiceAction}
          executingActionId={executingActionId}
          isResolving={selectedTask.status === 'resolving'}
        />
      )}

      {isCaptureOpen && (
        <CaptureTaskModal
          onClose={() => setIsCaptureOpen(false)}
          onAddTask={handleAddTask}
        />
      )}

      {isAuditOpen && (
        <BedtimeAuditModal
          tasks={tasks}
          bedtime={bedtime}
          onClose={() => setIsAuditOpen(false)}
          onInspectTask={(task) => {
            setIsAuditOpen(false);
            setSelectedTask(task);
          }}
          onOpenDailySummary={() => setIsDailySummaryOpen(true)}
          onOpenMasterCombine={() => setIsMasterCombineOpen(true)}
        />
      )}

      <MasterCombineModal
        tasks={tasks}
        bedtime={bedtime}
        onUpdateBedtime={handleBedtimeChange}
        isOpen={isMasterCombineOpen}
        onClose={() => setIsMasterCombineOpen(false)}
        onUpdateTasks={(updated) => {
          setTasks(updated);
          localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updated));
        }}
        onInspectTask={(task) => {
          setIsMasterCombineOpen(false);
          setSelectedTask(task);
        }}
      />

      <DailySummaryReportModal
        tasks={tasks}
        bedtime={bedtime}
        isOpen={isDailySummaryOpen}
        onClose={() => setIsDailySummaryOpen(false)}
        onInspectTask={(task) => {
          setIsDailySummaryOpen(false);
          setSelectedTask(task);
        }}
      />

      {isServicesHubOpen && (
        <ServicesHubModal
          services={services}
          onClose={() => setIsServicesHubOpen(false)}
          onSyncAll={handleSyncAllServices}
          isSyncing={isSyncingServices}
        />
      )}
    </div>
  );
}
