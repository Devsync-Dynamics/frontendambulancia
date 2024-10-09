import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Truck, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { IAmbulancia } from '@/services/ambulancia.service';

// Configuración del icono de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl.src,
  iconUrl: iconUrl.src,
  shadowUrl: shadowUrl.src,
});

interface MapComponentProps {
  ambulancias: IAmbulancia[];
}

const getStatusColor = (estado: string) => {
  const statusColors: { [key: string]: string } = {
    'Disponible': 'bg-green-500',
    'En servicio': 'bg-yellow-500',
    'En mantenimiento': 'bg-red-500',
    'INACTIVO': 'bg-gray-500'
  };
  return statusColors[estado] || 'bg-gray-500';
};

const MapComponent: React.FC<MapComponentProps> = ({ ambulancias }) => {
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
      {ambulancias.map((ambulancia) => (
        <Marker
          key={ambulancia.id}
          position={[ambulancia.latitude, ambulancia.longitude]}
        >
          <Popup className="rounded-lg overflow-hidden">
            <div className="p-2">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Ambulancia {ambulancia.placa}
              </h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  {ambulancia.user.map((tripulante, index) => (
                    <span className="font-semibold" key={index}>
                      Tripulación: {tripulante.nombre} {tripulante.apellido}
                    </span>
                  ))}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {ambulancia.ubicacionActual}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(ambulancia.estado.estado)}`}>
                    {ambulancia.estado.estado}
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