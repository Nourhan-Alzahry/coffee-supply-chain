// scripts/run-single-account.js
const hre = require("hardhat");

async function main() {
  const STORAGE_ADDR = "0xC7465E1002d16F2d5E2376FA7b4417110BEBcC01";
  const COFFEE_ADDR = "0xe41b8c4169Ab4ad750372ba2c2768cd3bAb50e21";
  const USER_ADDR = "0xc6E80cdD87bf05806448968796C895c35F068Af8";

  const coffee = await hre.ethers.getContractAt("CoffeeSupplyChain", COFFEE_ADDR);
  const user = await hre.ethers.getContractAt("SupplyChainUser", USER_ADDR);
  const storage = await hre.ethers.getContractAt("SupplyChainStorage", STORAGE_ADDR);
  const [owner] = await hre.ethers.getSigners();

  console.log("Using account:", owner.address);


  async function setRoleAndVerify(roleName) {
    console.log(`Setting role to ${roleName}...`);
    const tx = await user.updateUserForAdmin(owner.address, roleName, "111", roleName, true, "hash");
    await tx.wait();

    const currentRole = await storage.userRole(owner.address);
    console.log(`Verified role: ${currentRole}`);
    if (currentRole !== roleName) {
      throw new Error(`Role mismatch: expected ${roleName}, got ${currentRole}`);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  await setRoleAndVerify("FARM_INSPECTION");

  console.log("Adding batch details...");
  let tx = await coffee.addBasicDetails("REG001", "Ahmed", "Farm", "ExportCo", "ImportCo");
  let receipt = await tx.wait();
  const batchEvent = receipt.events.find(e => e.event === "PerformCultivation");
  const batchNo = batchEvent.args.batchNo;
  console.log("Batch created:", batchNo);

  console.log("Performing farm inspection...");
  await coffee.updateFarmInspectorData(batchNo, "Arabica", "Typica", "Organic");
  console.log("Inspection done.");

  await setRoleAndVerify("HARVESTER");

  console.log("Harvesting...");
  await coffee.updateHarvesterData(batchNo, "Caturra", "25°C", "80%");
  console.log("Harvesting done.");

  await setRoleAndVerify("EXPORTER");

  console.log("Exporting...");
  const departure = Math.floor(Date.now() / 1000) + 86400;
  await coffee.updateExporterData(batchNo, 1000, "Port of Rotterdam", "Ship1", "S123", departure, 12345);
  console.log("Export done.");

  await setRoleAndVerify("IMPORTER");

  console.log("Importing...");
  await coffee.updateImporterData(batchNo, 1000, "Ship1", "S123", "Container", "Warehouse", "Address", 54321);
  console.log("Import done.");

  await setRoleAndVerify("PROCESSOR");

  console.log("Processing (roasting)...");
  const packageTime = Math.floor(Date.now() / 1000) + 172800;
  await coffee.updateProcessorData(batchNo, 1000, "200°C", 600, "B001", packageTime, "RoastCo", "Roaster");
  console.log("Processing done.");

  const status = await coffee.getNextAction(batchNo);
  console.log("Final status:", status);
  console.log("Supply chain completed successfully!");
}

main().catch(console.error);