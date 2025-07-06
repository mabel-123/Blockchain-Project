import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-typechain";

const ALCHEMY_API_KEY = "your-alchemy-api-key";
const SEPOLIA_PRIVATE_KEY = "your-private-key";

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${SEPOLIA_PRIVATE_KEY}`],
    },
  },
};

export default config;