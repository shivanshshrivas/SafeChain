const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function validatePostgres(username, password) {
  const client = new Client({
    user: username,
    password,
    host: "localhost",
    port: 5432,
    database: "postgres"
  });

  try {
    await client.connect();
    await client.end();

    // ✅ Save to local_config.json
    const configPath = path.join(__dirname, "../local_config.json");
    fs.writeFileSync(
      configPath,
      JSON.stringify({ postgres: { username, password } }, null, 2)
    );

    return { success: true, message: "Postgres credentials validated" };
  } catch (err) {
    console.error("❌ Postgres validation failed:", err.message);
    return { success: false, error: "Connection failed. Check credentials." };
  }
}

module.exports = validatePostgres;
