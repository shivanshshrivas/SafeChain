const { ethers } = require("ethers");
require("dotenv").config();

const ABI = [
  "function updateMapping(string value) public",
  "function getMapping() public view returns (string)"
];

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(`0x${process.env.PRIVATE_KEY}`, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, signer);

// ⬆️ Write to blockchain
async function updateCID(newCid) {
  const tx = await contract.updateMapping(newCid);
  await tx.wait();
  return tx.hash;
}

// ⬇️ Read from blockchain
async function getCID() {
  return await contract.getMapping();
}

module.exports = { updateCID, getCID };
