export interface AgentInfo {
  id: string;
  name: string;
  serviceType: string;
  category: string;
  feeUSDC: string;
  address: string;
  reliability: string;
  totalJobs: number;
  volumeUSDC: string;
  description: string;
  active: boolean;
}

export interface TaskReceipt {
  agent: string;
  taskId: string;
  resultHash: string;
  fee: string;
  timestamp: number;
  signature: string;
}

export interface SubAgentExecution {
  name: string;
  address: string;
  fee: string;
  receipt: TaskReceipt;
  data: any;
}

export interface ExecutionStep {
  step: string;
  agent: string;
  address: string;
  feeUSDC: string;
  status: "idle" | "running" | "signed" | "settled";
  signature?: string;
}

export interface SwarmResult {
  taskId: string;
  query: string;
  targetEntity: string;
  totalCostUSDC: string;
  orchestratorFeeUSDC: string;
  txHash: string;
  blockNumber: number;
  explorerUrl: string;
  executionLog: ExecutionStep[];
  subAgents: SubAgentExecution[];
  finalReport: {
    title: string;
    executiveSummary: string;
    keyTakeaways: string[];
    metrics?: Record<string, string>;
    sources?: Array<{ title: string; snippet: string; url: string }>;
    riskFactors: string[];
    recommendation: string;
    generatedAt: string;
  };
}
