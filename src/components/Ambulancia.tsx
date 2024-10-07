import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Activity, Truck, AlertCircle, Clock, MapPin, User, Calendar, RefreshCcw, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ClientOnlyTimestamp from './ClientOnlyTimestamp';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Importar el mapa dinámicamente para evitar problemas de SSR
const MapWithNoSSR = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full bg-white/5 flex items-center justify-center">
        Cargando mapa...
      </div>
    )
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
    distancia?: number; // Added optional distancia property
  }

  interface AmbulanceFormData {
    placa: string;
    conductor: string;
    estado: string;
    ubicacionActual: string;
  }

const Ambulancia: React.FC = () => {
        const [busqueda, setBusqueda] = useState('');
      const [ambulances, setAmbulances] = useState<IAmbulance[]>([]);
      const [ubicacionBuscada, setUbicacionBuscada] = useState<{ lat: number; lon: number } | null>(null); // Updated type
      const [ambulanciaCercana, setAmbulanciaCercana] = useState<IAmbulance | null>(null);
      const [zoom, setZoom] = useState(13);
      const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());
      const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
      const [editingAmbulance, setEditingAmbulance] = useState<IAmbulance | null>(null);
      const [formData, setFormData] = useState<AmbulanceFormData>({
        placa: '',
        conductor: '',
        estado: 'DISPONIBLE',
        ubicacionActual: ''
      });


       // Función para calcular la distancia entre dos puntos
       const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };
    
       // Función para buscar ubicación usando Nominatim
       const buscarUbicacion = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda)}`
          );
          const data = await response.json();
    
          if (data && data.length > 0) {
            const ubicacion = {
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon)
            };
            
            setZoom(16);
            setUbicacionBuscada(ubicacion);
            
            encontrarAmbulanciaCercana(ubicacion);
          }
        } catch (error) {
          console.error('Error al buscar ubicación:', error);
        }
      };
    
      const encontrarAmbulanciaCercana = (ubicacion: { lat: number; lon: number }) => {
        let distanciaMinima = Infinity;
        let ambulanciaMasCercana = null;
    
        ambulances.forEach((ambulancia: IAmbulance) => { // Changed 'ambulancias' to 'ambulances'
          if (ambulancia.estado === 'DISPONIBLE') {
            const distancia = calcularDistancia(
              ubicacion.lat,
              ubicacion.lon,
              ambulancia.latitude,
              ambulancia.longitude
            );
            console.log('distancia'+distancia);
            console.log('distanciaMinima'+distanciaMinima);
            if (distancia < distanciaMinima) {
              distanciaMinima = distancia;
              ambulanciaMasCercana = { ...ambulancia, distancia };
            }
          }
        });
    console.log(ambulanciaMasCercana);
        setAmbulanciaCercana(ambulanciaMasCercana);
      };

      const handleCreateAmbulance = () => {
        const newAmbulance: IAmbulance = {
          id: ambulances.length + 1,
          ...formData,
          latitude: 10.9639 + (Math.random() - 0.5) * 0.1,
          longitude: -74.7964 + (Math.random() - 0.5) * 0.1,
          ultimaActualizacion: new Date().toISOString(),
        };
    
        setAmbulances([...ambulances, newAmbulance]);
        setShowAmbulanceModal(false);
        resetForm();
      };
    
      const handleEditAmbulance = () => {
        if (!editingAmbulance) return;
        
        const updatedAmbulances = ambulances.map(amb => 
          amb.id === editingAmbulance.id ? {
            ...amb,
            ...formData,
            ultimaActualizacion: new Date().toISOString()
          } : amb
        );
    
        setAmbulances(updatedAmbulances);
        setShowAmbulanceModal(false);
        setEditingAmbulance(null);
        resetForm();
      };
    
      const handleDeleteAmbulance = (id: number) => {
        if (confirm('¿Está seguro de que desea eliminar esta ambulancia?')) {
          setAmbulances(ambulances.filter(amb => amb.id !== id));
        }
      };
    
      const resetForm = () => {
        setFormData({
          placa: '',
          conductor: '',
          estado: 'DISPONIBLE',
          ubicacionActual: ''
        });
      };
    
      const openEditModal = (ambulance: IAmbulance) => {
        setEditingAmbulance(ambulance);
        setFormData({
          placa: ambulance.placa,
          conductor: ambulance.conductor,
          estado: ambulance.estado,
          ubicacionActual: ambulance.ubicacionActual
        });
        setShowAmbulanceModal(true);
      };

  useEffect(() => {
    const mockAmbulances: IAmbulance[] = [
      {
        id: 1,
        placa: 'ABC123',
        conductor: 'Juan Pérez',
        estado: 'DISPONIBLE',
        latitude: 10.9639,
        longitude: -74.7964,
        ultimaActualizacion: new Date().toISOString(),
        ubicacionActual: 'Centro de Barranquilla'
      },
      {
        id: 2,
        placa: 'XYZ789',
        conductor: 'María López',
        estado: 'EN_SERVICIO',
        latitude: 10.9177,
        longitude: -74.7647,
        ultimaActualizacion: new Date().toISOString(),
        ubicacionActual: 'Soledad'
      },
      {
        id: 3,
        placa: 'DEF456',
        conductor: 'Carlos Rodríguez',
        estado: 'MANTENIMIENTO',
        latitude: 10.9877,
        longitude: -74.7885,
        ultimaActualizacion: new Date().toISOString(),
        ubicacionActual: 'Taller Central'
      },
    ];
    setAmbulances(mockAmbulances);

 // Simular movimiento de ambulancias
 const movementInterval = setInterval(() => {
    setAmbulances(prevAmbulances => 
      prevAmbulances.map(ambulance => ({
        ...ambulance,
        latitude: ambulance.latitude + (Math.random() - 0.5) * 0.01,
        longitude: ambulance.longitude + (Math.random() - 0.5) * 0.01,
        ultimaActualizacion: new Date().toISOString()
      }))
    );
  }, 10000);

  return () => clearInterval(movementInterval);
}, []);


  const getStatusColor = (estado: string): string => {
    const statusColors: { [key: string]: string } = {
      'DISPONIBLE': 'bg-green-500 text-white',
      'EN_SERVICIO': 'bg-yellow-500 text-black',
      'MANTENIMIENTO': 'bg-red-500 text-white',
      'INACTIVO': 'bg-gray-500 text-white'
    };
    return statusColors[estado] || 'bg-gray-500 text-white';
  };

  const refreshData = () => {
    // Aquí iría la lógica para refrescar los datos desde el servidor
    setLastUpdate(new Date().toISOString());
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-blue-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Sistema de Monitoreo de Ambulancias</h1>
        <Button onClick={refreshData} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <RefreshCcw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Ambulancias', value: ambulances.length, icon: Truck, color: 'bg-blue-100 text-blue-600' },
          { label: 'Disponibles', value: ambulances.filter(a => a.estado === 'DISPONIBLE').length, icon: AlertCircle, color: 'bg-green-100 text-green-600' },
          { label: 'En Servicio', value: ambulances.filter(a => a.estado === 'EN_SERVICIO').length, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
          { label: 'En Mantenimiento', value: ambulances.filter(a => a.estado === 'MANTENIMIENTO').length, icon: Activity, color: 'bg-red-100 text-red-600' }
        ].map((stat, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardContent className="flex items-center p-6">
              <div className={`rounded-full p-3 mr-4 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-blue-100">
          <TabsTrigger value="map" className="text-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">Mapa en Vivo</TabsTrigger>
          <TabsTrigger value="list" className="text-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">Lista de Ambulancias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map">
              {/* Barra de búsqueda */}
              <div className="mt-4 px-4">
  <div className="flex gap-2 mb-4">
    <input
      type="text"
      placeholder="Buscar ubicación..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className="flex-1 px-4 py-2 rounded-lg border border-blue-200 
                bg-white text-blue-900 placeholder-blue-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                focus:border-blue-300 shadow-sm"
    />
    <Button
      onClick={buscarUbicacion}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Search className="h-4 w-4" />
      Buscar
    </Button>
  </div>

  {/* Popup para ambulancia cercana */}
  {ambulanciaCercana && (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center 
                  justify-center p-4 z-50 backdrop-blur-sm">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            Ambulancia más cercana encontrada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-600">Placa</p>
                  <p className="font-semibold text-blue-900">{ambulanciaCercana.placa}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Distancia</p>
                  <p className="font-semibold text-blue-900">
                    {ambulanciaCercana.distancia?.toFixed(2)} km
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Conductor</p>
                  <p className="font-semibold text-blue-900">{ambulanciaCercana.conductor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Estado</p>
                  <Badge className={`${getStatusColor(ambulanciaCercana.estado)}`}>
                    {ambulanciaCercana.estado}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-blue-600">Ubicación Actual</p>
                  <p className="font-semibold text-blue-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    {ambulanciaCercana.ubicacionActual}
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => setAmbulanciaCercana(null)}
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )}
</div>
          <Card className="shadow-xl bg-white">
            <CardContent className="p-0">
              <div className="h-[600px] rounded-lg overflow-hidden">
                <MapWithNoSSR ambulances={ambulances} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="list">
          <Card className="shadow-xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl text-blue-800">Estado de Unidades</CardTitle>
              <Button 
                onClick={() => {
                  resetForm();
                  setEditingAmbulance(null);
                  setShowAmbulanceModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Ambulancia
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full pr-4">
                {ambulances.map((ambulance) => (
                  <div key={ambulance.id} className="mb-4 p-6 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-blue-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-semibold flex items-center gap-2 text-blue-700">
                        <Truck className="h-5 w-5 text-blue-600" />
                        {ambulance.placa}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(ambulance.estado)} px-3 py-1 text-sm font-medium`}>
                          {ambulance.estado}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(ambulance)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAmbulance(ambulance.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-blue-600">
                      <p className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-400" /> {ambulance.conductor}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-400" /> {ambulance.ubicacionActual}
                      </p>
                      <p className="flex items-center gap-2 col-span-2 text-xs text-blue-500">
                        <Calendar className="h-3 w-3" /> Última actualización: <ClientOnlyTimestamp timestamp={ambulance.ultimaActualizacion} />
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para crear/editar ambulancia */}
      {showAmbulanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="max-w-md w-full shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                <Truck className="h-6 w-6 text-blue-600" />
                {editingAmbulance ? 'Editar Ambulancia' : 'Nueva Ambulancia'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-600">Placa</label>
                  <Input
                    value={formData.placa}
                    onChange={(e) => setFormData({...formData, placa: e.target.value})}
                    placeholder="Ingrese la placa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-600">Conductor</label>
                  <Input
                    value={formData.conductor}
                    onChange={(e) => setFormData({...formData, conductor: e.target.value})}
                    placeholder="Nombre del conductor"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-600">Estado</label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData({...formData, estado: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                      <SelectItem value="EN_SERVICIO">En Servicio</SelectItem>
                      <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                      <SelectItem value="INACTIVO">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-600">Ubicación Actual</label>
                  <Input
                    value={formData.ubicacionActual}
                    onChange={(e) => setFormData({...formData, ubicacionActual: e.target.value})}
                    placeholder="Ubicación actual"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setShowAmbulanceModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={editingAmbulance ? handleEditAmbulance : handleCreateAmbulance}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {editingAmbulance ? 'Guardar Cambios' : 'Crear Ambulancia'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <p className="text-center text-sm text-blue-600 mt-4">
        Última actualización: <ClientOnlyTimestamp timestamp={lastUpdate} />
      </p>
    </div>
  );
}
export default Ambulancia;