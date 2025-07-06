import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeploymentInfo {
  network: string;
  deployer: string;
  contracts: {
    myContract?: string;
    myToken?: string;
    credentialsStore?: string;
  };
  configuration: {
    approvers?: string[];
    verificationFee?: string;
    testCredentialHash?: string;
  };
  timestamp: string;
  blockNumber: number;
  gasUsed: {
    myContract?: number;
    myToken?: number;
    credentialsStore?: number;
  };
}

async function main() {
  console.log("💾 Saving deployment information...");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  // Get deployment info from command line arguments or environment
  const myContractAddress = process.env.MY_CONTRACT_ADDRESS;
  const myTokenAddress = process.env.MY_TOKEN_ADDRESS;
  const credentialsStoreAddress = process.env.CREDENTIALS_STORE_ADDRESS;
  const approvers = process.env.APPROVERS ? process.env.APPROVERS.split(',') : [];
  const verificationFee = process.env.VERIFICATION_FEE || "10";
  const testCredentialHash = process.env.TEST_CREDENTIAL_HASH;

  if (!myContractAddress && !myTokenAddress && !credentialsStoreAddress) {
    console.log("❌ No contract addresses provided. Please set environment variables:");
    console.log("   MY_CONTRACT_ADDRESS, MY_TOKEN_ADDRESS, CREDENTIALS_STORE_ADDRESS");
    console.log("   Or run this script after deployment to automatically capture addresses.");
    return;
  }

  const deploymentInfo: DeploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    contracts: {},
    configuration: {},
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    gasUsed: {}
  };

  // Add contract addresses if provided
  if (myContractAddress) {
    deploymentInfo.contracts.myContract = myContractAddress;
  }
  
  if (myTokenAddress) {
    deploymentInfo.contracts.myToken = myTokenAddress;
  }
  
  if (credentialsStoreAddress) {
    deploymentInfo.contracts.credentialsStore = credentialsStoreAddress;
  }

  // Add configuration if provided
  if (approvers.length > 0) {
    deploymentInfo.configuration.approvers = approvers;
  }
  
  if (verificationFee) {
    deploymentInfo.configuration.verificationFee = verificationFee;
  }
  
  if (testCredentialHash) {
    deploymentInfo.configuration.testCredentialHash = testCredentialHash;
  }

  // Save to file
  const filePath = path.join(__dirname, "../deployment-info.json");
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("✅ Deployment information saved to deployment-info.json");
  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log("Network:", deploymentInfo.network);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("Block Number:", deploymentInfo.blockNumber);
  console.log("Timestamp:", deploymentInfo.timestamp);
  
  if (deploymentInfo.contracts.myContract) {
    console.log("MyContract:", deploymentInfo.contracts.myContract);
  }
  
  if (deploymentInfo.contracts.myToken) {
    console.log("MyToken:", deploymentInfo.contracts.myToken);
  }
  
  if (deploymentInfo.contracts.credentialsStore) {
    console.log("UBaEducationCredentialsStore:", deploymentInfo.contracts.credentialsStore);
  }
  
  if (deploymentInfo.configuration.approvers) {
    console.log("Approvers:", deploymentInfo.configuration.approvers.join(", "));
  }
  
  if (deploymentInfo.configuration.verificationFee) {
    console.log("Verification Fee:", deploymentInfo.configuration.verificationFee, "tokens");
  }

  console.log("\n💡 Next steps:");
  console.log("1. Verify contracts: npm run verify");
  console.log("2. Test the system: npm test");
  console.log("3. Update your frontend with the contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Failed to save deployment info:", error);
    process.exit(1);
  }); 