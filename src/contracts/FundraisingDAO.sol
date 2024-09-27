// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FundraisingDAO is Ownable {
    // Define the structure of a campaign
    struct Campaign {
        address payable creator;
        uint256 goal;
        uint256 deadline;
        uint256 totalFunds;
        bool goalReached;
        bool fundsDistributed;
        mapping(address => uint256) contributions;
        address[] contributors;
    }

    // Governance token used for voting
    IERC20 public governanceToken;

    // Campaigns storage
    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount;

    // Voting related structures
    struct Proposal {
        uint256 campaignId;
        uint256 amount;
        bool executed;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) voted;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    // Events
    event CampaignCreated(uint256 campaignId, address creator, uint256 goal, uint256 deadline);
    event FundContributed(uint256 campaignId, address contributor, uint256 amount);
    event RefundIssued(uint256 campaignId, address contributor, uint256 amount);
    event ProposalCreated(uint256 proposalId, uint256 campaignId, uint256 amount);
    event VoteCast(uint256 proposalId, address voter, bool support);
    event FundsDistributed(uint256 campaignId, uint256 amount);

    // Pass msg.sender to Ownable constructor
    constructor(IERC20 _governanceToken) Ownable(msg.sender) {
        governanceToken = _governanceToken;
    }

    // Create a new fundraising campaign
    function createCampaign(uint256 _goal, uint256 _deadline) external {
        require(_deadline > block.timestamp, "Deadline should be in the future");

        campaignCount++;
        Campaign storage newCampaign = campaigns[campaignCount];
        newCampaign.creator = payable(msg.sender);
        newCampaign.goal = _goal;
        newCampaign.deadline = _deadline;

        emit CampaignCreated(campaignCount, msg.sender, _goal, _deadline);
    }

    // Contribute to a specific campaign
    function contribute(uint256 _campaignId) external payable {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution should be greater than 0");

        if (campaign.contributions[msg.sender] == 0) {
            campaign.contributors.push(msg.sender);
        }
        campaign.contributions[msg.sender] += msg.value;
        campaign.totalFunds += msg.value;

        emit FundContributed(_campaignId, msg.sender, msg.value);
    }

    // Create a proposal to distribute funds once the goal is reached
    function createProposal(uint256 _campaignId, uint256 _amount) external {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.totalFunds >= campaign.goal, "Goal not reached yet");
        require(msg.sender == campaign.creator, "Only campaign creator can propose");

        proposalCount++;
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.campaignId = _campaignId;
        newProposal.amount = _amount;

        emit ProposalCreated(proposalCount, _campaignId, _amount);
    }

    // Cast a vote on a proposal
    function vote(uint256 _proposalId, bool support) external {
        Proposal storage proposal = proposals[_proposalId];
        Campaign storage campaign = campaigns[proposal.campaignId];
        require(campaign.totalFunds >= campaign.goal, "Campaign goal not reached");
        require(!proposal.voted[msg.sender], "Already voted");

        uint256 voterTokens = governanceToken.balanceOf(msg.sender);
        require(voterTokens > 0, "Must hold governance tokens to vote");

        if (support) {
            proposal.votesFor += voterTokens;
        } else {
            proposal.votesAgainst += voterTokens;
        }
        proposal.voted[msg.sender] = true;

        emit VoteCast(_proposalId, msg.sender, support);
    }

    // Execute the proposal to distribute funds
    function executeProposal(uint256 _proposalId) external onlyOwner {
        Proposal storage proposal = proposals[_proposalId];
        Campaign storage campaign = campaigns[proposal.campaignId];
        require(!proposal.executed, "Proposal already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal not approved by majority");

        campaign.creator.transfer(proposal.amount);
        proposal.executed = true;
        campaign.fundsDistributed = true;

        emit FundsDistributed(proposal.campaignId, proposal.amount);
    }

    // Refund contributors if the campaign's goal is not met
    function refund(uint256 _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp >= campaign.deadline, "Campaign deadline not yet reached");
        require(campaign.totalFunds < campaign.goal, "Campaign goal was met");
        require(campaign.contributions[msg.sender] > 0, "No contributions from sender");

        uint256 contributedAmount = campaign.contributions[msg.sender];
        campaign.contributions[msg.sender] = 0;

        payable(msg.sender).transfer(contributedAmount);
        emit RefundIssued(_campaignId, msg.sender, contributedAmount);
    }
}
