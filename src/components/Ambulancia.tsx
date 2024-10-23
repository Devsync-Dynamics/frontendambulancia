'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCcw, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';
import { AmbulanciaStats } from './Ambulancias/AmbulanciaStats';
import { AmbulanciaFormModal } from './Ambulancias/AmbulanciaFormModal';
import { AmbulanciaList } from './Ambulancias/AmbulanciaList';
import { AmbulanciaSearch } from './Ambulancias/AmbulanciaSearch';
import { IAmbulancia, ITripulante, AmbulanciaFormData, ambulanciaService } from '@/services/ambulancia.service';

const MapWithNoSSR = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-gray-100 flex items-center justify-center text-teal-600 font-semibold">
      Cargando mapa...
    </div>
  )
});

const Ambulancia: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [ambulancias, setAmbulancias] = useState<IAmbulancia[]>([]);
  const [ubicacionBuscada, setUbicacionBuscada] = useState<{ lat: number; lon: number } | null>(null);
  const [tripulantes, setTripulantes] = useState<ITripulante[]>([]);
  const [ambulanciaId, setAmbulanciaId] = useState<number | null>(null);
  const [ambulanciaCercana, setAmbulanciaCercana] = useState<IAmbulancia | null>(null);
  const [zoom, setZoom] = useState(13);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState<IAmbulancia | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<AmbulanciaFormData>({
    placa: '',
    tripulacion: [],
    estadoId: '',
    ubicacionActual: '',
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 600000); // Actualizar cada 10 minutos
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ambulanciasData, tripulantesData] = await Promise.all([
        ambulanciaService.getAmbulancias(),
        ambulanciaService.getTripulantes(),
      ]);
      setAmbulancias(ambulanciasData);
      setTripulantes(tripulantesData);
      setLastUpdate(new Date().toISOString());

      const tripulacion = await ambulanciaService.getFilteredTripulantes();
      if (tripulacion) {
        const id = tripulacion;
        console.log('ambulancia ID', id);
        setAmbulanciaId(id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingAmbulance) {
        await ambulanciaService.updateAmbulancia(editingAmbulance.id, formData);
        toast({
          title: "Éxito",
          description: "Ambulancia actualizada correctamente",
        });
      } else {
        await ambulanciaService.createAmbulancia(formData);
        toast({
          title: "Éxito",
          description: "Ambulancia creada correctamente",
        });
      }
      setShowAmbulanceModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la ambulancia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar esta ambulancia?')) {
      setLoading(true);
      try {
        await ambulanciaService.deleteAmbulancia(id);
        toast({
          title: "Éxito",
          description: "Ambulancia eliminada correctamente",
        });
        fetchData();
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la ambulancia",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      placa: '',
      tripulacion: [],
      estadoId: '',
      ubicacionActual: '',
    });
    setEditingAmbulance(null);
  };

  const openEditModal = (ambulance: IAmbulancia) => {
    setEditingAmbulance(ambulance);
    setFormData({
      placa: ambulance.placa,
      tripulacion: ambulance.user,
      estadoId: ambulance.estado.id,
      ubicacionActual: ambulance.ubicacionActual,
      latitude: ambulance.latitude,
      longitude: ambulance.longitude,
    });
    setShowAmbulanceModal(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold text-teal-800">Sistema de Monitoreo de Ambulancias</h1>
        <Button 
          onClick={fetchData} 
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 transition-all shadow-lg"
          disabled={loading}
        >
          <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      <AmbulanciaStats ambulancia={ambulancias} />

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-teal-100 rounded-md shadow-sm">
          <TabsTrigger value="map" className="text-lg py-2 text-teal-600 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            Mapa en Vivo
          </TabsTrigger>
          <TabsTrigger value="list" className="text-lg py-2 text-teal-600 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            Lista de Ambulancias
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="map">
          <div className="mt-4 px-4">
            <AmbulanciaSearch ambulancia={ambulancias} />
            <Card className="shadow-lg rounded-md bg-white mt-4">
              <CardContent className="p-0">
                <div className="h-[600px] rounded-lg overflow-hidden">
                  <MapWithNoSSR ambulancias={ambulancias} ambulanciaId={ambulanciaId || 0} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card className="shadow-lg rounded-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl text-teal-600">Estado de Unidades</CardTitle>
              <Button 
                onClick={() => {
                  resetForm();
                  setShowAmbulanceModal(true);
                }}
                className="bg-teal-600 hover:bg-teal-700 transition-all shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nueva Ambulancia
              </Button>
            </CardHeader>
            <CardContent>
              <AmbulanciaList 
                ambulancias={ambulancias}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AmbulanciaFormModal
        show={showAmbulanceModal}
        onClose={() => {
          setShowAmbulanceModal(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingAmbulance={editingAmbulance}
        tripulantes={tripulantes}
        loading={loading}
      />
    </div>
  );
}

export default Ambulancia;
