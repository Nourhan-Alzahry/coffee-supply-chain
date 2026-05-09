const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoffeeSupplyChain", function () {
  let supplyChainStorage;
  let coffeeSupplyChain;
  let supplyChainUser;
  let owner;
  let farmInspector;
  let harvester;
  let exporter;
  let importer;
  let processor;
  let batchNo;

  beforeEach(async function () {
    // Get signers
    [owner, farmInspector, harvester, exporter, importer, processor] = await ethers.getSigners();

    // Deploy SupplyChainStorage
    const SupplyChainStorage = await ethers.getContractFactory("SupplyChainStorage");
    supplyChainStorage = await SupplyChainStorage.deploy();
    await supplyChainStorage.deployed();

    // Deploy CoffeeSupplyChain
    const CoffeeSupplyChain = await ethers.getContractFactory("CoffeeSupplyChain");
    coffeeSupplyChain = await CoffeeSupplyChain.deploy(supplyChainStorage.address);
    await coffeeSupplyChain.deployed();

    // Deploy SupplyChainUser
    const SupplyChainUser = await ethers.getContractFactory("SupplyChainUser");
    supplyChainUser = await SupplyChainUser.deploy(supplyChainStorage.address);
    await supplyChainUser.deployed();

    // Authorize contracts
    await supplyChainStorage.authorizeCaller(coffeeSupplyChain.address);
    await supplyChainStorage.authorizeCaller(supplyChainUser.address);
  });

  describe("User Management", function () {
    it("Should allow admin to create users", async function () {
      const name = "Alice";
      const contactNo = "1234567890";
      const role = "FARM_INSPECTION";
      const isActive = true;
      const profileHash = "QmHash";

      await supplyChainUser.updateUserForAdmin(
        farmInspector.address,
        name,
        contactNo,
        role,
        isActive,
        profileHash
      );

      const user = await supplyChainUser.getUser(farmInspector.address);
      expect(user.name).to.equal(name);
      expect(user.contactNo).to.equal(contactNo);
      expect(user.role).to.equal(role);
      expect(user.isActive).to.equal(isActive);
      expect(user.profileHash).to.equal(profileHash);
    });

    it("Should allow users to update their own profile", async function () {
      const name = "Bob";
      const contactNo = "0987654321";
      const role = "HARVESTER";
      const isActive = true;
      const profileHash = "QmAnotherHash";

      await supplyChainUser.connect(harvester).updateUser(
        name,
        contactNo,
        role,
        isActive,
        profileHash
      );

      const user = await supplyChainUser.getUser(harvester.address);
      expect(user.name).to.equal(name);
      expect(user.contactNo).to.equal(contactNo);
      expect(user.role).to.equal(role);
      expect(user.isActive).to.equal(isActive);
      expect(user.profileHash).to.equal(profileHash);
    });
  });

  describe("Supply Chain Flow", function () {
    beforeEach(async function () {
      // Create users
      await supplyChainUser.updateUserForAdmin(
        farmInspector.address,
        "Alice",
        "1234567890",
        "FARM_INSPECTION",
        true,
        "QmHash1"
      );
      await supplyChainUser.updateUserForAdmin(
        harvester.address,
        "Bob",
        "0987654321",
        "HARVESTER",
        true,
        "QmHash2"
      );
      await supplyChainUser.updateUserForAdmin(
        exporter.address,
        "Charlie",
        "1122334455",
        "EXPORTER",
        true,
        "QmHash3"
      );
      await supplyChainUser.updateUserForAdmin(
        importer.address,
        "David",
        "5544332211",
        "IMPORTER",
        true,
        "QmHash4"
      );
      await supplyChainUser.updateUserForAdmin(
        processor.address,
        "Eve",
        "9988776655",
        "PROCESSOR",
        true,
        "QmHash5"
      );
    });

    it("Should complete the full supply chain flow", async function () {
      // 1. Add basic details (Cultivation)
      const registrationNo = "REG123";
      const farmerName = "John Farmer";
      const farmAddress = "123 Coffee Farm";
      const exporterName = "ExportCo";
      const importerName = "ImportCo";

      const tx = await coffeeSupplyChain.addBasicDetails(
        registrationNo,
        farmerName,
        farmAddress,
        exporterName,
        importerName
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "PerformCultivation");
      batchNo = event.args.batchNo;

      // 2. Farm Inspection
      await coffeeSupplyChain.connect(farmInspector).updateFarmInspectorData(
        batchNo,
        "Arabica",
        "Typica",
        "Organic"
      );

      // 3. Harvesting
      await coffeeSupplyChain.connect(harvester).updateHarvesterData(
        batchNo,
        "Caturra",
        "25°C",
        "80%"
      );

      // 4. Export
      const shipmentQuantity = 1000;
      const destinationAddress = "Port of Rotterdam";
      const shipName = "Cargo Ship 1";
      const shipNo = "CS1";
      const estimateDateTime = Math.floor(Date.now() / 1000) + 86400;
      const exporterId = 12345;

      await coffeeSupplyChain.connect(exporter).updateExporterData(
        batchNo,
        shipmentQuantity,
        destinationAddress,
        shipName,
        shipNo,
        estimateDateTime,
        exporterId
      );

      // 5. Import
      await coffeeSupplyChain.connect(importer).updateImporterData(
        batchNo,
        1000,
        "Cargo Ship 1",
        "CS1",
        "Container SCXU1234567",
        "Warehouse A",
        "123 Warehouse St",
        54321
      );

      // 6. Processing
      await coffeeSupplyChain.connect(processor).updateProcessorData(
        batchNo,
        1000,
        "200°C",
        600,
        "BATCH001",
        Math.floor(Date.now() / 1000) + 172800,
        "RoastCo",
        "456 Roastery Rd"
      );

      // Verify final next action
      const nextAction = await coffeeSupplyChain.getNextAction(batchNo);
      expect(nextAction).to.equal("COMPLETED");
    });

    it("Should prevent unauthorized users from performing actions", async function () {
      const tx = await coffeeSupplyChain.addBasicDetails(
        "REG123",
        "John Farmer",
        "123 Coffee Farm",
        "ExportCo",
        "ImportCo"
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "PerformCultivation");
      batchNo = event.args.batchNo;

      await expect(
        coffeeSupplyChain.connect(harvester).updateFarmInspectorData(
          batchNo,
          "Arabica",
          "Typica",
          "Organic"
        )
      ).to.be.revertedWith("Invalid role");
    });
  });
});