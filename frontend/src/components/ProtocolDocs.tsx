import React from "react";
import { CheckCircle2, XCircle, Layers, Cpu, Coins } from "lucide-react";

export const ProtocolDocs: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
          The Economic Foundation
        </span>
        <h2 className="text-2xl font-bold text-white mt-3 mb-2">
          Why Arc is the Native OS for Autonomous Agent Commerce
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          AI agents cannot get Social Security numbers, pass Stripe KYC, or hold corporate credit cards. Furthermore, traditional blockchains force agents to run complex liquidity balancing bots just to pay gas. AgentMesh leverages Arc’s native USDC architecture to unlock true autonomous machine-to-machine economies.
        </p>
      </div>

      {/* Comparison: Web2 vs Traditional Crypto vs Arc */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Web2 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <XCircle className="h-5 w-5" />
            <h3 className="font-bold text-sm">Web2 Rails (Stripe / RapidAPI)</h3>
          </div>
          <ul className="text-xs text-slate-400 space-y-2">
            <li>• <strong>Fatal Fee Floor:</strong> $0.30 + 2.9% fee on a $0.005 micro-task = 6,000% fee overhead.</li>
            <li>• <strong>Identity Barrier:</strong> Requires human legal entity, SSN/EIN, and bank account KYC.</li>
            <li>• <strong>Chargeback Risk:</strong> Payments can be reversed up to 90 days after compute is consumed.</li>
          </ul>
        </div>

        {/* Ethereum / Base */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Layers className="h-5 w-5" />
            <h3 className="font-bold text-sm">Traditional L1s / L2s (Base / ETH)</h3>
          </div>
          <ul className="text-xs text-slate-400 space-y-2">
            <li>• <strong>Dual-Token Friction:</strong> Agents must hold ETH for gas and USDC for payments.</li>
            <li>• <strong>Operational Death:</strong> If gas runs out while holding $1,000 USDC, the agent halts.</li>
            <li>• <strong>ERC-20 Approval Overhead:</strong> Requires 2 transactions (approve + transfer) per settlement.</li>
          </ul>
        </div>

        {/* Arc Mainnet */}
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-3 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <h3 className="font-bold text-sm">AgentMesh on Arc Mainnet</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li>• <strong>Single Asset Balance:</strong> Gas IS USDC. 1 asset, 1 wallet balance, zero conversion bots.</li>
            <li>• <strong>Sub-Second Finality:</strong> ~780ms deterministic blocks via Malachite BFT consensus.</li>
            <li>• <strong>Atomic Call-Tree Splits:</strong> Recursive general contractor settlement in 1 single transaction.</li>
          </ul>
        </div>
      </div>

      {/* Protocol Architecture Deep Dive */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <Cpu className="h-4 w-4 text-cyan-400" />
          EIP-712 Cryptographic Proof-of-Execution Pipeline
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          To eliminate the "simulation trap," AgentMesh uses off-chain compute with on-chain cryptographic settlement. Each sub-agent holds its own EVM private key. Upon completing a task, it signs an EIP-712 structured data receipt:
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
          <pre>{`struct TaskReceipt {
    address agent;       // Sub-agent payout address
    bytes32 taskId;      // Unique session identifier
    bytes32 resultHash;  // keccak256 hash of the generated task output
    uint256 fee;         // Registered per-call price in native USDC (18 decimals)
    uint256 timestamp;   // Execution timestamp
    bytes signature;     // ECDSA signature recovered on-chain
}`}</pre>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The <code>AgentMeshRouter.sol</code> smart contract recovers the signer address using <code>ECDSA.recover(digest, signature)</code>, verifies the agent's active status in <code>AgentRegistry.sol</code>, and transfers native USDC directly to the subcontractor’s address.
        </p>
      </div>

      {/* Arc Dual-Interface Specification */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <Coins className="h-4 w-4 text-emerald-400" />
          Arc Dual-Interface Decimal Architecture
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Arc features an innovative native stablecoin architecture where USDC exists simultaneously across two interfaces sharing the same underlying balance:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">1. Protocol Native Interface</span>
            <span className="text-slate-400 block text-[11px]">Decimals: 18 (1 USDC = 1e18 wei)</span>
            <p className="text-slate-300 text-[11px] mt-1 font-sans">
              Used for gas accounting, <code>msg.value</code>, and native transfers via <code>payable</code> without requiring ERC-20 allowances.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">2. ERC-20 System Interface</span>
            <span className="text-slate-400 block text-[11px]">Decimals: 6 (1 USDC = 1e6 units)</span>
            <p className="text-slate-300 text-[11px] mt-1 font-sans">
              Located at precompile <code>0x3600...0000</code>, ensuring full compatibility with existing DeFi protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
