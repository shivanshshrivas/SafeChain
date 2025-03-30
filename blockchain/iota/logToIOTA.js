const { sendBlock, initLogger, setClientOptions } = require('@iota/sdk');
require('dotenv').config();

async function logToIOTA(meshId, cid, version) {
  try {
    initLogger();
    await setClientOptions({ nodes: [process.env.IOTA_NODE_URL] });

    const block = await sendBlock({
      payload: {
        type: 2,
        tag: Buffer.from("MeshSync"),
        data: Buffer.from(JSON.stringify({ meshId, cid, version }), 'utf-8')
      }
    });

    console.log("✅ Logged to IOTA:", block.blockId);
    return block.blockId;
  } catch (err) {
    console.error("❌ IOTA Error:", err);
    throw err;
  }
}

module.exports = logToIOTA;
