import React, { useState } from "react";

function CreateMeshTester() {
  const [meshName, setMeshName] = useState("");
  const [deviceID, setDeviceID] = useState("");
  const [response, setResponse] = useState(null);

  const handleCreateMesh = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/create-mesh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meshName, deviceID }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.message });
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>🧪 Create Mesh Tester</h2>
      <div>
        <label>Mesh Name: </label>
        <input
          type="text"
          value={meshName}
          onChange={(e) => setMeshName(e.target.value)}
          placeholder="e.g., floodInLawrence"
        />
      </div>
      <div>
        <label>Device ID: </label>
        <input
          type="text"
          value={deviceID}
          onChange={(e) => setDeviceID(e.target.value)}
          placeholder="e.g., aade636c6e70"
        />
      </div>
      <button onClick={handleCreateMesh} style={{ marginTop: "1rem" }}>
        Create Mesh
      </button>

      {response && (
        <pre style={{ marginTop: "2rem", background: "#eee", padding: "1rem" }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default CreateMeshTester;
