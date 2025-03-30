const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql')).toString();

async function createDatabaseAndUser(deviceId) {
  const systemClient = new Client({
    user: 'postgres',
    host: 'localhost',
    password: 'your_root_password', // Change this
    port: 5432,
  });

  await systemClient.connect();

  const shortId = deviceId.slice(0, 8).replace(/[^a-zA-Z0-9]/g, '');
  const username = `device_${shortId}`;
  const password = `pass_${shortId}`;
  const dbName = `safechain_${shortId}`;

  await systemClient.query(`CREATE USER ${username} WITH PASSWORD '${password}';`);
  await systemClient.query(`CREATE DATABASE ${dbName} OWNER ${username};`);
  await systemClient.end();

  const deviceClient = new Client({
    user: username,
    host: 'localhost',
    password,
    database: dbName,
    port: 5432,
  });

  await deviceClient.connect();
  await deviceClient.query(schemaSQL);
  await deviceClient.end();

  return { dbName, username, password };
}

module.exports = createDatabaseAndUser;
