import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// ===========================================
// ENVIRONMENT VARIABLES
// ===========================================

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "9vXoD6YKn4YS1EizvU8ku";
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || "3f9ca44f58f24ea8a23e6f446087bc02";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "3f9ca44f58f24ea8a23e6f446087bc02";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

// ===========================================
// VALIDATION
// ===========================================

if (!ALCHEMY_API_KEY || ALCHEMY_API_KEY === "your_alchemy_api_key_here" || ALCHEMY_API_KEY === "9vXoD6YKn4YS1EizvU8ku") {
  console.error("❌ Please set ALCHEMY_API_KEY in your .env file");
  console.error("   Get your API key from: https://www.alchemy.com/");
  process.exit(1);
}

if (!SEPOLIA_PRIVATE_KEY || SEPOLIA_PRIVATE_KEY === "your_private_key_here") {
  console.error("❌ Please set SEPOLIA_PRIVATE_KEY in your .env file");
  console.error("   Get your private key from MetaMask: Account Details > Export Private Key");
  process.exit(1);
}

// ===========================================
// NETWORK CONFIGURATION
// ===========================================

const networks: any = {
  hardhat: {
    chainId: 31337,
    allowUnlimitedContractSize: true,
    gas: 12000000,
    blockGasLimit: 12000000,
  },
  localhost: {
    url: "http://127.0.0.1:8545",
    chainId: 31337,
  }
};

// Add Sepolia network if private key is valid
if (SEPOLIA_PRIVATE_KEY.length === 64) {
  networks.sepolia = {
    url: `https://eth-sepolia.g.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    accounts: [SEPOLIA_PRIVATE_KEY],
    chainId: 11155111,
    gasPrice: 20000000000, // 20 gwei
  };
}

// Add mainnet network (optional)
if (process.env.MAINNET_PRIVATE_KEY && process.env.MAINNET_PRIVATE_KEY.length === 64) {
  networks.mainnet = {
    url: `https://eth-mainnet.g.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    accounts: [process.env.MAINNET_PRIVATE_KEY],
    chainId: 1,
    gasPrice: 20000000000, // 20 gwei
  };
}

// ===========================================
// HARDHAT CONFIGURATION
// ===========================================

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false,
    },
  },
  networks,
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
  },
  mocha: {
    timeout: 40000,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;