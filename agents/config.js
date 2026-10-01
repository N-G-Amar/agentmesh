require("dotenv").config();
const { ethers } = require("ethers");

const ARC_RPC_URL = process.env.ARC_RPC_URL || "https://rpc.mainnet.arc.io";
const ARC_CHAIN_ID = parseInt(process.env.ARC_CHAIN_ID || "5042", 10);

// Default deterministic test keys for autonomous agents (overridden by .env in production)
const AGENT_KEYS = {
  orchestrator: process.env.ORCHESTRATOR_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  search: process.env.SEARCH_AGENT_KEY || "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  finance: process.env.FINANCE_AGENT_KEY || "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  synthesis: process.env.SYNTHESIS_AGENT_KEY || "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
};

// Create wallet instances
const provider = new ethers.JsonRpcProvider(ARC_RPC_URL);

const wallets = {
  orchestrator: new ethers.Wallet(AGENT_KEYS.orchestrator, provider),
  search: new ethers.Wallet(AGENT_KEYS.search, provider),
  finance: new ethers.Wallet(AGENT_KEYS.finance, provider),
  synthesis: new ethers.Wallet(AGENT_KEYS.synthesis, provider),
};

module.exports = {
  ARC_RPC_URL,
  ARC_CHAIN_ID,
  AGENT_KEYS,
  provider,
  wallets,
  ROUTER_ADDRESS: process.env.ROUTER_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  REGISTRY_ADDRESS: process.env.REGISTRY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
};
