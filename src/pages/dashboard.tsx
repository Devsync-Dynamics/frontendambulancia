import React, { useState, useEffect } from 'react';
import GeneralLayout from '@/components/GeneralLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';
import { ArrowUpIcon, ArrowDownIcon, ActivityIcon, Truck } from 'lucide-react';
import L from 'leaflet';

// Importación dinámica de componentes de react-leaflet
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });

// Componente para ajustar la vista del mapa
const ChangeView = dynamic(() => 
    import('react-leaflet').then((mod) => {
      const { useMap } = mod;
      return function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
        const map = useMap();
        map.setView(center, zoom);
        return null;
      };
    }),
    { ssr: false }
  );

// Definir una interfaz para la ambulancia
interface Ambulance {
  id: string;
  placa: string;
  // Agrega aquí otras propiedades que pueda tener una ambulancia
}

function DashboardPage() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [emergencyData, setEmergencyData] = useState<{ mes: string; emergencias: number; }[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<string | null>(null);
  const [ambulanceRoute, setAmbulanceRoute] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0); // Add this line
  
  // Coordenadas centrales de Barranquilla
  const barranquillaCenterCoords: [number, number] = [10.9685, -74.7813];
  
  useEffect(() => {
    fetchAmbulances();
    fetchEmergencyData();
  }, []);

  const fetchAmbulances = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backendtraslado-production.up.railway.app/ambulancia', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAmbulances(data);
    } catch (error) {
      console.error('Error fetching ambulances:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmergencyData = () => {
    const data = [
      { mes: 'Ene', emergencias: 65 },
      { mes: 'Feb', emergencias: 59 },
      { mes: 'Mar', emergencias: 80 },
      { mes: 'Abr', emergencias: 81 },
      { mes: 'May', emergencias: 56 },
      { mes: 'Jun', emergencias: 55 },
    ];
    setEmergencyData(data);
  };

  const handleAmbulanceSelect = async (ambulanceId: string) => {
    setSelectedAmbulance(ambulanceId);
    const route = await fetchSimulatedRoute();
    setAmbulanceRoute(route);
    setMapKey(prevKey => prevKey + 1); // Add this line
  };

  const fetchSimulatedRoute = async () => {
    const API_KEY = '5b3ce3597851110001cf6248a904ff409da54695a2742d31e07f3920';
    
    // Coordenadas de algunas ubicaciones en el departamento del Atlántico
  const atlanticoLocations = [
    [-74.7813, 10.9685], // Barranquilla
    [-74.8861, 10.9877], // Soledad
    [-74.7508, 10.8909], // Puerto Colombia
    [-74.9197, 10.8813], // Galapa
    [-74.7667, 10.7833], // Malambo
    [-74.8833, 10.7500]  // Sabanagrande
  ];

  // Seleccionar dos ubicaciones al azar para la ruta
  const start = atlanticoLocations[Math.floor(Math.random() * atlanticoLocations.length)];
  let end;
  do {
    end = atlanticoLocations[Math.floor(Math.random() * atlanticoLocations.length)];
  } while (end === start);

  // Construir la URL con las coordenadas correctas en el formato LONGITUD,LATITUD
  const startCoordinates = `${start[0]},${start[1]}`;
  const endCoordinates = `${end[0]},${end[1]}`;

  console.log('Inicio de ruta (long, lat):', startCoordinates);
  console.log('Fin de ruta (long, lat):', endCoordinates);

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${startCoordinates}&end=${endCoordinates}`, 
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error en la respuesta de la API: ${response.statusText} (status: ${response.status})`);
    }

    const data = await response.json();

    // Verificar si la respuesta contiene la propiedad `features` con rutas
    if (!data.features || data.features.length === 0) {
      throw new Error('No se encontraron rutas en la respuesta de la API.');
    }

    const coordinates = data.features[0].geometry.coordinates;
    console.log('Coordenadas de la ruta obtenidas:', coordinates);

    // OpenRouteService devuelve coordenadas en formato [longitud, latitud]
    // Necesitamos invertirlas para Leaflet que usa [latitud, longitud]
    return coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
  } catch (error) {
    console.error('Error al obtener la ruta desde OpenRouteService:', error);
    return [];
  }
};
  return (
    <div className="dashboard p-6 bg-gradient-to-br from-blue-900 to-indigo-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">Panel de Control de Salud</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 p-6 rounded-xl shadow-lg backdrop-blur-md">
          <h2 className="text-xl font-semibold mb-2">Total de Ambulancias</h2>
          <p className="text-4xl font-bold text-blue-300">{ambulances.length}</p>
          <div className="flex items-center mt-2 text-green-400">
            <ArrowUpIcon className="w-4 h-4 mr-1" />
            <span>5% más que ayer</span>
          </div>
        </div>
        <div className="bg-white/10 p-6 rounded-xl shadow-lg backdrop-blur-md">
          <h2 className="text-xl font-semibold mb-2">Emergencias Activas</h2>
          <p className="text-4xl font-bold text-red-400">3</p>
          <div className="flex items-center mt-2 text-red-400">
            <ArrowUpIcon className="w-4 h-4 mr-1" />
            <span>2 más que hace una hora</span>
          </div>
        </div>
        <div className="bg-white/10 p-6 rounded-xl shadow-lg backdrop-blur-md">
          <h2 className="text-xl font-semibold mb-2">Personal Disponible</h2>
          <p className="text-4xl font-bold text-green-400">25</p>
          <div className="flex items-center mt-2 text-yellow-400">
            <ArrowDownIcon className="w-4 h-4 mr-1" />
            <span>3 menos que ayer</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 p-6 rounded-xl shadow-lg backdrop-blur-md h-[500px]">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <ActivityIcon className="w-6 h-6 mr-2" />
            Emergencias por Mes
          </h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={emergencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" />
              <XAxis dataKey="mes" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: '#1e3a8a', border: 'none' }} />
              <Legend />
              <Bar dataKey="emergencias" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white/10 p-6 rounded-xl shadow-lg backdrop-blur-md h-[500px]">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Truck className="w-6 h-6 mr-2" />
            Recorrido de Ambulancia en Atlántico
          </h2>
          <div className="relative mb-4">
            <select 
              className="appearance-none w-full bg-white/20 border border-white/30 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white/30 focus:border-white transition-colors duration-200"
              onChange={(e) => handleAmbulanceSelect(e.target.value)}
              value={selectedAmbulance || ''}
            >
              <option value="">Seleccionar Ambulancia</option>
              {ambulances.map((ambulance) => (
                <option key={ambulance.id} value={ambulance.id} className="bg-blue-800 text-white">
                  {ambulance.placa}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          <div className="h-[400px] w-full rounded-lg overflow-hidden">
            <MapContainer center={barranquillaCenterCoords} zoom={10} style={{ height: '100%', width: '100%' }}>
              <ChangeView center={barranquillaCenterCoords} zoom={10} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {ambulanceRoute.length > 0 && (
                <>
                  <Marker position={ambulanceRoute[0]}>
                    <Popup>Inicio del recorrido</Popup>
                  </Marker>
                  <Marker position={ambulanceRoute[ambulanceRoute.length - 1]}>
                    <Popup>Fin del recorrido</Popup>
                  </Marker>
                  <Polyline positions={ambulanceRoute} color="#60a5fa" weight={3} />
                </>
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

DashboardPage.getLayout = (page: React.ReactElement) => {
  return <GeneralLayout>{page}</GeneralLayout>;
};

export default DashboardPage;