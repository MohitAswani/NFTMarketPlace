require("dotenv").config();
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
  networks:{
    goerli:{
      url:process.env.GOERLI_INFURA_URL,
      accounts:[process.env.METAMASK_PRIVATE_KEY]
    }
  }
};
