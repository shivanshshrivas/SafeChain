const uploadToIPFS = require('./ipfs/uploadToIPFS');
const logToIOTA = require('./iota/logToIOTA');
const updateCID = require('./ipcmlink/updateCID');

async function syncToBlockchain(messages, meshId, version) {
  const data = {
    mesh_id: meshId,
    version,
    timestamp: Date.now(),
    messages
  };

  const cid = await uploadToIPFS(data);
  await updateCID(meshId, cid);
  const iotaTx = await logToIOTA(meshId, cid, version);

  return { cid, iotaTx };
}

module.exports = syncToBlockchain;
