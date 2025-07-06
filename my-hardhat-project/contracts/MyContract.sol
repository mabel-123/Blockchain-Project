// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    string public name;
    uint256 public value;

    constructor(string memory _name, uint256 _value) {
        name = _name;
        value = _value;
    }

    function setValue(uint256 _value) public {
        value = _value;
    }

    function getValue() public view returns (uint256) {
        return value;
    }
}