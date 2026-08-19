import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { Navigation } from 'lucide-react';

// Custom icons based on status and count
const createCustomIcon = (color, count) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="position: relative;">
        <div style="
          background-color: ${color};
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position: absolute;
          top: 8px;
          left: 0;
          width: 36px;
          text-align: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          z-index: 10;
        ">${count}</div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const getLotIcon = (lot, isAdmin = false) => {
  const available = lot.availableSlots ?? lot.totalSlots;
  const booked = lot.totalSlots - available;
  const countDisplay = lot.status === 'ACTIVE' ? (isAdmin ? booked : available) : '-';

  if (lot.status !== 'ACTIVE') return createCustomIcon('#9ca3af', countDisplay); // Gray
  
  const availabilityPercent = lot.totalSlots > 0 ? (available / lot.totalSlots) : 0;
  
  if (isAdmin) {
    // Admin View: Focus on parked cars (Booked)
    // Red = Full/Busy (lots of cars), Green = Empty (no cars)
    if (booked === 0) return createCustomIcon('#22c55e', countDisplay); // Green (Empty)
    if (availabilityPercent <= 0.33) return createCustomIcon('#ef4444', countDisplay); // Red (Busy)
    return createCustomIcon('#eab308', countDisplay); // Yellow
  } else {
    // Citizen View: Focus on open slots (Available)
    // Red = Full (no slots), Green = Open (lots of slots)
    if (available === 0) return createCustomIcon('#ef4444', countDisplay); // Red
    if (availabilityPercent <= 0.33) return createCustomIcon('#eab308', countDisplay); // Yellow
    return createCustomIcon('#22c55e', countDisplay); // Green
  }
};

const ParkingMap = ({ parkingLots, center = [22.3072, 73.1812], isAdmin = false }) => {
  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {parkingLots.map(lot => (
        <Marker 
          key={lot.id} 
          position={[lot.latitude, lot.longitude]} 
          icon={getLotIcon(lot, isAdmin)}
        >
          <Popup className="custom-popup">
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-lg text-gray-800 mb-1">{lot.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{lot.address}</p>
              
              <div className="flex gap-4 mb-4">
                <div className="bg-blue-50 p-2 rounded-lg flex-1 text-center">
                  <p className="text-xs text-blue-600 font-semibold uppercase">
                    {isAdmin ? "Currently Booked" : "Available Slots"}
                  </p>
                  <p className="text-xl font-bold text-blue-900">
                    {isAdmin ? (lot.totalSlots - (lot.availableSlots ?? lot.totalSlots)) : (lot.availableSlots ?? lot.totalSlots)}
                  </p>
                </div>
                {/* Bike slots can be added if available in schema */}
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className={`text-sm font-medium ${lot.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}`}>
                  {lot.status}
                </span>
                <div className="flex gap-2">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${lot.latitude},${lot.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 transition-colors"
                  >
                    <Navigation size={16} />
                    Nav
                  </a>
                  {(!isAdmin && lot.status === 'ACTIVE' && (lot.availableSlots ?? lot.totalSlots) > 0) && (
                    <Link
                      to={`/book/${lot.id}`}
                      className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Book
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ParkingMap;
