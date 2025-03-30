const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const http = require("http");
const { Client } = require("pg");

const { startWebSocketServer } = require("./ws/wsServer");
const configureDevice = require("./device/configureDevice");
const validatePostgres = require("./device/validatePostgres");
const { updateCID, getCID } = require("./blockchain/ipcm");
const createMesh = require("./blockchain/createMesh");
const joinMesh = require("./routes/joinMesh");
const leaveMesh = require("./routes/leaveMesh");
const { broadcastMessageToMesh } = require("./ws/wsServer");
const syncToIPFS = require("./blockchain/syncToBlockchain");


dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/api/ping", (req, res) => {
  res.send("pong");
});

const httpServer = http.createServer(app);
startWebSocketServer(httpServer);

app.get("/api/check-postgres", (req, res) => {
  const cmd = process.platform === "win32" ? "where psql" : "which psql";

  exec(cmd, (err, stdout) => {
    res.json({ installed: !err && stdout.trim().length > 0 });
  });
});


app.post("/api/install-postgres", (req, res) => {
  const username = "safechain_user";
  const password = crypto.randomBytes(8).toString("hex");

  const configPath = path.join(__dirname, "local_config.json");
  fs.writeFileSync(
    configPath,
    JSON.stringify({ postgres: { username, password } }, null, 2)
  );

  const command = process.platform === "win32"
    ? `installer\\install_postgres.bat ${username} ${password}`
    : `sh installer/install_postgres.sh ${username} ${password}`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ success: false, error: stderr });
    }

    return res.json({
      success: true,
      message: "Postgres installed and user created.",
      username,
      password,
    });
  });
});

app.post("/api/validate-postgres", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Missing username or password" });

  const result = await validatePostgres(username, password);
  res.json(result);
});


app.post("/api/configure-device", async (req, res) => {
  const { nickname } = req.body;
  if (!nickname) return res.status(400).json({ error: "Missing nickname" });

  const result = await configureDevice(nickname);
  res.json(result);
});

app.post("/api/create-mesh", async (req, res) => {
  const { meshName, deviceID } = req.body;

  if (!meshName || !deviceID)
    return res.status(400).json({ error: "Missing meshName or deviceID" });

  try {
    const result = await createMesh(meshName, deviceID);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("❌ Mesh creation failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/join-mesh", async (req, res) => {
  const { meshID, meshName, ipfsLink, deviceID } = req.body;

  if (!meshID || !meshName || !ipfsLink || !deviceID) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    const result = await joinMesh(meshID, meshName, ipfsLink, deviceID);
    res.json(result);
  } catch (err) {
    console.error("❌ Join mesh failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/leave-mesh", async (req, res) => {
  const { deviceID } = req.body;

  if (!deviceID) return res.status(400).json({ error: "Missing deviceID" });

  try {
    const result = await leaveMesh(deviceID);
    res.json(result);
  } catch (err) {
    console.error("❌ Leave mesh failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/send-message", async (req, res) => {
  const { meshID, message, deviceID, deviceNickname } = req.body;

  if (!meshID || !message || !deviceID || !deviceNickname) {
    return res.status(400).json({ error: "Missing message data" });
  }

  const timestamp = new Date().toISOString();

  // Broadcast via WebSocket
  broadcastMessageToMesh(meshID, {
    message,
    deviceID,
    deviceNickname,
    timestamp
  });

  // Save to local database
  const configPath = path.join(__dirname, "local_config.json");
  const { username, password } = JSON.parse(fs.readFileSync(configPath, "utf-8")).postgres;

  const client = new Client({
    user: username,
    password,
    host: "localhost",
    port: 5432,
    database: deviceID
  });

  try {
    await client.connect();
    await client.query(`
      INSERT INTO Local (MeshID, TimeStamp, Message, isSynced)
      VALUES ($1, $2, $3, false)
    `, [meshID, timestamp, message]);
    await client.end();

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error saving message:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/sync", async (req, res) => {
  const { meshID, deviceID } = req.body;

  if (!meshID || !deviceID) {
    return res.status(400).json({ error: "Missing meshID or deviceID" });
  }

  // Load Postgres credentials
  const configPath = path.join(__dirname, "local_config.json");
  const { username, password } = JSON.parse(fs.readFileSync(configPath, "utf-8")).postgres;

  const client = new Client({
    user: username,
    password,
    host: "localhost",
    port: 5432,
    database: deviceID
  });

  try {
    await client.connect();

    // 1. Get all unsynced messages
    const { rows: unsyncedMessages } = await client.query(`
      SELECT * FROM Local
      WHERE isSynced = false AND MeshID = $1
    `, [meshID]);

    if (unsyncedMessages.length === 0) {
      await client.end();
      return res.status(200).json({ success: true, message: "No unsynced messages." });
    }

    // 2. Format messages for IPFS
    const formatted = unsyncedMessages.map((msg) => ({
      message: msg.message,
      timestamp: msg.timestamp,
      deviceID,
    }));

    // 3. Upload to IPFS & blockchain
    const { cid, version } = await syncToIPFS(formatted, meshID);

    // 4. Mark messages as synced
    await client.query(`
      UPDATE Local
      SET isSynced = true
      WHERE isSynced = false AND MeshID = $1
    `, [meshID]);

    await client.end();

    res.json({ success: true, cid, version, syncedCount: formatted.length });

  } catch (err) {
    console.error("❌ Sync failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/get-latest-version", async (req, res) => {
  const { meshID, deviceID } = req.body;

  if (!meshID || !deviceID) {
    return res.status(400).json({ error: "Missing meshID or deviceID" });
  }

  const configPath = path.join(__dirname, "local_config.json");
  const { username, password } = JSON.parse(fs.readFileSync(configPath, "utf-8")).postgres;

  const client = new Client({
    user: username,
    password,
    host: "localhost",
    port: 5432,
    database: deviceID,
  });

  try {
    await client.connect();

    // 1. Get latest CID from IPCM smart contract
    const cid = await getCID();
    console.log("📥 Fetching from IPFS:", cid);

    // 2. Fetch data from IPFS gateway
    const ipfsURL = `https://gateway.pinata.cloud/ipfs/${cid}`;
    const response = await axios.get(ipfsURL);
    const messages = response.data;

    if (!Array.isArray(messages)) throw new Error("Invalid message format");

    // 3. Insert each message into Global table
    for (const msg of messages) {
      await client.query(
        `INSERT INTO Global (MeshID, Timestamp, Message, DeviceID, DeviceNickname)
         VALUES ($1, $2, $3, $4, $5)`,
        [meshID, msg.timestamp, msg.message, msg.deviceID, msg.deviceNickname || "Unknown"]
      );
    }

    await client.end();

    res.json({ success: true, count: messages.length, cid });

  } catch (err) {
    console.error("❌ Error syncing from blockchain:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/messages/:meshID/:deviceID", async (req, res) => {
  const { meshID, deviceID } = req.params;

  const configPath = path.join(__dirname, "local_config.json");
  const { username, password } = JSON.parse(fs.readFileSync(configPath, "utf-8")).postgres;

  const client = new Client({
    user: username,
    password,
    host: "localhost",
    port: 5432,
    database: deviceID
  });

  try {
    await client.connect();

    // 1. Fetch from Global table
    const globalRes = await client.query(
      `SELECT Message, Timestamp, DeviceID, DeviceNickname
       FROM Global
       WHERE MeshID = $1`, [meshID]
    );

    // 2. Fetch from Local table
    const localRes = await client.query(
      `SELECT Message, Timestamp
       FROM Local
       WHERE MeshID = $1`, [meshID]
    );

    await client.end();

    // 3. Merge and tag source
    const allMessages = [
      ...globalRes.rows.map(m => ({
        ...m,
        source: "Global"
      })),
      ...localRes.rows.map(m => ({
        ...m,
        deviceID,
        deviceNickname: "You",
        source: "Local"
      }))
    ];

    // 4. Sort by timestamp
    allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({ success: true, messages: allMessages });

  } catch (err) {
    console.error("❌ Failed to retrieve messages:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});



app.post("/api/updateCID", async (req, res) => {
  const { cid } = req.body;
  if (!cid) return res.status(400).send("Missing CID");

  try {
    const txHash = await updateCID(cid);
    res.json({ success: true, txHash });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.get("/api/getCID", async (req, res) => {
  try {
    const cid = await getCID();
    res.json({ success: true, cid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


httpServer.listen(PORT, () => {
  console.log(`✅ Express + WebSocket backend running on http://0.sfa.0.0:${PORT}`);
});
