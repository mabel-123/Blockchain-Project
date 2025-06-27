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

  describe("Basic Functionality", function () {
    it("should have correct initial state", async () => {
      expect(await token.name()).to.equal("Group 3 Token");
      expect(await token.symbol()).to.equal("G3TK");
      expect(await token.decimals()).to.equal(18);
      expect(await token.tokenPrice()).to.equal(ethers.parseEther("0.001"));
    });

    it("should transfer tokens and update balances", async () => {
      // First mint some tokens to owner
      await token.connect(owner).approveMint();
      await token.connect(addr1).approveMint();
      await token.connect(addr2).approveMint();
      await token.connect(owner).mint(owner.address, 100);
      
      await token.connect(owner).transfer(addr1.address, ethers.parseUnits("5", 18));
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseUnits("5", 18));
    });

    it("should fail transfer with insufficient balance", async () => {
      await expect(
        token.connect(addr1).transfer(addr2.address, ethers.parseUnits("1", 18))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("ETH to Token Conversion", function () {
    it("should convert ETH to tokens on receive", async () => {
      const ethAmount = ethers.parseEther("1");
      await addr1.sendTransaction({ to: await token.getAddress(), value: ethAmount });
      
      const expectedTokens = ethAmount / ethers.parseEther("0.001"); // 1000 tokens
      expect(await token.balanceOf(addr1.address)).to.equal(expectedTokens);
    });

    it("should convert ETH to tokens via buyTokens function", async () => {
      const ethAmount = ethers.parseEther("0.5");
      await token.connect(addr1).buyTokens({ value: ethAmount });
      
      const expectedTokens = ethAmount / ethers.parseEther("0.001"); // 500 tokens
      expect(await token.balanceOf(addr1.address)).to.equal(expectedTokens);
    });

    it("should fail with insufficient ETH for conversion", async () => {
      const smallAmount = ethers.parseEther("0.0001"); // Less than token price
      await expect(
        addr1.sendTransaction({ to: await token.getAddress(), value: smallAmount })
      ).to.be.revertedWith("Insufficient ETH sent for conversion");
    });
  });

  describe("Multi-Signature Minting", function () {
    it("should allow only multisig owners to approve minting", async () => {
      await token.connect(owner).approveMint();
      await token.connect(addr1).approveMint();
      await token.connect(addr2).approveMint();
      
      const amount = 100;
      await token.connect(owner).mint(addr3.address, amount);
      expect(await token.balanceOf(addr3.address)).to.equal(ethers.parseUnits("100", 18));

      // Non-multisig address should fail
      await expect(
        token.connect(addr4).approveMint()
      ).to.be.revertedWith("Not authorized to approve mint");
    });

    it("should require all 3 approvals before minting", async () => {
      await token.connect(owner).approveMint();
      await token.connect(addr1).approveMint();
      // Missing addr2 approval
      
      const amount = 100;
      await expect(
        token.connect(owner).mint(addr3.address, amount)
      ).to.be.revertedWith("Not all approvers have approved mint");
    });

    it("should reset approvals after successful mint", async () => {
      await token.connect(owner).approveMint();
      await token.connect(addr1).approveMint();
      await token.connect(addr2).approveMint();
      
      await token.connect(owner).mint(addr3.address, 100);
      
      // Approvals should be reset
      expect(await token.mintApprovals(owner.address)).to.be.false;
      expect(await token.mintApprovals(addr1.address)).to.be.false;
      expect(await token.mintApprovals(addr2.address)).to.be.false;
    });
  });

  describe("Multi-Signature Withdrawal", function () {
    beforeEach(async () => {
      // Add some ETH to contract
      await addr1.sendTransaction({ to: await token.getAddress(), value: ethers.parseEther("1") });
    });

    it("should allow only multisig owners to approve withdrawal", async () => {
      await token.connect(owner).approveWithdraw();
      await token.connect(addr1).approveWithdraw();
      
      await token.connect(owner).withdraw(addr3.address, ethers.parseEther("0.5"));
      expect(await ethers.provider.getBalance(addr3.address)).to.be.gt(0);

      // Non-multisig address should fail
      await expect(
        token.connect(addr4).approveWithdraw()
      ).to.be.revertedWith("Not authorized to approve withdrawal");
    });

    it("should require at least 2 approvals for withdrawal", async () => {
      await token.connect(owner).approveWithdraw();
      // Only 1 approval, need 2
      
      await expect(
        token.connect(owner).withdraw(addr3.address, ethers.parseEther("0.5"))
      ).to.be.revertedWith("At least 2 approvals required");
    });

    it("should reset approvals after successful withdrawal", async () => {
      await token.connect(owner).approveWithdraw();
      await token.connect(addr1).approveWithdraw();
      
      await token.connect(owner).withdraw(addr3.address, ethers.parseEther("0.5"));
      
      // Approvals should be reset
      expect(await token.withdrawApprovals(owner.address)).to.be.false;
      expect(await token.withdrawApprovals(addr1.address)).to.be.false;
    });

    it("should fail withdrawal with insufficient balance", async () => {
      await token.connect(owner).approveWithdraw();
      await token.connect(addr1).approveWithdraw();
      
      await expect(
        token.connect(owner).withdraw(addr3.address, ethers.parseEther("2"))
      ).to.be.revertedWith("Insufficient contract balance");
    });
  });

  describe("Security Tests", function () {
    it("should prevent unauthorized minting (security test)", async () => {
      await expect(
        token.connect(addr4).mint(addr3.address, 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should prevent unauthorized withdrawal (security test)", async () => {
      await expect(
        token.connect(addr4).withdraw(addr3.address, ethers.parseEther("0.1"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should handle zero address validation", async () => {
      const zeroAddresses = [ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress];
      const MyToken = await ethers.getContractFactory("MyToken");
      
      await expect(
        MyToken.deploy(zeroAddresses)
      ).to.be.revertedWith("Approver cannot be zero address");
    });
  });
}); 