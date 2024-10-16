import React, { useState, useEffect, useRef, useCallback } from 'react';
import GeneralLayout from '../components/GeneralLayout';
import { useToast } from "@/hooks/use-toast";
import { ambulanciaService, CreateSolicitudDto, Solicitud } from '@/services/ambulancia.service';
import SolicitudesTable from '@/components/Solicitudes/SolicitudesTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ambulance, Bell, ClipboardList, Plus, Send, RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';

export default function EnviarSolicitud() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const [statusNotification, setStatusNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const lastFetchTimeRef = useRef<number>(0);

  const [formData, setFormData] = useState<CreateSolicitudDto>({
    paciente: '',
    origen: '',
    destino: '',
    fecha: '',
    prioridad: 'media',
  });

  useEffect(() => {
    const audio = new Audio('/notificacion/alert2.mp3');
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

  const fetchSolicitudes = useCallback(async (force: boolean = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTimeRef.current < 5000) {
      // Si no es forzado y han pasado menos de 5 segundos desde la última actualización, no hacemos nada
      return;
    }

    setIsLoading(true);
    try {
      const data = await ambulanciaService.getSolicitudes();
      lastFetchTimeRef.current = now;

      setSolicitudes(prevSolicitudes => {
        // Comparar y notificar cambios
        data.forEach(newSolicitud => {
          const oldSolicitud = prevSolicitudes.find(s => s.id === newSolicitud.id);
          if (oldSolicitud && oldSolicitud.estado !== newSolicitud.estado) {
            if (newSolicitud.estado === 'en_proceso') {
              showStatusNotification('Solicitud Aprobada', `Su solicitud para ${newSolicitud.paciente} ha sido aprobada y está en proceso.`, 'success');
            } else if (newSolicitud.estado === 'cancelado') {
              showStatusNotification('Solicitud Rechazada', `Su solicitud para ${newSolicitud.paciente} ha sido rechazada.`, 'error');
            }
          }
        });
        return data;
      });
    } catch (error) {
      console.error('Error al obtener las solicitudes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSolicitudes(true); // Carga inicial forzada
    const intervalId = setInterval(() => fetchSolicitudes(), 15000);
    return () => clearInterval(intervalId);
  }, [fetchSolicitudes]);

  const showStatusNotification = (title: string, message: string, type: 'success' | 'error') => {
    setStatusNotification({ show: true, message: `${title}: ${message}`, type });
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    setTimeout(() => {
      setStatusNotification({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await ambulanciaService.createSolicitud(formData);
      toast({
        title: "Éxito",
        description: "Solicitud creada correctamente.",
      });
      setFormData({
        paciente: '',
        origen: '',
        destino: '',
        fecha: '',
        prioridad: 'media',
      });
      setIsModalOpen(false);
      fetchSolicitudes(true); // Forzar actualización después de crear una nueva solicitud
    } catch (error) {
      console.error('Error al crear la solicitud:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la solicitud.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, prioridad: value as 'baja' | 'media' | 'alta' });
  };




  return (
    <GeneralLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Centro de Control de Ambulancias</h1>
        <div className="grid grid-cols-1 gap-8">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-semibold text-gray-700 flex items-center">
                <ClipboardList className="mr-2 h-6 w-6" />
                Solicitudes Pendientes
              </CardTitle>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Solicitud
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800">Nueva Solicitud de Ambulancia</DialogTitle>
                    <DialogDescription>
                      Complete los detalles para crear una nueva solicitud de ambulancia.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="paciente">Paciente</Label>
                      <Input
                        id="paciente"
                        name="paciente"
                        value={formData.paciente}
                        onChange={handleInputChange}
                        placeholder="Nombre del paciente"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="origen">Origen</Label>
                      <Input
                        id="origen"
                        name="origen"
                        value={formData.origen}
                        onChange={handleInputChange}
                        placeholder="Lugar de origen"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destino">Destino</Label>
                      <Input
                        id="destino"
                        name="destino"
                        value={formData.destino}
                        onChange={handleInputChange}
                        placeholder="Lugar de destino"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha">Fecha y Hora</Label>
                      <Input
                        id="fecha"
                        name="fecha"
                        type="datetime-local"
                        value={formData.fecha}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prioridad">Prioridad</Label>
                      <Select onValueChange={handleSelectChange} value={formData.prioridad}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baja">Baja</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Enviar Solicitud
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
           
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Solicitudes Pendientes</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-inner p-4 overflow-x-auto">
                <SolicitudesTable
                  solicitudes={solicitudes}
                  tipoVista={'enviar'}
                />
              </div>
            )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Notificación de estado de la solicitud */}
      {statusNotification.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
          statusNotification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white flex items-center`}>
          {statusNotification.type === 'success' ? (
            <CheckCircle className="mr-2 h-5 w-5" />
          ) : (
            <XCircle className="mr-2 h-5 w-5" />
          )}
          {statusNotification.message}
        </div>
      )}
    </GeneralLayout>
  );
}