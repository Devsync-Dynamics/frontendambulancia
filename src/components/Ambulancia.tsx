import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Activity, Truck, AlertCircle, Clock, MapPin } from 'react-feather';
import ClientOnlyTimestamp from './ClientOnlyTimestamp';

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

  useEffect(() => {
    // Inicializar ambulancias con mock data
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
      'DISPONIBLE': 'bg-emerald-500',
      'EN_SERVICIO': 'bg-amber-500',
      'MANTENIMIENTO': 'bg-rose-500',
      'INACTIVO': 'bg-slate-500'
    };
    return statusColors[estado] || 'bg-slate-500';
  };

  const getStatusGlow = (estado: string): string => {
    const statusGlow: { [key: string]: string } = {
      'DISPONIBLE': 'shadow-emerald-500/50',
      'EN_SERVICIO': 'shadow-amber-500/50',
      'MANTENIMIENTO': 'shadow-rose-500/50',
      'INACTIVO': 'shadow-slate-500/50'
    };
    return statusGlow[estado] || 'shadow-slate-500/50';
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con estadísticas */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Activity className="h-8 w-8 text-blue-400" />
          Sistema de Monitoreo en Tiempo Real
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Ambulancias',
              value: ambulances.length,
              icon: Truck,
              color: 'text-blue-400'
            },
            {
              label: 'Disponibles',
              value: ambulances.filter(a => a.estado === 'DISPONIBLE').length,
              icon: AlertCircle,
              color: 'text-emerald-400'
            },
            {
              label: 'En Servicio',
              value: ambulances.filter(a => a.estado === 'EN_SERVICIO').length,
              icon: Clock,
              color: 'text-amber-400'
            },
            {
              label: 'En Mantenimiento',
              value: ambulances.filter(a => a.estado === 'MANTENIMIENTO').length,
              icon: AlertCircle,
              color: 'text-rose-400'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mapa y Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/10">
          <div className="h-[600px]">
            <MapWithNoSSR ambulances={ambulances} />
          </div>
        </div>

        {/* Lista de Ambulancias */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/10 overflow-hidden">
          <h2 className="text-xl font-bold mb-4 px-2">Estado de Unidades</h2>
          <div className="space-y-3 max-h-[540px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100/10">
            {ambulances.map((ambulance) => (
              <div
                key={ambulance.id}
                className={`bg-white/5 rounded-xl p-4 border border-white/10 shadow-lg ${getStatusGlow(ambulance.estado)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    {ambulance.placa}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(ambulance.estado)}`}>
                    {ambulance.estado}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-300">
                  <p>{ambulance.conductor}</p>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {ambulance.ubicacionActual}
                  </p>
                  <p className="text-xs text-gray-400">
                    Última actualización: <ClientOnlyTimestamp timestamp={ambulance.ultimaActualizacion} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ambulancia;