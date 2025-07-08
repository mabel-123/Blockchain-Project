import { ethers } from "hardhat";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface TestResult {
  testFile: string;
  status: "passed" | "failed" | "skipped";
  duration?: number;
  error?: string;
}

async function main() {
  console.log("🧪 Starting comprehensive test suite...");
  
  const testResults: TestResult[] = [];
  const testFiles = [
    "test/MyContract.test.ts",
    "test/MyToken.test.ts", 
    "test/UBaEducationCredentialsStore.test.ts"
  ];

  console.log("\n📋 Test files to run:");
  testFiles.forEach(file => console.log(`  - ${file}`));

  try {
    // Compile contracts first
    console.log("\n🔨 Compiling contracts...");
    execSync("npx hardhat compile", { stdio: "inherit" });
    console.log("✅ Compilation successful");

    // Run each test file individually for better reporting
    for (const testFile of testFiles) {
      console.log(`\n🧪 Running ${testFile}...`);
      
      const startTime = Date.now();
      try {
        execSync(`npx hardhat test ${testFile}`, { stdio: "inherit" });
        const duration = Date.now() - startTime;
        
        testResults.push({
          testFile,
          status: "passed",
          duration
        });
        
        console.log(`✅ ${testFile} passed in ${duration}ms`);
      } catch (error: any) {
        const duration = Date.now() - startTime;
        
        testResults.push({
          testFile,
          status: "failed",
          duration,
          error: error.message
        });
        
        console.log(`❌ ${testFile} failed in ${duration}ms`);
      }
    }

    // Run all tests together
    console.log("\n🧪 Running all tests together...");
    const allTestsStartTime = Date.now();
    try {
      execSync("npx hardhat test", { stdio: "inherit" });
      const allTestsDuration = Date.now() - allTestsStartTime;
      console.log(`✅ All tests completed in ${allTestsDuration}ms`);
    } catch (error: any) {
      console.log("❌ Some tests failed when run together");
    }

    // Generate test report
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST SUMMARY REPORT");
    console.log("=".repeat(60));
    
    const passedTests = testResults.filter(r => r.status === "passed");
    const failedTests = testResults.filter(r => r.status === "failed");
    const totalDuration = testResults.reduce((sum, r) => sum + (r.duration || 0), 0);
    
    console.log(`✅ Passed: ${passedTests.length}/${testResults.length}`);
    console.log(`❌ Failed: ${failedTests.length}/${testResults.length}`);
    console.log(`⏱️ Total Duration: ${totalDuration}ms`);
    
    if (failedTests.length > 0) {
      console.log("\n❌ Failed Tests:");
      failedTests.forEach(test => {
        console.log(`  - ${test.testFile}: ${test.error}`);
      });
    }
    
    console.log("\n📋 Individual Test Results:");
    testResults.forEach(test => {
      const status = test.status === "passed" ? "✅" : "❌";
      console.log(`  ${status} ${test.testFile} (${test.duration}ms)`);
    });

    // Save test results to file
    const testReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total: testResults.length,
        passed: passedTests.length,
        failed: failedTests.length,
        totalDuration
      },
      results: testResults
    };

    const reportPath = path.join(__dirname, "../test-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
    console.log(`\n💾 Test report saved to: test-report.json`);

    // Run gas analysis if requested
    if (process.env.REPORT_GAS) {
      console.log("\n⛽ Running gas analysis...");
      try {
        execSync("npx hardhat test --gas", { stdio: "inherit" });
        console.log("✅ Gas analysis completed");
      } catch (error: any) {
        console.log("❌ Gas analysis failed");
      }
    }

    // Final status
    if (failedTests.length === 0) {
      console.log("\n🎉 All tests passed successfully!");
      console.log("🚀 Your contracts are ready for deployment!");
    } else {
      console.log("\n⚠️ Some tests failed. Please review and fix the issues.");
      process.exit(1);
    }

  } catch (error) {
    console.error("💥 Test runner failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Test runner script failed:", error);
    process.exit(1);
  }); 