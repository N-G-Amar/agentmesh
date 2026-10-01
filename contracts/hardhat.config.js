require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    arc: {
      url: process.env.ARC_RPC_URL || "https://rpc.mainnet.arc.io",
      chainId: 5042,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      arc: process.env.ARC_EXPLORER_API_KEY || "empty",
    },
    customChains: [
      {
        network: "arc",
        chainId: 5042,
        urls: {
          apiURL: "https://explorer.arc.io/api",
          browserURL: "https://explorer.arc.io",
        },
      },
    ],
  },
};
