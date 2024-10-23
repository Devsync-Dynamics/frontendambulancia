import React, { useState, useEffect, useRef } from 'react';
import GeneralLayout from '../components/GeneralLayout';
import { useToast } from '@/hooks/use-toast';
import { ambulanciaService, Solicitud } from '@/services/ambulancia.service';
import SolicitudesTable from '@/components/Solicitudes/SolicitudesTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ambulance, Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecibirSolicitud() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [newSolicitud, setNewSolicitud] = useState<Solicitud | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const audio = new Audio('/notificacion/alert1.mp3');
    audioRef.current = audio;
    audio.onerror = (e) => {
      console.error('Error loading audio:', e);
      toast({
        title: "Error de Audio",
        description: "No se pudo cargar el sonido de notificación.",
        variant: "destructive",
      });
    };
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [toast]);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      setIsLoading(true);
      try {
        const response = await ambulanciaService.getSolicitudes();
        
        if (solicitudes.length > 0 && response.length > solicitudes.length) {
          if (audioRef.current) {
            audioRef.current.play().catch(error => {
              console.error('Error playing audio:', error);
              toast({
                title: "Error de Audio",
                description: "No se pudo reproducir el sonido de notificación.",
                variant: "destructive",
              });
            });
          }
          
          const newSolicitudData = response.find(s => !solicitudes.some(existingSolicitud => existingSolicitud.id === s.id));
          if (newSolicitudData) {
            setNewSolicitud(newSolicitudData);
            setShowNotification(true);
          }
          
          toast({
            title: "Nueva solicitud",
            description: "Se ha recibido una nueva solicitud de traslado.",
          });
        }
        
        setSolicitudes(response);
      } catch (error) {
        console.error('Error al obtener las solicitudes:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las solicitudes. Por favor, intente nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolicitudes();
    const interval = setInterval(fetchSolicitudes, 15000); // Actualiza cada 15 segundos

    return () => clearInterval(interval);
  }, [solicitudes.length, toast]);

  const handleCloseNotification = () => {
    setShowNotification(false);
    setNewSolicitud(null);
  };

  const handleAceptar = async (id: string) => {
    try {
      await ambulanciaService.updateSolicitud(id, 'en_proceso');
      toast({
        title: "Solicitud aceptada",
        description: "La solicitud ha sido aceptada y está en proceso.",
      });
      const updatedSolicitudes = await ambulanciaService.getSolicitudes();
      setSolicitudes(updatedSolicitudes);
      handleCloseNotification();
    } catch (error) {
      console.error('Error al aceptar la solicitud:', error);
      toast({
        title: "Error",
        description: "No se pudo aceptar la solicitud. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleRechazar = async (id: string) => {
    try {
      await ambulanciaService.updateSolicitud(id, 'cancelado');
      toast({
        title: "Solicitud rechazada",
        description: "La solicitud ha sido rechazada.",
      });
      const updatedSolicitudes = await ambulanciaService.getSolicitudes();
      setSolicitudes(updatedSolicitudes);
      handleCloseNotification();
    } catch (error) {
      console.error('Error al rechazar la solicitud:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <GeneralLayout>
      <div className="min-h-screen from-teal-50 to-teal-100 p-8">
        <Card className="bg-white shadow-lg border-t-4 border-teal-600 rounded-lg">
          <CardHeader className="bg-teal-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold flex items-center">
              <Ambulance className="mr-2 h-8 w-8" />
              Centro de Control de Traslados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-teal-50">
            <h2 className="text-2xl font-semibold text-teal-800 mb-4">Solicitudes Pendientes</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-teal-600" />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-inner p-4 overflow-x-auto">
                <SolicitudesTable
                  solicitudes={solicitudes}
                  onAceptar={handleAceptar}
                  onRechazar={handleRechazar}
                  tipoVista={'recibir'}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={showNotification} onOpenChange={setShowNotification}>
        <DialogContent className="bg-white shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-teal-600 flex items-center">
              <Bell className="mr-2 h-6 w-6" />
              Nueva Solicitud de Traslado
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Se ha recibido una nueva solicitud con los siguientes detalles:
            </DialogDescription>
          </DialogHeader>
          {newSolicitud && (
            <div className="mt-4 space-y-3 bg-teal-50 p-4 rounded-lg">
              <p className="text-teal-900"><span className="font-semibold text-teal-700">Paciente:</span> {newSolicitud.paciente}</p>
              <p className="text-teal-900"><span className="font-semibold text-teal-700">Origen:</span> {newSolicitud.origen}</p>
              <p className="text-teal-900"><span className="font-semibold text-teal-700">Destino:</span> {newSolicitud.destino}</p>
              <p className="text-teal-900"><span className="font-semibold text-teal-700">Fecha:</span> {new Date(newSolicitud.fecha).toLocaleString()}</p>
            </div>
          )}
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              onClick={() => newSolicitud && handleRechazar(newSolicitud.id)}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              Rechazar
            </Button>
            <Button
              onClick={() => newSolicitud && handleAceptar(newSolicitud.id)}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Aceptar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </GeneralLayout>
  );
}
