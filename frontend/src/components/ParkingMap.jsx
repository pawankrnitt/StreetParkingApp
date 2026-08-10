import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Navigation } from 'lucide-react';

// Custom icons based on status
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const iconGreen = createCustomIcon('#22c55e'); // Green (high availability)
const iconYellow = createCustomIcon('#eab308'); // Yellow (low availability)
const iconRed = createCustomIcon('#ef4444'); // Red (full)
const iconGray = createCustomIcon('#9ca3af'); // Gray (inactive)

const getLotIcon = (lot) => {
  if (lot.status !== 'ACTIVE') return iconGray;
  
  const availabilityPercent = lot.onlineSlots > 0 ? (lot.onlineSlots / (lot.onlineSlots)) : 0; // simplistic for MVP, ideally (total-occupied)/total
  // We will assume onlineSlots represents available for now since we don't have occupied count easily here.
  // Realistically we need an occupied count from API. Let's just use raw slots for MVP visual
  if (lot.onlineSlots > 10) return iconGreen;
  if (lot.onlineSlots > 0) return iconYellow;
  return iconRed;
};

const ParkingMap = ({ parkingLots, center = [22.3072, 73.1812] }) => {
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
          icon={getLotIcon(lot)}
        >
          <Popup className="custom-popup">
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-lg text-gray-800 mb-1">{lot.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{lot.address}</p>
              
              <div className="flex gap-4 mb-4">
                <div className="bg-blue-50 p-2 rounded-lg flex-1 text-center">
                  <p className="text-xs text-blue-600 font-semibold uppercase">Car Slots</p>
                  <p className="text-xl font-bold text-blue-900">{lot.onlineSlots}</p>
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
                  {lot.status === 'ACTIVE' && lot.onlineSlots > 0 && (
                    <a
                      href="/checkout"
                      className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Book
                    </a>
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
