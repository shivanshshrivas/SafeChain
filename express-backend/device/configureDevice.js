const { Client } = require("pg");
const crypto = require("crypto");
const os = require("os");
const fs = require("fs");
const path = require("path");

// 🔐 Load credentials
const configPath = path.join(__dirname, "../local_config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const { username, password } = config.postgres;

// 📡 Get local IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let name in interfaces) {
    for (let iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

// 🧠 Generate random DeviceID
function generateDeviceID() {
  return crypto.randomBytes(6).toString("hex");
}

// 🗃 SQL schema
function getSchema(deviceID, nickname, ip) {
  return `
    CREATE TABLE IF NOT EXISTS Local (
      primaryKey SERIAL PRIMARY KEY,
      MeshID TEXT,
      TimeStamp TIMESTAMP DEFAULT NOW(),
      Message TEXT,
      isSynced BOOLEAN DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS Global (
      primaryKey SERIAL PRIMARY KEY,
      MeshID TEXT,
      TimeStamp TIMESTAMP DEFAULT NOW(),
      Message TEXT,
      deviceID TEXT,
      deviceNickname TEXT
    );

    CREATE TABLE IF NOT EXISTS MeshInfo (
      key SERIAL PRIMARY KEY,
      MeshID TEXT,
      joinedAt TIMESTAMP DEFAULT NOW(),
      isActive BOOLEAN DEFAULT false,
      lastSynced TIMESTAMP,
      syncedVersion INTEGER,
      IPFSlink TEXT,
      nameOfMesh TEXT
    );

    CREATE TABLE IF NOT EXISTS DeviceInfo (
      DeviceID TEXT,
      DeviceName TEXT,
      IPAddress TEXT,
      configuredAt TIMESTAMP DEFAULT NOW()
    );

    INSERT INTO DeviceInfo (DeviceID, DeviceName, IPAddress)
    VALUES ('${deviceID}', '${nickname}', '${ip}');
  `;
}

// 🔧 Main Function
async function configureDevice(nickname) {
  const deviceID = generateDeviceID();
  const ip = getLocalIP();

  try {
    // 1. Create DB
    const adminClient = new Client({
      user: username,
      password,
      host: "localhost",
      port: 5432,
      database: "postgres"
    });

    await adminClient.connect();
    await adminClient.query(`CREATE DATABASE "${deviceID}"`);
    await adminClient.end();

    // 2. Create Tables in New DB
    const deviceClient = new Client({
      user: username,
      password,
      host: "localhost",
      port: 5432,
      database: deviceID
    });

    await deviceClient.connect();
    await deviceClient.query(getSchema(deviceID, nickname, ip));
    await deviceClient.end();

    return { success: true, deviceID, nickname };
  } catch (err) {
    console.error("❌ Error configuring device:", err);
    return { success: false, error: err.message };
  }
}

module.exports = configureDevice;
