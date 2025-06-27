// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title UBaEducationCredentialsStore
 * @dev Smart contract for storing and verifying education credentials
 * Users pay with custom ERC20 tokens to verify their credentials
 */
contract UBaEducationCredentialsStore is Ownable, ReentrancyGuard {
    IERC20 public tokenContract;
    uint256 public verificationFee;
    
    // Mapping to store credential hashes
    mapping(bytes32 => bool) public credentialExists;
    mapping(bytes32 => address) public credentialOwner;
    
    // Events
    event CredentialStored(bytes32 indexed credentialHash, address indexed owner, uint256 timestamp);
    event CredentialVerified(bytes32 indexed credentialHash, address indexed verifier, uint256 timestamp);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    
    /**
     * @dev Constructor sets the token contract and initial verification fee
     * @param _tokenContract Address of the ERC20 token contract
     * @param _verificationFee Fee in tokens for credential verification
     */
    constructor(address _tokenContract, uint256 _verificationFee) Ownable(msg.sender) {
        require(_tokenContract != address(0), "Token contract cannot be zero address");
        require(_verificationFee > 0, "Verification fee must be greater than 0");
        
        tokenContract = IERC20(_tokenContract);
        verificationFee = _verificationFee;
    }
    
    /**
     * @dev Store a credential hash on the blockchain
     * Only the owner can add new credentials
     * @param credentialHash Hash of the credential document
     * @param owner Address of the credential owner
     */
    function storeCredential(bytes32 credentialHash, address owner) external onlyOwner {
        require(credentialHash != bytes32(0), "Credential hash cannot be zero");
        require(owner != address(0), "Owner cannot be zero address");
        require(!credentialExists[credentialHash], "Credential already exists");
        
        credentialExists[credentialHash] = true;
        credentialOwner[credentialHash] = owner;
        
        emit CredentialStored(credentialHash, owner, block.timestamp);
    }
    
    /**
     * @dev Verify a credential by paying the verification fee
     * @param credentialHash Hash of the credential to verify
     * @return bool True if credential exists and fee is paid
     */
    function verifyCredential(bytes32 credentialHash) external nonReentrant returns (bool) {
        require(credentialHash != bytes32(0), "Credential hash cannot be zero");
        require(credentialExists[credentialHash], "Credential does not exist");
        
        // Transfer tokens from verifier to contract
        require(
            tokenContract.transferFrom(msg.sender, address(this), verificationFee),
            "Token transfer failed"
        );
        
        emit CredentialVerified(credentialHash, msg.sender, block.timestamp);
        return true;
    }
    
    /**
     * @dev Check if a credential exists
     * @param credentialHash Hash of the credential to check
     * @return bool True if credential exists
     */
    function checkCredential(bytes32 credentialHash) external view returns (bool) {
        return credentialExists[credentialHash];
    }
    
    /**
     * @dev Get the owner of a credential
     * @param credentialHash Hash of the credential
     * @return address Owner of the credential
     */
    function getCredentialOwner(bytes32 credentialHash) external view returns (address) {
        require(credentialExists[credentialHash], "Credential does not exist");
        return credentialOwner[credentialHash];
    }
    
    /**
     * @dev Update the verification fee (only owner)
     * @param newFee New verification fee in tokens
     */
    function updateVerificationFee(uint256 newFee) external onlyOwner {
        require(newFee > 0, "Verification fee must be greater than 0");
        uint256 oldFee = verificationFee;
        verificationFee = newFee;
        
        emit FeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Withdraw accumulated tokens (only owner)
     * @param amount Amount of tokens to withdraw
     */
    function withdrawTokens(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(
            tokenContract.balanceOf(address(this)) >= amount,
            "Insufficient contract balance"
        );
        
        require(
            tokenContract.transfer(owner(), amount),
            "Token transfer failed"
        );
        
        emit FundsWithdrawn(owner(), amount);
    }
    
    /**
     * @dev Get the current token balance of the contract
     * @return uint256 Current token balance
     */
    function getContractTokenBalance() external view returns (uint256) {
        return tokenContract.balanceOf(address(this));
    }
    
    /**
     * @dev Calculate hash of a credential document
     * This function helps users generate the correct hash for their credentials
     * @param matriculation Student matriculation number
     * @param cryptology Grade in cryptology
     * @param blockchain Grade in blockchain
     * @param secureSoftwareDev Grade in secure software development
     * @return bytes32 Hash of the credential
     */
    function calculateCredentialHash(
        string memory matriculation,
        string memory cryptology,
        string memory blockchain,
        string memory secureSoftwareDev
    ) external pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                matriculation,
                cryptology,
                blockchain,
                secureSoftwareDev
            )
        );
    }
} 