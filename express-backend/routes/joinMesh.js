const { Client } = require("pg");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../local_config.json");
const { username, password } = JSON.parse(fs.readFileSync(configPath, "utf-8")).postgres;

async function joinMesh(meshID, meshName, ipfsLink, deviceID) {
  const client = new Client({
    user: username,
    password,
    host: "localhost",
    port: 5432,
    database: deviceID
  });

  await client.connect();

  // 1. Deactivate previous mesh
  await client.query(`UPDATE MeshInfo SET isActive = false`);

  // 2. Insert new mesh metadata
  await client.query(`
    INSERT INTO MeshInfo (
      MeshID, joinedAt, isActive, lastSynced, syncedVersion, IPFSlink, nameOfMesh
    ) VALUES ($1, NOW(), true, NULL, 0, $2, $3)
  `, [meshID, ipfsLink, meshName]);

  // 3. Fetch mesh_created.json from IPFS
  const rawCid = ipfsLink.replace("ipfs://", "");
  const ipfsURL = `https://gateway.pinata.cloud/ipfs/${rawCid}/mesh_created.json`;

  const response = await axios.get(ipfsURL);
  const meshInfo = response.data;

  // 4. (Optional) Store historical messages from IPFS (if any)
  if (meshInfo.messages && Array.isArray(meshInfo.messages)) {
    for (const msg of meshInfo.messages) {
      await client.query(`
        INSERT INTO Global (MeshID, TimeStamp, Message, deviceID, deviceNickname)
        VALUES ($1, NOW(), $2, $3, $4)
      `, [meshID, msg.message, msg.deviceID, msg.deviceNickname]);
    }
  }

  await client.end();
  return { success: true, joined: meshID, from: ipfsURL };
}

module.exports = joinMesh;
