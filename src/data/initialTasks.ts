import { IncompleteTask } from '../types';
import { buildTaskMasterCombineTelemetry } from '../utils/masterCombine';

const RAW_INITIAL_TASKS: IncompleteTask[] = [
  {
    id: 'trail-101',
    title: 'Q3 Stakeholder Update & Delivery Timeline',
    category: 'email',
    sourceTrail: 'Gmail Drafts • Active tab left at 15:42 PM',
    currentProgress: 75,
    serviceId: 'gmail',
    emailAccountId: 'email-gmail-primary',
    predefinedActions: [
      {
        id: 'act-101-1',
        serviceId: 'gmail',
        name: 'Dispatch from krissmgusa@gmail.com',
        description: 'Send finalized email directly to stakeholder distribution list.',
        iconName: 'Send',
        targetEntity: 'Draft #d-8820 (Gmail: krissmgusa@gmail.com)',
        status: 'pending',
      },
      {
        id: 'act-101-2',
        serviceId: 'google_drive',
        name: 'Sync to Google Drive /Stakeholders/',
        description: 'Store PDF/Markdown copy of finalized email in Drive archive.',
        iconName: 'HardDrive',
        targetEntity: 'Drive: /Q3_Stakeholders/Updates/',
        status: 'pending',
      },
    ],
    originalContent: `Hi Team & Stakeholders,

Quick update on the Q3 milestone deliverables. We completed the migration to the new auth cluster on Tuesday with zero downtime. The frontend latency dropped by 18%.

The billing pipeline refactor is mostly done, but we ran into an edge case with multi-currency webhooks. We're addressing it.

[TODO: add timeline impact, mitigation plan for Europe region, and wrap up with next milestone date]`,
    userNotes: 'Keep the tone reassuring but transparent about Europe launch delay of 3 days. Send from my primary Gmail.',
    detectedAt: 'Today, 15:42',
    status: 'pending',
  },
  {
    id: 'trail-106',
    title: 'Customer Churn & Retention Analysis (churn_analysis.ipynb)',
    category: 'notebook',
    sourceTrail: 'JupyterLab / Colab • Kernel active on Localhost:8888',
    currentProgress: 45,
    serviceId: 'jupyter',
    emailAccountId: 'email-research-labs',
    notebookData: {
      kernel: 'Python 3.11 (ipykernel)',
      notebookType: 'jupyter',
      totalCells: 12,
      completedCells: 6,
      missingSections: [
        'Cell [7]: Model evaluation (ROC-AUC, Precision-Recall & F1 Score)',
        'Cell [8]: Feature importance ranking with SHAP / tree weights',
        'Cell [9]: Actionable Markdown conclusion for product leadership',
      ],
      cells: [
        {
          cellType: 'markdown',
          content: '# Customer Churn Risk Modeling\nObjective: Identify high-risk accounts prior to month-end contract renewal.',
          status: 'original',
        },
        {
          cellType: 'code',
          executionCount: 1,
          content: `import pandas as pd\nimport numpy as np\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report\n\ndf = pd.read_csv('telecom_churn_data.csv')\nX = df.drop(['churn', 'customer_id'], axis=1)\ny = df['churn']\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nclf = RandomForestClassifier(n_estimators=100, random_state=42)\nclf.fit(X_train, y_train)`,
          status: 'original',
          output: 'RandomForestClassifier(random_state=42) fitted on 8,400 samples.',
        },
        {
          cellType: 'markdown',
          content: '## Model Evaluation\n[Left unfinished: Need confusion matrix, precision/recall curves, and feature importance chart]',
          status: 'original',
        },
      ],
    },
    predefinedActions: [
      {
        id: 'act-106-1',
        serviceId: 'jupyter',
        name: 'Synthesize & Run Missing Cells [7-10]',
        description: 'Fills evaluation code cells, runs metrics computation, and generates charts.',
        iconName: 'BookOpen',
        targetEntity: 'Notebook: notebooks/churn_analysis.ipynb',
        status: 'pending',
      },
      {
        id: 'act-106-2',
        serviceId: 'google_drive',
        name: 'Commit Completed .ipynb to Google Drive',
        description: 'Exports finalized notebook file to shared ML team drive.',
        iconName: 'HardDrive',
        targetEntity: 'Google Drive: /ML_Models/2026/Notebooks/',
        status: 'pending',
      },
    ],
    originalContent: `# Cell [1-6] completed: Data cleaned, encoded, and RandomForest model fitted.
# Pending:
# In Cell [7]: Compute y_pred, y_proba, roc_auc_score, and print classification_report.
# In Cell [8]: Extract clf.feature_importances_, sort top 8 features, and plot horizontal barh chart.
# In Cell [9]: Markdown cell explaining why 'customer_support_calls' and 'contract_type_month_to_month' dominate churn risk, with recommendations.`,
    userNotes: 'Ensure standard matplotlib/seaborn formatting. Conclude with 3 concrete retention strategies.',
    detectedAt: 'Today, 16:50',
    status: 'pending',
  },
  {
    id: 'trail-107',
    title: 'Trello Card #84: S3 Lifecycle & Glacier Instant Retrieval Rule',
    category: 'code',
    sourceTrail: 'Trello API • Card "AWS Storage Tiering" in Sprint 42',
    currentProgress: 65,
    serviceId: 'trello',
    emailAccountId: 'email-work-solutions',
    predefinedActions: [
      {
        id: 'act-107-1',
        serviceId: 'trello',
        name: 'Move Card to "Done / Closed"',
        description: 'Moves Trello card #84 into the Done column on Sprint 42 board.',
        iconName: 'Trello',
        targetEntity: 'Trello Board: "Infrastructure Sprint 42" • List: Done',
        status: 'pending',
      },
      {
        id: 'act-107-2',
        serviceId: 'trello',
        name: 'Check Off All 4 Checklist Items',
        description: 'Marks Terraform verification and cost estimate checklist complete.',
        iconName: 'CheckSquare',
        targetEntity: 'Trello Checklist: "Acceptance Criteria"',
        status: 'pending',
      },
    ],
    originalContent: `# Trello Card Description:
Implement Terraform configuration to transition objects in s3://acme-analytics-logs/ to GLACIER_IR after 30 days, and expire objects after 365 days.

Current incomplete code snippet:
resource "aws_s3_bucket_lifecycle_configuration" "analytics_lifecycle" {
  bucket = aws_s3_bucket.analytics_logs.id

  rule {
    id     = "archive-and-expire"
    status = "Enabled"

    # [Need transition block to GLACIER_IR at 30 days]
    # [Need expiration block at 365 days]
    # [Need abort incomplete multipart upload block after 7 days]
  }
}
# Need cost savings summary calculation: ~68% cost reduction on 14TB logs.`,
    userNotes: 'Make sure standard Terraform syntax is valid and include the checklist sign-off.',
    detectedAt: 'Today, 14:20',
    status: 'pending',
  },
  {
    id: 'trail-104',
    title: 'Asana Task: Customer Incident Post-Mortem Reply to Enterprise Client',
    category: 'communication',
    sourceTrail: 'Asana • Task in "Enterprise Onboarding & SRE" (Assigned to Kris)',
    currentProgress: 80,
    serviceId: 'asana',
    emailAccountId: 'email-work-solutions',
    predefinedActions: [
      {
        id: 'act-104-1',
        serviceId: 'asana',
        name: 'Mark Task Complete in Asana',
        description: 'Closes out the Asana task and registers completion before sleep.',
        iconName: 'CheckSquare',
        targetEntity: 'Asana Project: SRE Onboarding • Task #9021',
        status: 'pending',
      },
      {
        id: 'act-104-2',
        serviceId: 'gmail',
        name: 'Dispatch from kris.solutions@acmecloud.io',
        description: 'Sends formal customer post-mortem email to Marcus & enterprise team.',
        iconName: 'Send',
        targetEntity: 'Work Email: kris.solutions@acmecloud.io',
        status: 'pending',
      },
    ],
    originalContent: `Hi Marcus,

Following up on our call regarding the 12-minute outage earlier today.

Root cause was a memory leak in the Redis cache eviction daemon triggered by the 2.4.1 hotfix. The faulty pod was rolled back at 13:48 UTC, and all database health checks returned to green at 13:52 UTC.

No customer data or transaction records were corrupted.

[Need to paste the preventative SLA credit policy and the 3 action items we are taking so this doesn't repeat]`,
    userNotes: 'Reference the 99.95% uptime SLA credit calculation and pledge post-mortem report by Friday. Dispatch from my work email.',
    detectedAt: 'Today, 17:10',
    status: 'pending',
  },
  {
    id: 'trail-103',
    title: 'Team Offsite 2-Day Agenda & Budget Breakdown',
    category: 'document',
    sourceTrail: 'Google Docs & Drive • Doc "Offsite_Q4_Plan" blurred at 14:05 PM',
    currentProgress: 60,
    serviceId: 'google_drive',
    emailAccountId: 'email-gmail-primary',
    predefinedActions: [
      {
        id: 'act-103-1',
        serviceId: 'google_drive',
        name: 'Commit Final Version to Google Doc',
        description: 'Replaces draft with full Day 2 agenda and finalized line-item budget table.',
        iconName: 'HardDrive',
        targetEntity: 'Google Docs: "Offsite_Q4_Plan.gdoc"',
        status: 'pending',
      },
      {
        id: 'act-103-2',
        serviceId: 'dropbox',
        name: 'Sync PDF Export to Dropbox /Planning/',
        description: 'Creates printable PDF backup in Dropbox team folder.',
        iconName: 'Cloud',
        targetEntity: 'Dropbox: /Events/Offsite_Q4_Final.pdf',
        status: 'pending',
      },
    ],
    originalContent: `Team Strategy Offsite (Oct 24-25)
Location: Half Moon Bay Conference Center
Attendees: 14 engineers, 2 PMs, 1 Designer

Day 1:
- 09:00 AM: Breakfast & Welcome
- 10:00 AM: 2027 Vision Architecture Review
- 12:30 PM: Lunch
- 02:00 PM: Breakout sessions (API redesign vs. Performance)
- 05:00 PM: Group dinner at Coastal Grill

Day 2:
[Left empty - need team building activity, hackathon demo session, retrospective, and departure logistics]

Budget estimate so far:
- Venue: $3,200
- Catering: ~$1,800
[Need remaining line items & total with 10% buffer under $7,500]`,
    userNotes: 'Target under $7,500 total. Need energizing hack session and clear closing circle.',
    detectedAt: 'Today, 14:05',
    status: 'pending',
  },
  {
    id: 'trail-105',
    title: 'Travel & Client Dinner Expense Filing (Outlook: kris_personal@outlook.com)',
    category: 'finance',
    sourceTrail: 'Outlook & Concur • Receipt email draft unsent at 12:30 PM',
    currentProgress: 35,
    serviceId: 'outlook',
    emailAccountId: 'email-outlook-personal',
    predefinedActions: [
      {
        id: 'act-105-1',
        serviceId: 'outlook',
        name: 'Send via kris_personal@outlook.com',
        description: 'Submits finalized reimbursement form to accounting@corp.com.',
        iconName: 'Send',
        targetEntity: 'Outlook: kris_personal@outlook.com',
        status: 'pending',
      },
      {
        id: 'act-105-2',
        serviceId: 'dropbox',
        name: 'Archive Itemized Receipts in Dropbox',
        description: 'Stores itemized ledger and tax breakdown in /Expenses_2026/.',
        iconName: 'Cloud',
        targetEntity: 'Dropbox: /Taxes_Expenses/2026_Q3_Trip.pdf',
        status: 'pending',
      },
    ],
    originalContent: `Receipts logged:
1. Oct 12: Delta Airlines SFO->JFK - $482.40 (Flight to client workshop)
2. Oct 13: The Modern NYC - $314.50 (Dinner with Acme Corp VP Engineering + 2 leads)
3. Oct 14: Uber to JFK - $78.20

Missing:
- Cost center code & department tagging
- Business justification write-up for dinner exceeding $100/head threshold
- Total aggregation and signature statement`,
    userNotes: 'Cost center is ENG-402 (Solutions Engineering). Dinner covered contract renewal negotiation. Send from my Outlook account.',
    detectedAt: 'Today, 12:30',
    status: 'pending',
  },
];

export const INITIAL_TASKS: IncompleteTask[] = RAW_INITIAL_TASKS.map((task) => ({
  ...task,
  masterCombine: task.masterCombine || buildTaskMasterCombineTelemetry(task, task.status === 'completed' ? 'complete' : 'sail'),
}));

