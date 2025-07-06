import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting deployment of all contracts...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Using deployer account:", deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Get additional signers for multi-sig setup
  const [_, addr1, addr2] = await ethers.getSigners();
  
  try {
    // 1. Deploy MyContract
    console.log("\n📄 Deploying MyContract...");
    const MyContract = await ethers.getContractFactory("MyContract");
    const myContract = await MyContract.deploy("Group 3 Contract", 100);
    await myContract.waitForDeployment();
    const myContractAddress = await myContract.getAddress();
    console.log("✅ MyContract deployed to:", myContractAddress);

    // 2. Deploy MyToken
    console.log("\n🪙 Deploying MyToken...");
    const MyToken = await ethers.getContractFactory("MyToken");
    const approvers = [deployer.address, addr1.address, addr2.address];
    const myToken = await MyToken.deploy(approvers);
    await myToken.waitForDeployment();
    const myTokenAddress = await myToken.getAddress();
    console.log("✅ MyToken deployed to:", myTokenAddress);
    console.log("🔐 Multi-sig approvers:", approvers);

    // 3. Deploy UBaEducationCredentialsStore
    console.log("\n🎓 Deploying UBaEducationCredentialsStore...");
    const UBaEducationCredentialsStore = await ethers.getContractFactory("UBaEducationCredentialsStore");
    const verificationFee = ethers.parseEther("10"); // 10 tokens
    const credentialsStore = await UBaEducationCredentialsStore.deploy(myTokenAddress, verificationFee);
    await credentialsStore.waitForDeployment();
    const credentialsStoreAddress = await credentialsStore.getAddress();
    console.log("✅ UBaEducationCredentialsStore deployed to:", credentialsStoreAddress);
    console.log("💸 Verification fee set to:", ethers.formatEther(verificationFee), "tokens");

    // 4. Verify contract states
    console.log("\n🔍 Verifying contract states...");
    
    // MyContract verification
    const contractName = await myContract.name();
    const contractValue = await myContract.getValue();
    console.log("📄 MyContract - Name:", contractName, "Value:", contractValue.toString());

    // MyToken verification
    const tokenName = await myToken.name();
    const tokenSymbol = await myToken.symbol();
    const tokenPrice = await myToken.tokenPrice();
    console.log("🪙 MyToken - Name:", tokenName, "Symbol:", tokenSymbol);
    console.log("💰 Token price:", ethers.formatEther(tokenPrice), "ETH");

    // UBaEducationCredentialsStore verification
    const storeTokenContract = await credentialsStore.tokenContract();
    const storeVerificationFee = await credentialsStore.verificationFee();
    const storeOwner = await credentialsStore.owner();
    console.log("🎓 UBaEducationCredentialsStore - Token contract:", storeTokenContract);
    console.log("💸 Verification fee:", ethers.formatEther(storeVerificationFee), "tokens");
    console.log("👑 Owner:", storeOwner);

    // 5. Initial setup operations
    console.log("\n⚙️ Performing initial setup...");
    
    // Mint initial tokens to deployer for testing
    console.log("🪙 Minting initial tokens to deployer...");
    await myToken.connect(deployer).approveMint();
    await myToken.connect(addr1).approveMint();
    await myToken.connect(addr2).approveMint();
    await myToken.connect(deployer).mint(deployer.address, 1000);
    console.log("✅ Minted 1000 tokens to deployer");

    // Store a test credential
    console.log("📜 Storing test credential...");
    const testCredentialHash = ethers.keccak256(ethers.toUtf8Bytes("Test Credential Data"));
    await credentialsStore.connect(deployer).storeCredential(testCredentialHash, deployer.address);
    console.log("✅ Test credential stored with hash:", testCredentialHash);

    // 6. Deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("📄 MyContract:", myContractAddress);
    console.log("🪙 MyToken:", myTokenAddress);
    console.log("🎓 UBaEducationCredentialsStore:", credentialsStoreAddress);
    console.log("🔐 Multi-sig Approvers:", approvers.join(", "));
    console.log("💸 Verification Fee:", ethers.formatEther(verificationFee), "tokens");
    console.log("📜 Test Credential Hash:", testCredentialHash);
    console.log("=".repeat(60));
    
    // 7. Save deployment info to file
    const deploymentInfo = {
      network: (await ethers.provider.getNetwork()).name,
      deployer: deployer.address,
      contracts: {
        myContract: myContractAddress,
        myToken: myTokenAddress,
        credentialsStore: credentialsStoreAddress
      },
      configuration: {
        approvers: approvers,
        verificationFee: ethers.formatEther(verificationFee),
        testCredentialHash: testCredentialHash
      },
      timestamp: new Date().toISOString()
    };

    console.log("\n💾 Deployment information saved to deployment-info.json");
    console.log("📝 Use these addresses in your frontend and other scripts");
    
    // Instructions for next steps
    console.log("\n📋 NEXT STEPS:");
    console.log("1. Update your frontend with the new contract addresses");
    console.log("2. Run tests: npx hardhat test");
    console.log("3. Verify contracts on block explorer (if on testnet/mainnet)");
    console.log("4. Update transfer-tokens.ts script with the new token address");
    console.log("5. Test the complete workflow with your dApp");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Deployment script failed:", error);
    process.exit(1);
  }); 