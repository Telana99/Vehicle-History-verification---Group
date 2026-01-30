const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying VehicleServiceHistory contract...\n");

  const VehicleServiceHistory = await hre.ethers.getContractFactory("VehicleServiceHistory");

  const vehicleService = await VehicleServiceHistory.deploy();
  await vehicleService.deployed();

  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract address:", vehicleService.address);
  console.log("👤 Deployed by:", (await hre.ethers.getSigners())[0].address);
  console.log("\n" + "=".repeat(60) + "\n");

  const deploymentInfo = {
    contractAddress: vehicleService.address,
    deployer: (await hre.ethers.getSigners())[0].address,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment-info.json");
  console.log("\n🎉 Deployment complete!\n");

  return vehicleService.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });