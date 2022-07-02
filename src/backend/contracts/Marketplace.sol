// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// Following required for : Required interface of an ERC721 compliant contract.
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// We also need a ReentrancyGuard guard  contract that will protect from ReentrancyGuard attacks.
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard{

    // State variables
    // Our marketplace charges fees for each NFT purchased so we need a feeAccount and feePercent.
    // immutable so that they can only be assigned value once.
    address payable public immutable feeAccount; // the account that receives fees
    uint public immutable feePercent;  // the fee percentages on sales.
    uint public itemCount;

    constructor(uint _feePercent){
        feeAccount=payable(msg.sender); // feeAccount is the deployer of the contract.
        feePercent=_feePercent;
    }
}