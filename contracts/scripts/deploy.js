const { ethers } = require("hardhat");

async function main() {
  // Get the deployer's address
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Compile the contract
  const SmartBox = await ethers.getContractFactory("SmartBox");

  // Deploy the contract
  console.log("Deploying contract...");
  const smartBox = await SmartBox.deploy();
  console.log("SmartBox deployed to:", smartBox.address);

  // Optionally, you can interact with the contract after deployment
  // Example: Get the contract's owner
  const owner = await smartBox.owner();
  console.log("Contract owner is:", owner);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });