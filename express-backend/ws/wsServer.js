const WebSocket = require("ws");

let connectedClients = [];

// 🌐 Starts WebSocket server on top of Express HTTP server
function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("🔌 New WebSocket client connected");
    connectedClients.push(ws);

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data);
        console.log("📩 Incoming message from client:", message);
        // You can handle ping/ack/typing indicators etc. here later
      } catch (err) {
        console.error("❌ Error parsing WebSocket message:", err.message);
      }
    });

    ws.on("close", () => {
      console.log("🔌 WebSocket client disconnected");
      connectedClients = connectedClients.filter((client) => client !== ws);
    });
  });

  return wss;
}

// 📡 Broadcasts a mesh creation event to all connected clients
function broadcastMeshAnnouncement(meshData) {
  const message = JSON.stringify({
    type: "mesh_announce",
    ...meshData,
  });

  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  console.log("📡 Broadcasted mesh:", meshData.meshID);
}

// 💬 Broadcasts a message to everyone in the mesh
function broadcastMessageToMesh(meshID, messageData) {
  const payload = JSON.stringify({
    type: "mesh_message",
    meshID,
    ...messageData,
  });

  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });

  console.log(`📨 Broadcasted message to mesh ${meshID}`);
}

module.exports = {
  startWebSocketServer,
  broadcastMeshAnnouncement,
  broadcastMessageToMesh,
};
