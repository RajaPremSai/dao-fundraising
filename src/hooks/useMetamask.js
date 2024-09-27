import { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";

export const useMetamask = () => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const connectMetamask = async () => {
      const ethereumProvider = await detectEthereumProvider();
      if (ethereumProvider) {
        setProvider(new ethers.providers.Web3Provider(ethereumProvider));
        const accounts = await ethereumProvider.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } else {
        console.log("Please install Metamask");
      }
    };
    connectMetamask();
  }, []);

  return { provider, account };
};
