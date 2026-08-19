import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLotDetails, getUserVehicles, createVehicle, createBooking, getLotAvailability } from '../services/api';
import { ArrowLeft, Car, Clock, MapPin, CheckCircle } from 'lucide-react';

const BookingPage = () => {
  const { lotId } = useParams();
  const navigate = useNavigate();

  const [lot, setLot] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  
  // Default to +1 hour from now for MVP simplicity
  const defaultStart = new Date();
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);
  
  // Format to local datetime-local string (YYYY-MM-DDThh:mm)
  const formatDatetime = (d) => {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [startTime, setStartTime] = useState(formatDatetime(defaultStart));
  const [endTime, setEndTime] = useState(formatDatetime(defaultEnd));
  const [bookedSlotIds, setBookedSlotIds] = useState([]);

  // Fetch initial lot details and vehicles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lotData, vehiclesData] = await Promise.all([
          getLotDetails(lotId),
          getUserVehicles()
        ]);
        setLot(lotData);
        setVehicles(vehiclesData);
        if (vehiclesData.length > 0) {
          setSelectedVehicleId(vehiclesData[0].id.toString());
        }
      } catch (err) {
        setError('Failed to load booking details. Are you logged in?');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lotId]);

  // Fetch dynamic slot availability whenever time changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!startTime || !endTime || !lot) return;
      try {
        const isoStart = new Date(startTime).toISOString();
        const isoEnd = new Date(endTime).toISOString();
        const response = await getLotAvailability(lot.id, isoStart, isoEnd);
        setBookedSlotIds(response.bookedSlotIds || []);
      } catch (err) {
        console.error("Failed to fetch slot availability", err);
      }
    };
    fetchAvailability();
  }, [lot, startTime, endTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let finalVehicleId = selectedVehicleId;
      
      // If user selected "new" and entered a plate, create it first
      if (selectedVehicleId === 'new' && newVehiclePlate.trim()) {
        const newVehicle = await createVehicle(newVehiclePlate.trim(), 'Car'); // Defaulting to Car
        finalVehicleId = newVehicle.id;
        setVehicles([...vehicles, newVehicle]);
      }

      if (!finalVehicleId || finalVehicleId === 'new') {
        throw new Error("Please select or enter a valid vehicle.");
      }

      if (!selectedSlotId) {
        throw new Error("Please select a parking slot.");
      }

      // Ensure UTC format for backend
      const isoStart = new Date(startTime).toISOString();
      const isoEnd = new Date(endTime).toISOString();

      const booking = await createBooking(parseInt(selectedSlotId), parseInt(finalVehicleId), isoStart, isoEnd);
      
      // Navigate to checkout passing the booking data
      navigate('/checkout', { 
        state: { 
          bookingId: booking.id, 
          amount: booking.totalAmount 
        } 
      });

    } catch (err) {
      setError(err.message || err.response?.data?.detail || "An error occurred while booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !lot) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-red-500 font-medium bg-red-50 p-4 rounded-lg mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 underline">Return Home</button>
      </div>
    );
  }

  const availableSlots = lot.slots.filter(s => s.status === 'AVAILABLE');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-6 text-white relative">
          <button onClick={() => navigate('/')} className="absolute left-6 top-6 hover:text-indigo-200 transition">
            <ArrowLeft size={24} />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Book a Slot</h2>
            <div className="flex items-center justify-center gap-2 mt-2 text-indigo-100">
              <MapPin size={16} />
              <span>{lot.name} • {lot.address}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* Time Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Clock className="text-indigo-600" size={20} />
              Duration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Car className="text-indigo-600" size={20} />
              Vehicle
            </h3>
            <select 
              value={selectedVehicleId} 
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3 focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              <option value="" disabled>Select your vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.numberPlate} ({v.vehicleType})</option>
              ))}
              <option value="new">+ Add a new vehicle</option>
            </select>
            
            {selectedVehicleId === 'new' && (
              <input 
                type="text" 
                required
                placeholder="Enter Number Plate (e.g. MH01AB1234)"
                value={newVehiclePlate}
                onChange={(e) => setNewVehiclePlate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none bg-indigo-50"
              />
            )}
          </div>

          {/* Slot Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-indigo-600" size={20} />
              Available Slots
            </h3>
            {availableSlots.length === 0 ? (
              <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl text-sm font-medium border border-yellow-200">
                Sorry, no slots are currently available in this lot.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {availableSlots.map(slot => {
                  const isBooked = bookedSlotIds.includes(slot.id);
                  const isSelected = selectedSlotId === slot.id;
                  
                  return (
                    <div 
                      key={slot.id}
                      onClick={() => !isBooked && setSelectedSlotId(slot.id)}
                      className={`
                        rounded-xl p-3 text-center border-2 transition-all font-bold select-none
                        ${isBooked 
                          ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60' 
                          : isSelected
                            ? 'cursor-pointer border-indigo-600 bg-indigo-600 text-white shadow-md transform scale-105'
                            : 'cursor-pointer border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'}
                      `}
                      title={isBooked ? "Slot already booked for this time" : ""}
                    >
                      {slot.slotNumber}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || availableSlots.length === 0}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {submitting ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
