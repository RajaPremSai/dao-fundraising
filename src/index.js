import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import HomePage from "./pages/HomePage";
import CreateCampaign from "./pages/CreateCampaign";
import CreateProposal from "./pages/CreateProposal";
import Voting from "./pages/Voting";
import Footer from "./Footer";
import About from "./pages/about";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <NavigationBar />
    <Routes>
      <Route path={"/"} element={<HomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/CreateCampaign" element={<CreateCampaign />} />
      <Route path={"/CreateProposal"} element={<CreateProposal />} />
      <Route path={"/Voting"} element={<Voting />} />
    </Routes>
    <Footer />
  </BrowserRouter>
);
