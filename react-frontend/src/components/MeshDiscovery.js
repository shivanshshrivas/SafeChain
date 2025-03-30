import React, { useEffect, useState } from "react";
import axios from "axios";

const MeshDiscovery = () => {
  const [availableMeshes, setAvailableMeshes] = useState([]);
  const [deviceID, setDeviceID] = useState("");
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(null);
  const [meshName, setMeshName] = useState("");
  const [ipfsLink, setIpfsLink] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [meshID, setMeshID] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://10.104.175.40:5000");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "mesh_announce") {
          setAvailableMeshes((prev) => {
            // avoid duplicates
            const alreadyExists = prev.find((m) => m.meshID === data.meshID);
            return alreadyExists ? prev : [...prev, data];
          });

          // Set all the constants for use in the next function
          setMeshName(data.name || "");
          setIpfsLink(data.ipfsLink || "");
          setCreatedBy(data.createdBy || "");
          setMeshID(data.meshID || "");
        }
      } catch (err) {
        console.warn("Invalid WS message:", event.data);
      }
    };

    return () => ws.close();
  }, []);

  const joinMesh = async (mesh) => {
    if (!deviceID) {
      alert("Enter your Device ID first");
      return;
    }

    setJoining(true);
    try {
      const res = await axios.post("http://localhost:5000/api/join-mesh", {
        meshID: mesh.meshID,
        meshName: mesh.name,
        ipfsLink: mesh.ipfsLink,
        deviceID,
      });
      setJoined(res.data);
    } catch (err) {
      setJoined({ error: err.response?.data?.error || "Unknown error" });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      <h2>🌐 Mesh Discovery</h2>

      <input
        type="text"
        placeholder="Your Device ID"
        value={deviceID}
        onChange={(e) => setDeviceID(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      {availableMeshes.length === 0 ? (
        <p>No meshes discovered yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {availableMeshes.map((mesh) => (
            <li
              key={mesh.meshID}
              style={{
                border: "1px solid #ccc",
                marginBottom: "0.5rem",
                padding: "0.5rem",
                borderRadius: "6px",
              }}
            >
              <strong>{mesh.name}</strong> <br />
              Mesh ID: <code>{mesh.meshID}</code> <br />
              IPFS: <code>{mesh.ipfsLink}</code> <br />
              Created by: <code>{mesh.createdBy}</code>
              <br />
              <button
                onClick={() => joinMesh(mesh)}
                style={{ marginTop: "0.5rem" }}
                disabled={joining}
              >
                {joining ? "Joining..." : "Join Mesh"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {joined && (
        <pre style={{ backgroundColor: "#f0f0f0", padding: "1rem", marginTop: "1rem" }}>
          {JSON.stringify(joined, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default MeshDiscovery;
