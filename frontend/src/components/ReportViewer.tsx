import React, { useState } from "react";
import type { SwarmResult } from "../types";
import { FileText, KeyRound, ExternalLink, CheckCircle2, TrendingUp, Globe, AlertTriangle, ShieldCheck, Copy, Check } from "lucide-react";

interface ReportViewerProps {
  result: SwarmResult;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<"report" | "crypto">("report");
  const [copied, setCopied] = useState(false);

  const copyTaskId = () => {
    navigator.clipboard.writeText(result.taskId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const report = result.finalReport;
  const searchAgent = result.subAgents.find((a) => a.name.includes("Search"));
  const financeAgent = result.subAgents.find((a) => a.name.includes("Financial"));

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Verified Delivery & Settled
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Task #{result.taskId.slice(0, 10)}...
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100">{report.title}</h2>
        </div>

        {/* Tab Switcher between Report and Cryptographic Proofs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("report")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "report"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Executive Report
          </button>
          <button
            onClick={() => setActiveTab("crypto")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "crypto"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            Cryptographic Receipts (3)
          </button>
        </div>
      </div>

      {activeTab === "report" ? (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <h4 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              Executive Summary
            </h4>
            <p className="text-slate-200 text-sm leading-relaxed">
              {report.executiveSummary}
            </p>
          </div>

          {/* Key Strategic Takeaways */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-3">
              Strategic Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.keyTakeaways.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown (from Financial Agent) */}
          {financeAgent && financeAgent.data?.metrics && (
            <div>
              <h4 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                Live Financial Valuation Matrix (Arc-Financial-Agent)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {Object.entries(financeAgent.data.metrics).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center"
                  >
                    <div className="text-[10px] text-slate-400 capitalize truncate mb-1">
                      {key.replace(/([A-Z])/g, " $1")}
                    </div>
                    <div className="text-xs font-bold font-mono text-emerald-400">
                      {String(val)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cited Web Sources (from Search Agent) */}
          {searchAgent && searchAgent.data?.sources && (
            <div>
              <h4 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                Cited Web Intelligence (Arc-Search-Agent)
              </h4>
              <div className="space-y-2">
                {searchAgent.data.sources.map((src: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-start justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 mb-0.5">
                        {src.title}
                      </div>
                      <div className="text-slate-400 text-[11px] leading-relaxed">
                        {src.snippet}
                      </div>
                    </div>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0 text-[11px] font-mono"
                    >
                      Source
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Factors & Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30">
              <h5 className="text-xs uppercase font-semibold text-rose-400 tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                Identified Risk Factors
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {report.riskFactors.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex flex-col justify-between">
              <div>
                <h5 className="text-xs uppercase font-semibold text-emerald-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Synthesis Assessment
                </h5>
                <p className="text-xs text-slate-300 font-mono">
                  {report.recommendation}
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-emerald-900/30 text-[10px] text-slate-500 font-mono">
                Generated: {new Date(report.generatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Cryptographic Proof-of-Execution Tab */
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Each sub-agent signs an EIP-712 structured data receipt containing its assigned task ID, output content hash, and fee in native USDC. The smart contract validates these cryptographic signatures on Arc before disbursing payment.
          </p>

          <div className="space-y-3">
            {result.subAgents.map((sub, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 font-mono text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-200 font-sans">
                    {sub.name}
                  </span>
                  <span className="text-cyan-400 font-bold">
                    Fee: {sub.fee}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>
                    <span className="text-slate-500 block">Agent Address:</span>
                    <span className="text-slate-300 break-all">{sub.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Result Keccak256 Hash:</span>
                    <span className="text-emerald-400 break-all">{sub.receipt.resultHash}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px]">
                  <span className="text-slate-500 block mb-0.5">EIP-712 ECDSA Signature:</span>
                  <div className="p-2 rounded bg-slate-900 text-amber-300/90 break-all border border-slate-800 text-[10px]">
                    {sub.receipt.signature}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-cyan-200">
                All 3 signatures cryptographically verified against AgentRegistry on Arc Mainnet
              </span>
            </div>
            <button
              onClick={copyTaskId}
              className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy TaskID"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
