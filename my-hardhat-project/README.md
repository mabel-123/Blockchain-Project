# My Hardhat Project

This project is a simple Ethereum smart contract development setup using Hardhat, TypeScript, and the Sepolia testnet.

## Project Structure

```
my-hardhat-project
├── contracts
│   └── MyContract.sol       # Solidity smart contract
├── scripts
│   └── deploy.ts            # Deployment script for MyContract
├── test
│   └── myContract.test.ts    # Tests for MyContract
├── typechain-types          # Type definitions for TypeChain
├── hardhat.config.ts        # Hardhat configuration file
├── package.json             # npm configuration file
├── tsconfig.json            # TypeScript configuration file
└── README.md                # Project documentation
```

## Setup Instructions

1. **Install Dependencies**: Run `npm install` to install all necessary dependencies listed in `package.json`.

2. **Configure Hardhat**: Update the `hardhat.config.ts` file with your Alchemy/Infura project ID and your wallet's private key to connect to the Sepolia testnet.

3. **Compile Contracts**: Use the command `npx hardhat compile` to compile the Solidity contracts.

4. **Deploy Contracts**: Run the deployment script with `npx hardhat run scripts/deploy.ts --network sepolia` to deploy the `MyContract` smart contract to the Sepolia testnet.

5. **Run Tests**: Execute `npx hardhat test` to run the tests defined in `test/myContract.test.ts`.

## Usage

This project serves as a template for developing and deploying Ethereum smart contracts. You can modify the `MyContract.sol` file to implement your own contract logic and update the deployment and test scripts accordingly.

## License

This project is licensed under the MIT License.