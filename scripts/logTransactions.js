// scripts/logTransactions.js
// Run with: npx hardhat run scripts/logTransactions.js --network localhost

const hre = require("hardhat");
const fs = require('fs');

async function main() {
  // Contract addresses from your deployment (verify with your hardhat node)
  const deployed = JSON.parse(fs.readFileSync('deployed.json', 'utf8'));
const COFFEE_SUPPLY_ADDRESS = deployed.coffee;
const USER_CONTRACT_ADDRESS = deployed.user;

  // Get contract instances
  const coffeeSupply = await hre.ethers.getContractAt("CoffeeSupplyChain", COFFEE_SUPPLY_ADDRESS);
  const userContract = await hre.ethers.getContractAt("SupplyChainUser", USER_CONTRACT_ADDRESS);

  // Get signers (accounts from hardhat node)
  const [owner, inspector, harvester, exporter, importer, processor] = await hre.ethers.getSigners();

  console.log("\n========== TRANSACTION LOGS (Coffee Supply Chain) ==========\n");
  console.log(`Owner: ${owner.address}`);
  console.log(`Inspector: ${inspector.address}`);
  console.log(`Harvester: ${harvester.address}`);
  console.log(`Exporter: ${exporter.address}`);
  console.log(`Importer: ${importer.address}`);
  console.log(`Processor: ${processor.address}\n`);

  // Helper to print transaction summary
  async function logTx(tx, stepName, explanation) {
    const receipt = await tx.wait();
    const events = receipt.events.map(e => e.event).join(", ");
    console.log(`[${stepName}]`);
    console.log(`  Tx Hash:    ${tx.hash}`);
    console.log(`  Block:      ${receipt.blockNumber}`);
    console.log(`  From:       ${tx.from}`);
    console.log(`  To:         ${tx.to}`);
    console.log(`  Gas Used:   ${receipt.gasUsed.toString()}`);
    console.log(`  Events:     ${events}`);
    console.log(`  Explanation: ${explanation}\n`);
    return receipt;
  }

  // 1. Create users (admin only)
  console.log("--- USER CREATION (Admin) ---");
  
  let tx = await userContract.connect(owner).updateUserForAdmin(
    inspector.address, "Farm Inspector", "111", "FARM_INSPECTION", true, "QmInspector"
  );
  await logTx(tx, "Create Inspector", "Admin adds farm inspector role to the system.");

  tx = await userContract.connect(owner).updateUserForAdmin(
    harvester.address, "Harvester", "222", "HARVESTER", true, "QmHarvester"
  );
  await logTx(tx, "Create Harvester", "Admin adds harvester role.");

  tx = await userContract.connect(owner).updateUserForAdmin(
    exporter.address, "Exporter", "333", "EXPORTER", true, "QmExporter"
  );
  await logTx(tx, "Create Exporter", "Admin adds exporter role.");

  tx = await userContract.connect(owner).updateUserForAdmin(
    importer.address, "Importer", "444", "IMPORTER", true, "QmImporter"
  );
  await logTx(tx, "Create Importer", "Admin adds importer role.");

  tx = await userContract.connect(owner).updateUserForAdmin(
    processor.address, "Processor", "555", "PROCESSOR", true, "QmProcessor"
  );
  await logTx(tx, "Create Processor", "Admin adds processor role.");

  // 2. Add basic details (start cultivation)
  console.log("--- SUPPLY CHAIN FLOW ---");
  tx = await coffeeSupply.addBasicDetails(
    "REG001", "Ahmed Farmer", "123 Coffee Farm", "ExportCo", "ImportCo"
  );
  const receipt = await logTx(tx, "Add Basic Details (Cultivation)", 
    "Farmer creates a new coffee batch. Unique batch address generated. Next action: FARM_INSPECTION.");
  
  // Extract batch number from PerformCultivation event
  const batchEvent = receipt.events.find(e => e.event === "PerformCultivation");
  const batchNo = batchEvent.args.batchNo;
  console.log(`  New Batch Address: ${batchNo}\n`);

  // 3. Farm Inspection
  tx = await coffeeSupply.connect(inspector).updateFarmInspectorData(
    batchNo, "Arabica", "Typica", "Organic Fertilizer"
  );
  await logTx(tx, "Farm Inspection", 
    "Inspector records coffee variety (Arabica), seed type (Typica), and fertilizer used. Next action: HARVESTER.");

  // 4. Harvesting
  tx = await coffeeSupply.connect(harvester).updateHarvesterData(
    batchNo, "Caturra", "25°C", "80%"
  );
  await logTx(tx, "Harvesting", 
    "Harvester logs crop variety (Caturra), temperature and humidity at harvest time. Next action: EXPORTER.");

  // 5. Export
  const departureTime = Math.floor(Date.now() / 1000) + 86400; // tomorrow
  tx = await coffeeSupply.connect(exporter).updateExporterData(
    batchNo, 1000, "Port of Rotterdam", "MV Coffee Carrier", "SHIP123", departureTime, 98765
  );
  await logTx(tx, "Export", 
    "Exporter records quantity (1000 kg), ship name, number, destination, and estimated arrival. Next action: IMPORTER.");

  // 6. Import
  tx = await coffeeSupply.connect(importer).updateImporterData(
    batchNo, 1000, "MV Coffee Carrier", "SHIP123", "Container SCXU9876543", 
    "Rotterdam Warehouse A", "123 Harbor St", 54321
  );
  await logTx(tx, "Import", 
    "Importer confirms arrival, logs warehouse location and transport info. Next action: PROCESSOR.");

  // 7. Processing (Roasting)
  const packageTime = Math.floor(Date.now() / 1000) + 172800; // two days from now
  tx = await coffeeSupply.connect(processor).updateProcessorData(
    batchNo, 1000, "200°C", 600, "ROAST-001", packageTime, "Artisan Roast Co.", "456 Roastery Lane"
  );
  await logTx(tx, "Processing (Roasting)", 
    "Processor logs roasting temperature (200°C), duration (600 sec), internal batch number, packaging date. Next action: COMPLETED.");

  // 8. Final status
  const finalStatus = await coffeeSupply.getNextAction(batchNo);
  console.log(`Final Batch Status: ${finalStatus}`);
  console.log("\n========== END OF TRANSACTION LOGS ==========\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});