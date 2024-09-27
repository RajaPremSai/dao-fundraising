// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovernanceToken is ERC20, Ownable {
    // Constructor to initialize token with name, symbol, and initial supply
    constructor() ERC20("GovernanceToken", "GVT") Ownable(msg.sender) {
        // Mint 1 million tokens to contract owner
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // Mint new tokens (only owner can mint)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
