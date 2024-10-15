import React, { useState, useEffect, useRef } from 'react';
import GeneralLayout from '../components/GeneralLayout';
import { useToast } from '@/hooks/use-toast';
import { ambulanciaService, Solicitud } from '@/services/ambulancia.service';
import SolicitudesTable from '@/components/Solicitudes/SolicitudesTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function RecibirSolicitud() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [newSolicitud, setNewSolicitud] = useState<Solicitud | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const audio = new Audio();
    const sources = [
      { src: '/notificacion/alert1.mp3', type: 'audio/mpeg' },
    ];
    
    sources.forEach(source => {
      const sourceElement = document.createElement('source');
      sourceElement.src = source.src;
      sourceElement.type = source.type;
      audio.appendChild(sourceElement);
    });
    
    audioRef.current = audio;
    
    audio.onerror = (e) => {
      console.error('Error loading audio:', e);
      toast({
        title: "Error de Audio",
        description: "No se pudo cargar el sonido de notificación.",
        variant: "destructive",
      });
    };
    
    return () => audio.remove();
  }, [toast]);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      setIsLoading(true);
      try {
        const response = await ambulanciaService.getSolicitudes();
        
        if (solicitudes.length > 0 && response.length > solicitudes.length) {
          // Play the audio
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
          
          // Find the new solicitud
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
    const interval = setInterval(fetchSolicitudes, 15000); // Update every 15 seconds

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
      <div className="p-6 bg-gradient-to-br from-blue-900 to-indigo-900 min-h-screen">
        <h1 className="text-3xl font-bold text-white mb-6">Recibir Solicitudes de Traslado</h1>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <SolicitudesTable
            solicitudes={solicitudes}
            onAceptar={handleAceptar}
            onRechazar={handleRechazar}
          />
        )}
      </div>
      
      <Dialog open={showNotification} onOpenChange={setShowNotification}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Solicitud de Traslado</DialogTitle>
            <DialogDescription>
              Se ha recibido una nueva solicitud de traslado con los siguientes detalles:
            </DialogDescription>
          </DialogHeader>
          {newSolicitud && (
            <div className="mt-4">
              <p><strong>Paciente:</strong> {newSolicitud.paciente}</p>
              <p><strong>Origen:</strong> {newSolicitud.origen}</p>
              <p><strong>Destino:</strong> {newSolicitud.destino}</p>
              <p><strong>Fecha:</strong> {new Date(newSolicitud.fecha).toLocaleString()}</p>
            </div>
          )}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => newSolicitud && handleRechazar(newSolicitud.id)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Rechazar
            </button>
            <button
              onClick={() => newSolicitud && handleAceptar(newSolicitud.id)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Aceptar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </GeneralLayout>
  );
}