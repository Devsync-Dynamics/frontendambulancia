import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, MapPin } from 'react-feather';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl.src,
  iconUrl: iconUrl.src,
  shadowUrl: shadowUrl.src,
});

interface IAmbulance {
  id: number;
  placa: string;
  conductor: string;
  estado: string;
  latitude: number;
  longitude: number;
  ultimaActualizacion: string;
  ubicacionActual: string;
}

interface IMapComponentProps {
  ambulances: IAmbulance[];
}

const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'active':
      return 'bg-green-500';
    case 'inactive':
      return 'bg-red-500';
    case 'pending':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

const MapComponent: React.FC<IMapComponentProps> = ({ ambulances }) => {
  return (
    <MapContainer
      center={[10.9639, -74.7964]}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {ambulances.map((ambulance) => (
        <Marker
          key={ambulance.id}
          position={[ambulance.latitude, ambulance.longitude]}
        >
          <Popup className="rounded-lg overflow-hidden">
            <div className="p-2">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Ambulancia {ambulance.placa}
              </h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-semibold">Conductor:</span>
                  {ambulance.conductor}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {ambulance.ubicacionActual}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(ambulance.estado)}`}>
                    {ambulance.estado}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;

