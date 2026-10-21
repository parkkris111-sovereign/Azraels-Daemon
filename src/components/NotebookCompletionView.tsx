import React from 'react';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  HardDrive, 
  Terminal, 
  BarChart2, 
  Code2,
  FileText
} from 'lucide-react';
import { IncompleteTask } from '../types';

interface NotebookCompletionViewProps {
  task: IncompleteTask;
  onExecuteAction?: (actionId: string) => void;
  isResolving?: boolean;
}

export const NotebookCompletionView: React.FC<NotebookCompletionViewProps> = ({
  task,
  onExecuteAction,
  isResolving,
}) => {
  const notebookData = task.notebookData;
  const isCompleted = task.status === 'completed';

  return (
    <div className="space-y-4">
      {/* Notebook Environment Ribbon */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs border border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-stone-200">
                churn_analysis.ipynb
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 font-mono">
                {notebookData?.kernel || 'Python 3.11 (ipykernel)'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Computational notebook with {notebookData?.totalCells || 12} total cells • {isCompleted ? '100% Executed & Sealed' : `${task.currentProgress}% Executed`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Kernel Online
          </span>
        </div>
      </div>

      {/* Identified Missing Gaps in the Notebook */}
      {!isCompleted && notebookData?.missingSections && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs space-y-1.5">
          <p className="font-semibold text-amber-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Integrator Daemon Missing Cell Target:</span>
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-amber-800 text-[11px]">
            {notebookData.missingSections.map((sec, idx) => (
              <li key={idx}>{sec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cell Stack */}
      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white divide-y divide-stone-100 font-mono text-xs">
        {/* Cell 1: Ingestion (Original) */}
        <div className="p-3 bg-stone-50/50">
          <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1.5 font-sans">
            <div className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-stone-400" />
              <span>In [1]: Data Ingestion & Preprocessing</span>
            </div>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              Completed during day
            </span>
          </div>
          <div className="bg-stone-900 text-stone-100 p-2.5 rounded-lg text-[11px] leading-relaxed overflow-x-auto">
            <code>
              import pandas as pd{'\n'}
              import numpy as np{'\n'}
              from sklearn.model_selection import train_test_split{'\n'}
              from sklearn.ensemble import RandomForestClassifier{'\n'}
              df = pd.read_csv('telecom_churn_data.csv')
            </code>
          </div>
        </div>

        {/* Cell 7: Model Evaluation (Synthesized by Daemon) */}
        <div className={`p-3 transition-colors ${isCompleted ? 'bg-emerald-50/30' : 'bg-stone-50/20'}`}>
          <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1.5 font-sans">
            <div className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold text-stone-800">
                In [7]: Metrics, ROC-AUC & Classification Report
              </span>
            </div>
            <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
              {isCompleted ? 'Daemon Synthesized & Run' : 'Pending Daemon Resolution'}
            </span>
          </div>
          <div className="bg-stone-900 text-stone-100 p-2.5 rounded-lg text-[11px] leading-relaxed overflow-x-auto">
            <code>
              {isCompleted ? (
                `from sklearn.metrics import classification_report, roc_auc_score\n` +
                `y_pred = clf.predict(X_test)\n` +
                `y_proba = clf.predict_proba(X_test)[:, 1]\n` +
                `print("ROC-AUC Score:", round(roc_auc_score(y_test, y_proba), 4))\n` +
                `print(classification_report(y_test, y_pred, target_names=['Retained', 'Churned']))`
              ) : (
                `# Left incomplete by user at 16:50 PM\n# [Daemon will compute y_pred, roc_auc, and classification report]`
              )}
            </code>
          </div>

          {isCompleted && (
            <div className="mt-2 bg-stone-950 text-emerald-300 p-2 rounded-lg text-[10px] leading-snug border border-stone-800">
              <p className="text-stone-400 font-sans text-[9px] uppercase tracking-wider mb-1">Out [7]:</p>
              ROC-AUC Score: 0.9142<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;precision&nbsp;&nbsp;&nbsp;&nbsp;recall&nbsp;&nbsp;f1-score&nbsp;&nbsp;&nbsp;support<br />
              &nbsp;&nbsp;&nbsp;&nbsp;Retained&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.94&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.96&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.95&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1420<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Churned&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.86&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.81&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.83&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;260<br />
              &nbsp;&nbsp;&nbsp;&nbsp;accuracy&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.93&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1680
            </div>
          )}
        </div>

        {/* Cell 8: Feature Importance (Synthesized by Daemon) */}
        <div className={`p-3 transition-colors ${isCompleted ? 'bg-emerald-50/30' : 'bg-stone-50/20'}`}>
          <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1.5 font-sans">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold text-stone-800">
                In [8]: Feature Importances & Visual Ranking
              </span>
            </div>
            <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
              {isCompleted ? 'Daemon Synthesized & Run' : 'Pending Daemon Resolution'}
            </span>
          </div>
          <div className="bg-stone-900 text-stone-100 p-2.5 rounded-lg text-[11px] leading-relaxed overflow-x-auto">
            <code>
              {isCompleted ? (
                `import matplotlib.pyplot as plt\n` +
                `import seaborn as sns\n` +
                `importances = pd.Series(clf.feature_importances_, index=X.columns).sort_values(ascending=False)\n` +
                `plt.figure(figsize=(7, 3))\n` +
                `sns.barplot(x=importances.head(6), y=importances.head(6).index, palette='viridis')\n` +
                `plt.title('Top Churn Risk Predictors')\n` +
                `plt.tight_layout()`
              ) : (
                `# [Daemon will extract clf.feature_importances_ and build seaborn chart]`
              )}
            </code>
          </div>

          {isCompleted && (
            <div className="mt-2 bg-stone-950 p-2.5 rounded-lg text-[10px] border border-stone-800 space-y-1 font-sans">
              <p className="text-stone-400 text-[9px] uppercase tracking-wider font-mono">Out [8]: Generated Feature Ranking</p>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-stone-300">1. customer_support_calls</span>
                  <span className="text-emerald-400 font-bold">34.8% weight</span>
                </div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[34.8%]" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-stone-300">2. contract_type_month_to_month</span>
                  <span className="text-emerald-400 font-bold">28.2% weight</span>
                </div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[28.2%]" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-stone-300">3. tenure_months</span>
                  <span className="text-emerald-400 font-bold">18.5% weight</span>
                </div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[18.5%]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cell 9: Markdown Executive Conclusion (Synthesized by Daemon) */}
        <div className={`p-3 font-sans text-xs ${isCompleted ? 'bg-indigo-50/40' : 'bg-stone-50/10'}`}>
          <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1.5">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-semibold text-stone-800">
                Cell [9]: Markdown Executive Findings & Recommendations
              </span>
            </div>
            <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
              {isCompleted ? 'Daemon Synthesized' : 'Pending Closure'}
            </span>
          </div>

          <div className="p-3 bg-white border border-stone-200 rounded-lg space-y-2 text-stone-800 leading-relaxed text-[11px]">
            {isCompleted ? (
              <>
                <h4 className="font-bold text-stone-900 text-xs">### Executive Synthesis & Retention Playbook</h4>
                <p>
                  <strong>Key Finding:</strong> Accounts making &ge; 4 support calls within 60 days on month-to-month contracts exhibit an <strong>82% churn probability</strong> within 30 days.
                </p>
                <div className="bg-stone-50 p-2 rounded border border-stone-100 space-y-1 text-stone-700">
                  <p className="font-semibold text-stone-900">Recommended Pre-Bedtime Sign-off Actions:</p>
                  <p>1. Trigger automated Customer Success outreach upon 3rd unresolved ticket.</p>
                  <p>2. Offer annual discount incentives to month-to-month users at month 3.</p>
                  <p>3. Model committed to <code>Google Drive: /ML_Models/2026/churn_analysis.ipynb</code>.</p>
                </div>
              </>
            ) : (
              <p className="text-stone-400 italic">
                Awaiting Daemon Pre-Sleep sweep to synthesize conclusions, interpret metrics, and write actionable takeaways.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
