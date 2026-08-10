import React, { useEffect, useState } from 'react';
import { fetchParkingLots, apiClient } from '../services/api';
import ParkingMap from '../components/ParkingMap';
import { Map, List, Settings, Users, BarChart3, IndianRupee } from 'lucide-react';

const Dashboard = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('map'); // 'map', 'list', 'analytics'

  useEffect(() => {
    const loadData = async () => {
      try {
        const [lotsRes, analyticsRes] = await Promise.all([
          fetchParkingLots(),
          apiClient.get('/analytics/overview')
        ]);
        setParkingLots(lotsRes);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-wider">StreetPark<span className="text-indigo-400">OS</span></h1>
          <p className="text-xs text-indigo-300 mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex-1 mt-6">
          <a href="#" onClick={() => setView('analytics')} className={`flex items-center gap-3 px-6 py-4 border-l-4 ${view==='analytics' ? 'bg-indigo-800 border-indigo-400' : 'border-transparent hover:bg-indigo-800'}`}>
            <BarChart3 size={20} />
            <span className="font-medium">Analytics</span>
          </a>
          <a href="#" onClick={() => setView('map')} className={`flex items-center gap-3 px-6 py-4 border-l-4 ${view==='map' ? 'bg-indigo-800 border-indigo-400' : 'border-transparent hover:bg-indigo-800'}`}>
            <Map size={20} />
            <span className="font-medium">City Map</span>
          </a>
          <a href="#" onClick={() => setView('list')} className={`flex items-center gap-3 px-6 py-4 border-l-4 ${view==='list' ? 'bg-indigo-800 border-indigo-400' : 'border-transparent hover:bg-indigo-800'}`}>
            <List size={20} />
            <span className="font-medium">Lot Management</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-6 py-4 border-l-4 border-transparent hover:bg-indigo-800 text-gray-300">
            <Users size={20} />
            <span className="font-medium">Operators</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-6 py-4 border-l-4 border-transparent hover:bg-indigo-800 text-gray-300">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">{view} View</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">System Normal</span>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">A</div>
          </div>
        </header>

        {/* Dynamic View */}
        <div className="flex-1 relative bg-gray-50">
          {loading ? (
             <div className="h-full w-full flex items-center justify-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
             </div>
          ) : view === 'map' ? (
             <ParkingMap parkingLots={parkingLots} />
          ) : view === 'analytics' ? (
             <div className="p-8 h-full overflow-auto">
               <h3 className="text-2xl font-bold text-gray-800 mb-6">City Overview</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 {/* Card 1 */}
                 <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
                   <div className="p-4 bg-green-100 text-green-600 rounded-full">
                     <IndianRupee size={32} />
                   </div>
                   <div>
                     <p className="text-sm text-gray-500 font-medium uppercase">Total Revenue</p>
                     <p className="text-3xl font-bold text-gray-800">₹{analytics?.totalRevenue}</p>
                   </div>
                 </div>
                 {/* Card 2 */}
                 <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
                   <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                     <List size={32} />
                   </div>
                   <div>
                     <p className="text-sm text-gray-500 font-medium uppercase">Active Bookings</p>
                     <p className="text-3xl font-bold text-gray-800">{analytics?.totalActiveBookings}</p>
                   </div>
                 </div>
                 {/* Card 3 */}
                 <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
                   <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
                     <BarChart3 size={32} />
                   </div>
                   <div>
                     <p className="text-sm text-gray-500 font-medium uppercase">City Occupancy</p>
                     <p className="text-3xl font-bold text-gray-800">{analytics?.cityOccupancyRate}%</p>
                   </div>
                 </div>
               </div>
             </div>
          ) : (
             <div className="p-8 overflow-auto h-full">
               <div className="bg-white rounded-xl shadow p-6">
                 <h3 className="text-lg font-bold mb-4 border-b pb-2">All Parking Lots</h3>
                 <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-500 text-sm">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Online Slots</th>
                        <th className="pb-3 font-medium">Offline Slots</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {parkingLots.map(lot => (
                        <tr key={lot.id} className="border-t">
                          <td className="py-4 font-medium text-gray-800">{lot.name}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${lot.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {lot.status}
                            </span>
                          </td>
                          <td className="py-4 text-gray-600">{lot.onlineSlots}</td>
                          <td className="py-4 text-gray-600">{lot.offlineSlots}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
