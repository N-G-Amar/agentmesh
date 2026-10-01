const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();

  console.log("==================================================");
  console.log("🚀 Deploying AgentMesh Protocol to Network:");
  console.log(`   Network Chain ID: ${net.chainId}`);
  console.log(`   Deployer Wallet:  ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`   Deployer Balance: ${ethers.formatEther(balance)} USDC`);
  console.log("==================================================");

  // 1. Deploy AgentRegistry
  console.log("\n📦 Deploying AgentRegistry...");
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const registry = await AgentRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`✅ AgentRegistry deployed at: ${registryAddress}`);

  // 2. Deploy AgentMeshRouter
  console.log("\n📦 Deploying AgentMeshRouter...");
  const AgentMeshRouter = await ethers.getContractFactory("AgentMeshRouter");
  const router = await AgentMeshRouter.deploy(registryAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log(`✅ AgentMeshRouter deployed at: ${routerAddress}`);

  // 3. Authorize Router in Registry
  console.log("\n🔐 Authorizing Router in Registry...");
  const authTx = await registry.setRouterAuthorization(routerAddress, true);
  await authTx.wait();
  console.log(`✅ AgentMeshRouter authorized successfully!`);

  console.log("\n==================================================");
  console.log("🎉 AGENTMESH DEPLOYMENT COMPLETE!");
  console.log(`   AgentRegistry:   ${registryAddress}`);
  console.log(`   AgentMeshRouter: ${routerAddress}`);
  console.log("==================================================");

  return { registryAddress, routerAddress };
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
