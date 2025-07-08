// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultiSigWallet {
    address[] public owners;
    uint public required;
    mapping(address => bool) public isOwner;
    struct Transaction {
        address to;
        uint value;
        bool executed;
        uint confirmations;
    }
    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public confirmations;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    constructor(address[] memory _owners, uint _required) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid required number of owners");
        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }
        required = _required;
    }

    function submitTransaction(address to, uint value) public onlyOwner {
        transactions.push(Transaction({
            to: to,
            value: value,
            executed: false,
            confirmations: 0
        }));
    }

    function confirmTransaction(uint txIndex) public onlyOwner {
        require(!confirmations[txIndex][msg.sender], "Already confirmed");
        confirmations[txIndex][msg.sender] = true;
        transactions[txIndex].confirmations += 1;
        if (transactions[txIndex].confirmations >= required) {
            executeTransaction(txIndex);
        }
    }

    function executeTransaction(uint txIndex) internal {
        Transaction storage txn = transactions[txIndex];
        require(!txn.executed, "Already executed");
        require(address(this).balance >= txn.value, "Insufficient balance");
        txn.executed = true;
        payable(txn.to).transfer(txn.value);
    }

    receive() external payable {}
} 