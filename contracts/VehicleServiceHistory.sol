// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VehicleServiceHistory {
    
    // Structure to store service record details
    struct ServiceRecord {
        uint256 timestamp;
        string vehicleId;
        string serviceType;
        uint256 mileage;
        string description;
        address serviceCenter;
    }
    
    // Mapping: vehicleId => array of service records
    mapping(string => ServiceRecord[]) private vehicleHistory;
    
    // Mapping: address => authorized status
    mapping(address => bool) public authorizedCenters;
    
    // Mapping: address => service center name
    mapping(address => string) public serviceCenterNames;
    
    // Contract owner (admin)
    address public owner;
    
    // Events for logging
    event ServiceCenterAdded(address indexed center, string name);
    event ServiceCenterRemoved(address indexed center);
    event ServiceRecordAdded(
        string indexed vehicleId, 
        address indexed serviceCenter,
        string serviceType,
        uint256 timestamp
    );
    
    // Constructor - sets the contract deployer as owner
    constructor() {
        owner = msg.sender;
    }
    
    // Modifier: only owner can execute
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    // Modifier: only authorized service centers can execute
    modifier onlyAuthorized() {
        require(authorizedCenters[msg.sender], "Not an authorized service center");
        _;
    }
    
    /**
     * @dev Add a new authorized service center
     * @param _center Address of the service center
     * @param _name Name of the service center
     */
    function addServiceCenter(address _center, string memory _name) public onlyOwner {
        require(_center != address(0), "Invalid address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(!authorizedCenters[_center], "Service center already authorized");
        
        authorizedCenters[_center] = true;
        serviceCenterNames[_center] = _name;
        
        emit ServiceCenterAdded(_center, _name);
    }
    
    /**
     * @dev Remove an authorized service center
     * @param _center Address of the service center to remove
     */
    function removeServiceCenter(address _center) public onlyOwner {
        require(authorizedCenters[_center], "Service center not authorized");
        
        authorizedCenters[_center] = false;
        delete serviceCenterNames[_center];
        
        emit ServiceCenterRemoved(_center);
    }
    
    /**
     * @dev Add a service record for a vehicle
     * @param _vehicleId Unique identifier for the vehicle (e.g., VIN)
     * @param _serviceType Type of service performed
     * @param _mileage Current mileage of the vehicle
     * @param _description Detailed description of the service
     */
    function addServiceRecord(
        string memory _vehicleId,
        string memory _serviceType,
        uint256 _mileage,
        string memory _description
    ) public onlyAuthorized {
        require(bytes(_vehicleId).length > 0, "Vehicle ID cannot be empty");
        require(bytes(_serviceType).length > 0, "Service type cannot be empty");
        require(_mileage > 0, "Mileage must be greater than 0");
        
        // Create new service record
        ServiceRecord memory newRecord = ServiceRecord({
            timestamp: block.timestamp,
            vehicleId: _vehicleId,
            serviceType: _serviceType,
            mileage: _mileage,
            description: _description,
            serviceCenter: msg.sender
        });
        
        // Add to vehicle's history
        vehicleHistory[_vehicleId].push(newRecord);
        
        emit ServiceRecordAdded(_vehicleId, msg.sender, _serviceType, block.timestamp);
    }
    
    /**
     * @dev Get complete service history for a vehicle
     * @param _vehicleId Vehicle identifier
     * @return Array of all service records for the vehicle
     */
    function getServiceHistory(string memory _vehicleId) 
        public 
        view 
        returns (ServiceRecord[] memory) 
    {
        return vehicleHistory[_vehicleId];
    }
    
    /**
     * @dev Get number of service records for a vehicle
     * @param _vehicleId Vehicle identifier
     * @return Count of service records
     */
    function getRecordCount(string memory _vehicleId) 
        public 
        view 
        returns (uint256) 
    {
        return vehicleHistory[_vehicleId].length;
    }
    
    /**
     * @dev Get a specific service record by index
     * @param _vehicleId Vehicle identifier
     * @param _index Index of the record in the array
     * @return Service record at the specified index
     */
    function getServiceRecordByIndex(string memory _vehicleId, uint256 _index)
        public
        view
        returns (ServiceRecord memory)
    {
        require(_index < vehicleHistory[_vehicleId].length, "Index out of bounds");
        return vehicleHistory[_vehicleId][_index];
    }
    
    /**
     * @dev Check if an address is an authorized service center
     * @param _center Address to check
     * @return True if authorized, false otherwise
     */
    function isAuthorizedCenter(address _center) public view returns (bool) {
        return authorizedCenters[_center];
    }
    
    /**
     * @dev Get service center name
     * @param _center Address of the service center
     * @return Name of the service center
     */
    function getServiceCenterName(address _center) public view returns (string memory) {
        return serviceCenterNames[_center];
    }
}