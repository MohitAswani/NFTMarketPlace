// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// Following required for : ERC721 token with storage based token URI management.
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// Now our contract inherits from ERC721URIStorage contract.
contract NFT is ERC721URIStorage{

    uint public tokenCount=0;

    // We call the constructor from the parent contract.
    // ERC721 (name of the nft,symbol of the nft)
    constructor() ERC721("DApp NFT","DAPP"){}

    // The below function will be used to mint/create NFTs.
    // It takes in the link to the NFT content as an argument.
    // We want this function to be called from the outside not from the contract so we use 'external'
    // We want the function to return the tokenCount
    function mint(string memory _tokenURI) external returns(uint){
        tokenCount++;

        // Mint using the _safeMint function from the ERC721 contract.
        // First argument is address that we are minting from which is the caller of the contract. 
        // Second is the id of the token.
        _safeMint(msg.sender, tokenCount);

        // Then we call the function to set the metadata for the minted NFT.
        // Arguments : (id of the token,meta data).
        _setTokenURI(tokenCount, _tokenURI);

        // Returning the id of the minted token.
        return (tokenCount);
    }
}