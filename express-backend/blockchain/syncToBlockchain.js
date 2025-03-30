const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { updateCID } = require("./ipcm");

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_GROUP_BASE = process.env.PINATA_GROUP_BASE || "SafeChainMesh_";

async function syncToBlockchain(messages, meshID) {
  const version = Date.now(); // or increment if you’re tracking it
  const tempPath = path.join(__dirname, `./temp-messages-${version}.json`);

  // 1. Save messages to a temporary file
  fs.writeFileSync(tempPath, JSON.stringify(messages, null, 2));

  // 2. Upload to IPFS via Pinata
  const data = new FormData();
  data.append("file", fs.createReadStream(tempPath));

  const uploadRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
    headers: {
      ...data.getHeaders(),
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    },
  });

  const cid = uploadRes.data.IpfsHash;
  console.log("📦 Uploaded to IPFS:", cid);

  // 3. Add to Pinata File Group (based on MeshID)
  const groupRes = await axios.post(
    "https://api.pinata.cloud/file_group/add/pin",
    {
      groupName: `${PINATA_GROUP_BASE}${meshID}`,
      pin: cid,
    },
    {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    }
  );

  console.log("📚 Added to group:", groupRes.data);

  // 4. Update the latest CID on Polygon using IPCM smart contract
  await updateCID(cid);

  // 5. Clean up temp file
  fs.unlinkSync(tempPath);

  return { cid, version };
}

module.exports = syncToBlockchain;
