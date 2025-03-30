const fs = require('fs');
const path = require('path');
const nacl = require('tweetnacl');
const { encodeBase64 } = require('tweetnacl-util');

const CONFIG_PATH = path.join(__dirname, '../../.device_config.json');

async function configureDevice(nickname = "Anonymous Node") {
  if (fs.existsSync(CONFIG_PATH)) {
    console.log("✅ Device already configured.");
    return JSON.parse(fs.readFileSync(CONFIG_PATH));
  }

  const keypair = nacl.box.keyPair();
  const deviceId = encodeBase64(keypair.publicKey);
  const privateKey = encodeBase64(keypair.secretKey);

  const config = {
    device_id: deviceId,
    private_key: privateKey,
    nickname,
    location: { lat: 0, lng: 0 }
  };

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log("✅ Device identity generated and saved.");
  return config;
}

module.exports = configureDevice;
