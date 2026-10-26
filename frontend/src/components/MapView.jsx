import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

function LocationMarker({ onLocationSelect, marker }) {
  const [position, setPosition] = useState(marker || null);
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      fetchAddress(lat, lng, onLocationSelect);
    }
  });

  useEffect(() => {
    if (marker) {
      setPosition(marker);
      map.flyTo([marker.lat, marker.lng], 15);
    }
  }, [marker, map]);

  return position ? (
    <Marker position={[position.lat, position.lng]}>
      <Popup>📍 Selected location</Popup>
    </Marker>
  ) : null;
}

async function fetchAddress(lat, lng, onLocationSelect) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    onLocationSelect({ lat, lng, address });
  } catch {
    onLocationSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
  }
}

export default function MapView({ onLocationSelect, marker, readOnly = false }) {
  const defaultCenter = [12.9716, 77.5946]; // Bangalore

  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer
        center={marker ? [marker.lat, marker.lng] : defaultCenter}
        zoom={13}
        style={{ height: '320px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {!readOnly && (
          <LocationMarker onLocationSelect={onLocationSelect} marker={marker} />
        )}
        {readOnly && marker && (
          <Marker position={[marker.lat, marker.lng]}>
            <Popup>📍 Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}