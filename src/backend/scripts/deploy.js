async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contracts here:

  // This line fetches the contract factory which is used to deploy the NFT.
  // We call this method on the ethers object which is inject into our dev enviroment by hardhat.
  // ethers is a library which is used to communicate with ethereum nodes.
  // Then we pass in the name of contract we want to deploy.
  const NFT = await ethers.getContractFactory("NFT");

  // We call the deploy on the factory to deply the contract and fetch the deployed copy of the NFT.
  const nft = await NFT.deploy();

  const Marketplace = await ethers.getContractFactory("Marketplace");
  // We need to pass in the fee percent in the deploy method because the marketplace constructor expects a fee percent.
  const marketplace = await Marketplace.deploy(1);

  console.log("NFT contract address", nft.address);
  console.log("Marketplace contract address", marketplace.address);

  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
  // And we pass the deployed copy and the name of the NFT.
  saveFrontendFiles(nft, "NFT");
  saveFrontendFiles(marketplace, "Marketplace");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
