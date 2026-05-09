// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SupplyChainStorage is Ownable {
    // Events
    event AuthorizedCaller(address caller);
    event DeAuthorizedCaller(address caller);

    // Modifiers
    modifier onlyAuthCaller() {
        require(authorizedCaller[msg.sender] == 1, "Not authorized");
        _;
    }

    // User structure
    struct User {
        string name;
        string contactNo;
        bool isActive;
        string profileHash;
    }

    // Process structures as defined in the original contract
    struct BasicDetails {
        string registrationNo;
        string farmerName;
        string farmAddress;
        string exporterName;
        string importerName;
    }

    struct FarmInspector {
        string coffeeFamily;
        string typeOfSeed;
        string fertilizerUsed;
    }

    struct Harvester {
        string cropVariety;
        string temperatureUsed;
        string humidity;
    }

    struct Exporter {
        string destinationAddress;
        string shipName;
        string shipNo;
        uint256 quantity;
        uint256 departureDateTime;
        uint256 estimateDateTime;
        uint256 plantNo;
        uint256 exporterId;
    }

    struct Importer {
        uint256 quantity;
        uint256 arrivalDateTime;
        uint256 importerId;
        string shipName;
        string shipNo;
        string transportInfo;
        string warehouseName;
        string warehouseAddress;
    }

    struct Processor {
        uint256 quantity;
        uint256 rostingDuration;
        uint256 packageDateTime;
        string temperature;
        string internalBatchNo;
        string processorName;
        string processorAddress;
    }

    // Mappings
    mapping(address => User) public userDetails;
    mapping(address => string) public userRole;
    mapping(address => uint8) public authorizedCaller;
    mapping(address => BasicDetails) public batchBasicDetails;
    mapping(address => FarmInspector) public batchFarmInspector;
    mapping(address => Harvester) public batchHarvester;
    mapping(address => Exporter) public batchExporter;
    mapping(address => Importer) public batchImporter;
    mapping(address => Processor) public batchProcessor;
    mapping(address => string) public nextAction;

    constructor() {
        authorizedCaller[msg.sender] = 1;
        emit AuthorizedCaller(msg.sender);
    }

    // Authorize a new caller
    function authorizeCaller(address _caller) external onlyOwner returns (bool) {
        authorizedCaller[_caller] = 1;
        emit AuthorizedCaller(_caller);
        return true;
    }

    // Deauthorize a caller
    function deAuthorizeCaller(address _caller) external onlyOwner returns (bool) {
        authorizedCaller[_caller] = 0;
        emit DeAuthorizedCaller(_caller);
        return true;
    }

    // Get user role
    function getUserRole(address _userAddress) external view onlyAuthCaller returns (string memory) {
        return userRole[_userAddress];
    }

    // Get next action for a batch
    function getNextAction(address _batchNo) external view onlyAuthCaller returns (string memory) {
        return nextAction[_batchNo];
    }

    // Set user details
    function setUser(
        address _userAddress,
        string memory _name,
        string memory _contactNo,
        string memory _role,
        bool _isActive,
        string memory _profileHash
    ) external onlyAuthCaller returns (bool) {
        userDetails[_userAddress] = User(_name, _contactNo, _isActive, _profileHash);
        userRole[_userAddress] = _role;
        return true;
    }

    // Get user details
    function getUser(address _userAddress)
        external
        view
        onlyAuthCaller
        returns (
            string memory name,
            string memory contactNo,
            string memory role,
            bool isActive,
            string memory profileHash
        )
    {
        User memory user = userDetails[_userAddress];
        return (user.name, user.contactNo, userRole[_userAddress], user.isActive, user.profileHash);
    }

    // Set basic details for a batch
    function setBasicDetails(
        address _batchNo,
        string memory _registrationNo,
        string memory _farmerName,
        string memory _farmAddress,
        string memory _exporterName,
        string memory _importerName
    ) external onlyAuthCaller returns (bool) {
        batchBasicDetails[_batchNo] = BasicDetails(
            _registrationNo,
            _farmerName,
            _farmAddress,
            _exporterName,
            _importerName
        );
        nextAction[_batchNo] = "FARM_INSPECTION";
        return true;
    }

    // Get basic details for a batch
    function getBasicDetails(address _batchNo)
        external
        view
        onlyAuthCaller
        returns (
            string memory registrationNo,
            string memory farmerName,
            string memory farmAddress,
            string memory exporterName,
            string memory importerName
        )
    {
        BasicDetails memory details = batchBasicDetails[_batchNo];
        return (
            details.registrationNo,
            details.farmerName,
            details.farmAddress,
            details.exporterName,
            details.importerName
        );
    }

    // Set farm inspector data
    function setFarmInspectorData(
        address _batchNo,
        string memory _coffeeFamily,
        string memory _typeOfSeed,
        string memory _fertilizerUsed
    ) external onlyAuthCaller returns (bool) {
        batchFarmInspector[_batchNo] = FarmInspector(_coffeeFamily, _typeOfSeed, _fertilizerUsed);
        nextAction[_batchNo] = "HARVESTER";
        return true;
    }

    // Get farm inspector data
    function getFarmInspectorData(address _batchNo)
        external
        view
        onlyAuthCaller
        returns (
            string memory coffeeFamily,
            string memory typeOfSeed,
            string memory fertilizerUsed
        )
    {
        FarmInspector memory data = batchFarmInspector[_batchNo];
        return (data.coffeeFamily, data.typeOfSeed, data.fertilizerUsed);
    }

    // Similar functions for Harvester, Exporter, Importer, Processor...
    // (To save space, I'll include minimal examples, but in practice you'll need all of them)

    // Set harvester data
    function setHarvesterData(
        address _batchNo,
        string memory _cropVariety,
        string memory _temperatureUsed,
        string memory _humidity
    ) external onlyAuthCaller returns (bool) {
        batchHarvester[_batchNo] = Harvester(_cropVariety, _temperatureUsed, _humidity);
        nextAction[_batchNo] = "EXPORTER";
        return true;
    }

    // Get harvester data
    function getHarvesterData(address _batchNo)
        external
        view
        onlyAuthCaller
        returns (
            string memory cropVariety,
            string memory temperatureUsed,
            string memory humidity
        )
    {
        Harvester memory data = batchHarvester[_batchNo];
        return (data.cropVariety, data.temperatureUsed, data.humidity);
    }

    // Set exporter data
    function setExporterData(
        address _batchNo,
        uint256 _quantity,
        string memory _destinationAddress,
        string memory _shipName,
        string memory _shipNo,
        uint256 _estimateDateTime,
        uint256 _exporterId
    ) external onlyAuthCaller returns (bool) {
        batchExporter[_batchNo] = Exporter({
            destinationAddress: _destinationAddress,
            shipName: _shipName,
            shipNo: _shipNo,
            quantity: _quantity,
            departureDateTime: block.timestamp,
            estimateDateTime: _estimateDateTime,
            plantNo: 0,
            exporterId: _exporterId
        });
        nextAction[_batchNo] = "IMPORTER";
        return true;
    }

    // Get exporter data
    function getExporterData(address _batchNo)
        external
        view
        onlyAuthCaller
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
        Exporter memory data = batchExporter[_batchNo];
        return (
            data.quantity,
            data.destinationAddress,
            data.shipName,
            data.shipNo,
            data.departureDateTime,
            data.estimateDateTime,
            data.exporterId
        );
    }

    // Set importer data
    function setImporterData(
        address _batchNo,
        uint256 _quantity,
        string memory _shipName,
        string memory _shipNo,
        string memory _transportInfo,
        string memory _warehouseName,
        string memory _warehouseAddress,
        uint256 _importerId
    ) external onlyAuthCaller returns (bool) {
        batchImporter[_batchNo] = Importer({
            quantity: _quantity,
            arrivalDateTime: block.timestamp,
            importerId: _importerId,
            shipName: _shipName,
            shipNo: _shipNo,
            transportInfo: _transportInfo,
            warehouseName: _warehouseName,
            warehouseAddress: _warehouseAddress
        });
        nextAction[_batchNo] = "PROCESSOR";
        return true;
    }

    // Get importer data
    function getImporterData(address _batchNo)
        external
        view
        onlyAuthCaller
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
        Importer memory data = batchImporter[_batchNo];
        return (
            data.quantity,
            data.shipName,
            data.shipNo,
            data.arrivalDateTime,
            data.transportInfo,
            data.warehouseName,
            data.warehouseAddress,
            data.importerId
        );
    }

    // Set processor data
    function setProcessorData(
        address _batchNo,
        uint256 _quantity,
        string memory _temperature,
        uint256 _rostingDuration,
        string memory _internalBatchNo,
        uint256 _packageDateTime,
        string memory _processorName,
        string memory _processorAddress
    ) external onlyAuthCaller returns (bool) {
        batchProcessor[_batchNo] = Processor({
            quantity: _quantity,
            rostingDuration: _rostingDuration,
            packageDateTime: _packageDateTime,
            temperature: _temperature,
            internalBatchNo: _internalBatchNo,
            processorName: _processorName,
            processorAddress: _processorAddress
        });
        nextAction[_batchNo] = "COMPLETED";
        return true;
    }

    // Get processor data
    function getProcessorData(address _batchNo)
        external
        view
        onlyAuthCaller
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
        Processor memory data = batchProcessor[_batchNo];
        return (
            data.quantity,
            data.temperature,
            data.rostingDuration,
            data.internalBatchNo,
            data.packageDateTime,
            data.processorName,
            data.processorAddress
        );
    }
}