const { ethers } = require("ethers");

describe("NFT", function () {
  let deployer,
    addr1,
    addr2,
    nft,
    marketplace,
    feePercent = 1;

  // Also we need to wrap this code in a beforeEach hook so that this code runs before every tests.

  beforeEach(async function () {
    // In order to tests our contracts we need to get the contract factory for each just like deploy scripts.

    const NFT = await ethers.getContractFactory("NFT");
    const Marketplace = await ethers.getContractFactory("Marketplace");

    // Next we need to fetch the signers for each of the test accounts on our dev blockchain.
    // Signers can be thought of as extraction of etherium accounts that can be used to sign and send transaction to the etherium network.
    // The first address will that be of the deployer.
    [deployer, addr1, addr2] = await ethers.getSigners(); // This will give us a array of signers

    // Next we deploy the contracts
    nft = await NFT.deploy();
    marketplace = await Marketplace.deply(feePercent);
  });

  
});
