// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SmartBox {
    address public owner;
    uint256 public nextPackageId;

    enum UserRole { None, Customer, DeliveryAgent }

    struct User {
        string metadata;
        string cid;
        string rfidData;
        UserRole role;
    }

    struct Package {
        uint256 id;
        string cid;
        string metadata;
        address customer;
        bool delivered;
        bool fundsReleased;
        uint256 funds;
        string name; // New field
        string description; // New field
    }

    mapping(address => User) public users;
    mapping(uint256 => Package) public packages;

    event UserRegistered(address indexed user, UserRole role);
    event PackageCreated(uint256 indexed packageId, address indexed customer);
    event PackageDelivered(uint256 indexed packageId, address indexed deliveryAgent);
    event FundsReleased(uint256 indexed packageId);
    event FundsAdded(uint256 indexed packageId, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyCustomer(uint256 packageId) {
        require(packages[packageId].customer == msg.sender, "Not the customer");
        _;
    }

    modifier onlyDeliveryAgent() {
        require(users[msg.sender].role == UserRole.DeliveryAgent, "Not a delivery agent");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerUser(string memory metadata, string memory cid, string memory rfidData, UserRole role) external {
        require(users[msg.sender].role == UserRole.None, "User already registered");
        users[msg.sender] = User({
            metadata: metadata,
            cid: cid,
            rfidData: rfidData,
            role: role
        });
        emit UserRegistered(msg.sender, role);
    }

    // function createPackage(string memory metadata, string memory cid, address customer, uint256 funds) external onlyDeliveryAgent {
    //     require(users[customer].role == UserRole.Customer, "Not a customer");
    //     require(bytes(users[customer].rfidData).length != 0, "Customer not registered with RFID");

    //     packages[nextPackageId] = Package({
    //         id: nextPackageId,
    //         cid: cid,
    //         metadata: metadata,
    //         customer: customer,
    //         delivered: false,
    //         fundsReleased: false,
    //         funds: funds
    //     });
    //     emit PackageCreated(nextPackageId, customer);
    //     nextPackageId++;
    // }

    // function markAsDelivered(uint256 packageId, string memory cid) external onlyDeliveryAgent {
    //     Package storage pkg = packages[packageId];
    //     require(!pkg.delivered, "Package already delivered");

    //     pkg.delivered = true;
    //     pkg.cid = cid;
    //     emit PackageDelivered(packageId, msg.sender);
    // }

    function releaseFunds(uint256 packageId) external onlyCustomer(packageId) {
        Package storage pkg = packages[packageId];
        require(pkg.delivered, "Package not delivered");
        require(!pkg.fundsReleased, "Funds already released");

        pkg.fundsReleased = true;
        emit FundsReleased(packageId);
    }

    function addFunds(uint256 packageId, uint256 amount) external onlyDeliveryAgent {
        Package storage pkg = packages[packageId];
        require(!pkg.fundsReleased, "Funds already released");

        pkg.funds += amount;
        emit FundsAdded(packageId, amount);
    }

    function getPackage(uint256 packageId) external view returns (Package memory) {
        return packages[packageId];
    }

    function getMyPackageDetails() external view returns (Package[] memory) {
        require(users[msg.sender].role == UserRole.Customer, "Not a customer");
        uint256 count = 0;
        for (uint256 i = 0; i < nextPackageId; i++) {
            if (packages[i].customer == msg.sender) {
                count++;
            }
        }

        Package[] memory myPackages = new Package[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextPackageId; i++) {
            if (packages[i].customer == msg.sender) {
                myPackages[index] = packages[i];
                index++;
            }
        }
        return myPackages;
    }

    function trackAllPackages() external view onlyDeliveryAgent returns (Package[] memory) {
        Package[] memory allPackages = new Package[](nextPackageId);
        for (uint256 i = 0; i < nextPackageId; i++) {
            allPackages[i] = packages[i];
        }
        return allPackages;
    }

    event PackageCreatedOnSui(uint256 indexed packageId, string metadata, string cid, string name, string description);
    event PackageDeliveredOnSui(uint256 indexed packageId);

    function createPackage(string memory metadata, string memory cid, address customer, uint256 funds, string memory name, string memory description) external onlyDeliveryAgent {
        packages[nextPackageId] = Package({
            id: nextPackageId,
            cid: cid,
            metadata: metadata,
            customer: customer,
            delivered: false,
            fundsReleased: false,
            funds: funds,
            name: name, // New field
            description: description // New field
        });

        emit PackageCreated(nextPackageId, customer);
        emit PackageCreatedOnSui(nextPackageId, metadata, cid, name, description); // Notify Sui
        nextPackageId++;
    }

    function markAsDelivered(uint256 packageId, string memory cid) external onlyDeliveryAgent {
        packages[packageId].delivered = true;

        emit PackageDelivered(packageId, msg.sender);
        emit PackageDeliveredOnSui(packageId); // Notify Sui
    }
}