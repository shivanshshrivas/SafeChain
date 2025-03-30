const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Client } = require("pg");
const { broadcastMeshAnnouncement } = require("../ws/wsServer");
const { updateCID } = require("./ipcm");
const { PinataSDK } = require("pinata");

require("dotenv").config();

// ✅ Authenticate with JWT
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
});

const configPath = path.join(__dirname, "../local_config.json");
const { username, password } = JSON.parse(fs.readFileSync(configPath, "utf-8")).postgres;

function generateMeshID() {
  return crypto.randomBytes(6).toString("hex");
}

async function createMesh(meshName, deviceID) {
  const meshID = generateMeshID();
  const createdAt = new Date().toISOString();

  // 1. Create the group
  const group = await pinata.groups.public.create({ name: `mesh-${meshID}` });
  const groupId = group.id;

  // 2. Create a temporary file for the mesh metadata
  const meshData = {
    type: "mesh_created",
    meshName,
    meshID,
    createdAt,
    createdBy: deviceID,
  };

  const tempFolder = path.join(__dirname, `../.temp/mesh-${meshID}`);
  fs.mkdirSync(tempFolder, { recursive: true });
  const meshFilePath = path.join(tempFolder, "mesh_created.json");
  fs.writeFileSync(meshFilePath, JSON.stringify(meshData, null, 2));

  // 3. Upload to IPFS + associate with group
  const file = fs.readFileSync(meshFilePath);
  const upload = await pinata.upload.public.file(
    new File([file], "mesh_created.json", { type: "application/json" })
  );

  const fileId = upload.id;
  await pinata.groups.public.addFiles({ groupId, files: [fileId] });

  const ipfsLink = `ipfs://${upload.cid}`;

  // 4. Push CID to blockchain via IPCM
  await updateCID(ipfsLink);

  // 5. Save to Postgres
  const client = new Client({
    user: username,
    password,
    host: "localhost",
    port: 5432,
    database: deviceID,
  });

  await client.connect();
  await client.query(`UPDATE MeshInfo SET isActive = false`);
  await client.query(
    `INSERT INTO MeshInfo (MeshID, joinedAt, isActive, lastSynced, syncedVersion, IPFSlink, nameOfMesh)
     VALUES ($1, NOW(), true, NULL, 0, $2, $3)`,
    [meshID, ipfsLink, meshName]
  );
  await client.end();

  // 6. Announce over WebSocket
  broadcastMeshAnnouncement({
    meshID,
    name: meshName,
    ipfsLink,
    createdBy: deviceID,
  });

  // Optional: cleanup
  fs.rmSync(tempFolder, { recursive: true, force: true });

  return { meshID, ipfsLink, createdAt, groupId };
}

module.exports = createMesh;
