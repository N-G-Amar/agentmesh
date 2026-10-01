import React from "react";
import { CheckCircle2, Clock, Loader2, KeyRound, ArrowDown, GitBranch, ShieldCheck, ExternalLink } from "lucide-react";
import type { ExecutionStep, SwarmResult } from "../types";

interface CallTreeDAGProps {
  steps: ExecutionStep[];
  isExecuting: boolean;
  result: SwarmResult | null;
}

export const CallTreeDAG: React.FC<CallTreeDAGProps> = ({ steps, isExecuting: _isExecuting, result }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-cyan-400" />
          <h3 className="font-semibold text-slate-100 text-sm">
            Live Call-Tree Execution & Disbursement Graph (DAG)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            EIP-712 Proof-of-Execution Receipts
          </span>
        </div>
      </div>

      {/* DAG Visualization */}
      <div className="flex flex-col items-center gap-4">
        {/* Level 0: User Prompt & Budget Authorization */}
        <div className="w-full max-w-md p-3.5 rounded-xl border border-indigo-500/40 bg-indigo-950/20 text-center relative shadow-lg shadow-indigo-950/30">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-0.5">
            Root Invocation
          </div>
          <div className="text-xs font-semibold text-slate-100 truncate">
            {result?.query || "User Research Request"}
          </div>
          <div className="text-[11px] font-mono text-cyan-300 mt-1 font-medium">
            Budget Authorized: 0.040 USDC
          </div>
        </div>

        {/* Downward Connector */}
        <div className="flex flex-col items-center text-slate-600">
          <div className="h-4 w-px bg-gradient-to-b from-indigo-500 to-cyan-500"></div>
          <ArrowDown className="h-4 w-4 text-cyan-500 -mt-1" />
        </div>

        {/* Level 1: Research Orchestrator */}
        <div className="w-full max-w-md p-3 rounded-xl border border-slate-700 bg-slate-800/60 text-center relative">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Orchestrator Agent
            </span>
            <span className="text-[10px] text-amber-400 font-mono font-medium">
              Margin: 0.015 USDC
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-200 mt-1">
            Query Decomposed → On-Chain Agent Discovery & Coordination
          </div>
        </div>

        {/* Fan-Out Connectors */}
        <div className="w-full max-w-3xl flex justify-between px-16 text-slate-600 -my-1">
          <div className="h-5 w-px bg-slate-700"></div>
          <div className="h-5 w-px bg-slate-700"></div>
          <div className="h-5 w-px bg-slate-700"></div>
        </div>

        {/* Level 2: 3 Concurrent Sub-Agents */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((s, idx) => {
            const isDone = s.status === "signed" || s.status === "settled";
            const isRunning = s.status === "running";

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all duration-300 relative ${
                  isDone
                    ? "bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-500/5"
                    : isRunning
                    ? "bg-cyan-950/30 border-cyan-500/60 ring-1 ring-cyan-500/20 shadow-md shadow-cyan-500/10"
                    : "bg-slate-900/40 border-slate-800 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {s.step}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    ${s.feeUSDC}
                  </span>
                </div>

                <div className="font-semibold text-xs text-slate-200 mb-2 truncate">
                  {s.agent}
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : isRunning ? (
                      <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <span
                      className={
                        isDone
                          ? "text-emerald-400 font-medium"
                          : isRunning
                          ? "text-cyan-400 font-medium"
                          : "text-slate-500"
                      }
                    >
                      {isDone ? "EIP-712 Signed" : isRunning ? "Executing Task..." : "Standby"}
                    </span>
                  </div>

                  {s.signature && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1" title={s.signature}>
                      <KeyRound className="h-2.5 w-2.5 text-amber-400" />
                      {s.signature.slice(0, 8)}...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Fan-In Connectors */}
        <div className="w-full max-w-3xl flex justify-between px-16 text-slate-600 -my-1">
          <div className="h-5 w-px bg-slate-700"></div>
          <div className="h-5 w-px bg-slate-700"></div>
          <div className="h-5 w-px bg-slate-700"></div>
        </div>

        {/* Downward Connector to Router */}
        <div className="flex flex-col items-center text-slate-600">
          <div className="h-4 w-px bg-gradient-to-b from-cyan-500 to-emerald-500"></div>
          <ArrowDown className="h-4 w-4 text-emerald-500 -mt-1" />
        </div>

        {/* Level 3: Settlement Router on Arc */}
        <div
          className={`w-full max-w-md p-4 rounded-xl border text-center transition-all duration-300 ${
            result?.txHash
              ? "bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
              : "bg-slate-900/60 border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              AgentMeshRouter.sol (Arc Mainnet)
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-200">
              Total Settled: 0.040 USDC
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-1 text-left">
            Atomic verification of 3 sub-agent ECDSA signatures + batch USDC split in 1 single transaction (~780ms).
          </p>

          {result?.txHash && (
            <div className="mt-3 pt-2.5 border-t border-emerald-800/40 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Confirmed on Arc L1
              </div>
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono font-medium underline underline-offset-2"
              >
                View on Arc Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
