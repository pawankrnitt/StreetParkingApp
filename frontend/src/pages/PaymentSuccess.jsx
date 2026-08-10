import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const location = useLocation();
  const result = location.state?.result;

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-8">
          Your booking has been confirmed and the parking slot is reserved for you.
        </p>
        
        {result && (
          <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Booking ID</p>
            <p className="font-semibold text-gray-800 mb-3">#{result.bookingId}</p>
            
            <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
            <p className="font-semibold text-gray-800">₹{result.amountPaid}</p>
          </div>
        )}

        <Link 
          to="/" 
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition block text-center"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
