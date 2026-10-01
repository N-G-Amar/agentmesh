const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const { wallets, provider, ARC_CHAIN_ID, ROUTER_ADDRESS, REGISTRY_ADDRESS } = require("./config");
const { runAutonomousResearch } = require("./orchestrator");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Return network status and live agent wallet balances on Arc
app.get("/api/status", async (req, res) => {
  try {
    const balances = {};
    for (const [key, wallet] of Object.entries(wallets)) {
      try {
        const bal = await provider.getBalance(wallet.address);
        balances[key] = {
          address: wallet.address,
          balanceUSDC: ethers.formatEther(bal),
        };
      } catch (err) {
        balances[key] = {
          address: wallet.address,
          balanceUSDC: "0.00",
        };
      }
    }

    res.json({
      network: "Arc Mainnet",
      chainId: ARC_CHAIN_ID,
      rpc: "https://rpc.mainnet.arc.io",
      explorer: "https://explorer.arc.io",
      contracts: {
        router: ROUTER_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        registry: REGISTRY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      },
      wallets: balances,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Return registered agents directory
app.get("/api/agents", (req, res) => {
  res.json({
    agents: [
      {
        id: "search-agent-v1",
        name: "Arc-Search-Agent",
        serviceType: "web-search",
        category: "Intelligence",
        feeUSDC: "0.005",
        address: wallets.search.address,
        reliability: "99.4%",
        totalJobs: 1420,
        volumeUSDC: "7.10",
        description: "Autonomous real-time search extraction with source citation and domain filtering.",
      },
      {
        id: "finance-agent-v1",
        name: "Arc-Financial-Agent",
        serviceType: "financial-metrics",
        category: "Market Data",
        feeUSDC: "0.010",
        address: wallets.finance.address,
        reliability: "98.9%",
        totalJobs: 2180,
        volumeUSDC: "21.80",
        description: "Structured fundamental valuation metrics, P/E ratios, revenue growth, and cash flow analysis.",
      },
      {
        id: "synthesis-agent-v1",
        name: "Arc-Synthesis-Agent",
        serviceType: "summarizer",
        category: "Reasoning",
        feeUSDC: "0.010",
        address: wallets.synthesis.address,
        reliability: "99.8%",
        totalJobs: 3840,
        volumeUSDC: "38.40",
        description: "Executive strategic briefing and cross-source synthesis using state-of-the-art LLM architectures.",
      },
    ],
  });
});

// Execute multi-agent autonomous research
app.post("/api/execute", async (req, res) => {
  try {
    const { query, targetEntity, routerAddress } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const result = await runAutonomousResearch({
      query,
      targetEntity: targetEntity || "NVIDIA",
      routerAddress: routerAddress || ROUTER_ADDRESS,
    });

    res.json(result);
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 AgentMesh Agent API running on http://localhost:${PORT}`);
});
