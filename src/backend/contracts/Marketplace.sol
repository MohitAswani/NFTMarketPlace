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

    // To keep track of all the NFTs we use a struct of a item/NFT.
    struct Item{
        uint itemId;
        // Instance of NFT contract associate with the itemId
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }

    // indexed will allow us to search for Offered event using the nft and the seller addresses.
    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );

    // We need a DS which can keep track of all the items and we use a mapping for that.
    // Mapping will have itemId->Item
    mapping(uint=>Item) public items;

    constructor(uint _feePercent){
        feeAccount=payable(msg.sender); // feeAccount is the deployer of the contract.
        feePercent=_feePercent;
    }

    // In this function we make the item.
    // From the frontend user will pass in the id of the contract and solidity will make it a instance of the nft.
    // We add the nonReentrant modifier which comes from the ReentrancyGuard interface.
    // And this modifier prevent this function from being called before the first call to this function is finished.
    function makeItem(IERC721 _nft,uint _tokenId,uint _price) external nonReentrant{
        require(_price>=0,"Price must be greater than zero");

        // incrementing itemCount
        itemCount++;

        // transfer the NFT using the transfer from function.
        // We transfer the nft from the acc who calls this function to the address of this contract and also pass in the token id.
        // So we can transfer the nft from a user to contract.
        _nft.transferFrom(msg.sender, address(this), _tokenId);

        // We add a new item to the items mapping.
        items[itemCount]=Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );

        // We also want to emit an event Offered.
        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }
}