# Blockchain Project - Distributed Systems and Blockchains Security

This project implements a custom ERC20 token with multi-signature functionality and an education credentials verification system on the Sepolia testnet.

## Project Overview

### MyToken (ERC20 Token)
- **Name**: Group 3 Token
- **Symbol**: G3TK
- **Features**:
  - ETH-to-token conversion (automatic and manual)
  - Multi-signature minting control (3 approvers required)
  - Multi-signature withdrawal control (2 out of 3 approvers)
  - Secure token operations with proper access control

### UBaEducationCredentialsStore
- **Purpose**: Education credentials verification system
- **Features**:
  - Store credential hashes on blockchain (not plaintext)
  - Verify credentials by paying with custom tokens
  - Owner-controlled credential management
  - Secure fee collection and withdrawal

## Security Features

### Why Store Hashes Instead of Plaintext?
1. **Privacy Protection**: Sensitive educational data is not exposed on the public blockchain
2. **Gas Efficiency**: Storing hashes is much cheaper than storing large JSON documents
3. **Data Integrity**: Hashes provide cryptographic proof of document authenticity
4. **Compliance**: Meets data protection requirements while maintaining verifiability

## Development Environment Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet
- Sepolia testnet ETH

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

3. **Configure environment**
   - Copy `.env.example` to `.env` (if available)
   - Add your configuration values

### Required API Keys
- **Alchemy/Infura**: For Sepolia testnet access
- **Etherscan**: For contract verification
- **Private Key**: Your wallet's private key for deployment

## Configuration

### Update hardhat.config.ts
Replace the placeholder values in `hardhat.config.ts`:

```typescript
const ALCHEMY_API_KEY = "your-alchemy-api-key";
const SEPOLIA_PRIVATE_KEY = "your-private-key";
const ETHERSCAN_API_KEY = "your-etherscan-api-key";
```

### Multi-Signature Addresses
Update the multi-signature addresses in `deploy.ts`:

```typescript
const multisigOwners = [
  "0xYourAddress1",
  "0xYourAddress2", 
  "0xYourAddress3"
];
```

## Contract Deployment

### Deploy to Sepolia Testnet
```bash
npm run deploy
```

### Expected Output
```
Starting deployment...
Deploying contracts with account: 0x...
Account balance: ...

Deploying MyToken contract...
MyToken deployed to: 0x...

Deploying UBaEducationCredentialsStore contract...
UBaEducationCredentialsStore deployed to: 0x...

Deployment Summary:
===================
MyToken Address: 0x...
UBaEducationCredentialsStore Address: 0x...
Verification Fee: 10 tokens
Target Address for 10 tokens: 0x0874207411f712D90edd8ded353fdc6f9a417903
```

## Contract Verification

### Verify on Etherscan
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Example
```bash
# For MyToken
npx hardhat verify --network sepolia 0x... "0x...,0x...,0x..."

# For UBaEducationCredentialsStore
npx hardhat verify --network sepolia 0x... "0x..." "10000000000000000000"
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Files
```bash
npx hardhat test test/MyToken.test.ts
npx hardhat test test/UBaEducationCredentialsStore.test.ts
```

### Test Coverage
The test suite covers:
- Basic ERC20 functionality
- ETH-to-token conversion
- Multi-signature minting security
- Multi-signature withdrawal security
- Credential storage and verification
- Access control and security measures
- Reentrancy protection

## Token Operations

### Multi-Signature Minting Process
1. All 3 approvers call `approveMint()`
2. Owner calls `mint(address, amount)`
3. Approvals are automatically reset

### Multi-Signature Withdrawal Process
1. At least 2 out of 3 approvers call `approveWithdraw()`
2. Owner calls `withdraw(address, amount)`
3. Approvals are automatically reset

### Token Transfer to Target Address
After minting tokens to the deployer:
```bash
npx hardhat run scripts/transfer-tokens.ts --network sepolia
```

## MetaMask Integration

### Add Custom Token
1. Open MetaMask
2. Go to "Import Tokens"
3. Enter the deployed MyToken contract address
4. Token details will auto-populate
5. Click "Add Custom Token"

### Verify Token Balance
- Check that 10 tokens are transferred to: `0x0874207411f712D90edd8ded353fdc6f9a417903`

## Credential Verification Process

### 1. Store Credential
```javascript
// Owner stores credential hash
await credentialsStore.storeCredential(credentialHash, studentAddress);
```

### 2. Calculate Credential Hash
```javascript
// Generate hash from credential data
const hash = await credentialsStore.calculateCredentialHash(
  "UBA2358985",  // matriculation
  "A",           // cryptology grade
  "B",           // blockchain grade
  "A"            // secure software dev grade
);
```

### 3. Verify Credential
```javascript
// User approves tokens and verifies
await token.approve(credentialsStore.address, verificationFee);
await credentialsStore.verifyCredential(credentialHash);
```

## Project Structure

```
my-hardhat-project/
├── contracts/
│   ├── MyToken.sol
│   └── UBaEducationCredentialsStore.sol
├── test/
│   ├── MyToken.test.ts
│   └── UBaEducationCredentialsStore.test.ts
├── scripts/
│   └── deploy.ts
├── hardhat.config.ts
├── package.json
└── README.md
```

## Security Considerations

### Implemented Security Measures
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Access control for administrative functions
- **Multi-signature**: Requires multiple approvals for critical operations
- **Input Validation**: Comprehensive parameter validation
- **Error Handling**: Proper error messages and revert conditions

### Best Practices
- Never store sensitive data on-chain
- Use hashes for data integrity verification
- Implement proper access controls
- Test thoroughly before deployment
- Verify contracts on Etherscan

## Troubleshooting

### Common Issues
1. **Insufficient ETH**: Ensure you have Sepolia testnet ETH
2. **API Key Issues**: Verify Alchemy/Infura API keys are correct
3. **Private Key**: Ensure private key is properly formatted (without 0x prefix)
4. **Network Issues**: Check network connectivity and API endpoints

### Getting Help
- Check Hardhat documentation: https://hardhat.org/
- OpenZeppelin documentation: https://docs.openzeppelin.com/
- Etherscan verification guide: https://docs.etherscan.io/

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

---

**Note**: This project is for educational purposes. Always test thoroughly on testnets before deploying to mainnet.