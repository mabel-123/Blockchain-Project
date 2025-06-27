import { ethers } from "hardhat";

async function main() {
  console.log("Starting token transfer process...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Contract addresses (update these after deployment)
  const tokenAddress = "YOUR_TOKEN_CONTRACT_ADDRESS"; // Update this
  const targetAddress = "0x0874207411f712D90edd8ded353fdc6f9a417903";
  const transferAmount = ethers.parseEther("10"); // 10 tokens

  // Get contract instances
  const MyToken = await ethers.getContractFactory("MyToken");
  const token = MyToken.attach(tokenAddress);

  console.log("Token contract address:", tokenAddress);
  console.log("Target address:", targetAddress);
  console.log("Transfer amount:", ethers.formatEther(transferAmount), "tokens");

  // Check deployer's token balance
  const deployerBalance = await token.balanceOf(deployer.address);
  console.log("Deployer token balance:", ethers.formatEther(deployerBalance), "tokens");

  if (deployerBalance < transferAmount) {
    console.log("Insufficient token balance. You need to mint tokens first.");
    console.log("Required:", ethers.formatEther(transferAmount), "tokens");
    console.log("Available:", ethers.formatEther(deployerBalance), "tokens");
    console.log("\nTo mint tokens:");
    console.log("1. Call approveMint() from all 3 multisig addresses");
    console.log("2. Call mint() from the owner address");
    return;
  }

  // Check target address current balance
  const targetBalance = await token.balanceOf(targetAddress);
  console.log("Target address current balance:", ethers.formatEther(targetBalance), "tokens");

  // Transfer tokens
  console.log("\nTransferring tokens...");
  const tx = await token.connect(deployer).transfer(targetAddress, transferAmount);
  console.log("Transaction hash:", tx.hash);

  // Wait for transaction confirmation
  await tx.wait();
  console.log("Transaction confirmed!");

  // Check final balances
  const finalDeployerBalance = await token.balanceOf(deployer.address);
  const finalTargetBalance = await token.balanceOf(targetAddress);

  console.log("\nTransfer Summary:");
  console.log("==================");
  console.log("Deployer final balance:", ethers.formatEther(finalDeployerBalance), "tokens");
  console.log("Target final balance:", ethers.formatEther(finalTargetBalance), "tokens");
  console.log("Transaction hash:", tx.hash);

  console.log("\n✅ Token transfer completed successfully!");
  console.log("📝 Include this transaction hash in your report:", tx.hash);
}

main().catch((error) => {
  console.error("Error during token transfer:", error);
  process.exitCode = 1;
}); 