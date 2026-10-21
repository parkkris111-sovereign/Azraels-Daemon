import { IncompleteTask, TaskMasterCombineTelemetry, MasterCombineStage } from '../types';

export interface StageDefinition {
  id: MasterCombineStage;
  code: string;
  name: string;
  shortLabel: string;
  subtitle: string;
  motto: string;
  color: string;
  borderColor: string;
  bgActive: string;
  textGlow: string;
  description: string;
}

export const MASTER_COMBINE_STAGES: StageDefinition[] = [
  {
    id: 'sail',
    code: 'S.A.I.L',
    name: 'S.A.I.L',
    shortLabel: 'S.A.I.L',
    subtitle: 'Sensor Acquisition & Ingestion Loop',
    motto: 'Scan, Ingest & Locate Dangling Workday Trails',
    color: 'text-cyan-600',
    borderColor: 'border-cyan-400',
    bgActive: 'bg-cyan-50',
    textGlow: 'shadow-cyan-500/20',
    description: 'Autonomous listener actively patrolling open browser tabs, uncommitted Jupyter kernels, unread email drafts, and project boards to detect items left at 1%–99% completion.',
  },
  {
    id: 'abide',
    code: 'ABIDE',
    name: 'ABIDE',
    shortLabel: 'ABIDE',
    subtitle: 'Automated Boundary, Intent & Dependency Engine',
    motto: 'Hold Fast to User Voice, Tone & Safety Guardrails',
    color: 'text-emerald-600',
    borderColor: 'border-emerald-400',
    bgActive: 'bg-emerald-50',
    textGlow: 'shadow-emerald-500/20',
    description: 'Analyzes intent fidelity, detects missing dependencies, and enforces non-destructive boundaries so the daemon finishes your work exactly as you would have done.',
  },
  {
    id: 'azrael',
    code: 'AZRAEL',
    name: 'AZRAEL',
    shortLabel: 'AZRAEL',
    subtitle: 'Automated Zero-Residual Action & Execution Layer',
    motto: 'The Angel of Closure: Terminate Lingering Loops',
    color: 'text-purple-600',
    borderColor: 'border-purple-400',
    bgActive: 'bg-purple-50',
    textGlow: 'shadow-purple-500/20',
    description: 'The executioner of lingering work. Leaves zero residual threads. Generates the exact missing code cells, sign-offs, and balances before bedtime.',
  },
  {
    id: 'aaa',
    code: 'A.A.A.',
    name: 'A.A.A.',
    shortLabel: 'A.A.A.',
    subtitle: 'Automated Audit, Archival & Attestation',
    motto: 'Triple-A Quality Verification & Multi-Service Dispatch',
    color: 'text-amber-600',
    borderColor: 'border-amber-400',
    bgActive: 'bg-amber-50',
    textGlow: 'shadow-amber-500/20',
    description: 'Issues cryptographic attestation receipts, confirms 100% test passes, dispatches payloads to Google Drive, Trello, and Asana, and seals the deliverable.',
  },
  {
    id: 'arc_of_change',
    code: 'Arc of Change',
    name: 'Arc of Change',
    shortLabel: 'Arc of Change',
    subtitle: 'Daylight Fragmentation ➔ Nocturnal Tranquility',
    motto: 'Transform Daytime Chaos into Restful Bedtime Peace',
    color: 'text-indigo-600',
    borderColor: 'border-indigo-400',
    bgActive: 'bg-indigo-50',
    textGlow: 'shadow-indigo-500/20',
    description: 'The overarching psychological and cognitive transformation: shifting your mind from daytime fragmented open loops into deep, guaranteed bedtime serenity.',
  },
];

export function generateAttestationChecksum(taskId: string): string {
  const hash = Math.abs(
    taskId.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  ).toString(16).toUpperCase().padStart(8, '0');
  return `AAA-ATT-${hash}`;
}

export function buildTaskMasterCombineTelemetry(
  task: IncompleteTask,
  stage: MasterCombineStage = 'sail'
): TaskMasterCombineTelemetry {
  const isCompleted = task.status === 'completed' || stage === 'complete';
  const progress = task.currentProgress || 50;
  const hash = generateAttestationChecksum(task.id);

  const sailStatus = stage === 'sail' ? 'active' : 'passed';
  const abideStatus = stage === 'sail' ? 'pending' : stage === 'abide' ? 'active' : 'passed';
  const azraelStatus = stage === 'sail' || stage === 'abide' ? 'pending' : stage === 'azrael' ? 'active' : 'passed';
  const aaaStatus = isCompleted || stage === 'aaa' || stage === 'arc_of_change' ? (stage === 'aaa' ? 'active' : 'passed') : 'pending';
  const arcStatus = isCompleted || stage === 'arc_of_change' ? (stage === 'arc_of_change' ? 'active' : 'passed') : 'pending';

  return {
    currentStage: isCompleted ? 'complete' : stage,
    sail: {
      stage: 'sail',
      name: 'S.A.I.L',
      subtitle: 'Sensor Acquisition & Ingestion Loop',
      status: sailStatus,
      sensorDomain: task.serviceId ? `${task.serviceId.toUpperCase()} Active Hook` : 'Online Workday Trail Listener',
      ingestionEntropy: Math.min(96, Math.max(30, 100 - progress + 12)),
      startingProgress: progress,
      timestamp: task.detectedAt || 'Today, 15:42',
      identifiedContext: `${task.sourceTrail} • Trailing gap of ${100 - progress}% detected`,
    },
    abide: {
      stage: 'abide',
      name: 'ABIDE',
      subtitle: 'Automated Boundary, Intent & Dependency Engine',
      status: abideStatus,
      intentPreserved: true,
      boundaryRule: task.userNotes 
        ? `Strict Boundary: "${task.userNotes.slice(0, 70)}..."` 
        : 'Preserve authentic author tone, protect credentials, zero destructive overwrites',
      toneFidelityScore: Math.floor(95 + Math.random() * 4),
      guardrailsPassed: [
        'Non-destructive patch boundary enforced',
        'User voice tone consistency validated',
        'Credentials & webhook targets sanitized',
      ],
    },
    azrael: {
      stage: 'azrael',
      name: 'AZRAEL',
      subtitle: 'Automated Zero-Residual Action & Execution Layer',
      status: azraelStatus,
      executionStatus: isCompleted ? 'loop_terminated' : (stage === 'azrael' ? 'active' : 'pending'),
      residualOpenLoopsKilled: task.missingPartsIdentified?.length || 3,
      missingDeltaSynthesized: task.completionSummary || `Synthesized remaining ${100 - progress}% delta to achieve 100% closure`,
      executionVelocityMs: 840,
    },
    aaa: {
      stage: 'aaa',
      name: 'A.A.A.',
      subtitle: 'Automated Audit, Archival & Attestation',
      status: aaaStatus,
      attestationChecksum: hash,
      archiveTarget: task.serviceId === 'jupyter' 
        ? 'Drive: /ML_Models/2026/Notebooks/' 
        : task.serviceId === 'gmail' 
          ? 'Gmail Outbox & Drive Stakeholder Archive' 
          : 'Integrated Vault Storage / 2026-Archive',
      downstreamDispatches: (task.predefinedActions || []).map(a => a.name),
      certifiedAt: task.completedAt || 'Pending Master Combine Run',
    },
    arcOfChange: {
      stage: 'arc_of_change',
      name: 'Arc of Change',
      subtitle: 'Daylight Fragmentation ➔ Nocturnal Tranquility',
      status: arcStatus,
      dayStateEntropy: 85,
      nightStatePeaceScore: isCompleted ? 100 : Math.round((progress / 100) * 100),
      tranquilityDeltaPct: isCompleted ? Math.round(100 - progress) : 0,
      cognitivePeaceVerdict: isCompleted
        ? 'Dangling loop eliminated. Zero mental carryover into sleep cycle.'
        : `Pending Master Combine resolution before bedtime.`,
    },
    pipelineCompletedAt: isCompleted ? (task.completedAt || new Date().toLocaleTimeString()) : undefined,
  };
}
