import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchParkingLots } from '../services/api';
import ParkingMap from '../components/ParkingMap';

const Home = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  
  // Time selection for dynamic availability
  const defaultStart = new Date();
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);
  const formatDatetime = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  
  const [startTime, setStartTime] = useState(formatDatetime(defaultStart));
  const [endTime, setEndTime] = useState(formatDatetime(defaultEnd));
  
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload(); // Quick way to reset state and re-render
  };

  useEffect(() => {
    const loadData = async () => {
      if (!startTime || !endTime) return;
      try {
        const isoStart = new Date(startTime).toISOString();
        const isoEnd = new Date(endTime).toISOString();
        const data = await fetchParkingLots(isoStart, isoEnd);
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
  }, [startTime, endTime]);

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
        <nav className="flex gap-4 items-center">
          <button 
            onClick={() => {
              if (token) navigate('/my-bookings');
              else navigate('/login');
            }}
            className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            My Bookings
          </button>
          
          {token ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Hi, {user?.name || 'User'}</span>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-white bg-red-600 px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
            >
              Login
            </button>
          )}
        </nav>
      </header>
      
      {/* Map Container */}
      <main className="flex-1 relative">
        <ParkingMap parkingLots={parkingLots.filter(lot => lot.name.toLowerCase().includes(activeQuery.toLowerCase()) || lot.address.toLowerCase().includes(activeQuery.toLowerCase()))} />
        
        {/* Floating Search/Filter could go here */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white p-3 rounded-xl shadow-lg flex gap-4 items-center flex-wrap justify-center w-full max-w-4xl">
           <input 
             type="text" 
             placeholder="Search destination..." 
             className="border-none focus:ring-0 outline-none w-48 text-sm" 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && setActiveQuery(searchTerm)}
           />
           <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
           
           <div className="flex items-center gap-2">
             <label className="text-xs font-semibold text-gray-500 uppercase">From:</label>
             <input 
               type="datetime-local" 
               className="border-none text-sm focus:ring-0 outline-none bg-transparent"
               value={startTime}
               onChange={(e) => setStartTime(e.target.value)}
             />
           </div>
           <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
           
           <div className="flex items-center gap-2">
             <label className="text-xs font-semibold text-gray-500 uppercase">To:</label>
             <input 
               type="datetime-local" 
               className="border-none text-sm focus:ring-0 outline-none bg-transparent"
               value={endTime}
               onChange={(e) => setEndTime(e.target.value)}
             />
           </div>

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
