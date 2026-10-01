const { ethers } = require("ethers");
const { wallets, provider, ROUTER_ADDRESS, REGISTRY_ADDRESS } = require("./config");
const { executeSearchAgent, executeFinanceAgent, executeSynthesisAgent } = require("./subAgents");

// ABIs
const ROUTER_ABI = [
  "function settleCallTree(bytes32 taskId, uint256 orchestratorFee, address orchestratorRecipient, tuple(address agent, bytes32 taskId, bytes32 resultHash, uint256 fee, uint256 timestamp, bytes signature)[] receipts) external payable",
  "function escrows(bytes32) external view returns (address user, address orchestrator, uint256 amount, uint256 deadline, bool settled)",
  "function settledTasks(bytes32) external view returns (bool)",
  "event CallTreeSettled(bytes32 indexed taskId, address indexed caller, uint256 totalDisbursed, uint256 subAgentCount, uint256 orchestratorFee)",
  "event SubAgentPaid(bytes32 indexed taskId, address indexed agent, uint256 fee, bytes32 resultHash)",
];

const REGISTRY_ABI = [
  "function getAgentCount() external view returns (uint256)",
  "function getAllAgents() external view returns (address[])",
  "function getAgent(address) external view returns (tuple(address wallet, string name, string endpoint, string serviceType, uint256 pricePerCall, bool active, uint256 totalTasksCompleted, uint256 totalVolumeEarned, uint256 registeredAt))",
  "function isAgentAvailable(address) external view returns (bool available, uint256 fee)",
];

/**
 * Orchestrator coordinates the multi-agent research swarm and settles payment on Arc
 */
async function runAutonomousResearch({ query, targetEntity = "NVIDIA", routerAddress = ROUTER_ADDRESS }) {
  console.log(`\n======================================================`);
  console.log(`🤖 Starting Autonomous Research Swarm for: "${query}"`);
  console.log(`======================================================`);

  const effectiveRouterAddress = routerAddress || ROUTER_ADDRESS;
  const taskId = ethers.keccak256(
    ethers.toUtf8Bytes(`task-${Date.now()}-${query}-${Math.random()}`)
  );

  console.log(`📌 Task ID generated: ${taskId}`);

  // Fixed fees (in native USDC: 18 decimals)
  const SEARCH_FEE = ethers.parseEther("0.005");
  const FINANCE_FEE = ethers.parseEther("0.010");
  const SYNTHESIS_FEE = ethers.parseEther("0.010");
  const ORCHESTRATOR_FEE = ethers.parseEther("0.015");

  const executionLog = [];

  // Step 1: Search Agent execution
  console.log(`\n🔍 [1/3] Hiring Arc-Search-Agent (Fee: 0.005 USDC)...`);
  const searchResult = await executeSearchAgent(taskId, query, SEARCH_FEE, effectiveRouterAddress);
  executionLog.push({
    step: "Search Intelligence",
    agent: searchResult.agentName,
    address: searchResult.agentAddress,
    feeUSDC: "0.005",
    status: "Completed & Cryptographically Signed",
    signature: searchResult.receipt.signature.slice(0, 18) + "...",
  });

  // Step 2: Financial Metrics Agent execution
  console.log(`📊 [2/3] Hiring Arc-Financial-Agent (Fee: 0.010 USDC)...`);
  const financeResult = await executeFinanceAgent(taskId, targetEntity, FINANCE_FEE, effectiveRouterAddress);
  executionLog.push({
    step: "Financial Analysis",
    agent: financeResult.agentName,
    address: financeResult.agentAddress,
    feeUSDC: "0.010",
    status: "Completed & Cryptographically Signed",
    signature: financeResult.receipt.signature.slice(0, 18) + "...",
  });

  // Step 3: Synthesis Agent execution
  console.log(`🧠 [3/3] Hiring Arc-Synthesis-Agent (Fee: 0.010 USDC)...`);
  const synthesisResult = await executeSynthesisAgent(
    taskId,
    searchResult.data,
    financeResult.data,
    SYNTHESIS_FEE,
    effectiveRouterAddress
  );
  executionLog.push({
    step: "Executive Synthesis",
    agent: synthesisResult.agentName,
    address: synthesisResult.agentAddress,
    feeUSDC: "0.010",
    status: "Completed & Cryptographically Signed",
    signature: synthesisResult.receipt.signature.slice(0, 18) + "...",
  });

  // Step 4: Call-Tree Settlement on Arc Mainnet
  const receipts = [searchResult.receipt, financeResult.receipt, synthesisResult.receipt];
  const totalSubAgentFees = SEARCH_FEE + FINANCE_FEE + SYNTHESIS_FEE;
  const totalCost = totalSubAgentFees + ORCHESTRATOR_FEE;

  console.log(`\n⚡ [4/4] Submitting Call-Tree Settlement to Arc Blockchain...`);
  console.log(`   Total Budget: ${ethers.formatEther(totalCost)} USDC`);
  console.log(`   Sub-agents (3): ${ethers.formatEther(totalSubAgentFees)} USDC`);
  console.log(`   Orchestrator Margin: ${ethers.formatEther(ORCHESTRATOR_FEE)} USDC`);

  let txHash = null;
  let blockNumber = null;
  let explorerUrl = null;

  if (effectiveRouterAddress && effectiveRouterAddress !== "") {
    try {
      const routerContract = new ethers.Contract(effectiveRouterAddress, ROUTER_ABI, wallets.orchestrator);
      const tx = await routerContract.settleCallTree(
        taskId,
        ORCHESTRATOR_FEE,
        wallets.orchestrator.address,
        receipts,
        { value: totalCost }
      );
      console.log(`   Tx submitted: ${tx.hash}. Waiting for Arc confirmation...`);
      const receipt = await tx.wait();
      txHash = tx.hash;
      blockNumber = receipt.blockNumber;
      explorerUrl = `https://explorer.arc.io/tx/${tx.hash}`;
      console.log(`   ✅ Confirmed in block ${blockNumber}! Explorer: ${explorerUrl}`);
    } catch (err) {
      console.warn(`   ⚠️ Live on-chain tx skipped or simulated: ${err.message}`);
    }
  }

  return {
    taskId,
    query,
    targetEntity,
    totalCostUSDC: ethers.formatEther(totalCost),
    orchestratorFeeUSDC: ethers.formatEther(ORCHESTRATOR_FEE),
    txHash,
    blockNumber,
    explorerUrl,
    executionLog,
    subAgents: [
      {
        name: searchResult.agentName,
        address: searchResult.agentAddress,
        fee: "0.005 USDC",
        receipt: searchResult.receipt,
        data: searchResult.data,
      },
      {
        name: financeResult.agentName,
        address: financeResult.agentAddress,
        fee: "0.010 USDC",
        receipt: financeResult.receipt,
        data: financeResult.data,
      },
      {
        name: synthesisResult.agentName,
        address: synthesisResult.agentAddress,
        fee: "0.010 USDC",
        receipt: synthesisResult.receipt,
        data: synthesisResult.data,
      },
    ],
    finalReport: synthesisResult.data,
  };
}

module.exports = {
  runAutonomousResearch,
};
