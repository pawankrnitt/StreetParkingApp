import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { processMockPayment } from '../services/api';
import { CheckCircle } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // In a real flow, you'd pass booking ID via state or URL params.
  // For demo, we just grab it from state or mock it.
  const bookingId = location.state?.bookingId || 1; 
  const amount = location.state?.amount || 50;

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await processMockPayment(bookingId);
      // On success, redirect to the success page
      navigate('/payment-success', { state: { result } });
    } catch (err) {
      console.error(err);
      setError("Payment failed or booking not found. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Complete Your Payment</h2>
        
        <div className="bg-indigo-50 rounded-xl p-6 mb-8 text-center border border-indigo-100">
          <p className="text-gray-600 text-sm mb-1 uppercase font-semibold">Total Amount Due</p>
          <p className="text-4xl font-bold text-indigo-700">₹{amount}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <button 
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <CheckCircle size={20} />
              Pay Now
            </>
          )}
        </button>
        
        <p className="text-center text-xs text-gray-400 mt-4">
          This is a practice project. No real payment will be processed.
        </p>
      </div>
    </div>
  );
};

export default Checkout;
