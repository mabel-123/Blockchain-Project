# Configuration Guide

## Required API Keys and Private Key

To deploy your contracts to the Sepolia testnet, you need to update the `hardhat.config.ts` file with your actual API keys and private key.

### 1. Alchemy API Key

**Get your API key from:** https://www.alchemy.com/

1. Sign up for a free account
2. Create a new app
3. Select "Sepolia" network
4. Copy your API key

### 2. Your Wallet's Private Key

**Get your private key from MetaMask:**

1. Open MetaMask
2. Click on your account (top right)
3. Go to "Account Details"
4. Click "Export Private Key"
5. Enter your password
6. Copy the private key (64 characters, without 0x prefix)

⚠️ **WARNING:** Never share your private key or commit it to version control!

### 3. Etherscan API Key

**Get your API key from:** https://etherscan.io/apis

1. Sign up for a free account
2. Go to "API Keys" section
3. Create a new API key
4. Copy your API key

## How to Update Configuration

### Option 1: Direct Update (Quick)

Edit `hardhat.config.ts` and replace the placeholder values:

```typescript
const ALCHEMY_API_KEY = "your-actual-alchemy-api-key";
const SEPOLIA_PRIVATE_KEY = "your-actual-private-key-without-0x-prefix";
const ETHERSCAN_API_KEY = "your-actual-etherscan-api-key";
```

### Option 2: Environment Variables (Recommended)

1. Create a `.env` file in the project root:

```env
ALCHEMY_API_KEY=your-actual-alchemy-api-key
SEPOLIA_PRIVATE_KEY=your-actual-private-key-without-0x-prefix
ETHERSCAN_API_KEY=your-actual-etherscan-api-key
```

2. Install dotenv:
```bash
npm install dotenv
```

3. Add this line at the top of `hardhat.config.ts`:
```typescript
import "dotenv/config";
```

## Example Configuration

Here's what your `hardhat.config.ts` should look like:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";

// Replace these with your actual values
const ALCHEMY_API_KEY = "abc123def456ghi789..."; // Your Alchemy API key
const SEPOLIA_PRIVATE_KEY = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"; // Your private key
const ETHERSCAN_API_KEY = "xyz789abc123def456..."; // Your Etherscan API key

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
  networks: {
    sepolia: {
      url: `https://eth-sepolia.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};

export default config;
```

## Validation

After updating the configuration, you can test it by running:

```bash
npx hardhat compile
```

If you see any error messages about missing API keys, make sure you've updated all the values correctly.

## Security Notes

- ✅ Use environment variables for production
- ✅ Never commit private keys to version control
- ✅ Use a dedicated wallet for testing
- ✅ Keep your API keys secure
- ❌ Don't share your private key
- ❌ Don't use your main wallet for testing

## Getting Sepolia Testnet ETH

You'll need some Sepolia testnet ETH to deploy contracts. Get it from:

1. **Alchemy Sepolia Faucet:** https://sepoliafaucet.com/
2. **Infura Sepolia Faucet:** https://www.infura.io/faucet/sepolia
3. **Chainlink Faucet:** https://faucets.chain.link/sepolia

## Next Steps

Once you've updated the configuration:

1. Test the configuration: `npx hardhat compile`
2. Deploy contracts: `npx hardhat run scripts/deploy.ts --network sepolia`
3. Run tests: `npm test`
4. Verify contracts on Etherscan 