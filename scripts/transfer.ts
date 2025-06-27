import { ethers } from "hardhat";

async function main() {
  const tokenAddress = "0x0874207411f712D90edd8ded353fdc6f9a417903";
  const recipient = "0x0874207411f712D90edd8ded353fdc6f9a417903";
  const amount = ethers.parseUnits("10", 18); // 10 tokens, 18 decimals

  const [signer] = await ethers.getSigners();
  const token = await ethers.getContractAt("MyToken", tokenAddress, signer);

  const tx = await token.transfer(recipient, amount);
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("Transfer complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});