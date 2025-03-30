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
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-[#F5F5F0] text-[#3B3B3B]">
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
  );
};

export default MeshSelection;
