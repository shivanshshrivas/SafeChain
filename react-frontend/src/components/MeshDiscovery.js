import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "../context/AppContext";

const MeshDiscovery = () => {
  const [availableMeshes, setAvailableMeshes] = useState([]);
  // const [deviceID, setDeviceID] = useState("");
  const { deviceId, setDeviceId } = useAppContext(); // Grab deviceId from context
  const [deviceID, setDeviceID] = useState(() => {
    // Retrieve deviceId from localStorage or use the context value
    return localStorage.getItem("deviceId") || deviceId || "";
  });  
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(null);
  const [meshName, setMeshName] = useState("");
  const [ipfsLink, setIpfsLink] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [meshID, setMeshID] = useState("");

  useEffect(() => {

    const ws = new WebSocket("ws://10.104.175.40:5002");

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
    <div className='p-4 flex flex-col justify-center text-[#333]'>
      <h2 className="text-3xl font-figtree ">Mesh Discovery</h2>

      <p className="font-figtree">Your device ID: {deviceID}</p>

      {availableMeshes.length === 0 ? (
        <p>No meshes discovered yet.</p>
      ) : (
        <ul className="available-meshes bg-[#F5F5F0] font-inter mt-4" style={{ listStyle: "none"}}>
          <h1 className="text-xl">Available Meshes</h1>
          {availableMeshes.map((mesh) => (
            <li
              key={mesh.meshID}
              className="flex flex-col gap-2 justify-start items-start rounded-xl shadow-lg p-4 bg-white border border-[#e0e0e0]"
            >
              <table className="table-auto w-full text-left">
                <tbody>
                  <tr>
                    <td className="font-bold">Mesh name:</td>
                    <td>{mesh.name}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Mesh ID:</td>
                    <td>{mesh.meshID}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">IPFS link:</td>
                    <td>{mesh.ipfsLink}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Created by (Device ID):</td>
                    <td>{mesh.createdBy}</td>
                  </tr>
                </tbody>
              </table>
              <button
                onClick={() => joinMesh(mesh)}
                className="px-4 py-2 mb-4 rounded-full shadow-md font-inter bg-[#f5f5f5] text-[#333] border border-[#d6d6d6] transition-all duration-300 ease"
                onMouseOver={(e) => (e.target.style.backgroundColor = "#eaeaea")} // Hover effect
                onMouseOut={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
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
