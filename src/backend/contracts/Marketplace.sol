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

    // Buyer set as indexed so as to search all the bought events using buyers id.
    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
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
        require(_price>0,"Price must be greater than zero");

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

    // Will take in the itemid of the item which is to be purchased and then we also make it payable so that the user who is calling this function can also transfer ether with it.
    function purchaseItem(uint _itemId) external payable nonReentrant{
        uint _totalPrice=getTotalPrice(_itemId);

        // We add storage to it so as to say that this variable is directly reference the item from memory and not creating a copy of the data.
        Item storage item = items[_itemId];

        // We make sure that the item id is valid.
        require(_itemId>0&&_itemId<=itemCount,"item doesn't exist");
        // We make sure the ether sent with function call is enough
        require(msg.value==_totalPrice,"not enough ether to cover item price and market fee");
        // We make sure that the item is not sold
        require(!item.sold,"Item already sold!");

        // Pay the seller and feeAccount
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice-item.price);

        // Update the item to sold
        item.sold=true;

        // transfer nft to buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        // Emit a bought event
        emit Bought(_itemId, address(item.nft), item.tokenId, item.price, item.seller, msg.sender);
    }

    // This function will get the final price of the item which is the price set by the seller and the purchase fee.
    // Also this variable is view because it not modifying any of the state variables.
    // We will set it to public because we need to also call this function in the frontend.
    function getTotalPrice(uint _itemId) view public returns(uint){
        return (items[_itemId].price*(100+feePercent)/100);
    }
}