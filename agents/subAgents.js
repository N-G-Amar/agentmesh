const { ethers } = require("ethers");
const { wallets, ARC_CHAIN_ID } = require("./config");

/**
 * Sign an EIP-712 task receipt for an autonomous agent
 */
async function signReceipt(agentWallet, routerAddress, taskId, resultHash, fee) {
  const timestamp = Math.floor(Date.now() / 1000);
  const contractAddress = routerAddress && ethers.isAddress(routerAddress) ? routerAddress : "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const domain = {
    name: "AgentMesh",
    version: "1",
    chainId: ARC_CHAIN_ID,
    verifyingContract: contractAddress,
  };

  const types = {
    TaskReceipt: [
      { name: "agent", type: "address" },
      { name: "taskId", type: "bytes32" },
      { name: "resultHash", type: "bytes32" },
      { name: "fee", type: "uint256" },
      { name: "timestamp", type: "uint256" },
    ],
  };

  const value = {
    agent: agentWallet.address,
    taskId: taskId,
    resultHash: resultHash,
    fee: fee,
    timestamp: timestamp,
  };

  const signature = await agentWallet.signTypedData(domain, types, value);

  return {
    agent: agentWallet.address,
    taskId: taskId,
    resultHash: resultHash,
    fee: fee.toString(),
    timestamp: timestamp,
    signature: signature,
  };
}

/**
 * Sub-Agent 1: Search Agent
 */
async function executeSearchAgent(taskId, query, fee, routerAddress) {
  const searchResults = {
    query: query,
    summary: `Real-time web intelligence gathered for: "${query}". Multiple regulatory and enterprise announcements identified.`,
    sources: [
      {
        title: "Arc Network Ecosystem Expansion",
        snippet: "Circle announces 20 new enterprise validator nodes and sub-second deterministic settlement on Arc.",
        url: "https://arc.io/news/ecosystem-2026",
      },
      {
        title: "Agentic AI Economics & Micropayments",
        snippet: "Machine-to-machine financial infrastructure surges as autonomous agents settle micro-services using native USDC.",
        url: "https://bloomberg.com/crypto/agentic-finance-2026",
      },
      {
        title: "Quarterly Performance & Growth Trajectory",
        snippet: "Enterprise adoption exceeds consensus estimates by 18%, driven by sovereign compute and AI API demand.",
        url: "https://reuters.com/markets/tech-q3-brief",
      },
    ],
    timestamp: new Date().toISOString(),
  };

  const resultHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(searchResults)));
  const receipt = await signReceipt(wallets.search, routerAddress, taskId, resultHash, fee);

  return {
    agentName: "Arc-Search-Agent",
    agentAddress: wallets.search.address,
    serviceType: "web-search",
    data: searchResults,
    receipt: receipt,
  };
}

/**
 * Sub-Agent 2: Financial Metrics Agent
 */
async function executeFinanceAgent(taskId, targetEntity, fee, routerAddress) {
  const financialData = {
    entity: targetEntity,
    metrics: {
      marketCap: "$3.24 Trillion",
      quarterlyRevenue: "$38.6B (+128% YoY)",
      operatingMargin: "62.4%",
      freeCashFlow: "$14.8B",
      peRatio: "58.2x",
      usdcSettlementVolume: "$840M (30-day run rate)",
    },
    valuationInsight: "Exceptional cash flow generation with premium multiple driven by near-monopoly AI infrastructure margins.",
    timestamp: new Date().toISOString(),
  };

  const resultHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(financialData)));
  const receipt = await signReceipt(wallets.finance, routerAddress, taskId, resultHash, fee);

  return {
    agentName: "Arc-Financial-Agent",
    agentAddress: wallets.finance.address,
    serviceType: "financial-metrics",
    data: financialData,
    receipt: receipt,
  };
}

/**
 * Sub-Agent 3: Synthesis & Intelligence Agent
 */
async function executeSynthesisAgent(taskId, searchResult, financeResult, fee, routerAddress) {
  const synthesis = {
    title: `AgentMesh Intelligence Brief: Strategic Assessment`,
    executiveSummary: `Autonomous synthesis compiled from Search Agent and Financial Agent intelligence streams. The subject displays market-leading revenue expansion coupled with resilient institutional liquidity on Arc.`,
    keyTakeaways: [
      "Macro Tailwinds: Increasing transition towards autonomous agentic execution and native dollar settlements.",
      "Financial Health: Record quarterly revenue with robust operating margins of >60%.",
      "Economic Rail Alignment: Seamless integration with Circle's Arc L1 ensures instantaneous, predictable settlement costs.",
    ],
    riskFactors: [
      "Potential regulatory review of concentrated AI infrastructure supply.",
      "Macroeconomic capital expenditure cycle variations.",
    ],
    recommendation: "STRONG BUY / POSITIVE STRATEGIC OUTLOOK",
    generatedAt: new Date().toISOString(),
  };

  const resultHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(synthesis)));
  const receipt = await signReceipt(wallets.synthesis, routerAddress, taskId, resultHash, fee);

  return {
    agentName: "Arc-Synthesis-Agent",
    agentAddress: wallets.synthesis.address,
    serviceType: "summarizer",
    data: synthesis,
    receipt: receipt,
  };
}

module.exports = {
  signReceipt,
  executeSearchAgent,
  executeFinanceAgent,
  executeSynthesisAgent,
};
