import { ethers } from "hardhat";

async function main() {
  console.log("Starting multi-signature minting process...");

  // Get signers
  const [owner, addr1, addr2, addr3] = await ethers.getSigners();
  
  // Contract addresses (update these after deployment)
  const tokenAddress = "0xA1234b56789cDEf0123456789ABCDEF012345678"; // Update this
  const mintAmount = 100; // Amount to mint
  const mintToAddress = owner.address; // Address to mint tokens to

  // Get contract instance
  const MyToken = await ethers.getContractFactory("MyToken");
  const token = MyToken.attach(tokenAddress);

  console.log("Token contract address:", tokenAddress);
  console.log("Minting to address:", mintToAddress);
  console.log("Mint amount:", mintAmount, "tokens");

  // Check current balances
  const initialBalance = await token.balanceOf(mintToAddress);
  console.log("Initial balance:", ethers.formatEther(initialBalance), "tokens");

  // Step 1: All 3 approvers approve minting
  console.log("\nStep 1: Approving minting from all 3 multisig addresses...");
  
  console.log("Approver 1 (owner) approving...");
  const tx1 = await token.connect(owner).approveMint();
  await tx1.wait();
  console.log("✅ Approver 1 approval confirmed");

  console.log("Approver 2 approving...");
  const tx2 = await token.connect(addr1).approveMint();
  await tx2.wait();
  console.log("✅ Approver 2 approval confirmed");

  console.log("Approver 3 approving...");
  const tx3 = await token.connect(addr2).approveMint();
  await tx3.wait();
  console.log("✅ Approver 3 approval confirmed");

  // Step 2: Owner mints tokens
  console.log("\nStep 2: Owner minting tokens...");
  const mintTx = await token.connect(owner).mint(mintToAddress, mintAmount);
  console.log("Minting transaction hash:", mintTx.hash);
  
  await mintTx.wait();
  console.log("✅ Minting confirmed!");

  // Check final balance
  const finalBalance = await token.balanceOf(mintToAddress);
  console.log("\nMinting Summary:");
  console.log("=================");
  console.log("Initial balance:", ethers.formatEther(initialBalance), "tokens");
  console.log("Minted amount:", mintAmount, "tokens");
  console.log("Final balance:", ethers.formatEther(finalBalance), "tokens");
  console.log("Minting transaction hash:", mintTx.hash);

  console.log("\n✅ Multi-signature minting completed successfully!");
  console.log("📝 You can now transfer tokens to the target address");
}

main().catch((error) => {
  console.error("Error during minting process:", error);
  process.exitCode = 1;
}); 