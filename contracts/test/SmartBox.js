const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SmartBox", function () {
  let SmartBox;
  let smartBox;
  let owner;
  let customer;

  beforeEach(async function () {
    // Deploy the contract
    const SmartBoxFactory = await ethers.getContractFactory("SmartBox");
    [owner, customer] = await ethers.getSigners();
    smartBox = await SmartBoxFactory.deploy();

    // Wait for the contract to be mined
    await smartBox.waitForDeployment(); // This ensures the contract is deployed
  });

  describe("Owner Setup", function () {
    it("Should set the right owner", async function () {
      expect(await smartBox.owner()).to.equal(owner.address);
    });
  });

  describe("Package Management", function () {
    it("Should create a package", async function () {
      await expect(smartBox.createPackage("Package metadata", customer.address))
        .to.emit(smartBox, "PackageCreated")
        .withArgs(0, customer.address);

      const pkg = await smartBox.packages(0);
      expect(pkg.metadata).to.equal("Package metadata");
      expect(pkg.customer).to.equal(customer.address);
      expect(pkg.delivered).to.be.false;
      expect(pkg.fundsReleased).to.be.false;
    });

    it("Should mark a package as delivered", async function () {
      // Create a package first
      await smartBox.createPackage("Package metadata", customer.address);

      // Mark package as delivered
      await expect(smartBox.markAsDelivered(0))
        .to.emit(smartBox, "PackageDelivered")
        .withArgs(0, owner.address);

      // Check package status
      const pkg = await smartBox.packages(0);
      expect(pkg.delivered).to.be.true;
    });

    it("Should release funds after package delivery", async function () {
      await smartBox.createPackage("Package metadata", customer.address);
      await smartBox.markAsDelivered(0);

      // Release funds by the customer
      await expect(smartBox.connect(customer).releaseFunds(0))
        .to.emit(smartBox, "FundsReleased")
        .withArgs(0);

      // Check if funds are released
      const pkg = await smartBox.packages(0);
      expect(pkg.fundsReleased).to.be.true;
    });

    it("Should fail to release funds if not delivered", async function () {
      await smartBox.createPackage("Package metadata", customer.address);

      // Try releasing funds before delivery
      await expect(
        smartBox.connect(customer).releaseFunds(0)
      ).to.be.revertedWith("Package not delivered");
    });

    it("Should fail to release funds if already released", async function () {
      await smartBox.createPackage("Package metadata", customer.address);
      await smartBox.markAsDelivered(0);
      await smartBox.connect(customer).releaseFunds(0);

      // Try releasing funds again, should fail
      await expect(
        smartBox.connect(customer).releaseFunds(0)
      ).to.be.revertedWith("Funds already released");
    });
  });
});