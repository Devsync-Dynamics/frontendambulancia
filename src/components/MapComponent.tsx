import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Truck, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { IAmbulancia } from '@/services/ambulancia.service';
import { io, Socket } from 'socket.io-client';

// Configuración del icono de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl.src,
  iconUrl: iconUrl.src,
  shadowUrl: shadowUrl.src,
});

interface MapComponentProps {
  ambulancias: IAmbulancia[];
  currentAmbulanceId: number;
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

const SOCKET_URL = 'http://localhost:3001';

const MapComponent: React.FC<MapComponentProps> = ({ ambulancias, currentAmbulanceId }) => {
  const [ambulanceLocations, setAmbulanceLocations] = useState<IAmbulancia[]>(ambulancias);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Actualizar ambulanceLocations cuando cambie ambulancias
  useEffect(() => {
    setAmbulanceLocations(ambulancias);
  }, [ambulancias]);

  const updateCurrentLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (socket) {
            socket.emit('updateLocation', { 
              id: currentAmbulanceId, 
              lat: latitude, 
              lng: longitude 
            });
          }
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [socket, currentAmbulanceId]);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setSocket(socketInstance);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socketInstance.on('locationUpdated', (updatedAmbulance: IAmbulancia) => {
      console.log('Location updated:', updatedAmbulance);
      setAmbulanceLocations((prevLocations) => 
        prevLocations.map((ambulance) =>
          ambulance.id === updatedAmbulance.id ? { ...ambulance, ...updatedAmbulance } : ambulance
        )
      );
    });

    // Configurar el intervalo para actualizar la ubicación
    const intervalId = setInterval(() => {
      updateCurrentLocation();
    }, 10000); // Actualizar cada 10 segundos

    // Limpiar el intervalo y desconectar el socket cuando el componente se desmonte
    return () => {
      clearInterval(intervalId);
      if (socketInstance.connected) {
        socketInstance.disconnect();
      }
    };
  }, [updateCurrentLocation]);

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
      {ambulanceLocations.map((ambulancia) => (
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