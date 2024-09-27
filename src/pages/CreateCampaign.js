import React, { useState } from "react";
import { ethers } from "ethers";
import { Form, Button, Container, Row, Col } from "react-bootstrap"; // Using react-bootstrap for form styling
import FundraisingDAO from "../contracts/FundraisingDAO.json"; // Import ABI

// Replace with your contract address
const FUNDRAISING_CONTRACT_ADDRESS =
  "0x4Ac1d98D9cEF99EC6546dEd4Bd550b0b287aaD6D";

const CreateCampaign = () => {
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
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

  // Create a new campaign by interacting with the contract
  const createNewCampaign = async () => {
    if (!goal || !deadline) {
      setMessage("Please fill out all fields.");
      return;
    }

    try {
      const contract = new ethers.Contract(
        FUNDRAISING_CONTRACT_ADDRESS,
        FundraisingDAO,
        signer
      );

      // Convert goal to Wei
      const goalInWei = ethers.utils.parseEther(goal);

      // Call the contract method `createCampaign(goal, deadline)`
      const transaction = await contract.createCampaign(goalInWei, deadline);
      await transaction.wait(); // Wait for transaction to be mined
      setMessage("Campaign created successfully!");
    } catch (error) {
      console.error("Error creating campaign", error);
      setMessage("Error creating campaign. Check console for details.");
    }
  };

  return (
    <Container>
      <h2>Create a New Campaign</h2>
      <Row>
        <Col md={6}>
          <Form>
            <Form.Group controlId="goal">
              <Form.Label>Campaign Goal (ETH)</Form.Label>
              <Form.Control
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Enter goal in ETH"
              />
            </Form.Group>

            <Form.Group controlId="deadline">
              <Form.Label>Campaign Deadline (UNIX Timestamp)</Form.Label>
              <Form.Control
                type="number"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="Enter deadline in UNIX timestamp"
              />
            </Form.Group>

            <Button variant="primary" onClick={createNewCampaign}>
              Create Campaign
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

export default CreateCampaign;
