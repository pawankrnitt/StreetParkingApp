import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserBookings } from '../services/api';
import { ArrowLeft } from 'lucide-react';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getUserBookings();
        setBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex items-center">
        <button 
          onClick={() => navigate('/')} 
          className="text-gray-400 hover:text-indigo-600 transition-colors mr-4"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">My Bookings</h1>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">🚗</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-700">No Bookings Found</h2>
            <p className="text-gray-500 mt-2">You haven't made any parking bookings yet.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
            >
              Find Parking
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                      booking.status === 'CONFIRMED' || booking.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                      ID: #{booking.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Slot {booking.parkingSlotId}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium text-gray-800">From:</span> {formatDate(booking.startTime)}</p>
                    <p><span className="font-medium text-gray-800">To:</span> {formatDate(booking.endTime)}</p>
                  </div>
                </div>
                <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0">
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Total Paid</p>
                  <p className="text-2xl font-bold text-indigo-600">₹{booking.totalAmount}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;
