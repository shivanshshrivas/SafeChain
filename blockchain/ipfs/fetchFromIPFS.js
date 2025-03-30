const axios = require('axios');

async function fetchFromIPFS(cid) {
  const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    console.error("❌ IPFS Fetch Error:", err);
    throw err;
  }
}

module.exports = fetchFromIPFS;
