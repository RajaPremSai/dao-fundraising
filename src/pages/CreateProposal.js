import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Form, Button, Container, Row, Col } from "react-bootstrap"; // Using react-bootstrap for form styling
import FundraisingDAO from "../contracts/FundraisingDAO.json"; // Import the ABI

// Replace with your contract address
const FUNDRAISING_CONTRACT_ADDRESS =
  "0x4Ac1d98D9cEF99EC6546dEd4Bd550b0b287aaD6D";

const CreateProposal = () => {
  const [campaignId, setCampaignId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Connect to the Ethereum wallet (Metamask)
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please install Metamask!");
        return;
      }
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      setProvider(provider);
      setSigner(signer);
      console.log("Wallet connected");
    } catch (error) {
      console.error("Error connecting to wallet", error);
    }
  };

  // Create a new proposal for an existing campaign
  const createNewProposal = async () => {
    if (!campaignId || !description || !amount) {
      setMessage("Please fill out all fields.");
      return;
    }

    try {
      const contract = new ethers.Contract(
        FUNDRAISING_CONTRACT_ADDRESS,
        FundraisingDAO,
        signer
      );

      // Convert amount to Wei
      const amountInWei = ethers.utils.parseEther(amount);

      // Call the contract method `submitProposal(campaignId, description, amount)`
      const transaction = await contract.submitProposal(
        campaignId,
        description,
        amountInWei
      );
      await transaction.wait(); // Wait for transaction to be mined
      setMessage("Proposal submitted successfully!");
    } catch (error) {
      console.error("Error submitting proposal", error);
      setMessage("Error submitting proposal. Check console for details.");
    }
  };

  return (
    <Container>
      <h2>Submit a Proposal</h2>
      <Row>
        <Col md={6}>
          <Form>
            <Form.Group controlId="campaignId">
              <Form.Label>Campaign ID</Form.Label>
              <Form.Control
                type="number"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                placeholder="Enter the campaign ID"
              />
            </Form.Group>

            <Form.Group controlId="description">
              <Form.Label>Proposal Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description of the proposal"
              />
            </Form.Group>

            <Form.Group controlId="amount">
              <Form.Label>Requested Amount (ETH)</Form.Label>
              <Form.Control
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter the amount in ETH"
              />
            </Form.Group>

            <Button variant="primary" onClick={createNewProposal}>
              Submit Proposal
            </Button>
          </Form>
        </Col>
      </Row>

      <Button
        variant="secondary"
        onClick={connectWallet}
        style={{ marginTop: "20px" }}
      >
        Connect Wallet
      </Button>

      {message && <p style={{ marginTop: "20px" }}>{message}</p>}
    </Container>
  );
};

export default CreateProposal;
