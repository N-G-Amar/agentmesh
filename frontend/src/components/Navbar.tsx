import React from "react";
import { Cpu, ShieldCheck, Zap, Activity } from "lucide-react";

interface NavbarProps {
  activeTab: "studio" | "registry" | "architecture";
  setActiveTab: (tab: "studio" | "registry" | "architecture") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="h-full w-full bg-slate-950 rounded-xl flex items-center justify-center">
              <Cpu className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                AgentMesh
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                Arc Mainnet
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">
              Autonomous Agent Call-Tree & USDC Settlement Protocol
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "studio"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Swarm Studio
          </button>
          <button
            onClick={() => setActiveTab("registry")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "registry"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Agent Registry
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "architecture"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Arc Economics
          </button>
        </nav>

        {/* Network telemetry */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-emerald-400 font-semibold">Chain 5042</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[11px]">~780ms block</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 text-[11px] font-medium">USDC Gas</span>
          </div>
        </div>
      </div>
    </header>
  );
};
