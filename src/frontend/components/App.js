import { BrowserRouter, Routes, Route } from "react-router-dom";
import logo from "./logo.png";
import "./App.css";
import Navigation from "./Navbar";
import { useState } from "react";
import { ethers } from "ethers";
import MarketplaceAbi from "../contractsData/Marketplace.json";
import MarketplaceAddress from "../contractsData/Marketplace-address.json";
import NFTAbi from "../contractsData/NFT.json";
import NFTAddress from "../contractsData/NFT-address.json";
import Home from "./Home";
import Create from "./Create";
import MyListedItems from "./MyListedItems";
import MyPurchases from "./MyPurchases";
import { Spinner } from "react-bootstrap";

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [nft, setNFT] = useState({});
  const [marketplace, setMarketplace] = useState({});

  // Metamask login/connect
  const web3Handler = async () => {
    // fetch the account in our metmask.
    // This line will return an array of accounts.
    // First account listed will be the one which is connected to the app and we will display that account.
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
    // Get provider from metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Set signer
    // A Signer in ethers is an abstraction of an Ethereum Account, which can be used to sign messages and transactions and send signed transactions to the Ethereum Network to execute state changing operations.
    const signer = provider.getSigner();

    loadContracts(signer);
  };

  const loadContracts = async (signer) => {
    // We use this function to get the deployed copy of the contracts.
    // We import the copy of the constract which we saved while deploying.
    const marketplace = new ethers.Contract(
      MarketplaceAddress.address,
      MarketplaceAbi.abi,
      signer
    );
    setMarketplace(marketplace);
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    setNFT(nft);
    setLoading(false);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} account={account}></Navigation>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "80vh",
            }}
          >
            <Spinner animation="border" style={{ display: "flex" }} />
            <p className="mx-3 my-0">Awaiting Metamask Connection...</p>
          </div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={<Home marketplace={marketplace} nft={nft} />}
            />
            <Route
              path="/create"
              element={<Create marketplace={marketplace} nft={nft} />}
            />
            <Route
              path="/my-listed-items"
              element={
                <MyListedItems
                  marketplace={marketplace}
                  nft={nft}
                  account={account}
                />
              }
            />
            <Route
              path="/my-purchases"
              element={
                <MyPurchases
                  marketplace={marketplace}
                  nft={nft}
                  account={account}
                />
              }
            />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
