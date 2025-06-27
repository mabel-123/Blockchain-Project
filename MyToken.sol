// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import standard ERC20 functionality from OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title MyToken
 * @dev ERC20 Token with ETH-to-token conversion, buy function,
 * multi-sig minting and withdrawal mechanisms.
 */
contract MyToken is ERC20, Ownable {
    using Address for address payable;

    uint256 public tokenPrice = 0.001 ether; // Price per token
    address[3] public approvers; // Three addresses for multi-sig
    mapping(address => bool) private isApprover;

    // Minting approval mapping: approver => approved
    mapping(address => bool) public mintApprovals;
    // Withdrawal approval mapping
    mapping(address => bool) public withdrawApprovals;

    constructor(address[3] memory _approvers) ERC20("Group 3 Token", "G3TK") {
        require(
            _approvers[0] != address(0) &&
            _approvers[1] != address(0) &&
            _approvers[2] != address(0),
            "Approver cannot be zero address"
        );

        approvers = _approvers;
        for (uint i = 0; i < 3; i++) {
            isApprover[_approvers[i]] = true;
        }
    }

    // ----------------- Token Purchase Logic -----------------

    // Automatically convert ETH to tokens upon receiving Ether
    receive() external payable {
        uint256 amount = msg.value / tokenPrice;
        require(amount > 0, "Insufficient ETH sent for conversion");

        _mint(msg.sender, amount * (10 ** decimals()));
    }

    // Function for users to buy tokens explicitly
    function buyTokens() external payable {
        uint256 amount = msg.value / tokenPrice;
        require(amount > 0, "Not enough ETH sent");

        _mint(msg.sender, amount * (10 ** decimals()));
    }

    // ----------------- Multi-Sig Minting -----------------

    // Approve a mint request (requires all 3 approvers to call)
    function approveMint() external {
        require(isApprover[msg.sender], "Not authorized to approve mint");
        mintApprovals[msg.sender] = true;
    }

    // Mint tokens to an address after all 3 have approved
    function mint(address to, uint256 amount) external onlyOwner {
        require(
            mintApprovals[approvers[0]] &&
            mintApprovals[approvers[1]] &&
            mintApprovals[approvers[2]],
            "Not all approvers have approved mint"
        );

        _mint(to, amount * (10 ** decimals()));

        // Reset approvals
        for (uint i = 0; i < 3; i++) {
            mintApprovals[approvers[i]] = false;
        }
    }

    // ----------------- Multi-Sig Withdrawal -----------------

    // Approve withdrawal (2 out of 3)
    function approveWithdraw() external {
        require(isApprover[msg.sender], "Not authorized to approve withdrawal");
        withdrawApprovals[msg.sender] = true;
    }

    // Withdraw funds to a destination address after 2/3 approvals
    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient contract balance");

        uint256 approvalCount = 0;
        for (uint i = 0; i < 3; i++) {
            if (withdrawApprovals[approvers[i]]) {
                approvalCount++;
            }
        }

        require(approvalCount >= 2, "At least 2 approvals required");

        // Reset approvals after execution
        for (uint i = 0; i < 3; i++) {
            withdrawApprovals[approvers[i]] = false;
        }

        to.sendValue(amount);
    }
}