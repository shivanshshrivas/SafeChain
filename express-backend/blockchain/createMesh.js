const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Client } = require("pg");
const pinataSDK = require("@pinata/sdk");
const { updateCID } = require("./ipcm");
const { broadcastMeshAnnouncement } = require("../ws/wsServer"); // import at top

require("dotenv").config();

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

const configPath = path.join(__dirname, "../local_config.json");
const { username, password } = JSON.parse(fs.readFileSync(configPath, "utf-8")).postgres;

function generateMeshID() {
  return crypto.randomBytes(6).toString("hex");
}

async function createMesh(meshName, deviceID) {
  const meshID = generateMeshID();
  const createdAt = new Date().toISOString();

  const groupMetadata = {
    name: `mesh-${meshID}`,
    metadata: {
      meshName,
      createdBy: deviceID,
      createdAt
    }
  };

  // 1. Create the file group on Pinata
  const groupResponse = await pinata.createPinataFileGroup(groupMetadata);
  const groupId = groupResponse.data.id;

  // 2. Create mesh_created.json
  const meshData = {
    type: "mesh_created",
    meshName,
    meshID,
    createdAt,
    createdBy: deviceID
  };

  const tempFolder = path.join(__dirname, `../.temp/mesh-${meshID}`);
  fs.mkdirSync(tempFolder, { recursive: true });

  const meshFilePath = path.join(tempFolder, "mesh_created.json");
  fs.writeFileSync(meshFilePath, JSON.stringify(meshData, null, 2));

  // 3. Upload to group
  const pinResponse = await pinata.pinFileToIPFS(fs.createReadStream(meshFilePath), {
    pinataMetadata: {
      name: `mesh_created_${meshID}`,
      keyvalues: {
        meshID,
        groupId,
        version: "0"
      }
    }
  });

  const fileCID = pinResponse.IpfsHash;
  const ipfsLink = `ipfs://${fileCID}`;

  // 4. Push CID to IPCM smart contract
  await updateCID(ipfsLink);

  // 5. Save to local Postgres MeshInfo
  const client = new Client({
    user: username,
    password,
    host: "localhost",
    port: 5432,
    database: deviceID
  });

  await client.connect();

  await client.query(`UPDATE MeshInfo SET isActive = false`);

  await client.query(`
    INSERT INTO MeshInfo (
      MeshID, joinedAt, isActive, lastSynced, syncedVersion, IPFSlink, nameOfMesh
    ) VALUES ($1, NOW(), true, NULL, 0, $2, $3)
  `, [meshID, ipfsLink, meshName]);

  broadcastMeshAnnouncement({
    meshID,
    name: meshName,
    ipfsLink,
    createdBy: deviceID
  });

  await client.end();

  // Optional: clean up temp file
  fs.rmSync(tempFolder, { recursive: true, force: true });

  return { meshID, ipfsLink, createdAt, groupId };
}

module.exports = createMesh;
