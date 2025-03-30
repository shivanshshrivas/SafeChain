const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../local_config.json");
const { username, password } = JSON.parse(fs.readFileSync(configPath, "utf-8")).postgres;

async function leaveMesh(deviceID) {
  const client = new Client({
    user: username,
    password,
    host: "localhost",
    port: 5432,
    database: deviceID
  });

  await client.connect();

  // 1. Find current active mesh
  const { rows } = await client.query(`SELECT MeshID FROM MeshInfo WHERE isActive = true LIMIT 1`);
  if (rows.length === 0) {
    await client.end();
    return { success: false, error: "No active mesh found." };
  }

  const activeMeshID = rows[0].meshid;

  // 2. Set active = false, log lastSynced
  await client.query(`
    UPDATE MeshInfo
    SET isActive = false, lastSynced = NOW()
    WHERE MeshID = $1
  `, [activeMeshID]);

  await client.end();

  return { success: true, leftMesh: activeMeshID };
}

module.exports = leaveMesh;
