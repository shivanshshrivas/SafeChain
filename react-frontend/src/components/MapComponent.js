import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet';
import { useEffect, useState } from 'react';
import CuteLoader from './CuteLoader';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for missing marker icons
const customIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41], // size of the icon
  iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
  popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41], // size of the shadow
});

export default function MapComponent() {
  const [isMaximized, setIsMaximized] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(null); // Default position

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition([latitude, longitude]);
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <div className={`flex relative justify-center items-center shadow-xl border rounded-xl h-full transition-all duration-300 ease-in-out overflow-hidden ${isMaximized ? 'max-w-[50vw]' : 'max-w-[13vw]'}`}>
      { currentPosition ?  <MapContainer 
        center={currentPosition} 
        zoom={15} 
        className={`h-screen overflow-hidden max-h-[80vh] w-full z-0 `}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={currentPosition} icon={customIcon}>
          <Popup>
            <div className='flex bg-transparent flex-col justify-center grid-rows-2 font-figtree text-gray-800 p-0'>
              <div>Your Location</div>
              <div>Lat: {currentPosition[0]}, Lng: {currentPosition[1]}</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer> 
      :
      <CuteLoader /> 
      }
      <button onClick={() => {setIsMaximized(!isMaximized); console.log(isMaximized)}} className='absolute text-center flex justify-center items-center top-2 right-2 z-10 bg-white shadow-lg rounded-[50%] h-9 w-9 opacity-100'>
        {
          isMaximized ? <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6 12L18 12" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
            : <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 12H20M12 4V20" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
        }
      </button>
    </div>
  );
}