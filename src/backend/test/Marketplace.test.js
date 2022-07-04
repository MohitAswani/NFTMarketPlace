const { expect } = require("chai");

// WEI is the smallest sub-division of ether or the pency of etherium.
// 1 ether = 10^18 wei
const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

describe("Marketplace", function () {
  let deployer, addr1, addr2, marketplace, nft;
  let URI = "sample uri";
  let feePercent = 1;

  beforeEach(async function () {
    const NFT = await ethers.getContractFactory("NFT");
    const Marketplace = await ethers.getContractFactory("Marketplace");

    [deployer, addr1, addr2] = await ethers.getSigners();

    nft = await NFT.deploy();
    marketplace = await Marketplace.deploy(feePercent);
  });

  describe("Deployment", function () {
    it("Should track the feeAccount and feePercent of the marketplace", async function () {
      expect(await marketplace.feeAccount()).to.equal(deployer.address);
      expect(await marketplace.feePercent()).to.equal(feePercent);
    });
  });

  describe("Making marketplace items", function () {
    beforeEach(async function () {
      // addr1 mints a nft
      await nft.connect(addr1).mint(URI);
      // addr1 approves marketplace to spend nft.
      // We need to call the setApprovalForAll function to approve or remove operator as an operator for the caller.
      // Operators can call transferFrom or safeTransferFrom for any token owned by the caller.
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
    });

    it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async function () {
      // addr1 offers their nft at a price of 1 ether.
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, toWei(1))
      )
        .to.emit(marketplace, "Offered")
        .withArgs(1, nft.address, 1, toWei(1), addr1.address);
      // Owner of NFT should now be the marketplace.
      expect(await nft.ownerOf(1)).to.equal(marketplace.address);
      // Item count should now be 1
      expect(await marketplace.itemCount()).to.equal(1);
      // Get item from the items mapping then check fields to ensure they are correct
      const item = await marketplace.items(1);

      expect(item.itemId).to.equal(1);
      expect(item.nft).to.equal(nft.address);
      expect(item.tokenId).to.equal(1);
      expect(item.price).to.equal(toWei(1));
      expect(item.sold).to.equal(false);
    });

    it("Should fail if price is set to zero", async function () {
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, 0)
      ).to.be.revertedWith("Price must be greater than zero");
    });
  });

  describe("Purchasing marketplace items", function () {
    let price = 2;
    let totalPriceInWei;
    beforeEach(async function () {
      // addr1 mints a nft
      await nft.connect(addr1).mint(URI);
      // addr1 approves marketplace to spend nft.
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
      // addr1 makes their nft a marketplace item.
      await marketplace.connect(addr1).makeItem(nft.address, 1, toWei(price));
    });

    it("Should update item as sold,pay seller, transfer NFT to buyer,charge fees and emit a bought event", async function () {
      // fetching initial account balances
      const sellerInitialEthBal = await addr1.getBalance();
      const feeAccountInitialEthBal = await deployer.getBalance();

      // fetch total price
      totalPriceInWei = await marketplace.getTotalPrice(1);

      // addr2 purchases item.
      // Following is how we passed in the value in tests.
      await expect(
        marketplace.connect(addr2).purchaseItem(1, { value: totalPriceInWei })
      )
        .to.emit(marketplace, "Bought")
        .withArgs(
          1,
          nft.address,
          1,
          toWei(price),
          addr1.address,
          addr2.address
        );

      // fetching final account balances
      const sellerFinalEthBal = await addr1.getBalance();
      const feeAccountFinalEthBal = await deployer.getBalance();

      // seller should receive payment for the price of the NFT soln.
      expect(+fromWei(sellerFinalEthBal)).to.equal(
        +price + +fromWei(sellerInitialEthBal)
      );
      // Calculating fee
      const fee = (feePercent / 100) * price;
      // feeAccount should receive fee
      expect(+fromWei(feeAccountFinalEthBal)).to.equal(
        +fee + +fromWei(feeAccountInitialEthBal)
      );
      // The buyer should now own the nft.
      // We call the ownerOf function and pass in the nft id.
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
      // Item should be market as sold
      expect((await marketplace.items(1)).sold).to.equal(true);
    });

    it("Should fail for invalid item ids,sold items and when not enough ehter is paid", async function () {
      // fails for invalid item ids
      await expect(
        marketplace.connect(addr2).purchaseItem(2, { value: totalPriceInWei })
      ).to.be.revertedWith("item doesn't exist");
      await expect(
        marketplace.connect(addr2).purchaseItem(0, { value: totalPriceInWei })
      ).to.be.revertedWith("item doesn't exist");

      // fails when not enough ether is paid with transaction.
      await expect(
        marketplace.connect(addr2).purchaseItem(1, { value: toWei(price) })
      ).to.be.revertedWith(
        "not enough ether to cover item price and market fee"
      );

      // addr2 purchases item 1
      await marketplace
        .connect(addr2)
        .purchaseItem(1, { value: totalPriceInWei });

      // deployer tries purchasing item1 after its been sold
      await expect(
        marketplace
          .connect(deployer)
          .purchaseItem(1, { value: totalPriceInWei })
      ).to.be.revertedWith("Item already sold!");
    });
  });
});
