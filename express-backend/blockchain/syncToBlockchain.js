const fs = require("fs");
const path = require("path");
const { updateCID } = require("./ipcm");
const { PinataSDK } = require("pinata");
const { Blob } = require("buffer"); // ✅ Add this!

require("dotenv").config();

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
});

async function syncToBlockchain(messages, meshID) {
  const version = Date.now();
  const tempPath = path.join(__dirname, `./temp-messages-${version}.json`);

  // 1. Save messages to disk
  fs.writeFileSync(tempPath, JSON.stringify(messages, null, 2));

  // 2. Read file and convert to Blob
  const fileBuffer = fs.readFileSync(tempPath);
  const blob = new Blob([fileBuffer], { type: "application/json" }); // ✅ wrap in Blob

  // 3. Upload file using new Pinata SDK
  const upload = await pinata.upload.public.file(blob, {
    filename: `messages-${version}.json`
  });

  const cid = upload.cid;
  const fileId = upload.id;

  // 4. Create/find Pinata Group
  const groupName = `mesh-${meshID}`;
  const groups = await pinata.groups.public.list();
  const existingGroup = groups.groups.find(g => g.name === groupName);

  let groupId;
  if (existingGroup) {
    groupId = existingGroup.id;
  } else {
    const group = await pinata.groups.public.create({ name: groupName });
    groupId = group.id;
  }

  // 5. Add file to group
  await pinata.groups.public.addFiles({ groupId, files: [fileId] });

  // 6. Push CID to Polygon
  await updateCID(cid);

  // 7. Cleanup
  fs.unlinkSync(tempPath);

  return { cid, version };
}

module.exports = syncToBlockchain;
