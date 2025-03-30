const pinataSDK = require('@pinata/sdk');
require('dotenv').config();

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

async function uploadJSONToIPFS(data) {
  try {
    const result = await pinata.pinJSONToIPFS(data);
    console.log("✅ Uploaded to IPFS:", result.IpfsHash);
    return result.IpfsHash;
  } catch (err) {
    console.error("❌ IPFS Upload Error:", err);
    throw err;
  }
}

module.exports = uploadJSONToIPFS;
