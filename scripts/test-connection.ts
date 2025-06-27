import { JsonRpcProvider } from 'ethers';

async function main() {
  console.log("Testing Alchemy connection...");

  try {
    // Connect to the Ethereum network
    const provider = new JsonRpcProvider("https://tea-sepolia.g.alchemy.com/v2/9vXoD6YKn4YS1EizvU8ku");

    // Get block by number
    const blockNumber = "latest";
    const block = await provider.getBlock(blockNumber);

    console.log("✅ Connection successful!");
    console.log("Block number:", block?.number);
    console.log("Block hash:", block?.hash);
    console.log("Timestamp:", block?.timestamp);
    
    // Get network info
    const network = await provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);

    // Get gas price
    const gasPrice = await provider.getFeeData();
    console.log("Current gas price:", gasPrice.gasPrice?.toString(), "wei");

  } catch (error) {
    console.error("❌ Connection failed:", error);
    console.log("Please check your Alchemy API key and network connection.");
  }
}

main().catch((error) => {
  console.error("Script error:", error);
  process.exitCode = 1;
}); 