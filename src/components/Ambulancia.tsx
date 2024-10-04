import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Activity, Truck, AlertCircle, Clock, MapPin, User, Calendar, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ClientOnlyTimestamp from './ClientOnlyTimestamp';
import { Button } from "@/components/ui/button";

const MapWithNoSSR = dynamic(() => import('./MapComponent'), {
  ssr: false
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

const Ambulancia: React.FC = () => {
  const [ambulances, setAmbulances] = useState<IAmbulance[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

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

    const movementInterval = setInterval(() => {
      setAmbulances(prevAmbulances => 
        prevAmbulances.map(ambulance => ({
          ...ambulance,
          latitude: ambulance.latitude + (Math.random() - 0.5) * 0.01,
          longitude: ambulance.longitude + (Math.random() - 0.5) * 0.01,
          ultimaActualizacion: new Date().toISOString()
        }))
      );
      setLastUpdate(new Date().toISOString());
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
            <CardHeader>
              <CardTitle className="text-2xl text-blue-800">Estado de Unidades</CardTitle>
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
                      <Badge className={`${getStatusColor(ambulance.estado)} px-3 py-1 text-sm font-medium`}>
                        {ambulance.estado}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-blue-600">
                      <p className="flex items-center gap-2"><User className="h-4 w-4 text-blue-400" /> {ambulance.conductor}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-400" /> {ambulance.ubicacionActual}</p>
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
      
      <p className="text-center text-sm text-blue-600 mt-4">
        Última actualización: <ClientOnlyTimestamp timestamp={lastUpdate} />
      </p>
    </div>
  );
};

export default Ambulancia;