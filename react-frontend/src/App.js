
import logo from './logo.svg';
// import './App.css';
import CreateMeshTester from './components/CreateMeshTester';
import MeshDiscovery from './components/MeshDiscovery';
import LiveChat from './components/LiveChat';
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
        <div className="w-screen flex justify-center items-center bg-[#F5F5F0]">
          <Routes>
            <Route path="/" element={<DeviceSetup />} />
            <Route path="/mesh-selection" element={<MeshDiscovery />} />
            <Route path="/join-mesh" element={<JoinMesh />} />
            <Route path="/main" element={<MainPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
