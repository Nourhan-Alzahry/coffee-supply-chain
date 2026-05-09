// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SupplyChainStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CoffeeSupplyChain is Ownable {
    // Events
    event PerformCultivation(address indexed user, address indexed batchNo);
    event DoneInspection(address indexed user, address indexed batchNo);
    event DoneHarvesting(address indexed user, address indexed batchNo);
    event DoneExporting(address indexed user, address indexed batchNo);
    event DoneImporting(address indexed user, address indexed batchNo);
    event DoneProcessing(address indexed user, address indexed batchNo);

    // Modifiers
    modifier isValidPerformer(address batchNo, string memory role) {
        require(
            keccak256(abi.encodePacked(supplyChainStorage.getUserRole(msg.sender))) ==
                keccak256(abi.encodePacked(role)),
            "Invalid role"
        );
        require(
            keccak256(abi.encodePacked(supplyChainStorage.getNextAction(batchNo))) ==
                keccak256(abi.encodePacked(role)),
            "Invalid next action"
        );
        _;
    }

    // Storage variable
    SupplyChainStorage public supplyChainStorage;

    constructor(address _supplyChainAddress) {
        supplyChainStorage = SupplyChainStorage(_supplyChainAddress);
    }

    // Get next action
    function getNextAction(address _batchNo) public view returns (string memory) {
        return supplyChainStorage.getNextAction(_batchNo);
    }

    // Get basic details
    function getBasicDetails(address _batchNo)
        public
        view
        returns (
            string memory registrationNo,
            string memory farmerName,
            string memory farmAddress,
            string memory exporterName,
            string memory importerName
        )
    {
        return supplyChainStorage.getBasicDetails(_batchNo);
    }

    // Perform basic cultivation
    function addBasicDetails(
        string memory _registrationNo,
        string memory _farmerName,
        string memory _farmAddress,
        string memory _exporterName,
        string memory _importerName
    ) public onlyOwner returns (address) {
        // Generate a unique batch address
        address batchNo = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            block.timestamp,
                            msg.sender,
                            _registrationNo,
                            _farmerName,
                            blockhash(block.number - 1)
                        )
                    )
                )
            )
        );
        supplyChainStorage.setBasicDetails(
            batchNo,
            _registrationNo,
            _farmerName,
            _farmAddress,
            _exporterName,
            _importerName
        );
        emit PerformCultivation(msg.sender, batchNo);
        return batchNo;
    }

    // Get farm inspector data
    function getFarmInspectorData(address _batchNo)
        public
        view
        returns (
            string memory coffeeFamily,
            string memory typeOfSeed,
            string memory fertilizerUsed
        )
    {
        return supplyChainStorage.getFarmInspectorData(_batchNo);
    }

    // Perform farm inspection
    function updateFarmInspectorData(
        address _batchNo,
        string memory _coffeeFamily,
        string memory _typeOfSeed,
        string memory _fertilizerUsed
    ) public isValidPerformer(_batchNo, "FARM_INSPECTION") returns (bool) {
        bool status = supplyChainStorage.setFarmInspectorData(
            _batchNo,
            _coffeeFamily,
            _typeOfSeed,
            _fertilizerUsed
        );
        emit DoneInspection(msg.sender, _batchNo);
        return status;
    }

    // Get harvester data
    function getHarvesterData(address _batchNo)
        public
        view
        returns (
            string memory cropVariety,
            string memory temperatureUsed,
            string memory humidity
        )
    {
        return supplyChainStorage.getHarvesterData(_batchNo);
    }

    // Perform harvesting
    function updateHarvesterData(
        address _batchNo,
        string memory _cropVariety,
        string memory _temperatureUsed,
        string memory _humidity
    ) public isValidPerformer(_batchNo, "HARVESTER") returns (bool) {
        bool status = supplyChainStorage.setHarvesterData(
            _batchNo,
            _cropVariety,
            _temperatureUsed,
            _humidity
        );
        emit DoneHarvesting(msg.sender, _batchNo);
        return status;
    }

    // Get exporter data
    function getExporterData(address _batchNo)
        public
        view
        returns (
            uint256 quantity,
            string memory destinationAddress,
            string memory shipName,
            string memory shipNo,
            uint256 departureDateTime,
            uint256 estimateDateTime,
            uint256 exporterId
        )
    {
        return supplyChainStorage.getExporterData(_batchNo);
    }

    // Perform exporting
    function updateExporterData(
        address _batchNo,
        uint256 _quantity,
        string memory _destinationAddress,
        string memory _shipName,
        string memory _shipNo,
        uint256 _estimateDateTime,
        uint256 _exporterId
    ) public isValidPerformer(_batchNo, "EXPORTER") returns (bool) {
        bool status = supplyChainStorage.setExporterData(
            _batchNo,
            _quantity,
            _destinationAddress,
            _shipName,
            _shipNo,
            _estimateDateTime,
            _exporterId
        );
        emit DoneExporting(msg.sender, _batchNo);
        return status;
    }

    // Get importer data
    function getImporterData(address _batchNo)
        public
        view
        returns (
            uint256 quantity,
            string memory shipName,
            string memory shipNo,
            uint256 arrivalDateTime,
            string memory transportInfo,
            string memory warehouseName,
            string memory warehouseAddress,
            uint256 importerId
        )
    {
        return supplyChainStorage.getImporterData(_batchNo);
    }

    // Perform importing
    function updateImporterData(
        address _batchNo,
        uint256 _quantity,
        string memory _shipName,
        string memory _shipNo,
        string memory _transportInfo,
        string memory _warehouseName,
        string memory _warehouseAddress,
        uint256 _importerId
    ) public isValidPerformer(_batchNo, "IMPORTER") returns (bool) {
        bool status = supplyChainStorage.setImporterData(
            _batchNo,
            _quantity,
            _shipName,
            _shipNo,
            _transportInfo,
            _warehouseName,
            _warehouseAddress,
            _importerId
        );
        emit DoneImporting(msg.sender, _batchNo);
        return status;
    }

    // Get processor data
    function getProcessorData(address _batchNo)
        public
        view
        returns (
            uint256 quantity,
            string memory temperature,
            uint256 rostingDuration,
            string memory internalBatchNo,
            uint256 packageDateTime,
            string memory processorName,
            string memory processorAddress
        )
    {
        return supplyChainStorage.getProcessorData(_batchNo);
    }

    // Perform processing
    function updateProcessorData(
        address _batchNo,
        uint256 _quantity,
        string memory _temperature,
        uint256 _rostingDuration,
        string memory _internalBatchNo,
        uint256 _packageDateTime,
        string memory _processorName,
        string memory _processorAddress
    ) public isValidPerformer(_batchNo, "PROCESSOR") returns (bool) {
        bool status = supplyChainStorage.setProcessorData(
            _batchNo,
            _quantity,
            _temperature,
            _rostingDuration,
            _internalBatchNo,
            _packageDateTime,
            _processorName,
            _processorAddress
        );
        emit DoneProcessing(msg.sender, _batchNo);
        return status;
    }
}
