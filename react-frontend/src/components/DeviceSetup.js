import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const DeviceSetup = () => {
  const { setDeviceId, setNickname } = useAppContext();
  const [name, setName] = useState("");
  const [deviceId, setGeneratedDeviceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGenerateDeviceId = async () => {
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
      } else {
        setError(data.error || "Failed to generate Device ID. Try again.");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Error connecting to server.");
    }

    setLoading(false);
  };

  const handleSetup = () => {
    if (!deviceId || !name.trim()) return;
    navigate("/mesh-selection");
  };

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
        onClick={handleGenerateDeviceId}
        disabled={loading || !!deviceId} // Disable after generating
        className="px-4 py-2 mb-4 rounded-full shadow-md font-inter bg-[#E0DACD] hover:bg-[#D6D1C4]"
      >
        {loading ? "Generating..." : deviceId ? `Device ID: ${deviceId}` : "Generate Device ID"}
      </button>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        onClick={handleSetup}
        disabled={!deviceId || !name.trim()}
        className="px-4 py-2 rounded-full shadow-md font-inter bg-[#E0DACD] hover:bg-[#D6D1C4]"
      >
        Confirm
      </button>
    </div>
  );
};

export default DeviceSetup;
