import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying UBaEducationCredentialsStore...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Using deployer account:", deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  try {
    // First, deploy MyToken if not already deployed
    console.log("\n🪙 Checking/Deploying MyToken...");
    let myTokenAddress: string;
    
    // You can either deploy a new token or use an existing one
    // For this script, we'll deploy a new one
    const [_, addr1, addr2] = await ethers.getSigners();
    const approvers = [deployer.address, addr1.address, addr2.address];
    
    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy(approvers);
    await myToken.waitForDeployment();
    myTokenAddress = await myToken.getAddress();
    const myTokenInstance = myToken as any;
    
    console.log("✅ MyToken deployed at:", myTokenAddress);

    // Deploy UBaEducationCredentialsStore
    console.log("\n🎓 Deploying UBaEducationCredentialsStore...");
    const UBaEducationCredentialsStore = await ethers.getContractFactory("UBaEducationCredentialsStore");
    
    // Set verification fee (10 tokens)
    const verificationFee = ethers.parseEther("10");
    
    const credentialsStore = await UBaEducationCredentialsStore.deploy(myTokenAddress, verificationFee);
    await credentialsStore.waitForDeployment();
    const credentialsStoreAddress = await credentialsStore.getAddress();
    const credentialsStoreInstance = credentialsStore as any;
    
    console.log("✅ UBaEducationCredentialsStore deployed successfully!");
    console.log("📍 Contract address:", credentialsStoreAddress);

    // Verify the deployment
    console.log("\n🔍 Verifying deployment...");
    const storeTokenContract = await credentialsStoreInstance.tokenContract();
    const storeVerificationFee = await credentialsStoreInstance.verificationFee();
    const storeOwner = await credentialsStoreInstance.owner();
    
    console.log("✅ Verification successful!");
    console.log("🪙 Token contract:", storeTokenContract);
    console.log("💸 Verification fee:", ethers.formatEther(storeVerificationFee), "tokens");
    console.log("👑 Owner:", storeOwner);

    // Initial setup and testing
    console.log("\n⚙️ Performing initial setup...");
    
    // Mint tokens to deployer for testing
    console.log("🪙 Minting tokens to deployer...");
    await myTokenInstance.connect(deployer).approveMint();
    await myTokenInstance.connect(addr1).approveMint();
    await myTokenInstance.connect(addr2).approveMint();
    await myTokenInstance.connect(deployer).mint(deployer.address, 1000);
    
    const deployerTokenBalance = await myTokenInstance.balanceOf(deployer.address);
    console.log("✅ Minted tokens to deployer:", ethers.formatEther(deployerTokenBalance));

    // Store a test credential
    console.log("\n📜 Storing test credential...");
    const testCredentialHash = ethers.keccak256(ethers.toUtf8Bytes("Test Credential Data"));
    await credentialsStoreInstance.connect(deployer).storeCredential(testCredentialHash, deployer.address);
    
    const credentialExists = await credentialsStoreInstance.credentialExists(testCredentialHash);
    const credentialOwner = await credentialsStoreInstance.credentialOwner(testCredentialHash);
    
    console.log("✅ Test credential stored successfully!");
    console.log("🔍 Credential exists:", credentialExists);
    console.log("👤 Credential owner:", credentialOwner);

    // Test credential verification
    console.log("\n🧪 Testing credential verification...");
    
    // Approve tokens for verification
    await myTokenInstance.connect(deployer).approve(credentialsStoreAddress, verificationFee);
    
    // Verify the credential
    await credentialsStoreInstance.connect(deployer).verifyCredential(testCredentialHash);
    
    const finalDeployerBalance = await myTokenInstance.balanceOf(deployer.address);
    const contractBalance = await credentialsStoreInstance.getContractTokenBalance();
    
    console.log("✅ Credential verification test successful!");
    console.log("🪙 Deployer final balance:", ethers.formatEther(finalDeployerBalance));
    console.log("💰 Contract token balance:", ethers.formatEther(contractBalance));

    // Test hash calculation
    console.log("\n🧪 Testing hash calculation...");
    const matriculation = "UBA2358985";
    const cryptology = "A";
    const blockchain = "B";
    const secureSoftwareDev = "A";
    
    const calculatedHash = await credentialsStoreInstance.calculateCredentialHash(
      matriculation, cryptology, blockchain, secureSoftwareDev
    );
    
    console.log("✅ Hash calculation test successful!");
    console.log("📝 Calculated hash:", calculatedHash);

    console.log("\n" + "=".repeat(70));
    console.log("🎉 UBaEducationCredentialsStore deployment completed!");
    console.log("=".repeat(70));
    console.log("📍 Contract address:", credentialsStoreAddress);
    console.log("🪙 Token contract:", myTokenAddress);
    console.log("💸 Verification fee:", ethers.formatEther(verificationFee), "tokens");
    console.log("👑 Owner:", storeOwner);
    console.log("🔐 Multi-sig approvers:", approvers.join(", "));
    console.log("📜 Test credential hash:", testCredentialHash);
    console.log("=".repeat(70));

    // Save deployment info
    const deploymentInfo = {
      contract: "UBaEducationCredentialsStore",
      address: credentialsStoreAddress,
      tokenContract: myTokenAddress,
      verificationFee: ethers.formatEther(verificationFee),
      owner: storeOwner,
      approvers: approvers,
      testCredentialHash: testCredentialHash,
      deployer: deployer.address,
      timestamp: new Date().toISOString()
    };

    console.log("\n💾 Deployment information:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Instructions for next steps
    console.log("\n📋 NEXT STEPS:");
    console.log("1. Update your frontend with the new contract addresses");
    console.log("2. Test the complete workflow with your dApp");
    console.log("3. Store real credentials using the storeCredential function");
    console.log("4. Test credential verification with different users");

  } catch (error) {
    console.error("❌ UBaEducationCredentialsStore deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Deployment script failed:", error);
    process.exit(1);
  }); 