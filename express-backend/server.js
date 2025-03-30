const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const syncToBlockchain = require('../blockchain/syncToBlockchain');
const getLatestCID = require('../blockchain/ipcmlink/getLatestCID');
const fetchFromIPFS = require('../blockchain/ipfs/fetchFromIPFS');

const configureDevice = require('./device/configureDevice');
const configureDb = require('./db/configureDb');
const db = require('./db');

dotenv.config();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ✅ Health Check
app.get('/api/ping', (req, res) => {
  res.send('pong');
});

// ✅ Configure Device
app.post('/api/configure-device', async (req, res) => {
  try {
    const { nickname = 'Anonymous Node' } = req.body;

    // 1. Generate device ID and config
    const device = await configureDevice(nickname);
    console.log(`🆔 Device ID: ${device.device_id}`);

    // 2. Check if PostgreSQL is running
    const pgRunning = await tryPostgresConnection();

    if (!pgRunning) {
      console.log("⚠️ PostgreSQL not running, installing...");
      await runPostgresInstaller(); // optional, comment if manual install
    }

    // 3. Configure DB (user + db + tables)
    const dbInfo = await configureDb(device.device_id);

    res.status(200).json({
      success: true,
      message: "Device configured successfully",
      device_id: device.device_id,
      db: dbInfo
    });
  } catch (err) {
    console.error("❌ Device configuration failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Sync to blockchain (IPFS + IPCM + IOTA)
app.post('/api/sync', async (req, res) => {
  const { meshId, version, messages } = req.body;
  if (!meshId || !messages) return res.status(400).send('Missing data');

  try {
    const result = await syncToBlockchain(messages, meshId, version);
    res.status(200).json({ success: true, cid: result.cid });
  } catch (err) {
    console.error("❌ Sync failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Fetch latest global messages from IPFS
app.get('/api/messages/:meshId', async (req, res) => {
  const meshId = req.params.meshId;

  try {
    const cid = await getLatestCID(meshId);
    if (!cid) return res.status(404).json({ error: 'No data found for this mesh' });

    const ipfsData = await fetchFromIPFS(cid);
    const messages = ipfsData.messages || [];

    for (const msg of messages) {
      await db.insertGlobalMessage(msg, meshId, ipfsData.version || 0);
    }

    res.status(200).json({ messages });
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔍 Check if PostgreSQL is running
async function tryPostgresConnection() {
  const { Client } = require('pg');
  try {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      password: 'your_root_password',
      port: 5432,
    });
    await client.connect();
    await client.end();
    return true;
  } catch (err) {
    return false;
  }
}

// 🛠️ Optional: Batch installer for Postgres
async function runPostgresInstaller() {
  return new Promise((resolve, reject) => {
    exec('cmd /c install_postgres.bat', (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Batch install failed:", err);
        reject(err);
      } else {
        console.log("✅ PostgreSQL installed successfully.");
        resolve();
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Express backend running at http://localhost:${PORT}`);
});
