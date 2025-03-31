import MapComponent from "../components/MapComponent";
import TextWindow from "../components/TextWindow";
import LiveChat from "../components/LiveChat";
import { useLocation } from "react-router-dom";
const MainPage = () => {

  const location = useLocation();
  const { meshID, meshName, ipfsLink, deviceID, nickname } = location.state || {};


  return (
<div className="w-screen h-screen p-4 grid grid-cols-2 gap-2">
  <div className="flex-1">
    <MapComponent />
  </div>
  <div className="flex-1">
    <LiveChat meshID={meshID} meshName={meshName} ipfsLink={ipfsLink} deviceID={deviceID} nickname={nickname} />
  </div>
</div>
  );
};

export default MainPage;
