// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentRegistry
 * @dev On-chain registry and reputation directory for AI agents on Arc.
 *      Agents register their services, endpoints, and fixed per-call fees.
 *      Track records (volume and tasks completed) are updated upon verified settlement.
 */
contract AgentRegistry is Ownable {
    struct Agent {
        address wallet;
        string name;
        string endpoint;
        string serviceType;
        uint256 pricePerCall; // In native USDC (18 decimals: 1 USDC = 1e18)
        bool active;
        uint256 totalTasksCompleted;
        uint256 totalVolumeEarned;
        uint256 registeredAt;
    }

    // Mapping from agent wallet address to Agent details
    mapping(address => Agent) public agents;
    // List of all registered agent addresses
    address[] public agentList;

    // Authorized routers allowed to record verified task completions
    mapping(address => bool) public authorizedRouters;

    // Events
    event AgentRegistered(
        address indexed wallet,
        string name,
        string serviceType,
        uint256 pricePerCall,
        string endpoint
    );
    event AgentUpdated(
        address indexed wallet,
        string endpoint,
        uint256 pricePerCall,
        bool active
    );
    event AgentTaskRecorded(
        address indexed wallet,
        uint256 feeEarned,
        uint256 totalCompleted,
        uint256 totalVolume
    );
    event RouterAuthorizationSet(address indexed router, bool authorized);

    modifier onlyAuthorizedRouter() {
        require(authorizedRouters[msg.sender] || msg.sender == owner(), "Not authorized router");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Authorize or revoke a settlement router to update agent performance metrics
     */
    function setRouterAuthorization(address router, bool authorized) external onlyOwner {
        authorizedRouters[router] = authorized;
        emit RouterAuthorizationSet(router, authorized);
    }

    /**
     * @notice Register a new autonomous agent in the registry
     */
    function registerAgent(
        string calldata name,
        string calldata endpoint,
        string calldata serviceType,
        uint256 pricePerCall
    ) external {
        require(agents[msg.sender].wallet == address(0), "Agent already registered");
        require(bytes(name).length > 0, "Name required");
        require(bytes(serviceType).length > 0, "Service type required");

        agents[msg.sender] = Agent({
            wallet: msg.sender,
            name: name,
            endpoint: endpoint,
            serviceType: serviceType,
            pricePerCall: pricePerCall,
            active: true,
            totalTasksCompleted: 0,
            totalVolumeEarned: 0,
            registeredAt: block.timestamp
        });

        agentList.push(msg.sender);

        emit AgentRegistered(msg.sender, name, serviceType, pricePerCall, endpoint);
    }

    /**
     * @notice Update agent service settings
     */
    function updateAgent(
        string calldata endpoint,
        uint256 pricePerCall,
        bool active
    ) external {
        require(agents[msg.sender].wallet != address(0), "Agent not registered");
        Agent storage agent = agents[msg.sender];
        agent.endpoint = endpoint;
        agent.pricePerCall = pricePerCall;
        agent.active = active;

        emit AgentUpdated(msg.sender, endpoint, pricePerCall, active);
    }

    /**
     * @notice Record a verified task execution and credit reputation/volume
     */
    function recordTaskExecution(address agentAddress, uint256 feeEarned) external onlyAuthorizedRouter {
        Agent storage agent = agents[agentAddress];
        require(agent.wallet != address(0), "Agent not found");

        agent.totalTasksCompleted += 1;
        agent.totalVolumeEarned += feeEarned;

        emit AgentTaskRecorded(
            agentAddress,
            feeEarned,
            agent.totalTasksCompleted,
            agent.totalVolumeEarned
        );
    }

    /**
     * @notice Check if an agent is active and get their registered fee
     */
    function isAgentAvailable(address agentAddress) external view returns (bool available, uint256 fee) {
        Agent storage agent = agents[agentAddress];
        return (agent.active && agent.wallet != address(0), agent.pricePerCall);
    }

    /**
     * @notice Total number of registered agents
     */
    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }

    /**
     * @notice Returns array of all agent addresses
     */
    function getAllAgents() external view returns (address[] memory) {
        return agentList;
    }

    /**
     * @notice Returns full details for an agent
     */
    function getAgent(address agentAddress) external view returns (Agent memory) {
        return agents[agentAddress];
    }
}
