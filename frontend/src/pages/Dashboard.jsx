import React, { useEffect, useState } from 'react';
import { fetchParkingLots, apiClient } from '../services/api';
import ParkingMap from '../components/ParkingMap';
import { Map, List, Settings, Users, BarChart3, IndianRupee, Clock, LogOut } from 'lucide-react';
import { getGlobalActiveBookings, promoteUserToAdmin, checkoutBooking } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('map'); // 'map', 'list', 'analytics', 'operators', 'active-bookings'
  const [emailInput, setEmailInput] = useState("");
  const [promoteStatus, setPromoteStatus] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const loadData = async () => {
    try {
      const [lotsRes, analyticsRes, bookingsRes] = await Promise.all([
        fetchParkingLots(),
        apiClient.get('/analytics/overview'),
        getGlobalActiveBookings()
      ]);
      setParkingLots(lotsRes);
      setAnalytics(analyticsRes.data);
      setActiveBookings(bookingsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePromote = async (e) => {
    e.preventDefault();
    if (!emailInput) return;
    try {
      setPromoteStatus({ type: 'info', message: 'Promoting...' });
      const res = await promoteUserToAdmin(emailInput);
      setPromoteStatus({ type: 'success', message: res.message });
      setEmailInput("");
    } catch (err) {
      setPromoteStatus({ type: 'error', message: err.response?.data?.detail || 'Failed to promote user' });
    }
  };

  const handleRelease = async (bookingId) => {
    try {
      await checkoutBooking(bookingId);
      // Reload data to reflect checkout
      await loadData();
    } catch (err) {
      alert("Failed to release car.");
    }
  };

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
          <a href="#" onClick={() => setView('list')} className={`flex items-center gap-3 px-6 py-4 border-l-4 ${view==='list' ? 'bg-indigo-800 border-indigo-400' : 'border-transparent hover:bg-indigo-800 text-gray-300'}`}>
            <List size={20} />
            <span className="font-medium">Lot Management</span>
          </a>
          <a href="#" onClick={() => setView('active-bookings')} className={`flex items-center gap-3 px-6 py-4 border-l-4 ${view==='active-bookings' ? 'bg-indigo-800 border-indigo-400' : 'border-transparent hover:bg-indigo-800 text-gray-300'}`}>
            <Clock size={20} />
            <span className="font-medium">Active Bookings</span>
          </a>
          <a href="#" onClick={() => setView('operators')} className={`flex items-center gap-3 px-6 py-4 border-l-4 ${view==='operators' ? 'bg-indigo-800 border-indigo-400' : 'border-transparent hover:bg-indigo-800 text-gray-300'}`}>
            <Users size={20} />
            <span className="font-medium">Operators</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-6 py-4 border-l-4 border-transparent hover:bg-indigo-800 text-gray-300">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </a>
        </nav>
        <div className="p-6 border-t border-indigo-800 mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left text-indigo-300 hover:text-white transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
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
             <ParkingMap parkingLots={parkingLots} isAdmin={true} />
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
           ) : view === 'list' ? (
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
          ) : view === 'active-bookings' ? (
             <div className="p-8 overflow-auto h-full">
               <div className="bg-white rounded-xl shadow p-6">
                 <h3 className="text-lg font-bold mb-4 border-b pb-2">Live Active Bookings</h3>
                 <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-500 text-sm">
                        <th className="pb-3 font-medium">Booking ID</th>
                        <th className="pb-3 font-medium">Vehicle ID</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {activeBookings.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-4 text-gray-500">No active bookings right now.</td></tr>
                      ) : activeBookings.map(b => (
                        <tr key={b.id} className="border-t">
                          <td className="py-4 font-medium text-gray-800">#{b.id}</td>
                          <td className="py-4">{b.vehicleId || 'Walk-in'}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${b.status === 'OVERSTAYED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-4 font-semibold text-gray-800">₹{b.totalAmount}</td>
                          <td className="py-4 text-right">
                             <button onClick={() => handleRelease(b.id)} className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded font-medium hover:bg-indigo-700">Release Car</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
             </div>
          ) : view === 'operators' ? (
             <div className="p-8 overflow-auto h-full">
               <div className="bg-white rounded-xl shadow p-6 max-w-md">
                 <h3 className="text-lg font-bold mb-4 border-b pb-2">Promote Operator</h3>
                 <p className="text-sm text-gray-600 mb-4">Enter the email address of a registered citizen to grant them full admin privileges.</p>
                 <form onSubmit={handlePromote} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-300"
                        placeholder="operator@streetpark.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                      />
                    </div>
                    {promoteStatus && (
                      <div className={`p-3 rounded text-sm ${promoteStatus.type === 'success' ? 'bg-green-100 text-green-800' : promoteStatus.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {promoteStatus.message}
                      </div>
                    )}
                    <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition-colors">
                      Promote to Admin
                    </button>
                 </form>
               </div>
             </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
