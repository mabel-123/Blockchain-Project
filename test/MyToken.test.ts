import { ethers } from "hardhat";
import { expect } from "chai";

describe("MyToken", function () {
  let token: any;
  let owner: any, addr1: any, addr2: any, addr3: any, addr4: any;

  beforeEach(async () => {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    token = await MyToken.deploy([owner.address, addr1.address, addr2.address]);
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set correct token details", async () => {
      expect(await token.name()).to.equal("Group 3 Token");
      expect(await token.symbol()).to.equal("G3TK");
      expect(await token.decimals()).to.equal(18);
    });

    it("should set correct approvers", async () => {
      expect(await token.approvers(0)).to.equal(owner.address);
      expect(await token.approvers(1)).to.equal(addr1.address);
      expect(await token.approvers(2)).to.equal(addr2.address);
    });

    it("should fail deployment with zero address approver", async () => {
      const MyToken = await ethers.getContractFactory("MyToken");
      await expect(
        MyToken.deploy([ethers.ZeroAddress, addr1.address, addr2.address])
      ).to.be.revertedWith("Approver cannot be zero address");
    });

    it("should set correct token price", async () => {
      expect(await token.tokenPrice()).to.equal(ethers.parseEther("0.001"));
    });
  });

  describe("ETH to Token Conversion", function () {
    it("should convert ETH to tokens on receive", async () => {
      const ethAmount = ethers.parseEther("1");
      const expectedTokens = ethAmount / ethers.parseEther("0.001");
      
      await addr3.sendTransaction({ to: await token.getAddress(), value: ethAmount });
      expect(await token.balanceOf(addr3.address)).to.equal(expectedTokens);
    });

    it("should convert ETH to tokens via buyTokens function", async () => {
      const ethAmount = ethers.parseEther("0.5");
      const expectedTokens = ethAmount / ethers.parseEther("0.001");
      
      await token.connect(addr3).buyTokens({ value: ethAmount });
      expect(await token.balanceOf(addr3.address)).to.equal(expectedTokens);
    });

    it("should fail with insufficient ETH", async () => {
      const smallAmount = ethers.parseEther("0.0001"); // Less than token price
      await expect(
        addr3.sendTransaction({ to: await token.getAddress(), value: smallAmount })
      ).to.be.revertedWith("Insufficient ETH sent for conversion");
    });

    it("should handle multiple ETH conversions", async () => {
      await addr3.sendTransaction({ to: await token.getAddress(), value: ethers.parseEther("1") });
      await addr4.sendTransaction({ to: await token.getAddress(), value: ethers.parseEther("2") });
      
      expect(await token.balanceOf(addr3.address)).to.equal(ethers.parseUnits("1000", 18));
      expect(await token.balanceOf(addr4.address)).to.equal(ethers.parseUnits("2000", 18));
    });
  });

  describe("ERC20 Standard Functions", function () {
    beforeEach(async () => {
      // Give tokens to addr3 for testing
      await addr3.sendTransaction({ to: await token.getAddress(), value: ethers.parseEther("1") });
    });

    it("should transfer tokens correctly", async () => {
      const transferAmount = ethers.parseUnits("100", 18);
      await token.connect(addr3).transfer(addr4.address, transferAmount);
      
      expect(await token.balanceOf(addr4.address)).to.equal(transferAmount);
      expect(await token.balanceOf(addr3.address)).to.equal(ethers.parseUnits("900", 18));
    });

    it("should fail transfer with insufficient balance", async () => {
      const largeAmount = ethers.parseUnits("2000", 18);
      await expect(
        token.connect(addr3).transfer(addr4.address, largeAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("should handle approve and transferFrom", async () => {
      const approveAmount = ethers.parseUnits("200", 18);
      await token.connect(addr3).approve(addr4.address, approveAmount);
      
      const transferAmount = ethers.parseUnits("150", 18);
      await token.connect(addr4).transferFrom(addr3.address, addr1.address, transferAmount);
      
      expect(await token.balanceOf(addr1.address)).to.equal(transferAmount);
      expect(await token.allowance(addr3.address, addr4.address)).to.equal(ethers.parseUnits("50", 18));
    });

    it("should fail transferFrom with insufficient allowance", async () => {
      await token.connect(addr3).approve(addr4.address, ethers.parseUnits("100", 18));
      
      await expect(
        token.connect(addr4).transferFrom(addr3.address, addr1.address, ethers.parseUnits("150", 18))
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("Multi-Sig Minting", function () {
    it("should allow only approvers to approve minting", async () => {
      await token.connect(owner).approveMint();
      await token.connect(addr1).approveMint();
      await token.connect(addr2).approveMint();
      
      expect(await token.mintApprovals(owner.address)).to.be.true;
      expect(await token.mintApprovals(addr1.address)).to.be.true;
      expect(await token.mintApprovals(addr2.address)).to.be.true;
    });

    it("should fail when non-approver tries to approve minting", async () => {
      await expect(
        token.connect(addr3).approveMint()
      ).to.be.revertedWith("Not authorized to approve mint");
    });

    it("should mint tokens after all approvers approve", async () => {
      await token.connect(owner).approveMint();
      await token.connect(addr1).approveMint();
      await token.connect(addr2).approveMint();
      
      const mintAmount = 100;
      await token.connect(owner).mint(addr3.address, mintAmount);
      
      expect(await token.balanceOf(addr3.address)).to.equal(ethers.parseUnits("100", 18));
    });

    it("should fail minting without all approvals", async () => {
      await token.connect(owner).approveMint();
      await token.connect(addr1).approveMint();
      // addr2 hasn't approved yet
      
      await expect(
        token.connect(owner).mint(addr3.address, 100)
      ).to.be.revertedWith("Not all approvers have approved mint");
    });

    it("should reset approvals after minting", async () => {
      await token.connect(owner).approveMint();
      await token.connect(addr1).approveMint();
      await token.connect(addr2).approveMint();
      
      await token.connect(owner).mint(addr3.address, 100);
      
      expect(await token.mintApprovals(owner.address)).to.be.false;
      expect(await token.mintApprovals(addr1.address)).to.be.false;
      expect(await token.mintApprovals(addr2.address)).to.be.false;
    });

    it("should fail minting when called by non-owner", async () => {
      await token.connect(owner).approveMint();
      await token.connect(addr1).approveMint();
      await token.connect(addr2).approveMint();
      
      await expect(
        token.connect(addr3).mint(addr4.address, 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Multi-Sig Withdrawal", function () {
    beforeEach(async () => {
      // Add ETH to contract for withdrawal testing
      await addr3.sendTransaction({ to: await token.getAddress(), value: ethers.parseEther("10") });
    });

    it("should allow only approvers to approve withdrawal", async () => {
      await token.connect(owner).approveWithdraw();
      await token.connect(addr1).approveWithdraw();
      
      expect(await token.withdrawApprovals(owner.address)).to.be.true;
      expect(await token.withdrawApprovals(addr1.address)).to.be.true;
    });

    it("should fail when non-approver tries to approve withdrawal", async () => {
      await expect(
        token.connect(addr3).approveWithdraw()
      ).to.be.revertedWith("Not authorized to approve withdrawal");
    });

    it("should withdraw ETH after 2 out of 3 approvals", async () => {
      await token.connect(owner).approveWithdraw();
      await token.connect(addr1).approveWithdraw();
      
      const withdrawAmount = ethers.parseEther("5");
      const initialBalance = await ethers.provider.getBalance(addr4.address);
      
      await token.connect(owner).withdraw(addr4.address, withdrawAmount);
      
      const finalBalance = await ethers.provider.getBalance(addr4.address);
      expect(finalBalance).to.equal(initialBalance + withdrawAmount);
    });

    it("should fail withdrawal with insufficient approvals", async () => {
      await token.connect(owner).approveWithdraw();
      // Only 1 approval, need at least 2
      
      await expect(
        token.connect(owner).withdraw(addr4.address, ethers.parseEther("1"))
      ).to.be.revertedWith("At least 2 approvals required");
    });

    it("should fail withdrawal with insufficient contract balance", async () => {
      await token.connect(owner).approveWithdraw();
      await token.connect(addr1).approveWithdraw();
      
      const largeAmount = ethers.parseEther("20"); // More than contract has
      await expect(
        token.connect(owner).withdraw(addr4.address, largeAmount)
      ).to.be.revertedWith("Insufficient contract balance");
    });

    it("should reset withdrawal approvals after execution", async () => {
      await token.connect(owner).approveWithdraw();
      await token.connect(addr1).approveWithdraw();
      
      await token.connect(owner).withdraw(addr4.address, ethers.parseEther("1"));
      
      expect(await token.withdrawApprovals(owner.address)).to.be.false;
      expect(await token.withdrawApprovals(addr1.address)).to.be.false;
      expect(await token.withdrawApprovals(addr2.address)).to.be.false;
    });

    it("should fail withdrawal when called by non-owner", async () => {
      await token.connect(owner).approveWithdraw();
      await token.connect(addr1).approveWithdraw();
      
      await expect(
        token.connect(addr3).withdraw(addr4.address, ethers.parseEther("1"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Security Tests", function () {
    it("should prevent unauthorized access to minting", async () => {
      await expect(
        token.connect(addr3).mint(addr4.address, 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should prevent unauthorized access to withdrawal", async () => {
      await expect(
        token.connect(addr3).withdraw(addr4.address, ethers.parseEther("1"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should handle edge case with zero ETH conversion", async () => {
      await expect(
        addr3.sendTransaction({ to: await token.getAddress(), value: 0 })
      ).to.be.revertedWith("Insufficient ETH sent for conversion");
    });
  });

  describe("Gas Optimization", function () {
    it("should use reasonable gas for token transfers", async () => {
      await addr3.sendTransaction({ to: await token.getAddress(), value: ethers.parseEther("1") });
      
      const tx = await token.connect(addr3).transfer(addr4.address, ethers.parseUnits("100", 18));
      const receipt = await tx.wait();
      
      // Gas usage should be reasonable for ERC20 transfer
      expect(receipt!.gasUsed).to.be.lt(100000);
    });
  });
}); 