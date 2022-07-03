const { expect } = require("chai");

describe("NFT", function () {
  let deployer, addr1, addr2, nft;
  let URI = "sample uri";

  // Also we need to wrap this code in a beforeEach hook so that this code runs before every tests.

  beforeEach(async function () {
    // In order to tests our contracts we need to get the contract factory for each just like deploy scripts.

    const NFT = await ethers.getContractFactory("NFT");

    // Next we need to fetch the signers for each of the test accounts on our dev blockchain.
    // Signers can be thought of as extraction of etherium accounts that can be used to sign and send transaction to the etherium network.
    // The first address will that be of the deployer.
    [deployer, addr1, addr2] = await ethers.getSigners(); // This will give us a array of signers

    // Next we deploy the contracts
    nft = await NFT.deploy();
  });

  describe("Deployment", function () {
    it("Should track name and symbol of the nft collection", async function () {
      expect(await nft.name()).to.equal("DApp NFT");
      expect(await nft.symbol()).to.equal("DAPP");
    });
  });

  describe("Minting NFTs", function () {
    it("Should track each minted NFT", async function () {
      // We connect the addr1 acc with the NFT contract and calling the mint function on it.
      await nft.connect(addr1).mint(URI);
      expect(await nft.tokenCount()).to.equal(1);
      // Balance of returns the number of tokens in owner's account.
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      // tokenURI will give us the tokenURI of the token with corresponding token id.
      expect(await nft.tokenURI(1)).to.equal(URI);

      await nft.connect(addr2).mint(URI);
      expect(await nft.tokenCount()).to.equal(2);
      expect(await nft.balanceOf(addr2.address)).to.equal(1);
      expect(await nft.tokenURI(2)).to.equal(URI);
    });
  });
});
