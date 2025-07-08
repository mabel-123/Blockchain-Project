// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    address public owner;
    uint public goal;
    uint public raised;
    mapping(address => uint) public contributions;
    bool public goalReached;

    constructor(uint _goal) {
        owner = msg.sender;
        goal = _goal;
    }

    function contribute() public payable {
        require(!goalReached, "Goal already reached");
        contributions[msg.sender] += msg.value;
        raised += msg.value;
        if (raised >= goal) {
            goalReached = true;
        }
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        require(goalReached, "Goal not reached");
        payable(owner).transfer(address(this).balance);
    }

    function refund() public {
        require(!goalReached, "Goal already reached");
        uint amount = contributions[msg.sender];
        require(amount > 0, "No contributions");
        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
} 