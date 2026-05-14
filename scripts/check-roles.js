const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Checking roles for address:", deployer.address);

    const STORAGE_ADDR = "0xC7465E1002d16F2d5E2376FA7b4417110BEBcC01"; 
    const storage = await hre.ethers.getContractAt("SupplyChainStorage", STORAGE_ADDR);

    const userRole = await storage.userRole(deployer.address);
    console.log(`The role of ${deployer.address} is: '${userRole}'`);

    if (userRole === "") {
        console.log("No role found! Please run the role assignment script.");
    } else {
        console.log("Role setup is correct.");
    }
}

main().catch(console.error);