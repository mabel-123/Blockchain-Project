import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface SetupConfig {
  hasEnvFile: boolean;
  hasValidKeys: boolean;
  canCompile: boolean;
  canTest: boolean;
  networkAccess: boolean;
}

async function main() {
  console.log("🔧 Setting up Blockchain Smart Contract Project...");
  console.log("=".repeat(60));
  
  const setupConfig: SetupConfig = {
    hasEnvFile: false,
    hasValidKeys: false,
    canCompile: false,
    canTest: false,
    networkAccess: false
  };

  try {
    // 1. Check environment file
    console.log("\n📋 1. Checking environment configuration...");
    const envPath = path.join(__dirname, "../.env");
    const envExamplePath = path.join(__dirname, "../env.example");
    
    if (fs.existsSync(envPath)) {
      setupConfig.hasEnvFile = true;
      console.log("✅ .env file found");
      
      // Check if keys are properly set
      const envContent = fs.readFileSync(envPath, "utf8");
      const hasAlchemyKey = envContent.includes("ALCHEMY_API_KEY=") && !envContent.includes("your_alchemy_api_key_here");
      const hasPrivateKey = envContent.includes("SEPOLIA_PRIVATE_KEY=") && !envContent.includes("your_private_key_here");
      const hasEtherscanKey = envContent.includes("ETHERSCAN_API_KEY=") && !envContent.includes("your_etherscan_api_key_here");
      
      if (hasAlchemyKey && hasPrivateKey && hasEtherscanKey) {
        setupConfig.hasValidKeys = true;
        console.log("✅ Environment variables properly configured");
      } else {
        console.log("⚠️ Environment variables need to be updated");
        console.log("   Please edit .env file with your actual API keys");
      }
    } else {
      console.log("❌ .env file not found");
      if (fs.existsSync(envExamplePath)) {
        console.log("📝 Creating .env file from template...");
        fs.copyFileSync(envExamplePath, envPath);
        console.log("✅ .env file created from template");
        console.log("⚠️ Please edit .env file with your actual API keys");
      } else {
        console.log("❌ env.example template not found");
      }
    }

    // 2. Check dependencies
    console.log("\n📦 2. Checking dependencies...");
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"));
      const requiredDeps = ["hardhat", "ethers", "@openzeppelin/contracts"];
      const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]);
      
      if (missingDeps.length === 0) {
        console.log("✅ All required dependencies found");
      } else {
        console.log("❌ Missing dependencies:", missingDeps.join(", "));
        console.log("💡 Run: npm install");
      }
    } catch (error) {
      console.log("❌ Error reading package.json");
    }

    // 3. Test compilation
    console.log("\n🔨 3. Testing contract compilation...");
    try {
      execSync("npx hardhat compile", { stdio: "pipe" });
      setupConfig.canCompile = true;
      console.log("✅ Contracts compile successfully");
    } catch (error) {
      console.log("❌ Contract compilation failed");
      console.log("💡 Check for syntax errors in your contracts");
    }

    // 4. Test network access
    console.log("\n🌐 4. Testing network access...");
    if (setupConfig.hasValidKeys) {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_KEY ? 
          `https://eth-sepolia.g.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}` : 
          "http://localhost:8545");
        
        const blockNumber = await provider.getBlockNumber();
        setupConfig.networkAccess = true;
        console.log("✅ Network access successful (Block:", blockNumber, ")");
      } catch (error) {
        console.log("❌ Network access failed");
        console.log("💡 Check your Alchemy API key and network connectivity");
      }
    } else {
      console.log("⚠️ Skipping network test (no valid API keys)");
    }

    // 5. Test basic functionality
    console.log("\n🧪 5. Testing basic functionality...");
    try {
      execSync("npx hardhat test --grep 'should set the correct initial values'", { stdio: "pipe" });
      setupConfig.canTest = true;
      console.log("✅ Basic tests pass");
    } catch (error) {
      console.log("❌ Basic tests failed");
      console.log("💡 Check your test files and contract compilation");
    }

    // 6. Generate setup report
    console.log("\n" + "=".repeat(60));
    console.log("📊 SETUP REPORT");
    console.log("=".repeat(60));
    
    const checks = [
      { name: "Environment File", status: setupConfig.hasEnvFile },
      { name: "Valid API Keys", status: setupConfig.hasValidKeys },
      { name: "Contract Compilation", status: setupConfig.canCompile },
      { name: "Network Access", status: setupConfig.networkAccess },
      { name: "Basic Tests", status: setupConfig.canTest }
    ];
    
    checks.forEach(check => {
      const status = check.status ? "✅" : "❌";
      console.log(`${status} ${check.name}`);
    });
    
    const passedChecks = checks.filter(c => c.status).length;
    const totalChecks = checks.length;
    
    console.log(`\n📈 Setup Progress: ${passedChecks}/${totalChecks} checks passed`);
    
    if (passedChecks === totalChecks) {
      console.log("\n🎉 Project setup completed successfully!");
      console.log("🚀 You're ready to deploy and test your contracts!");
    } else {
      console.log("\n⚠️ Some setup steps need attention:");
      
      if (!setupConfig.hasEnvFile) {
        console.log("   - Create .env file with your API keys");
      }
      if (!setupConfig.hasValidKeys) {
        console.log("   - Update .env file with actual API keys");
      }
      if (!setupConfig.canCompile) {
        console.log("   - Fix contract compilation errors");
      }
      if (!setupConfig.networkAccess) {
        console.log("   - Check network connectivity and API keys");
      }
      if (!setupConfig.canTest) {
        console.log("   - Fix test failures");
      }
    }

    // 7. Next steps
    console.log("\n📋 NEXT STEPS:");
    if (passedChecks === totalChecks) {
      console.log("1. Deploy contracts: npm run deploy:all");
      console.log("2. Run full test suite: npm test");
      console.log("3. Verify contracts: npm run verify");
      console.log("4. Start development!");
    } else {
      console.log("1. Fix the issues listed above");
      console.log("2. Run this setup script again: npx hardhat run scripts/setup-project.ts");
      console.log("3. Once all checks pass, proceed with deployment");
    }

  } catch (error) {
    console.error("💥 Setup script failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Setup script failed:", error);
    process.exit(1);
  }); 