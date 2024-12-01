require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.18",  // Adjust to your Solidity version
  networks: {
    // Sepolia configuration
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,   // Sepolia RPC URL (Alchemy/Infura/Ankr)
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],   // Your private key
      chainId: 11155111, // Sepolia chain ID
    },

    // Base Sepolia configuration
    baseSepolia: {
      url: "https://sepolia.base.org",  // Correct RPC URL for Base Sepolia
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],  // Same private key as Sepolia
      chainId: 84532,  // Base Sepolia chain ID
    },
  },

  // If using hardhat-deploy, you can include it here
  namedAccounts: {
    deployer: {
      default: 0, // Deploy contract from the first account in your accounts array
    },
  },
};