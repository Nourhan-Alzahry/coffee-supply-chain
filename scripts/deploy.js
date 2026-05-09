const hre = require("hardhat");

async function main() {
  // Get the contract factories
  const SupplyChainStorage = await hre.ethers.getContractFactory("SupplyChainStorage");
  const CoffeeSupplyChain = await hre.ethers.getContractFactory("CoffeeSupplyChain");
  const SupplyChainUser = await hre.ethers.getContractFactory("SupplyChainUser");

  // Deploy SupplyChainStorage
  console.log("Deploying SupplyChainStorage...");
  const supplyChainStorage = await SupplyChainStorage.deploy();
  await supplyChainStorage.deployed();
  console.log("SupplyChainStorage deployed to:", supplyChainStorage.address);

  // Deploy CoffeeSupplyChain with SupplyChainStorage address
  console.log("Deploying CoffeeSupplyChain...");
  const coffeeSupplyChain = await CoffeeSupplyChain.deploy(supplyChainStorage.address);
  await coffeeSupplyChain.deployed();
  console.log("CoffeeSupplyChain deployed to:", coffeeSupplyChain.address);

  // Deploy SupplyChainUser with SupplyChainStorage address
  console.log("Deploying SupplyChainUser...");
  const supplyChainUser = await SupplyChainUser.deploy(supplyChainStorage.address);
  await supplyChainUser.deployed();
  console.log("SupplyChainUser deployed to:", supplyChainUser.address);

  // Authorize the CoffeeSupplyChain and SupplyChainUser contracts as callers
  console.log("Authorizing callers...");
  await supplyChainStorage.authorizeCaller(coffeeSupplyChain.address);
  await supplyChainStorage.authorizeCaller(supplyChainUser.address);
  console.log("Callers authorized");

  console.log("Deployment completed successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
