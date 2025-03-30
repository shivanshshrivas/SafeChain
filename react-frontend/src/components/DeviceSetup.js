import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const DeviceSetup = () => {
  const { setDeviceId, setNickname } = useAppContext();
  const [name, setName] = useState("");
  const [deviceId, setGeneratedDeviceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSetup = async () => {
    if (!name.trim()) {
      setError("Please enter a nickname first.");
      return;
    }


    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/configure-device", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname: name }), 
      });

      const data = await response.json();
      console.log("🔍 Response:", data);
      if (response.ok) {
        setGeneratedDeviceId(data.deviceID);
        setDeviceId(data.deviceID);
        setNickname(name);
        localStorage.setItem("deviceId", deviceId);
        
      } else {
        setError(data.error || "Failed to generate Device ID. Try again.");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Error connecting to server.");
    }

    setLoading(false);
  };


  const handleJoinMesh = () => {
    navigate("/mesh-selection",
      { state: { nickname: name }}
    ); // Navigate to MeshSelection component
     
  }

  const handleCreateMesh = () => {
    navigate("/main"); // Navigate to MeshSelection component 
  }


  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-[#F5F5F0] text-[#3B3B3B] font-mono">
      <h1 className="text-xl font-figtree mb-4">Setup Your Device</h1>

      <input
        type="text"
        placeholder="Enter your nickname"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-4 py-2 border rounded-full shadow-md font-inter mb-4 bg-white"
        disabled={!!deviceId} // Prevent editing after device is configured
      />

      <button
        onClick={handleSetup}
        disabled={loading || !!deviceId} // Disable after generating
        className="px-4 py-2 mb-4 rounded-full shadow-md font-inter bg-[#f5f5f5] text-[#333] border border-[#d6d6d6] transition-all duration-300 ease"
        onMouseOver={(e) => (e.target.style.backgroundColor = "#eaeaea")} // Hover effect
        onMouseOut={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
        >
        {loading ? "Generating..." : "Confirm"}
        
      </button>

      {
        deviceId && (
          <div className="flex flex-col items-center">
            <h1 className="text-xl mb-4 font-figtree">Join or Create a Mesh Network</h1>
            <button
              onClick={handleCreateMesh} 
              className="mb-4 w-36 bg-[#E0DACD] hover:bg-[#D6D1C4] duration-200 px-4 py-2 rounded-full shadow-md font-inter"
            >
              Create a Mesh
            </button>
            <button 
              onClick={handleJoinMesh}
              className="w-36 bg-[#E0DACD] hover:bg-[#D6D1C4] duration-200 px-4 py-2 rounded-full shadow-md font-inter"
            >
              Join a Mesh
            </button>
          </div>
        )
      }


      {error && <p className="text-red-500 mb-4">{error}</p>}

    </div>
  );
};

export default DeviceSetup;
