export type TaskCategory = 
  | 'email' 
  | 'code' 
  | 'document' 
  | 'finance' 
  | 'research' 
  | 'communication' 
  | 'admin'
  | 'notebook';

export type TaskStatus = 'pending' | 'resolving' | 'completed' | 'archived';

export type OnlineServiceId = 
  | 'gmail' 
  | 'outlook' 
  | 'trello' 
  | 'asana' 
  | 'google_drive' 
  | 'dropbox' 
  | 'jupyter' 
  | 'notion';

export interface UserEmailAccount {
  id: string;
  email: string;
  label: string;
  provider: 'gmail' | 'outlook' | 'custom';
  isPrimary: boolean;
  unreadDraftsCount?: number;
  avatarColor?: string;
  signature?: string;
  taskCount?: number;
}

export interface PredefinedServiceAction {
  id: string;
  serviceId: OnlineServiceId;
  name: string;
  description: string;
  iconName: string;
  targetEntity: string;
  executedAt?: string;
  executionReceipt?: string;
  status?: 'pending' | 'executing' | 'executed' | 'failed';
}

export interface NotebookCell {
  cellType: 'code' | 'markdown';
  content: string;
  status: 'original' | 'daemon_completed';
  executionCount?: number | null;
  output?: string;
}

export interface NotebookData {
  kernel: string;
  notebookType: 'jupyter' | 'colab' | 'deepnote';
  totalCells: number;
  completedCells: number;
  cells?: NotebookCell[];
  missingSections: string[];
}

export interface IncompleteTask {
  id: string;
  title: string;
  category: TaskCategory;
  sourceTrail: string;
  currentProgress: number; // 1 to 99
  originalContent: string;
  userNotes?: string;
  detectedAt: string;
  status: TaskStatus;
  
  // Associated service & account
  serviceId?: OnlineServiceId;
  emailAccountId?: string; // associated user email account ID
  predefinedActions?: PredefinedServiceAction[];
  
  // Notebook specific metadata
  notebookData?: NotebookData;

  // Populated when daemon finishes the task to 100%
  completedContent?: string;
  missingPartsIdentified?: string[];
  completionSummary?: string;
  daemonActionsTaken?: string[];
  diffHighlights?: string;
  completedAt?: string;
  approvedBySleepSweep?: boolean;

  // Master Combine Pipeline Telemetry (S.A.I.L > ABIDE > AZRAEL > A.A.A. > Arc of Change)
  masterCombine?: TaskMasterCombineTelemetry;
}

export type MasterCombineStage = 'sail' | 'abide' | 'azrael' | 'aaa' | 'arc_of_change' | 'complete';

export interface SailTelemetry {
  stage: 'sail';
  name: 'S.A.I.L';
  subtitle: 'Sensor Acquisition & Ingestion Loop';
  status: 'passed' | 'active' | 'pending';
  sensorDomain: string;
  ingestionEntropy: number;
  startingProgress: number;
  timestamp: string;
  identifiedContext: string;
}

export interface AbideTelemetry {
  stage: 'abide';
  name: 'ABIDE';
  subtitle: 'Automated Boundary, Intent & Dependency Engine';
  status: 'passed' | 'active' | 'pending';
  intentPreserved: boolean;
  boundaryRule: string;
  toneFidelityScore: number;
  guardrailsPassed: string[];
}

export interface AzraelTelemetry {
  stage: 'azrael';
  name: 'AZRAEL';
  subtitle: 'Automated Zero-Residual Action & Execution Layer';
  status: 'passed' | 'active' | 'pending';
  executionStatus: 'loop_terminated' | 'active' | 'pending';
  residualOpenLoopsKilled: number;
  missingDeltaSynthesized: string;
  executionVelocityMs: number;
}

export interface AaaTelemetry {
  stage: 'aaa';
  name: 'A.A.A.';
  subtitle: 'Automated Audit, Archival & Attestation';
  status: 'passed' | 'active' | 'pending';
  attestationChecksum: string;
  archiveTarget: string;
  downstreamDispatches: string[];
  certifiedAt: string;
}

export interface ArcOfChangeTelemetry {
  stage: 'arc_of_change';
  name: 'Arc of Change';
  subtitle: 'Daylight Fragmentation ➔ Nocturnal Tranquility';
  status: 'passed' | 'active' | 'pending';
  dayStateEntropy: number;
  nightStatePeaceScore: number;
  tranquilityDeltaPct: number;
  cognitivePeaceVerdict: string;
}

export interface TaskMasterCombineTelemetry {
  currentStage: MasterCombineStage;
  sail: SailTelemetry;
  abide: AbideTelemetry;
  azrael: AzraelTelemetry;
  aaa: AaaTelemetry;
  arcOfChange: ArcOfChangeTelemetry;
  pipelineCompletedAt?: string;
}

export interface ConnectedService {
  id: OnlineServiceId;
  name: string;
  category: 'email' | 'project_management' | 'cloud_storage' | 'notebook';
  connected: boolean;
  activeAccountInfo: string;
  iconName: string;
  supportedActions: { id: string; name: string; description: string }[];
}

export interface DaemonConfig {
  bedtimeTarget: string; // "23:00"
  mode: 'autonomous' | 'supervised';
  soundEnabled: boolean;
  autoSweepEnabled: boolean;
  autoDispatchActions: boolean; // whether to automatically execute service actions upon 100% completion
  personaStyle: 'concise_professional' | 'thorough_executive' | 'casual_pragmatic';
}

export interface DaemonLog {
  id: string;
  timestamp: string;
  level: 'info' | 'daemon' | 'success' | 'warn' | 'error';
  message: string;
  taskId?: string;
  serviceId?: OnlineServiceId;
}

export interface DaemonStats {
  totalTracked: number;
  pendingCount: number;
  completedCount: number;
  avgStartingProgress: number;
  timeUntilBedtime: string;
  isReadyForSleep: boolean;
  actionsExecutedCount: number;
}

export interface ProductivityTrendItem {
  title: string;
  category: string;
  observation: string;
  impactType: 'high_positive' | 'steady' | 'optimization_area';
  impactLabel: string;
}

export interface CategoryBreakdownInsight {
  category: TaskCategory;
  categoryLabel: string;
  taskCount: number;
  avgStartingProgress: number;
  timeSavedMinutes: number;
  highlightAccomplishment: string;
}

export interface DailySummaryReport {
  id: string;
  generatedAt: string;
  date: string;
  headline: string;
  overallScore: number;
  scoreLabel: string;
  executiveSummary: string;
  cognitivePeaceIndex: {
    score: number;
    description: string;
    unresolvedLoopsCount: number;
  };
  metrics: {
    totalTasksResolved: number;
    pendingTasksRemaining: number;
    avgInitialProgress: number;
    totalGapFilledPct: number;
    estimatedHoursSaved: number;
    peakActivityDomain: string;
    servicesAutomatedCount: number;
  };
  productivityTrends: ProductivityTrendItem[];
  categoryBreakdown: CategoryBreakdownInsight[];
  tomorrowFocusRecommendations: string[];
}
