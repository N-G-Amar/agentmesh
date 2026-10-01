const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentMesh Protocol on Arc", function () {
  let deployer, orchestrator, user, agentSearch, agentFinance, agentSummarizer;
  let registry, router;
  let chainId;

  const SEARCH_FEE = ethers.parseEther("0.005"); // 0.005 native USDC
  const FINANCE_FEE = ethers.parseEther("0.010"); // 0.010 native USDC
  const SUMMARY_FEE = ethers.parseEther("0.010"); // 0.010 native USDC
  const ORCHESTRATOR_FEE = ethers.parseEther("0.015"); // 0.015 native USDC

  beforeEach(async function () {
    [deployer, orchestrator, user, agentSearch, agentFinance, agentSummarizer] =
      await ethers.getSigners();

    const net = await ethers.provider.getNetwork();
    chainId = Number(net.chainId);

    // 1. Deploy AgentRegistry
    const AgentRegistryFactory = await ethers.getContractFactory("AgentRegistry");
    registry = await AgentRegistryFactory.deploy();
    await registry.waitForDeployment();

    // 2. Deploy AgentMeshRouter
    const AgentMeshRouterFactory = await ethers.getContractFactory("AgentMeshRouter");
    router = await AgentMeshRouterFactory.deploy(await registry.getAddress());
    await router.waitForDeployment();

    // 3. Authorize Router in Registry
    await registry.setRouterAuthorization(await router.getAddress(), true);

    // 4. Register the 3 sub-agents
    await registry.connect(agentSearch).registerAgent(
      "Arc-Search-Agent",
      "https://api.agentmesh.network/v1/search",
      "web-search",
      SEARCH_FEE
    );

    await registry.connect(agentFinance).registerAgent(
      "Arc-Financial-Agent",
      "https://api.agentmesh.network/v1/finance",
      "financial-metrics",
      FINANCE_FEE
    );

    await registry.connect(agentSummarizer).registerAgent(
      "Arc-Synthesis-Agent",
      "https://api.agentmesh.network/v1/synthesis",
      "summarizer",
      SUMMARY_FEE
    );
  });

  async function createSignedReceipt(agentSigner, taskId, resultString, fee) {
    const resultHash = ethers.keccak256(ethers.toUtf8Bytes(resultString));
    const timestamp = Math.floor(Date.now() / 1000);

    const domain = {
      name: "AgentMesh",
      version: "1",
      chainId: chainId,
      verifyingContract: await router.getAddress(),
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
      agent: agentSigner.address,
      taskId: taskId,
      resultHash: resultHash,
      fee: fee,
      timestamp: timestamp,
    };

    const signature = await agentSigner.signTypedData(domain, types, value);

    return {
      agent: agentSigner.address,
      taskId: taskId,
      resultHash: resultHash,
      fee: fee,
      timestamp: timestamp,
      signature: signature,
    };
  }

  describe("Agent Registry", function () {
    it("should properly register and query agents", async function () {
      expect(await registry.getAgentCount()).to.equal(3n);

      const agentData = await registry.getAgent(agentSearch.address);
      expect(agentData.name).to.equal("Arc-Search-Agent");
      expect(agentData.serviceType).to.equal("web-search");
      expect(agentData.pricePerCall).to.equal(SEARCH_FEE);
      expect(agentData.active).to.be.true;
    });

    it("should allow an agent to update endpoint and price", async function () {
      const newPrice = ethers.parseEther("0.008");
      await registry
        .connect(agentSearch)
        .updateAgent("https://new.api/search", newPrice, true);

      const updated = await registry.getAgent(agentSearch.address);
      expect(updated.pricePerCall).to.equal(newPrice);
      expect(updated.endpoint).to.equal("https://new.api/search");
    });
  });

  describe("Direct Atomic Call-Tree Settlement", function () {
    it("should atomically settle a 3-agent call tree and disburse native USDC", async function () {
      const taskId = ethers.keccak256(ethers.toUtf8Bytes("task-nvda-research-001"));

      const receipt1 = await createSignedReceipt(
        agentSearch,
        taskId,
        "NVIDIA Q3 Earnings beat expectations with record data center revenue",
        SEARCH_FEE
      );
      const receipt2 = await createSignedReceipt(
        agentFinance,
        taskId,
        "Market Cap: $3.1T, P/E: 65.4, YoY Revenue Growth: 122%",
        FINANCE_FEE
      );
      const receipt3 = await createSignedReceipt(
        agentSummarizer,
        taskId,
        "Executive Brief: NVDA sustains exponential AI infrastructure leadership",
        SUMMARY_FEE
      );

      const totalRequired = SEARCH_FEE + FINANCE_FEE + SUMMARY_FEE + ORCHESTRATOR_FEE;

      const balSearchBefore = await ethers.provider.getBalance(agentSearch.address);
      const balFinanceBefore = await ethers.provider.getBalance(agentFinance.address);
      const balSummaryBefore = await ethers.provider.getBalance(agentSummarizer.address);
      const balOrchBefore = await ethers.provider.getBalance(orchestrator.address);

      // Settle the call tree directly with native USDC payment
      const tx = await router
        .connect(user)
        .settleCallTree(
          taskId,
          ORCHESTRATOR_FEE,
          orchestrator.address,
          [receipt1, receipt2, receipt3],
          { value: totalRequired }
        );

      await expect(tx)
        .to.emit(router, "CallTreeSettled")
        .withArgs(taskId, user.address, totalRequired, 3n, ORCHESTRATOR_FEE);

      // Verify sub-agent balances increased
      expect(await ethers.provider.getBalance(agentSearch.address)).to.equal(
        balSearchBefore + SEARCH_FEE
      );
      expect(await ethers.provider.getBalance(agentFinance.address)).to.equal(
        balFinanceBefore + FINANCE_FEE
      );
      expect(await ethers.provider.getBalance(agentSummarizer.address)).to.equal(
        balSummaryBefore + SUMMARY_FEE
      );
      expect(await ethers.provider.getBalance(orchestrator.address)).to.equal(
        balOrchBefore + ORCHESTRATOR_FEE
      );

      // Verify registry recorded performance metrics
      const searchTrack = await registry.getAgent(agentSearch.address);
      expect(searchTrack.totalTasksCompleted).to.equal(1n);
      expect(searchTrack.totalVolumeEarned).to.equal(SEARCH_FEE);

      const financeTrack = await registry.getAgent(agentFinance.address);
      expect(financeTrack.totalTasksCompleted).to.equal(1n);
      expect(financeTrack.totalVolumeEarned).to.equal(FINANCE_FEE);
    });

    it("should reject forged or mismatched signatures", async function () {
      const taskId = ethers.keccak256(ethers.toUtf8Bytes("task-forged-test"));

      // Signed by deployer, claiming to be agentSearch
      const forgedReceipt = await createSignedReceipt(
        deployer,
        taskId,
        "Forged data",
        SEARCH_FEE
      );
      // Alter the agent address to claim it's agentSearch
      forgedReceipt.agent = agentSearch.address;

      const totalRequired = SEARCH_FEE;

      await expect(
        router
          .connect(user)
          .settleCallTree(
            taskId,
            0,
            orchestrator.address,
            [forgedReceipt],
            { value: totalRequired }
          )
      ).to.be.revertedWith("Invalid EIP-712 agent signature");
    });

    it("should prevent replay of the same task or receipt", async function () {
      const taskId = ethers.keccak256(ethers.toUtf8Bytes("task-replay-test"));
      const receipt = await createSignedReceipt(
        agentSearch,
        taskId,
        "Valid search data",
        SEARCH_FEE
      );

      // First call succeeds
      await router
        .connect(user)
        .settleCallTree(taskId, 0, orchestrator.address, [receipt], {
          value: SEARCH_FEE,
        });

      // Second call with same taskId reverts
      await expect(
        router
          .connect(user)
          .settleCallTree(taskId, 0, orchestrator.address, [receipt], {
            value: SEARCH_FEE,
          })
      ).to.be.revertedWith("Task already settled");
    });
  });

  describe("Escrow-Backed Settlement", function () {
    it("should allow creating escrow, settling with sub-agents, and refunding remainder", async function () {
      const taskId = ethers.keccak256(ethers.toUtf8Bytes("task-escrow-flow"));
      const escrowBudget = ethers.parseEther("0.060"); // $0.060 deposited

      // User deposits into escrow
      await router
        .connect(user)
        .createEscrow(taskId, orchestrator.address, 3600, {
          value: escrowBudget,
        });

      const receipt1 = await createSignedReceipt(
        agentSearch,
        taskId,
        "Search results",
        SEARCH_FEE
      );
      const receipt2 = await createSignedReceipt(
        agentFinance,
        taskId,
        "Finance stats",
        FINANCE_FEE
      );

      const totalSpent = SEARCH_FEE + FINANCE_FEE + ORCHESTRATOR_FEE; // 0.005 + 0.010 + 0.015 = 0.030
      const expectedRemainder = escrowBudget - totalSpent; // 0.030 refunded

      const balUserBefore = await ethers.provider.getBalance(user.address);

      // Orchestrator settles from escrow
      await router
        .connect(orchestrator)
        .settleFromEscrow(taskId, ORCHESTRATOR_FEE, [receipt1, receipt2]);

      // Remainder refunded to user
      const balUserAfter = await ethers.provider.getBalance(user.address);
      expect(balUserAfter).to.equal(balUserBefore + expectedRemainder);
    });

    it("should allow user to refund escrow after timeout expiration", async function () {
      const taskId = ethers.keccak256(ethers.toUtf8Bytes("task-timeout-test"));
      const deposit = ethers.parseEther("0.050");

      await router
        .connect(user)
        .createEscrow(taskId, orchestrator.address, 100, { value: deposit });

      // Fast forward time by 200 seconds
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine");

      const balUserBefore = await ethers.provider.getBalance(user.address);
      const tx = await router.connect(user).refundExpiredEscrow(taskId);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const balUserAfter = await ethers.provider.getBalance(user.address);
      expect(balUserAfter).to.equal(balUserBefore + deposit - gasCost);
    });
  });
});
