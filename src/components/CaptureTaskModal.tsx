import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  PlusCircle, 
  HelpCircle, 
  Clock, 
  FileText, 
  Sliders, 
  CheckCircle2, 
  Wand2,
  BookOpen,
  Layers,
  Send,
  Mail,
  HardDrive
} from 'lucide-react';
import { IncompleteTask, TaskCategory, OnlineServiceId, PredefinedServiceAction } from '../types';

interface CaptureTaskModalProps {
  onClose: () => void;
  onAddTask: (newTask: IncompleteTask, finishImmediately?: boolean) => void;
}

const CATEGORIES: { id: TaskCategory; label: string }[] = [
  { id: 'email', label: 'Email Draft' },
  { id: 'notebook', label: 'Jupyter / Notebook' },
  { id: 'code', label: 'Code / PR' },
  { id: 'document', label: 'Doc / Notes' },
  { id: 'finance', label: 'Expense / Finance' },
  { id: 'communication', label: 'Slack / Chat' },
  { id: 'research', label: 'Research / Tabs' },
  { id: 'admin', label: 'Admin / Form' },
];

export const CaptureTaskModal: React.FC<CaptureTaskModalProps> = ({
  onClose,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('email');
  const [sourceTrail, setSourceTrail] = useState('Active browser tab • Today');
  const [serviceId, setServiceId] = useState<OnlineServiceId>('gmail');
  const [currentProgress, setCurrentProgress] = useState(60);
  const [originalContent, setOriginalContent] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimationNote, setEstimationNote] = useState<string | null>(null);

  const handleEstimateWithAI = async () => {
    if (!originalContent.trim()) return;
    setIsEstimating(true);
    setEstimationNote(null);
    try {
      const res = await fetch('/api/daemon/estimate-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalContent, category }),
      });
      const data = await res.json();
      if (data.estimatedProgress) {
        setCurrentProgress(data.estimatedProgress);
        if (!title.trim() && data.suggestedTitle) {
          setTitle(data.suggestedTitle);
        }
        setEstimationNote(
          `AI analyzed draft: Estimated ~${data.estimatedProgress}% complete. Identified gaps: ${data.identifiedGaps?.slice(0, 2).join(', ')}`
        );
      }
    } catch {
      // Fallback calculation based on length
      const progress = Math.min(Math.max(Math.round((originalContent.length / 250) * 50) + 20, 15), 85);
      setCurrentProgress(progress);
      setEstimationNote(`Heuristic estimation applied (~${progress}% complete).`);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleCategoryChange = (cat: TaskCategory) => {
    setCategory(cat);
    if (cat === 'notebook') {
      setServiceId('jupyter');
      setSourceTrail('JupyterLab / Colab • Localhost:8888');
    } else if (cat === 'email') {
      setServiceId('gmail');
      setSourceTrail('Gmail Drafts • Active tab');
    } else if (cat === 'code') {
      setServiceId('trello');
      setSourceTrail('Trello Board • Sprint Card');
    } else if (cat === 'communication') {
      setServiceId('asana');
      setSourceTrail('Asana Task • Assigned item');
    }
  };

  const handleSubmit = (finishImmediately: boolean) => {
    if (!originalContent.trim() && !title.trim()) return;

    // Generate default predefined action based on service
    const predefinedActions: PredefinedServiceAction[] = [];
    if (serviceId === 'gmail') {
      predefinedActions.push({
        id: `act-${Date.now()}-1`,
        serviceId: 'gmail',
        name: 'Dispatch Draft via Gmail API',
        description: 'Sends finalized message from connected account.',
        iconName: 'Send',
        targetEntity: 'Gmail: krissmgusa@gmail.com',
        status: 'pending',
      });
    } else if (serviceId === 'trello') {
      predefinedActions.push({
        id: `act-${Date.now()}-1`,
        serviceId: 'trello',
        name: 'Move Card to "Done / Closed"',
        description: 'Transitions card to Done column.',
        iconName: 'Trello',
        targetEntity: 'Trello Board: Active Sprint',
        status: 'pending',
      });
    } else if (serviceId === 'asana') {
      predefinedActions.push({
        id: `act-${Date.now()}-1`,
        serviceId: 'asana',
        name: 'Mark Task Complete in Asana',
        description: 'Closes task and posts resolution note.',
        iconName: 'CheckSquare',
        targetEntity: 'Asana Project: Workspace Tasks',
        status: 'pending',
      });
    } else if (serviceId === 'jupyter') {
      predefinedActions.push({
        id: `act-${Date.now()}-1`,
        serviceId: 'jupyter',
        name: 'Execute Missing Cells & Export .ipynb',
        description: 'Runs Python kernel to completion and commits notebook.',
        iconName: 'BookOpen',
        targetEntity: 'Jupyter: /notebooks/active_session.ipynb',
        status: 'pending',
      });
    }

    const newTask: IncompleteTask = {
      id: `trail-${Date.now()}`,
      title: title.trim() || (category === 'notebook' ? 'Data Analysis & Modeling Notebook' : 'Unfinished Online Task'),
      category,
      sourceTrail: sourceTrail.trim() || 'Online workday trail',
      currentProgress,
      originalContent: originalContent.trim(),
      userNotes: userNotes.trim() || undefined,
      detectedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      status: 'pending',
      serviceId,
      predefinedActions,
      notebookData: category === 'notebook' ? {
        kernel: 'Python 3.11 (ipykernel)',
        notebookType: 'jupyter',
        totalCells: 10,
        completedCells: Math.round((currentProgress / 100) * 10),
        missingSections: ['Missing evaluation metrics & visualizations', 'Missing conclusion markdown block'],
      } : undefined,
    };

    onAddTask(newTask, finishImmediately);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-stone-900 text-stone-100">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Capture Incomplete Trail (1%–99%)
              </h2>
              <p className="text-xs text-stone-500">
                Register anything you started today in your email, Trello, Asana, Drive, or Notebooks
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Category Selector */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              Task Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    category === cat.id
                      ? 'bg-stone-900 border-stone-900 text-white shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Connected Service & Email Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Connected Service Target
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value as any)}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="gmail">Gmail API (krissmgusa@gmail.com)</option>
                <option value="outlook">Microsoft 365 / Outlook</option>
                <option value="trello">Trello (Sprint Board)</option>
                <option value="asana">Asana Workspace</option>
                <option value="jupyter">Jupyter & Colab Kernel</option>
                <option value="google_drive">Google Drive Storage</option>
                <option value="dropbox">Dropbox Storage</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Source Trail / Context
              </label>
              <input
                type="text"
                placeholder="e.g. Gmail Drafts / Slack thread / PR #22"
                value={sourceTrail}
                onChange={(e) => setSourceTrail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              placeholder={category === 'notebook' ? 'e.g. churn_prediction.ipynb model training' : 'e.g. Draft Q4 OKR email to VP'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          {/* Incomplete Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-stone-700">
                Incomplete Content / Draft Left Behind
              </label>
              {originalContent.trim() && (
                <button
                  type="button"
                  disabled={isEstimating}
                  onClick={handleEstimateWithAI}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>{isEstimating ? 'Estimating...' : 'AI Auto-Detect Completion %'}</span>
                </button>
              )}
            </div>
            <textarea
              rows={5}
              placeholder={category === 'notebook' 
                ? `# Paste unfinished notebook code cells or markdown notes here...\nimport pandas as pd\n# [Need ROC-AUC evaluation and conclusion]`
                : `Paste your unfinished draft, half-written code snippet, bullet points, or open tab notes here...`}
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-900 leading-relaxed"
            />
          </div>

          {/* Progress Slider (1% to 99%) */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-stone-500" />
                Current Completion Status:
              </span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {currentProgress}% Completed
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={99}
              value={currentProgress}
              onChange={(e) => setCurrentProgress(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
            />

            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>1% (Just started / stub)</span>
              <span>50% (Half finished)</span>
              <span>75% (Rough draft)</span>
              <span>99% (Needs sign-off)</span>
            </div>

            {estimationNote && (
              <p className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded p-2 mt-1">
                {estimationNote}
              </p>
            )}
          </div>

          {/* User Instructions */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Instructions for the Daemon (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Include 3 bullet recommendations and commit artifact before sleep"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-900 font-medium transition-colors"
            >
              Add to Bedtime Sweep Queue
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Add & Finish Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
