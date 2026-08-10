import React, { useEffect, useState } from 'react';
import { fetchParkingLots } from '../services/api';
import ParkingMap from '../components/ParkingMap';

const Home = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchParkingLots();
        // Citizen view should ideally only show ACTIVE lots, but we can filter here
        const activeLots = data.filter(lot => lot.status === 'ACTIVE');
        setParkingLots(activeLots);
      } catch (err) {
        setError("Failed to load parking lots. Please ensure backend is running.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();

    // Setup WebSocket
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'LOT_UPDATE') {
          const updatedLot = message.data;
          setParkingLots(prevLots => 
            prevLots.map(lot => 
              lot.id === updatedLot.id ? { ...lot, onlineSlots: updatedLot.onlineSlots, status: updatedLot.status } : lot
            )
          );
        }
      } catch (e) {
        console.error("Error parsing websocket message", e);
      }
    };

    return () => {
      if (ws) ws.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 font-medium p-4 bg-red-50 rounded-lg shadow">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">StreetPark</h1>
        </div>
        <nav className="flex gap-4">
          <button className="text-sm font-medium text-gray-600 hover:text-indigo-600">My Bookings</button>
          <button className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-lg shadow hover:bg-indigo-700">Login</button>
        </nav>
      </header>
      
      {/* Map Container */}
      <main className="flex-1 relative">
        <ParkingMap parkingLots={parkingLots.filter(lot => lot.name.toLowerCase().includes(activeQuery.toLowerCase()) || lot.address.toLowerCase().includes(activeQuery.toLowerCase()))} />
        
        {/* Floating Search/Filter could go here */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white p-3 rounded-xl shadow-lg flex gap-4 items-center">
           <input 
             type="text" 
             placeholder="Search destination..." 
             className="border-none focus:ring-0 outline-none w-64 text-sm" 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && setActiveQuery(searchTerm)}
           />
           <div className="w-px h-6 bg-gray-200"></div>
           <button 
             className="text-indigo-600 text-sm font-medium hover:text-indigo-800"
             onClick={() => setActiveQuery(searchTerm)}
           >
             Find Parking
           </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
