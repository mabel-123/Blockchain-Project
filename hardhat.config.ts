import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";

// ===========================================
// UPDATE THESE VALUES WITH YOUR ACTUAL KEYS
// ===========================================

// Get from: https://www.alchemy.com/
// Create a new app and select Sepolia network
const ALCHEMY_API_KEY = "9vXoD6YKn4YS1EizvU8ku";

// Get from MetaMask: Account Details > Export Private Key
// Should be 64 characters long, WITHOUT 0x prefix
const SEPOLIA_PRIVATE_KEY = "3f9ca44f58f24ea8a23e6f446087bc02";

// Get from: https://etherscan.io/apis
// Create a new API key
const ETHERSCAN_API_KEY = "3f9ca44f58f24ea8a23e6f446087bc02";

// ===========================================
// VALIDATION - Don't change these lines
// ===========================================

if (ALCHEMY_API_KEY === "PASTE_YOUR_ALCHEMY_API_KEY_HERE") {
  console.error("❌ Please update ALCHEMY_API_KEY in hardhat.config.ts");
  console.error("   Get your API key from: https://www.alchemy.com/");
  process.exit(1);
}

// Only add Sepolia network if the private key is 64 chars
const networks: any = {};
if (SEPOLIA_PRIVATE_KEY.length === 64) {
  networks.sepolia = {
    url: `https://eth-sepolia.g.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    accounts: [SEPOLIA_PRIVATE_KEY],
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks,
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};

export default config;