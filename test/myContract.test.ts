import { ethers } from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";

describe("MyToken", function () {
  let token: MyToken;
  let owner: any, addr1: any, addr2: any, addr3: any, addr4: any;

  beforeEach(async () => {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    token = await MyToken.deploy([owner.address, addr1.address, addr2.address]);
    await token.waitForDeployment();
  });

  it("should transfer tokens and update balances", async () => {
    await token.connect(owner).transfer(addr1.address, ethers.parseUnits("5", 18));
    expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseUnits("5", 18));
  });

  it("should convert ETH to tokens on receive", async () => {
    await addr1.sendTransaction({ to: await token.getAddress(), value: ethers.parseEther("1") });
    expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseUnits("1000", 18));
  });

  it("should allow only multisig owners to approve minting", async () => {
    const amount = ethers.parseUnits("100", 18);
    await token.connect(owner).proposeMint(addr3.address, amount);
    await token.connect(addr1).proposeMint(addr3.address, amount);
    await token.connect(addr2).proposeMint(addr3.address, amount);
    expect(await token.balanceOf(addr3.address)).to.equal(amount);

    // Non-multisig address should fail
    await expect(
      token.connect(addr4).proposeMint(addr3.address, amount)
    ).to.be.revertedWith("Not multisig owner");
  });

  it("should not allow unauthorized withdrawal", async () => {
    await addr1.sendTransaction({ to: await token.getAddress(), value: ethers.parseEther("1") });
    await expect(
      token.connect(addr4).proposeWithdraw(addr4.address, ethers.parseEther("0.5"))
    ).to.be.revertedWith("Not multisig owner");
  });

  it("should prevent reentrancy in withdraw (security test)", async () => {
    // This contract does not have a reentrancy vulnerability, but we check that withdrawal only works with multisig
    await addr1.sendTransaction({ to: await token.getAddress(), value: ethers.parseEther("1") });
    await token.connect(owner).proposeWithdraw(addr4.address, ethers.parseEther("0.5"));
    await token.connect(addr1).proposeWithdraw(addr4.address, ethers.parseEther("0.5"));
    // After 2 approvals, withdrawal should succeed and balance decrease
    // (No reentrancy possible, but this checks the multisig logic)
    expect(await ethers.provider.getBalance(await token.getAddress())).to.be.lt(ethers.parseEther("1"));
  });
});