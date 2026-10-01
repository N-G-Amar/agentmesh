import React from "react";
import { Wallet, ArrowUpRight, Shield } from "lucide-react";

interface WalletHUDProps {
  balances: {
    orchestrator: string;
    search: string;
    finance: string;
    synthesis: string;
  };
  isSettling: boolean;
}

export const WalletHUD: React.FC<WalletHUDProps> = ({ balances, isSettling }) => {
  const cards = [
    {
      role: "Orchestrator Agent",
      name: "Research Director",
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      balance: balances.orchestrator,
      margin: "+0.015 USDC margin",
      color: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400",
      accent: "bg-indigo-500/20 text-indigo-300",
    },
    {
      role: "Sub-Agent 1",
      name: "Arc-Search-Agent",
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      balance: balances.search,
      margin: "0.005 USDC/call",
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
      accent: "bg-cyan-500/20 text-cyan-300",
    },
    {
      role: "Sub-Agent 2",
      name: "Arc-Financial-Agent",
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      balance: balances.finance,
      margin: "0.010 USDC/call",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
      accent: "bg-emerald-500/20 text-emerald-300",
    },
    {
      role: "Sub-Agent 3",
      name: "Arc-Synthesis-Agent",
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      balance: balances.synthesis,
      margin: "0.010 USDC/call",
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
      accent: "bg-amber-500/20 text-amber-300",
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Autonomous Agent Treasury & Wallet Balances (Arc Mainnet)
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
          <Shield className="h-3 w-3 text-emerald-400" />
          Native USDC Gas & Value Settlement
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <div
            key={i}
            className={`p-3.5 rounded-xl border bg-gradient-to-br ${c.color} transition-all duration-300 relative overflow-hidden backdrop-blur-sm`}
          >
            {isSettling && (
              <div className="absolute inset-0 bg-cyan-400/5 animate-pulse pointer-events-none" />
            )}
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${c.accent}`}>
                {c.role}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {c.margin}
              </span>
            </div>

            <div className="font-semibold text-slate-200 text-sm mb-1">
              {c.name}
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-white">
                  ${parseFloat(c.balance).toFixed(4)}
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold uppercase">USDC</span>
              </div>
              <a
                href={`https://explorer.arc.io/address/${c.address}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-0.5 font-mono"
              >
                {c.address.slice(0, 5)}...{c.address.slice(-3)}
                <ArrowUpRight className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
