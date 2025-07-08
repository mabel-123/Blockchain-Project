// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    address public payer;
    address public payee;
    address public arbiter;

    constructor(address _payee, address _arbiter) payable {
        payer = msg.sender;
        payee = _payee;
        arbiter = _arbiter;
    }

    function release() public {
        require(msg.sender == arbiter, "Only arbiter can release funds");
        payable(payee).transfer(address(this).balance);
    }

    function refund() public {
        require(msg.sender == arbiter, "Only arbiter can refund");
        payable(payer).transfer(address(this).balance);
    }
} 