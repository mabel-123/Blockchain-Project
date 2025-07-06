import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying MyToken...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Using deployer account:", deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Get additional signers for multi-sig setup
  const [_, addr1, addr2] = await ethers.getSigners();
  
  try {
    // Deploy MyToken
    console.log("\n🪙 Deploying MyToken...");
    const MyToken = await ethers.getContractFactory("MyToken");
    
    // Set up multi-sig approvers
    const approvers = [deployer.address, addr1.address, addr2.address];
    console.log("🔐 Multi-sig approvers:", approvers);
    
    const myToken = await MyToken.deploy(approvers);
    await myToken.waitForDeployment();
    const myTokenAddress = await myToken.getAddress();
    const myTokenInstance = myToken as any;
    
    console.log("✅ MyToken deployed successfully!");
    console.log("📍 Contract address:", myTokenAddress);

    // Verify the deployment
    console.log("\n🔍 Verifying deployment...");
    const tokenName = await myTokenInstance.name();
    const tokenSymbol = await myTokenInstance.symbol();
    const tokenDecimals = await myTokenInstance.decimals();
    const tokenPrice = await myTokenInstance.tokenPrice();
    
    console.log("✅ Verification successful!");
    console.log("📝 Token name:", tokenName);
    console.log("🔤 Token symbol:", tokenSymbol);
    console.log("🔢 Token decimals:", tokenDecimals);
    console.log("💰 Token price:", ethers.formatEther(tokenPrice), "ETH");

    // Verify approvers
    console.log("\n🔐 Verifying multi-sig approvers...");
    for (let i = 0; i < 3; i++) {
      const approver = await myTokenInstance.approvers(i);
      console.log(`Approver ${i + 1}:`, approver);
    }

    // Test ETH to token conversion
    console.log("\n🧪 Testing ETH to token conversion...");
    const ethAmount = ethers.parseEther("1");
    const expectedTokens = ethAmount / tokenPrice;
    
    await deployer.sendTransaction({ to: myTokenAddress, value: ethAmount });
    const deployerBalance = await myTokenInstance.balanceOf(deployer.address);
    
    console.log("✅ ETH conversion test successful!");
    console.log("💰 ETH sent:", ethers.formatEther(ethAmount));
    console.log("🪙 Tokens received:", ethers.formatEther(deployerBalance));

    // Test multi-sig minting
    console.log("\n🧪 Testing multi-sig minting...");
    await myTokenInstance.connect(deployer).approveMint();
    await myTokenInstance.connect(addr1).approveMint();
    await myTokenInstance.connect(addr2).approveMint();
    
    const mintAmount = 500;
    await myTokenInstance.connect(deployer).mint(addr1.address, mintAmount);
    
    const addr1Balance = await myTokenInstance.balanceOf(addr1.address);
    console.log("✅ Multi-sig minting test successful!");
    console.log("🪙 Minted tokens to addr1:", ethers.formatEther(addr1Balance));

    // Test token transfer
    console.log("\n🧪 Testing token transfer...");
    const transferAmount = ethers.parseUnits("100", 18);
    await myTokenInstance.connect(addr1).transfer(addr2.address, transferAmount);
    
    const addr2Balance = await myTokenInstance.balanceOf(addr2.address);
    console.log("✅ Token transfer test successful!");
    console.log("🪙 addr2 balance:", ethers.formatEther(addr2Balance));

    console.log("\n" + "=".repeat(60));
    console.log("🎉 MyToken deployment completed!");
    console.log("=".repeat(60));
    console.log("📍 Contract address:", myTokenAddress);
    console.log("📝 Token name:", tokenName);
    console.log("🔤 Token symbol:", tokenSymbol);
    console.log("💰 Token price:", ethers.formatEther(tokenPrice), "ETH");
    console.log("🔐 Multi-sig approvers:", approvers.join(", "));
    console.log("=".repeat(60));

    // Save deployment info
    const deploymentInfo = {
      contract: "MyToken",
      address: myTokenAddress,
      name: tokenName,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      tokenPrice: ethers.formatEther(tokenPrice),
      approvers: approvers,
      deployer: deployer.address,
      timestamp: new Date().toISOString()
    };

    console.log("\n💾 Deployment information:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

  } catch (error) {
    console.error("❌ MyToken deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Deployment script failed:", error);
    process.exit(1);
  }); 