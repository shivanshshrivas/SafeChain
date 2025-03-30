//for managing global state in the app, such as deviceId, nickname, and meshId

import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [deviceId, setDeviceId] = useState(null);
  const [nickname, setNickname] = useState("");
  const [meshId, setMeshId] = useState(null);

  return (
    <AppContext.Provider value={{ deviceId, setDeviceId, nickname, setNickname, meshId, setMeshId }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
