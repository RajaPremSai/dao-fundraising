import React from "react";
import { Link } from "react-router-dom";
import { useMetamask } from "./hooks/useMetamask";

const NavigationBar = () => {
  const { account, connectWallet } = useMetamask();

  return <>
  <div className=""></div></>;
};

export default NavigationBar;
