import React, { useState, useEffect } from 'react';
import GeneralLayout from '@/components/GeneralLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';
import { ArrowUpIcon, ArrowDownIcon, ActivityIcon, Truck, Ambulance, Users, AlertTriangle } from 'lucide-react';
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
}

function DashboardPage() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [emergencyData, setEmergencyData] = useState<{ mes: string; emergencias: number; }[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<string | null>(null);
  const [ambulanceRoute, setAmbulanceRoute] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0);
  
  const barranquillaCenterCoords: [number, number] = [10.9685, -74.7813];
  
  useEffect(() => {
    fetchAmbulances();
    fetchEmergencyData();
  }, []);

  const fetchAmbulances = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backendtraslado-production-4194.up.railway.app/ambulancia', {
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
    
    const atlanticoLocations = [
      [-74.7813, 10.9685], 
      [-74.8861, 10.9877], 
      [-74.7508, 10.8909], 
      [-74.9197, 10.8813], 
      [-74.7667, 10.7833], 
      [-74.8833, 10.7500]  
    ];

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
    <div className="p-8 bg-teal-50 min-h-screen">
      <h1 className="text-5xl font-bold mb-10 text-center text-teal-900">Health Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <Card className="bg-white shadow-xl border-t-4 border-teal-500 hover:shadow-2xl rounded-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-sm font-semibold text-teal-700">Total Ambulances</CardTitle>
            <Ambulance className="h-6 w-6 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-800">{ambulances.length}</div>
            <p className="text-sm text-teal-500 mt-1 flex items-center">
              <ArrowUpIcon className="w-5 h-5 text-green-500 mr-1" />
              <span className="text-green-600">5% increase</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-t-4 border-red-500 hover:shadow-2xl rounded-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-sm font-semibold text-teal-700">Active Emergencies</CardTitle>
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-800">3</div>
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <ArrowUpIcon className="w-5 h-5 text-red-500 mr-1" />
              2 more than an hour ago
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-t-4 border-green-500 hover:shadow-2xl rounded-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-sm font-semibold text-teal-700">Available Staff</CardTitle>
            <Users className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-800">25</div>
            <p className="text-sm text-yellow-600 mt-1 flex items-center">
              <ArrowDownIcon className="w-5 h-5 text-yellow-500 mr-1" />
              3 less than yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-t-4 border-teal-400 hover:shadow-2xl rounded-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-sm font-semibold text-teal-700">Avg. Response Time</CardTitle>
            <ActivityIcon className="h-6 w-6 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-800">12 min</div>
            <p className="text-sm text-teal-600 mt-1 flex items-center">
              <ArrowDownIcon className="w-5 h-5 text-green-500 mr-1" />
              2 min less than last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white shadow-xl hover:shadow-2xl rounded-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-teal-800">
              <ActivityIcon className="w-6 h-6 mr-2 text-teal-500" />
              Emergencies by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emergencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" stroke="#0f766e" />
                  <YAxis stroke="#0f766e" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#99f6e4' }} />
                  <Legend />
                  <Bar dataKey="emergencias" fill="#14b8a6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl hover:shadow-2xl rounded-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-teal-800">
              <Truck className="w-6 h-6 mr-2 text-teal-500" />
              Ambulance Route
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Select onValueChange={handleAmbulanceSelect} value={selectedAmbulance || ''}>
                <SelectTrigger className="w-full border-gray-300 focus:ring-gray-500">
                  <SelectValue placeholder="Select Ambulance" />
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
            <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300">
              <MapContainer key={mapKey} center={barranquillaCenterCoords} zoom={10} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={barranquillaCenterCoords} zoom={10} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {ambulanceRoute.length > 0 && (
                  <>
                    <Marker position={ambulanceRoute[0]}>
                      <Popup>Start</Popup>
                    </Marker>
                    <Marker position={ambulanceRoute[ambulanceRoute.length - 1]}>
                      <Popup>End</Popup>
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
