import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const MeshSelection = () => {
  const { setMeshId } = useAppContext();
  const navigate = useNavigate();

  const handleCreateMesh = () => {
    setMeshId(`Mesh_${Math.floor(Math.random() * 1000)}`);
    navigate("/main");
  };

  const handleJoinMesh = () => {
    navigate("/join-mesh");
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-[#F5F5F0] text-[#3B3B3B] font-mono">
      <h1 className="text-xl mb-4">Join or Create a Mesh Network</h1>
      <button 
        onClick={handleCreateMesh} 
        className="mb-4 bg-[#E0DACD] hover:bg-[#D6D1C4] px-4 py-2 rounded"
      >
        Create a Mesh
      </button>
      <button 
        onClick={handleJoinMesh} 
        className="bg-[#E0DACD] hover:bg-[#D6D1C4] px-4 py-2 rounded"
      >
        Join a Mesh
      </button>
    </div>
  );
};

export default MeshSelection;
