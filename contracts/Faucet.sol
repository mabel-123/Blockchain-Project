// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Faucet {
    uint public amount = 0.01 ether;

    function requestFunds() public {
        require(address(this).balance >= amount, "Not enough funds in faucet");
        payable(msg.sender).transfer(amount);
    }

    receive() external payable {}
} 