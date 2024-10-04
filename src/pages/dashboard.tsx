import React, { useState, useEffect } from 'react';
import GeneralLayout from '@/components/GeneralLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';
import { ArrowUpIcon, ArrowDownIcon, ActivityIcon, Truck, Ambulance, Users, AlertTriangle } from 'lucide-react';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [mapKey, setMapKey] = useState(0);
  
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
    setMapKey(prevKey => prevKey + 1);
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

    const startCoordinates = `${start[0]},${start[1]}`;
    const endCoordinates = `${end[0]},${end[1]}`;

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

      if (!data.features || data.features.length === 0) {
        throw new Error('No se encontraron rutas en la respuesta de la API.');
      }

      const coordinates = data.features[0].geometry.coordinates;
      return coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
    } catch (error) {
      console.error('Error al obtener la ruta desde OpenRouteService:', error);
      return [];
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-100 to-teal-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">Panel de Control de Salud</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg border-t-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total de Ambulancias</CardTitle>
            <Ambulance className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{ambulances.length}</div>
            <p className="text-xs text-blue-600">
              <ArrowUpIcon className="w-4 h-4 mr-1 inline text-green-500" />
              <span className="text-green-600">5% más que ayer</span>
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 shadow-lg border-t-4 border-red-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Emergencias Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">3</div>
            <p className="text-xs text-red-600">
              <ArrowUpIcon className="w-4 h-4 mr-1 inline text-red-500" />
              <span className="text-red-600">2 más que hace una hora</span>
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-lg border-t-4 border-indigo-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">Personal Disponible</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">25</div>
            <p className="text-xs text-indigo-600">
              <ArrowDownIcon className="w-4 h-4 mr-1 inline text-yellow-500" />
              <span className="text-yellow-600">3 menos que ayer</span>
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-lg border-t-4 border-green-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Tiempo de Respuesta Promedio</CardTitle>
            <ActivityIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">12 min</div>
            <p className="text-xs text-green-600">
              <ArrowDownIcon className="w-4 h-4 mr-1 inline text-green-500" />
              <span className="text-green-600">2 min menos que el mes pasado</span>
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 bg-gradient-to-br from-blue-50 to-teal-50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center text-blue-800">
              <ActivityIcon className="w-5 h-5 mr-2 text-blue-600" />
              Emergencias por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emergencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" stroke="#4b5563" />
                  <YAxis stroke="#4b5563" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }} />
                  <Legend />
                  <Bar dataKey="emergencias" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 bg-gradient-to-br from-teal-50 to-blue-50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center text-blue-800">
              <Truck className="w-5 h-5 mr-2 text-blue-600" />
              Recorrido de Ambulancia en Atlántico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Select onValueChange={handleAmbulanceSelect} value={selectedAmbulance || ''}>
                <SelectTrigger className="w-full border-blue-300 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccionar Ambulancia" />
                </SelectTrigger>
                <SelectContent>
                  {ambulances.map((ambulance) => (
                    <SelectItem key={ambulance.id} value={ambulance.id}>
                      {ambulance.placa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="h-[400px] w-full rounded-lg overflow-hidden border-2 border-blue-200">
              <MapContainer key={mapKey} center={barranquillaCenterCoords} zoom={10} style={{ height: '100%', width: '100%' }}>
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
                    <Polyline positions={ambulanceRoute} color="#3b82f6" weight={3} />
                  </>
                )}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

DashboardPage.getLayout = (page: React.ReactElement) => {
  return <GeneralLayout>{page}</GeneralLayout>;
};

export default DashboardPage;