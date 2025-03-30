import MapComponent from "../components/MapComponent";
import TextWindow from "../components/TextWindow";

const MainPage = () => {
  return (
<div className="w-screen h-screen p-4 grid grid-cols-2 gap-2">
  <div className="flex-1">
    {/* Left Column Content */}
    <MapComponent />
  </div>
  <div className="flex-1">
    {/* Right Column Content */}
    <TextWindow nickname="User" deviceId="Node_001" />
  </div>
</div>
  );
};

export default MainPage;
