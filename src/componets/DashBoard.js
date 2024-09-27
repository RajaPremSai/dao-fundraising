import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card, Button, Row, Col, Container } from "react-bootstrap"; // Using react-bootstrap for styling
import FundraisingDAO from "../contracts/FundraisingDAO.json"; // Import the ABI

// Replace with your contract address
const FUNDRAISING_CONTRACT_ADDRESS =
  "0x4Ac1d98D9cEF99EC6546dEd4Bd550b0b287aaD6D";

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    // Initialize ethers provider and signer
    const initBlockchainData = async () => {
      try {
        const { ethereum } = window;
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          setProvider(provider);
          setSigner(signer);
        } else {
          console.log("Please install MetaMask!");
        }
      } catch (error) {
        console.error("Error connecting to wallet", error);
      }
    };

    initBlockchainData();
  }, []);

  // Fetch all campaigns from the contract
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        if (provider && signer) {
          const contract = new ethers.Contract(
            FUNDRAISING_CONTRACT_ADDRESS,
            FundraisingDAO,
            signer
          );
          const campaignCount = await contract.campaignCount();
          let fetchedCampaigns = [];

          for (let i = 0; i < campaignCount; i++) {
            const campaign = await contract.campaigns(i);
            fetchedCampaigns.push(campaign);
          }

          setCampaigns(fetchedCampaigns);
        }
      } catch (error) {
        console.error("Error fetching campaigns", error);
      }
    };

    fetchCampaigns();
  }, [provider, signer]);

  return (
    <Container>
      <h2>Available Campaigns</h2>
      <Row>
        {campaigns.length > 0 ? (
          campaigns.map((campaign, index) => (
            <Col key={index} md={4}>
              <Card style={{ marginBottom: "20px" }}>
                <Card.Body>
                  <Card.Title>Campaign #{index + 1}</Card.Title>
                  <Card.Text>
                    <strong>Creator:</strong> {campaign.creator} <br />
                    <strong>Goal:</strong>{" "}
                    {ethers.utils.formatEther(campaign.goal.toString())} ETH{" "}
                    <br />
                    <strong>Funds Raised:</strong>{" "}
                    {ethers.utils.formatEther(campaign.totalFunds.toString())}{" "}
                    ETH <br />
                    <strong>Deadline:</strong>{" "}
                    {new Date(campaign.deadline * 1000).toLocaleString()} <br />
                    <strong>Status:</strong>{" "}
                    {campaign.goalReached ? "Goal Reached" : "In Progress"}
                  </Card.Text>
                  <Button variant="primary">Contribute</Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>No campaigns available.</p>
        )}
      </Row>
    </Container>
  );
};

export default Dashboard;
