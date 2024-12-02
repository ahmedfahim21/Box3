// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SmartBox {
    address public owner;
    uint256 public nextPackageId;
    uint256 public nextOrderId;
    address[] public userAddresses;  // To store all user addresses

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
        string name;
        string description;
        address deliveryAgent; // Add delivery agent field
    }

    struct Order {
        uint256 id;
        string metadata;
        string cid;
        address customer;
        bool fulfilled;
        uint256 funds;
        string name;
        string description;
    }

    mapping(address => User) public users;
    mapping(uint256 => Package) public packages;
    mapping(uint256 => Order) public orders;

    event UserRegistered(address indexed user, UserRole role);
    event PackageCreated(uint256 indexed packageId, address indexed customer);
    event PackageDelivered(uint256 indexed packageId, address indexed deliveryAgent);
    event FundsReleased(uint256 indexed packageId);
    event FundsAdded(uint256 indexed packageId, uint256 amount);
    event PackageCreatedOnSui(uint256 indexed packageId, string metadata, address customer, uint256 funds, string cid, string name, string description);
    event PackageDeliveredOnSui(uint256 indexed packageId);
    event OrderCreated(uint256 indexed orderId, address indexed customer);
    event OrderFulfilled(uint256 indexed orderId, uint256 indexed packageId);

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
        userAddresses.push(msg.sender); // Store the address when a user is registered
        emit UserRegistered(msg.sender, role);
    }

    function createOrder(string memory metadata, string memory cid, uint256 funds, string memory name, string memory description) external payable {
        // require(msg.value == funds, "Incorrect funds sent");

        orders[nextOrderId] = Order({
            id: nextOrderId,
            metadata: metadata,
            cid: cid,
            customer: msg.sender,
            fulfilled: false,
            funds: funds,
            name: name,
            description: description
        });

        emit OrderCreated(nextOrderId, msg.sender);
        nextOrderId++;
    }

    function createPackage(uint256 orderId) external onlyDeliveryAgent {
        Order storage order = orders[orderId];
        require(!order.fulfilled, "Order already fulfilled");

        packages[nextPackageId] = Package({
            id: nextPackageId,
            cid: order.cid,
            metadata: order.metadata,
            customer: order.customer,
            delivered: false,
            fundsReleased: false,
            funds: order.funds,
            name: order.name,
            description: order.description,
            deliveryAgent: msg.sender
        });

        order.fulfilled = true;
        emit PackageCreated(nextPackageId, order.customer);
        emit PackageCreatedOnSui(nextPackageId, order.metadata, order.customer, order.funds, order.cid, order.name, order.description);
        emit OrderFulfilled(orderId, nextPackageId);
        nextPackageId++;
    }

    function assignDeliveryAgent(uint256 packageId, address deliveryAgent) external onlyOwner {
        Package storage pkg = packages[packageId];
        require(pkg.deliveryAgent == address(0), "Delivery agent already assigned");
        pkg.deliveryAgent = deliveryAgent;
    }

    function releaseFunds(uint256 packageId) external onlyCustomer(packageId) {
        Package storage pkg = packages[packageId];
        require(pkg.delivered, "Package not delivered");
        require(!pkg.fundsReleased, "Funds already released");

        // Send the funds to the delivery agent
        payable(pkg.deliveryAgent).transfer(pkg.funds);

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

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    function getAllUsers() external view returns (address[] memory) {
        return userAddresses; // Return the list of all user addresses
    }

    function getUser(address userAddress) external view returns (User memory) {
        return users[userAddress]; // Return the details of a particular user
    }

    function trackAllPackages() external view onlyDeliveryAgent returns (Package[] memory) {
        Package[] memory allPackages = new Package[](nextPackageId);
        for (uint256 i = 0; i < nextPackageId; i++) {
            allPackages[i] = packages[i];
        }
        return allPackages;
    }

    function markAsDelivered(uint256 packageId) external onlyDeliveryAgent {
        Package storage pkg = packages[packageId];
        pkg.delivered = true;

        emit PackageDelivered(packageId, msg.sender);
        emit PackageDeliveredOnSui(packageId); // Notify Sui
    }

    function getAllOrders() external view returns (Order[] memory) {
        Order[] memory allOrders = new Order[](nextOrderId);
        for (uint256 i = 0; i < nextOrderId; i++) {
            allOrders[i] = orders[i];
        }
        return allOrders;
    }
}