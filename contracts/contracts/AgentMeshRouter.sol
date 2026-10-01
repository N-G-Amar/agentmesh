// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgentRegistry.sol";

/**
 * @title AgentMeshRouter
 * @dev Cryptographic Call-Tree Settlement & Escrow Router for AI Agents on Arc.
 *      Settles multi-agent tasks natively in USDC with EIP-712 proof-of-execution receipts.
 */
contract AgentMeshRouter is EIP712, ReentrancyGuard, Ownable {
    using ECDSA for bytes32;

    AgentRegistry public immutable registry;

    // EIP-712 TypeHash for sub-agent signed task fulfillment receipts
    bytes32 public constant TASK_RECEIPT_TYPEHASH = keccak256(
        "TaskReceipt(address agent,bytes32 taskId,bytes32 resultHash,uint256 fee,uint256 timestamp)"
    );

    struct TaskReceipt {
        address agent;
        bytes32 taskId;
        bytes32 resultHash;
        uint256 fee;       // Native USDC fee (18 decimals: 1 USDC = 1e18)
        uint256 timestamp;
        bytes signature;
    }

    struct Escrow {
        address user;
        address orchestrator;
        uint256 amount;
        uint256 deadline;
        bool settled;
    }

    // Mapping of taskId to Escrow
    mapping(bytes32 => Escrow) public escrows;
    // Prevent replay of tasks
    mapping(bytes32 => bool) public settledTasks;
    // Prevent replay of individual receipts
    mapping(bytes32 => bool) public usedReceipts;

    // Events
    event CallTreeSettled(
        bytes32 indexed taskId,
        address indexed caller,
        uint256 totalDisbursed,
        uint256 subAgentCount,
        uint256 orchestratorFee
    );
    event SubAgentPaid(
        bytes32 indexed taskId,
        address indexed agent,
        uint256 fee,
        bytes32 resultHash
    );
    event EscrowCreated(
        bytes32 indexed taskId,
        address indexed user,
        address indexed orchestrator,
        uint256 amount,
        uint256 deadline
    );
    event EscrowRefunded(
        bytes32 indexed taskId,
        address indexed user,
        uint256 amount
    );

    constructor(address _registry) EIP712("AgentMesh", "1") Ownable(msg.sender) {
        require(_registry != address(0), "Invalid registry address");
        registry = AgentRegistry(_registry);
    }

    /**
     * @notice Create an escrow deposit for an agentic task
     */
    function createEscrow(
        bytes32 taskId,
        address orchestrator,
        uint256 timeoutDuration
    ) external payable nonReentrant {
        require(msg.value > 0, "Escrow deposit must be > 0");
        require(orchestrator != address(0), "Invalid orchestrator");
        require(escrows[taskId].user == address(0), "Escrow already exists");
        require(!settledTasks[taskId], "Task already settled");

        escrows[taskId] = Escrow({
            user: msg.sender,
            orchestrator: orchestrator,
            amount: msg.value,
            deadline: block.timestamp + timeoutDuration,
            settled: false
        });

        emit EscrowCreated(taskId, msg.sender, orchestrator, msg.value, block.timestamp + timeoutDuration);
    }

    /**
     * @notice Refund an escrow if the task timed out without settlement
     */
    function refundExpiredEscrow(bytes32 taskId) external nonReentrant {
        Escrow storage escrow = escrows[taskId];
        require(escrow.user != address(0), "Escrow does not exist");
        require(!escrow.settled, "Escrow already settled");
        require(block.timestamp > escrow.deadline, "Escrow not yet expired");
        require(msg.sender == escrow.user, "Only user can refund");

        uint256 amount = escrow.amount;
        escrow.settled = true;
        escrow.amount = 0;

        (bool success, ) = escrow.user.call{value: amount}("");
        require(success, "Refund transfer failed");

        emit EscrowRefunded(taskId, escrow.user, amount);
    }

    /**
     * @notice Settle a call tree using previously deposited escrow funds
     */
    function settleFromEscrow(
        bytes32 taskId,
        uint256 orchestratorFee,
        TaskReceipt[] calldata receipts
    ) external nonReentrant {
        Escrow storage escrow = escrows[taskId];
        require(escrow.user != address(0), "Escrow does not exist");
        require(!escrow.settled, "Escrow already settled");
        require(msg.sender == escrow.orchestrator, "Only assigned orchestrator can settle");
        require(block.timestamp <= escrow.deadline, "Escrow expired");

        escrow.settled = true;
        settledTasks[taskId] = true;

        uint256 totalCost = _verifyAndDisburse(taskId, receipts, orchestratorFee, escrow.orchestrator);
        require(totalCost <= escrow.amount, "Total cost exceeds escrow balance");

        // Refund any unused balance back to the user
        uint256 remainder = escrow.amount - totalCost;
        if (remainder > 0) {
            (bool refundOk, ) = escrow.user.call{value: remainder}("");
            require(refundOk, "User remainder refund failed");
        }

        emit CallTreeSettled(taskId, msg.sender, totalCost, receipts.length, orchestratorFee);
    }

    /**
     * @notice Direct atomic settlement in one transaction (orchestrator or user fronts native USDC)
     */
    function settleCallTree(
        bytes32 taskId,
        uint256 orchestratorFee,
        address orchestratorRecipient,
        TaskReceipt[] calldata receipts
    ) external payable nonReentrant {
        require(!settledTasks[taskId], "Task already settled");
        settledTasks[taskId] = true;

        uint256 totalCost = _verifyAndDisburse(taskId, receipts, orchestratorFee, orchestratorRecipient);
        require(msg.value >= totalCost, "Insufficient USDC sent");

        // Refund any surplus native USDC to the sender
        uint256 excess = msg.value - totalCost;
        if (excess > 0) {
            (bool refundOk, ) = msg.sender.call{value: excess}("");
            require(refundOk, "Surplus refund failed");
        }

        emit CallTreeSettled(taskId, msg.sender, totalCost, receipts.length, orchestratorFee);
    }

    /**
     * @dev Internal helper to verify EIP-712 sub-agent receipts, disburse native USDC, and update registry metrics
     */
    function _verifyAndDisburse(
        bytes32 taskId,
        TaskReceipt[] calldata receipts,
        uint256 orchestratorFee,
        address orchestratorRecipient
    ) internal returns (uint256) {
        uint256 totalSubAgentFees = 0;

        for (uint256 i = 0; i < receipts.length; i++) {
            TaskReceipt calldata r = receipts[i];

            require(r.taskId == taskId, "Mismatched taskId in receipt");
            require(r.agent != address(0), "Invalid agent address");
            require(r.fee > 0, "Fee must be > 0");

            bytes32 receiptHash = keccak256(abi.encode(r.taskId, r.agent, r.resultHash, r.timestamp));
            require(!usedReceipts[receiptHash], "Receipt already used");
            usedReceipts[receiptHash] = true;

            // Verify EIP-712 signature from the sub-agent
            bytes32 structHash = keccak256(
                abi.encode(
                    TASK_RECEIPT_TYPEHASH,
                    r.agent,
                    r.taskId,
                    r.resultHash,
                    r.fee,
                    r.timestamp
                )
            );
            bytes32 digest = _hashTypedDataV4(structHash);
            address signer = ECDSA.recover(digest, r.signature);
            require(signer == r.agent, "Invalid EIP-712 agent signature");

            // Verify agent is registered in AgentRegistry
            (bool available, ) = registry.isAgentAvailable(r.agent);
            require(available, "Agent not active in registry");

            // Disburse native USDC directly to the sub-agent
            (bool paidOk, ) = r.agent.call{value: r.fee}("");
            require(paidOk, "Sub-agent payment transfer failed");

            // Record verified execution in registry
            registry.recordTaskExecution(r.agent, r.fee);

            totalSubAgentFees += r.fee;
            emit SubAgentPaid(taskId, r.agent, r.fee, r.resultHash);
        }

        // Pay orchestrator fee
        if (orchestratorFee > 0 && orchestratorRecipient != address(0)) {
            (bool orchPaid, ) = orchestratorRecipient.call{value: orchestratorFee}("");
            require(orchPaid, "Orchestrator payment failed");
        }

        return totalSubAgentFees + orchestratorFee;
    }

    /**
     * @notice Compute the EIP-712 digest for a task receipt (helper for testing and off-chain signers)
     */
    function getReceiptDigest(
        address agent,
        bytes32 taskId,
        bytes32 resultHash,
        uint256 fee,
        uint256 timestamp
    ) external view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                TASK_RECEIPT_TYPEHASH,
                agent,
                taskId,
                resultHash,
                fee,
                timestamp
            )
        );
        return _hashTypedDataV4(structHash);
    }
}
