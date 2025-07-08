// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DutchAuction {
    address public seller;
    uint public startPrice;
    uint public reservePrice;
    uint public startBlock;
    uint public endBlock;
    address public winner;

    constructor(uint _startPrice, uint _reservePrice, uint _duration) {
        seller = msg.sender;
        startPrice = _startPrice;
        reservePrice = _reservePrice;
        startBlock = block.number;
        endBlock = block.number + _duration;
    }

    function getCurrentPrice() public view returns (uint) {
        if (block.number >= endBlock) {
            return reservePrice;
        }
        uint elapsed = block.number - startBlock;
        uint priceDrop = ((startPrice - reservePrice) * elapsed) / (endBlock - startBlock);
        return startPrice - priceDrop;
    }

    function bid() public payable {
        require(winner == address(0), "Auction ended");
        uint price = getCurrentPrice();
        require(msg.value >= price, "Bid too low");
        winner = msg.sender;
        payable(seller).transfer(msg.value);
    }
} 