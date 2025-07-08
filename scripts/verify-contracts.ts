import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeploymentInfo {
  network: string;
  deployer: string;
  contracts: {
    myContract?: string;
    myToken?: string;
    credentialsStore?: string;
  };
  configuration: {
    approvers?: string[];
    verificationFee?: string;
    testCredentialHash?: string;
  };
  timestamp: string;
}

async function main() {
  console.log("🔍 Starting contract verification process...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📋 Using deployer account:", deployer.address);

  try {
    // Check if deployment info exists
    const deploymentInfoPath = path.join(__dirname, "../deployment-info.json");
    let deploymentInfo: DeploymentInfo;

    if (fs.existsSync(deploymentInfoPath)) {
      const fileContent = fs.readFileSync(deploymentInfoPath, "utf8");
      deploymentInfo = JSON.parse(fileContent);
      console.log("📄 Found deployment info from previous deployment");
    } else {
      console.log("❌ No deployment info found. Please run deployment scripts first.");
      console.log("💡 Run: npm run deploy:all");
      return;
    }

    console.log("\n🔍 Verifying contracts on Etherscan...");

    // Verify MyContract
    if (deploymentInfo.contracts.myContract) {
      console.log("\n📄 Verifying MyContract...");
      try {
        await hre.run("verify:verify", {
          address: deploymentInfo.contracts.myContract,
          constructorArguments: ["Group 3 Contract", 100],
        });
        console.log("✅ MyContract verified successfully!");
      } catch (error: any) {
        if (error.message.includes("Already Verified")) {
          console.log("ℹ️ MyContract already verified");
        } else {
          console.log("❌ MyContract verification failed:", error.message);
        }
      }
    }

    // Verify MyToken
    if (deploymentInfo.contracts.myToken && deploymentInfo.configuration.approvers) {
      console.log("\n🪙 Verifying MyToken...");
      try {
        await hre.run("verify:verify", {
          address: deploymentInfo.contracts.myToken,
          constructorArguments: [deploymentInfo.configuration.approvers],
        });
        console.log("✅ MyToken verified successfully!");
      } catch (error: any) {
        if (error.message.includes("Already Verified")) {
          console.log("ℹ️ MyToken already verified");
        } else {
          console.log("❌ MyToken verification failed:", error.message);
        }
      }
    }

    // Verify UBaEducationCredentialsStore
    if (deploymentInfo.contracts.credentialsStore && deploymentInfo.contracts.myToken && deploymentInfo.configuration.verificationFee) {
      console.log("\n🎓 Verifying UBaEducationCredentialsStore...");
      try {
        const verificationFee = ethers.parseEther(deploymentInfo.configuration.verificationFee);
        await hre.run("verify:verify", {
          address: deploymentInfo.contracts.credentialsStore,
          constructorArguments: [deploymentInfo.contracts.myToken, verificationFee],
        });
        console.log("✅ UBaEducationCredentialsStore verified successfully!");
      } catch (error: any) {
        if (error.message.includes("Already Verified")) {
          console.log("ℹ️ UBaEducationCredentialsStore already verified");
        } else {
          console.log("❌ UBaEducationCredentialsStore verification failed:", error.message);
        }
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Contract verification process completed!");
    console.log("=".repeat(60));
    
    // Display verification links
    const network = await ethers.provider.getNetwork();
    const baseUrl = network.chainId === 11155111n ? "https://sepolia.etherscan.io" : "https://etherscan.io";
    
    console.log("\n🔗 Verification Links:");
    if (deploymentInfo.contracts.myContract) {
      console.log(`📄 MyContract: ${baseUrl}/address/${deploymentInfo.contracts.myContract}#code`);
    }
    if (deploymentInfo.contracts.myToken) {
      console.log(`🪙 MyToken: ${baseUrl}/address/${deploymentInfo.contracts.myToken}#code`);
    }
    if (deploymentInfo.contracts.credentialsStore) {
      console.log(`🎓 UBaEducationCredentialsStore: ${baseUrl}/address/${deploymentInfo.contracts.credentialsStore}#code`);
    }

  } catch (error) {
    console.error("❌ Contract verification failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Verification script failed:", error);
    process.exit(1);
  }); 