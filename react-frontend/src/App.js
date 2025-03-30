
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DeviceSetup from "./components/DeviceSetup";
import MeshSelection from "./components/MeshSelection";
import JoinMesh from "./components/JoinMesh";
import MainPage from "./pages/MainPage";
import { AppProvider } from "./context/AppContext";

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="w-screen h-screen flex justify-center items-center bg-[#F5F5F0]">
          <Routes>
            <Route path="/" element={<DeviceSetup />} />
            <Route path="/mesh-selection" element={<MeshSelection />} />
            <Route path="/join-mesh" element={<JoinMesh />} />
            <Route path="/main" element={<MainPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
