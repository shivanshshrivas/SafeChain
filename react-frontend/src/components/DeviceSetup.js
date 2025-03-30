import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const DeviceSetup = () => {
  const { setDeviceId, setNickname } = useAppContext();
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSetup = () => {
    if (!name) return;

    const generatedDeviceId = `Node_${Math.floor(Math.random() * 10000)}`;
    setDeviceId(generatedDeviceId);
    setNickname(name);
    
    navigate("/mesh-selection");
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-[#F5F5F0] text-[#3B3B3B] font-mono">
      <h1 className="text-xl mb-4">Setup Your Device</h1>
      <input
        type="text"
        placeholder="Enter your nickname"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-2 border-2 border-[#DEB887] rounded mb-4 bg-white"
      />
      <button 
        onClick={handleSetup} 
        className="bg-[#E0DACD] hover:bg-[#D6D1C4] px-4 py-2 rounded"
      >
        Confirm
      </button>
    </div>
  );
};

export default DeviceSetup;
