// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnableExample is Ownable {
    string public message;

    function setMessage(string memory _message) public onlyOwner {
        message = _message;
    }
} 