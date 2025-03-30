import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const JoinMesh = () => {
  const { setMeshId } = useAppContext();
  const navigate = useNavigate();
  
  // Placeholder for available networks
  const meshes = ["Mesh_123", "Mesh_456", "Mesh_789"];

  const handleJoin = (mesh) => {
    setMeshId(mesh);
    navigate("/main");
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-[#F5F5F0] text-[#3B3B3B] font-mono">
      <h1 className="text-xl mb-4">Available Mesh Networks</h1>
      {meshes.map((mesh, index) => (
        <button 
          key={index} 
          onClick={() => handleJoin(mesh)} 
          className="mb-2 bg-[#E0DACD] hover:bg-[#D6D1C4] px-4 py-2 rounded w-1/2"
        >
          {mesh}
        </button>
      ))}
    </div>
  );
};

export default JoinMesh;
