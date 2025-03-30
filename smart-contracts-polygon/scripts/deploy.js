const hre = require("hardhat");

async function main() {
  // Get deployer wallet address
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Deploying contract from address:", deployer.address);

  // Get contract factory and deploy
  const IPCM = await hre.ethers.getContractFactory("IPCM");
  const contract = await IPCM.deploy(deployer.address); // set the owner

  // Wait for deployment to complete
  await contract.waitForDeployment();

  // Log deployed address
  console.log("✅ IPCM contract deployed to:", contract.target);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
