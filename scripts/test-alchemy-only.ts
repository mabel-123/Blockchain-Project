import { JsonRpcProvider } from 'ethers';

async function main() {
  console.log("Testing Alchemy connection only...");

  try {
    // Connect to the Ethereum network using your Alchemy API key
    const provider = new JsonRpcProvider("https://eth-sepolia.g.alchemyapi.io/v2/9vXoD6YKn4YS1EizvU8ku");

    // Get block by number
    const blockNumber = "latest";
    const block = await provider.getBlock(blockNumber);

    console.log("✅ Alchemy connection successful!");
    console.log("Block number:", block?.number);
    console.log("Block hash:", block?.hash);
    console.log("Timestamp:", block?.timestamp);
    
    // Get network info
    const network = await provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);

    console.log("\n🎉 Your Alchemy API key is working correctly!");
    console.log("Next step: Update your private key and Etherscan API key in hardhat.config.ts");

  } catch (error) {
    console.error("❌ Alchemy connection failed:", error);
    console.log("Please check your Alchemy API key.");
  }
}

main().catch((error) => {
  console.error("Script error:", error);
  process.exitCode = 1;
}); 