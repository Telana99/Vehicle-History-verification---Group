const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VehicleServiceHistory", function () {
  let vehicleService;
  let owner;
  let serviceCenter1;
  let serviceCenter2;
  let buyer;

  beforeEach(async function () {
    [owner, serviceCenter1, serviceCenter2, buyer] = await ethers.getSigners();

    const VehicleService = await ethers.getContractFactory("VehicleServiceHistory");
    vehicleService = await VehicleService.deploy();
    await vehicleService.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await vehicleService.owner()).to.equal(owner.address);
    });

    it("Should start with no authorized centers", async function () {
      expect(await vehicleService.isAuthorizedCenter(serviceCenter1.address)).to.be.false;
    });
  });

  describe("Service Center Management", function () {
    it("Should allow owner to add service center", async function () {
      await vehicleService.addServiceCenter(serviceCenter1.address, "Quick Fix Auto");
      
      expect(await vehicleService.isAuthorizedCenter(serviceCenter1.address)).to.be.true;
      expect(await vehicleService.getServiceCenterName(serviceCenter1.address)).to.equal("Quick Fix Auto");
    });

    it("Should emit ServiceCenterAdded event", async function () {
      await expect(vehicleService.addServiceCenter(serviceCenter1.address, "Quick Fix Auto"))
        .to.emit(vehicleService, "ServiceCenterAdded")
        .withArgs(serviceCenter1.address, "Quick Fix Auto");
    });

    it("Should prevent non-owner from adding service center", async function () {
      await expect(
        vehicleService.connect(serviceCenter1).addServiceCenter(serviceCenter2.address, "Premium Auto")
      ).to.be.revertedWith("Only owner can perform this action");
    });

    it("Should prevent adding service center with empty name", async function () {
      await expect(
        vehicleService.addServiceCenter(serviceCenter1.address, "")
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should prevent adding duplicate service center", async function () {
      await vehicleService.addServiceCenter(serviceCenter1.address, "Quick Fix Auto");
      
      await expect(
        vehicleService.addServiceCenter(serviceCenter1.address, "Quick Fix Auto")
      ).to.be.revertedWith("Service center already authorized");
    });

    it("Should allow owner to remove service center", async function () {
      await vehicleService.addServiceCenter(serviceCenter1.address, "Quick Fix Auto");
      await vehicleService.removeServiceCenter(serviceCenter1.address);
      
      expect(await vehicleService.isAuthorizedCenter(serviceCenter1.address)).to.be.false;
    });
  });

  describe("Service Records", function () {
    beforeEach(async function () {
      await vehicleService.addServiceCenter(serviceCenter1.address, "Quick Fix Auto");
    });

    it("Should allow authorized center to add service record", async function () {
      await vehicleService.connect(serviceCenter1).addServiceRecord(
        "ABC123",
        "Oil Change",
        50000,
        "Changed oil and filter"
      );

      const recordCount = await vehicleService.getRecordCount("ABC123");
      expect(recordCount).to.equal(1);
    });

    it("Should prevent unauthorized center from adding records", async function () {
      await expect(
        vehicleService.connect(serviceCenter2).addServiceRecord(
          "ABC123",
          "Oil Change",
          50000,
          "Changed oil and filter"
        )
      ).to.be.revertedWith("Not an authorized service center");
    });

    it("Should prevent adding record with empty vehicle ID", async function () {
      await expect(
        vehicleService.connect(serviceCenter1).addServiceRecord(
          "",
          "Oil Change",
          50000,
          "Changed oil and filter"
        )
      ).to.be.revertedWith("Vehicle ID cannot be empty");
    });

    it("Should prevent adding record with zero mileage", async function () {
      await expect(
        vehicleService.connect(serviceCenter1).addServiceRecord(
          "ABC123",
          "Oil Change",
          0,
          "Changed oil and filter"
        )
      ).to.be.revertedWith("Mileage must be greater than 0");
    });

    it("Should store correct service record data", async function () {
      await vehicleService.connect(serviceCenter1).addServiceRecord(
        "ABC123",
        "Oil Change",
        50000,
        "Changed oil and filter"
      );

      const record = await vehicleService.getServiceRecordByIndex("ABC123", 0);
      
      expect(record.vehicleId).to.equal("ABC123");
      expect(record.serviceType).to.equal("Oil Change");
      expect(record.mileage).to.equal(50000);
      expect(record.description).to.equal("Changed oil and filter");
      expect(record.serviceCenter).to.equal(serviceCenter1.address);
      expect(record.timestamp).to.be.greaterThan(0);
    });

    it("Should allow multiple service records for same vehicle", async function () {
      await vehicleService.addServiceCenter(serviceCenter2.address, "Premium Auto");

      await vehicleService.connect(serviceCenter1).addServiceRecord(
        "ABC123",
        "Oil Change",
        50000,
        "Regular maintenance"
      );

      await vehicleService.connect(serviceCenter2).addServiceRecord(
        "ABC123",
        "Brake Service",
        55000,
        "Replaced brake pads"
      );

      const recordCount = await vehicleService.getRecordCount("ABC123");
      expect(recordCount).to.equal(2);

      const history = await vehicleService.getServiceHistory("ABC123");
      expect(history[0].serviceType).to.equal("Oil Change");
      expect(history[1].serviceType).to.equal("Brake Service");
    });
  });

  describe("Service History Retrieval", function () {
    beforeEach(async function () {
      await vehicleService.addServiceCenter(serviceCenter1.address, "Quick Fix Auto");
      await vehicleService.addServiceCenter(serviceCenter2.address, "Premium Auto");

      await vehicleService.connect(serviceCenter1).addServiceRecord(
        "ABC123",
        "Oil Change",
        50000,
        "Regular maintenance"
      );

      await vehicleService.connect(serviceCenter2).addServiceRecord(
        "ABC123",
        "Brake Service",
        55000,
        "Replaced brake pads"
      );

      await vehicleService.connect(serviceCenter1).addServiceRecord(
        "ABC123",
        "Tire Rotation",
        60000,
        "Rotated all four tires"
      );
    });

    it("Should allow anyone to view service history", async function () {
      const history = await vehicleService.connect(buyer).getServiceHistory("ABC123");
      expect(history.length).to.equal(3);
    });

    it("Should return complete service history", async function () {
      const history = await vehicleService.getServiceHistory("ABC123");
      
      expect(history[0].serviceType).to.equal("Oil Change");
      expect(history[0].mileage).to.equal(50000);
      
      expect(history[1].serviceType).to.equal("Brake Service");
      expect(history[1].mileage).to.equal(55000);
      
      expect(history[2].serviceType).to.equal("Tire Rotation");
      expect(history[2].mileage).to.equal(60000);
    });

    it("Should return empty array for vehicle with no history", async function () {
      const history = await vehicleService.getServiceHistory("XYZ789");
      expect(history.length).to.equal(0);
    });

    it("Should return correct record count", async function () {
      expect(await vehicleService.getRecordCount("ABC123")).to.equal(3);
      expect(await vehicleService.getRecordCount("XYZ789")).to.equal(0);
    });

    it("Should retrieve specific record by index", async function () {
      const record = await vehicleService.getServiceRecordByIndex("ABC123", 1);
      expect(record.serviceType).to.equal("Brake Service");
      expect(record.mileage).to.equal(55000);
    });

    it("Should revert when accessing invalid index", async function () {
      await expect(
        vehicleService.getServiceRecordByIndex("ABC123", 10)
      ).to.be.revertedWith("Index out of bounds");
    });
  });

  describe("Immutability and Security", function () {
    it("Should ensure records cannot be modified after creation", async function () {
      await vehicleService.addServiceCenter(serviceCenter1.address, "Quick Fix Auto");
      
      await vehicleService.connect(serviceCenter1).addServiceRecord(
        "ABC123",
        "Oil Change",
        50000,
        "Original description"
      );

      const recordBefore = await vehicleService.getServiceRecordByIndex("ABC123", 0);
      
      await vehicleService.connect(serviceCenter1).addServiceRecord(
        "ABC123",
        "Brake Service",
        55000,
        "Different service"
      );

      const recordAfter = await vehicleService.getServiceRecordByIndex("ABC123", 0);
      
      expect(recordAfter.serviceType).to.equal(recordBefore.serviceType);
      expect(recordAfter.description).to.equal(recordBefore.description);
      expect(recordAfter.mileage).to.equal(recordBefore.mileage);
    });

    it("Should track service center for each record", async function () {
      await vehicleService.addServiceCenter(serviceCenter1.address, "Quick Fix Auto");
      await vehicleService.addServiceCenter(serviceCenter2.address, "Premium Auto");

      await vehicleService.connect(serviceCenter1).addServiceRecord(
        "ABC123",
        "Oil Change",
        50000,
        "Service 1"
      );

      await vehicleService.connect(serviceCenter2).addServiceRecord(
        "ABC123",
        "Brake Service",
        55000,
        "Service 2"
      );

      const history = await vehicleService.getServiceHistory("ABC123");
      
      expect(history[0].serviceCenter).to.equal(serviceCenter1.address);
      expect(history[1].serviceCenter).to.equal(serviceCenter2.address);
    });
  });
});