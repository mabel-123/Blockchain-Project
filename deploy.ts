import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  // Get the deployer account
  const [deployer, addr1, addr2, addr3] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Use the first 3 signers as multi-signature addresses
  const multisigOwners = [
    deployer.address,
    addr1.address, 
    addr2.address
  ];

  console.log("Multi-signature addresses:");
  console.log("1. Owner:", multisigOwners[0]);
  console.log("2. Approver 1:", multisigOwners[1]);
  console.log("3. Approver 2:", multisigOwners[2]);

  // Deploy MyToken contract
  console.log("\nDeploying MyToken contract...");
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy(multisigOwners);
  await myToken.waitForDeployment();
  console.log("MyToken deployed to:", await myToken.getAddress());

  // Deploy UBaEducationCredentialsStore contract
  console.log("\nDeploying UBaEducationCredentialsStore contract...");
  const verificationFee = ethers.parseEther("10"); // 10 tokens for verification
  const UBaEducationCredentialsStore = await ethers.getContractFactory("UBaEducationCredentialsStore");
  const credentialsStore = await UBaEducationCredentialsStore.deploy(await myToken.getAddress(), verificationFee);
  await credentialsStore.waitForDeployment();
  console.log("UBaEducationCredentialsStore deployed to:", await credentialsStore.getAddress());

  // Transfer 10 tokens to the specified address
  console.log("\nTransferring 10 tokens to specified address...");
  const targetAddress = "0x0874207411f712D90edd8ded353fdc6f9a417903";
  const transferAmount = ethers.parseEther("10");
  
  // First, we need to mint tokens to the deployer (requires multi-sig approval)
  console.log("Note: To transfer tokens, you'll need to:");
  console.log("1. Approve minting from all 3 multisig addresses");
  console.log("2. Mint tokens to deployer");
  console.log("3. Transfer tokens to the target address");
  
  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("MyToken Address:", await myToken.getAddress());
  console.log("UBaEducationCredentialsStore Address:", await credentialsStore.getAddress());
  console.log("Verification Fee:", ethers.formatEther(verificationFee), "tokens");
  console.log("Target Address for 10 tokens:", targetAddress);
  console.log("\nNext steps:");
  console.log("1. Update hardhat.config.ts with your API keys");
  console.log("2. Verify contracts on Etherscan");
  console.log("3. Execute multi-sig minting process");
  console.log("4. Transfer tokens to target address");
  
  console.log("\nCommands to run:");
  console.log("1. Mint tokens: npx hardhat run scripts/mint-tokens.ts --network sepolia");
  console.log("2. Transfer tokens: npx hardhat run scripts/transfer-tokens.ts --network sepolia");
  console.log("3. Verify contracts: npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <ARGS>");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});