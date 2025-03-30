import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import configureDevice from "../components/ConfigureDevice"; // Import the backend function

const DeviceSetup = () => {
  const { setDeviceId, setNickname } = useAppContext();
  const [name, setName] = useState("");
  const [deviceId, setGeneratedDeviceId] = useState(""); // Store the generated deviceId
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSetup = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await configureDevice(name);
      if (response.success) {
        setDeviceId(response.deviceID);
        setNickname(name);
        setGeneratedDeviceId(response.deviceID);
        navigate("/mesh-selection");
      } else {
        setError("Failed to configure device. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please check your connection.");
    }

    setLoading(false);
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
      />

      <input
        type="text"
        value={deviceId || "Generating..."}
        readOnly
        className="px-4 py-2 border rounded-full shadow-md font-inter mb-4 bg-gray-200 text-gray-600"
      />

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        onClick={handleSetup}
        disabled={loading}
        className={`px-4 py-2 rounded-full shadow-md font-inter ${loading ? "bg-gray-400" : "bg-[#E0DACD] hover:bg-[#D6D1C4]"}`}
      >
        {loading ? "Configuring..." : "Confirm"}
      </button>
    </div>
  );
};

export default DeviceSetup;
