import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying MyContract...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Using deployer account:", deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  try {
    // Deploy MyContract
    console.log("\n📄 Deploying MyContract...");
    const MyContract = await ethers.getContractFactory("MyContract");
    
    // You can customize these parameters
    const contractName = "Group 3 Contract";
    const initialValue = 100;
    
    const myContract = await MyContract.deploy(contractName, initialValue);
    await myContract.waitForDeployment();
    const myContractAddress = await myContract.getAddress();
    const myContractInstance = myContract as any;
    
    console.log("✅ MyContract deployed successfully!");
    console.log("📍 Contract address:", myContractAddress);
    console.log("📝 Contract name:", contractName);
    console.log("🔢 Initial value:", initialValue);

    // Verify the deployment
    console.log("\n🔍 Verifying deployment...");
    const deployedName = await myContract.name();
    const deployedValue = await myContract.getValue();
    
    console.log("✅ Verification successful!");
    console.log("📝 Deployed name:", deployedName);
    console.log("🔢 Deployed value:", deployedValue.toString());

    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    const testValue = 250;
    await myContractInstance.connect(deployer).setValue(testValue);
    const retrievedValue = await myContractInstance.getValue();
    
    if (retrievedValue === BigInt(testValue)) {
      console.log("✅ Basic functionality test passed!");
    } else {
      console.log("❌ Basic functionality test failed!");
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 MyContract deployment completed!");
    console.log("=".repeat(50));
    console.log("📍 Address:", myContractAddress);
    console.log("📝 Name:", contractName);
    console.log("🔢 Initial Value:", initialValue);
    console.log("=".repeat(50));

  } catch (error) {
    console.error("❌ MyContract deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Deployment script failed:", error);
    process.exit(1);
  }); 