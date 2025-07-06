# 🏗️ Blockchain Smart Contract Project

A comprehensive Hardhat project featuring multiple smart contracts for education credential verification with ERC20 token integration.

## 📋 Project Overview

This project contains three main smart contracts:

1. **MyContract** - A simple contract with basic value storage and retrieval
2. **MyToken** - An ERC20 token with ETH conversion and multi-sig functionality
3. **UBaEducationCredentialsStore** - A credential verification system using custom tokens

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet
- Alchemy account (for RPC endpoint)
- Etherscan account (for contract verification)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-hardhat-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your actual values:
   ```env
   ALCHEMY_API_KEY=your_alchemy_api_key_here
   SEPOLIA_PRIVATE_KEY=your_private_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

4. **Compile contracts**
   ```bash
   npm run compile
   ```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run specific test files
```bash
npx hardhat test test/MyContract.test.ts
npx hardhat test test/MyToken.test.ts
npx hardhat test test/UBaEducationCredentialsStore.test.ts
```

### Run tests with gas reporting
```bash
npm run gas
```

### Run comprehensive test suite
```bash
npx hardhat run scripts/run-tests.ts
```

## 🚀 Deployment

### Deploy all contracts
```bash
npm run deploy:all
```

### Deploy individual contracts
```bash
# Deploy MyContract only
npm run deploy:mycontract

# Deploy MyToken only
npm run deploy:mytoken

# Deploy UBaEducationCredentialsStore only
npm run deploy:credentials
```

### Deploy to local network
```bash
# Start local node
npm run node

# Deploy to localhost
npm run deploy:local
```

## 📄 Contract Details

### MyContract
- **Purpose**: Simple value storage and retrieval
- **Functions**: `setValue()`, `getValue()`
- **Constructor**: Takes name and initial value

### MyToken
- **Purpose**: ERC20 token with ETH conversion
- **Features**:
  - ETH to token conversion (1 ETH = 1000 tokens)
  - Multi-sig minting (requires 3 approvals)
  - Multi-sig withdrawal (requires 2 out of 3 approvals)
- **Token Details**: "Group 3 Token" (G3TK)

### UBaEducationCredentialsStore
- **Purpose**: Education credential verification system
- **Features**:
  - Store credential hashes on blockchain
  - Verify credentials with token payment
  - Multi-sig token management
  - Credential hash calculation
- **Verification Fee**: 10 tokens per verification

## 🔧 Available Scripts

```bash
# Development
npm run compile          # Compile contracts
npm run clean           # Clean build artifacts
npm run node            # Start local Hardhat node

# Testing
npm test                # Run all tests
npm run test:coverage   # Run tests with coverage
npm run gas             # Run tests with gas reporting

# Deployment
npm run deploy          # Deploy basic contract
npm run deploy:all      # Deploy all contracts
npm run deploy:mycontract    # Deploy MyContract
npm run deploy:mytoken       # Deploy MyToken
npm run deploy:credentials   # Deploy UBaEducationCredentialsStore
npm run deploy:local    # Deploy to localhost

# Verification
npm run verify          # Verify contracts on Etherscan
```

## 📊 Contract Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────┐
│   MyContract    │    │     MyToken      │    │ UBaEducationCredentials │
│                 │    │                  │    │         Store           │
│ - setValue()    │    │ - ETH conversion │    │ - storeCredential()     │
│ - getValue()    │    │ - Multi-sig mint │    │ - verifyCredential()    │
│                 │    │ - Multi-sig w/d  │    │ - checkCredential()     │
└─────────────────┘    └──────────────────┘    └─────────────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │   Token Payment  │
                        │   & Verification │
                        └──────────────────┘
```

## 🔐 Security Features

- **Multi-signature**: Critical operations require multiple approvals
- **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
- **Access Control**: Owner-only functions for sensitive operations
- **Input Validation**: Comprehensive parameter validation
- **Gas Optimization**: Optimized contract code for efficiency

## 📝 Usage Examples

### 1. Deploy and Test MyContract
```bash
npm run deploy:mycontract
npx hardhat test test/MyContract.test.ts
```

### 2. Deploy and Test MyToken
```bash
npm run deploy:mytoken
npx hardhat test test/MyToken.test.ts
```

### 3. Deploy and Test Complete System
```bash
npm run deploy:all
npx hardhat test test/UBaEducationCredentialsStore.test.ts
```

### 4. Transfer Tokens
```bash
# Update token address in scripts/transfer-tokens.ts
npx hardhat run scripts/transfer-tokens.ts --network sepolia
```

### 5. Verify Contracts
```bash
npm run verify
```

## 🔍 Contract Verification

After deployment, verify your contracts on Etherscan:

```bash
npx hardhat run scripts/verify-contracts.ts --network sepolia
```

## 📈 Gas Optimization

The contracts are optimized for gas efficiency:
- Solidity optimizer enabled (200 runs)
- Efficient data structures
- Minimal storage operations
- Optimized function calls

## 🛠️ Development

### Adding New Contracts
1. Create contract in `contracts/` directory
2. Add tests in `test/` directory
3. Create deployment script in `scripts/` directory
4. Update this README

### Testing Best Practices
- Test all public functions
- Test edge cases and error conditions
- Test gas usage for critical functions
- Use descriptive test names
- Group related tests in describe blocks

## 📚 API Reference

### MyContract Functions
- `setValue(uint256 _value)` - Set the contract value
- `getValue()` - Get the current value
- `name()` - Get contract name

### MyToken Functions
- `buyTokens()` - Buy tokens with ETH
- `approveMint()` - Approve minting (multi-sig)
- `mint(address to, uint256 amount)` - Mint tokens
- `approveWithdraw()` - Approve withdrawal (multi-sig)
- `withdraw(address payable to, uint256 amount)` - Withdraw ETH

### UBaEducationCredentialsStore Functions
- `storeCredential(bytes32 credentialHash, address owner)` - Store credential
- `verifyCredential(bytes32 credentialHash)` - Verify credential
- `checkCredential(bytes32 credentialHash)` - Check if credential exists
- `getCredentialOwner(bytes32 credentialHash)` - Get credential owner
- `calculateCredentialHash(...)` - Calculate credential hash

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the test suite: `npm test`
2. Verify your environment variables
3. Check network connectivity
4. Review contract compilation: `npm run compile`
5. Check gas limits and network configuration

## 🔗 Useful Links

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Etherscan API](https://docs.etherscan.io/)
- [Alchemy Documentation](https://docs.alchemy.com/)
- [Solidity Documentation](https://docs.soliditylang.org/)

---

**Note**: This is a development project. For production use, ensure thorough testing and security audits.