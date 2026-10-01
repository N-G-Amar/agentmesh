import React, { useState } from "react";
import type { AgentInfo } from "../types";
import { ShieldCheck, Plus, ExternalLink } from "lucide-react";

interface AgentRegistryViewProps {
  agents: AgentInfo[];
  onRegisterAgent: (agent: Partial<AgentInfo>) => void;
}

export const AgentRegistryView: React.FC<AgentRegistryViewProps> = ({ agents, onRegisterAgent }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState("web-search");
  const [feeUSDC, setFeeUSDC] = useState("0.005");
  const [address, setAddress] = useState("");
  const [endpoint, setEndpoint] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    onRegisterAgent({
      id: `agent-${Date.now()}`,
      name,
      serviceType,
      category: serviceType === "web-search" ? "Intelligence" : serviceType === "financial-metrics" ? "Market Data" : "Reasoning",
      feeUSDC,
      address,
      reliability: "100%",
      totalJobs: 0,
      volumeUSDC: "0.00",
      description: endpoint ? `Endpoint: ${endpoint}` : `Autonomous ${serviceType} microservice registered on Arc L1.`,
      active: true,
    });
    setShowModal(false);
    setName("");
    setAddress("");
    setEndpoint("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="text-xs uppercase font-semibold text-cyan-400 tracking-wider">
              Decentralized Service Directory
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">On-Chain Agent Registry</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Autonomous AI agents query this on-chain directory to discover, evaluate, and hire specialized peers. All reputation metrics (jobs completed, volume in USDC) are updated upon cryptographic verification.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          Register New Agent
        </button>
      </div>

      {/* Agents Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Agent Name & Endpoint</th>
              <th className="py-3.5 px-4">Service Category</th>
              <th className="py-3.5 px-4">Per-Call Fee</th>
              <th className="py-3.5 px-4">Reliability</th>
              <th className="py-3.5 px-4">Jobs Settled</th>
              <th className="py-3.5 px-4">Total Volume</th>
              <th className="py-3.5 px-4">Wallet Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {agents.map((a) => (
              <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    {a.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-xs">
                    {a.description}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300 font-mono text-[10px] border border-slate-700">
                    {a.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                  ${a.feeUSDC} <span className="text-[10px] text-slate-400">USDC</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-cyan-300">
                  {a.reliability}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-300">
                  {a.totalJobs.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-300">
                  ${a.volumeUSDC}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400">
                  <a
                    href={`https://explorer.arc.io/address/${a.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-cyan-400 flex items-center gap-1"
                  >
                    {a.address.slice(0, 6)}...{a.address.slice(-4)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Register AI Agent on Arc</h3>
            <p className="text-xs text-slate-400 mb-4">
              Registers your agent into <code>AgentRegistry.sol</code> on Arc Mainnet with pricing and payout credentials.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Agent Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arc-Code-Reviewer-V1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Service Category</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="web-search">Web Intelligence & Search</option>
                  <option value="financial-metrics">Financial Valuation & Metrics</option>
                  <option value="summarizer">Reasoning & Synthesis</option>
                  <option value="code-audit">Smart Contract Audit</option>
                  <option value="translation">Multilingual Translation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Per-Call Fee (USDC)</label>
                <input
                  type="text"
                  required
                  placeholder="0.005"
                  value={feeUSDC}
                  onChange={(e) => setFeeUSDC(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Payout EVM Wallet Address</label>
                <input
                  type="text"
                  required
                  placeholder="0x..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
