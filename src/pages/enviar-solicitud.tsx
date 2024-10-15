import React, { useState } from 'react';
import GeneralLayout from '../components/GeneralLayout';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ambulanciaService, CreateSolicitudDto } from '@/services/ambulancia.service';

export default function EnviarSolicitud() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CreateSolicitudDto>({
    paciente: '',
    origen: '',
    destino: '',
    fecha: '',
    prioridad: 'media',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSelectChange = (value: 'baja' | 'media' | 'alta') => {
    setFormData(prevData => ({
      ...prevData,
      prioridad: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await ambulanciaService.createSolicitud(formData);
      toast({
        title: "Solicitud enviada",
        description: "La solicitud de traslado ha sido enviada con éxito.",
      });
      setFormData({
        paciente: '',
        origen: '',
        destino: '',
        fecha: '',
        prioridad: 'media',
      });
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GeneralLayout>
      <div className="p-6 bg-gradient-to-br from-blue-900 to-indigo-900 min-h-screen">
        <h1 className="text-3xl font-bold text-white mb-6">Enviar Solicitud de Traslado</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md bg-white p-6 rounded-lg shadow-md">
          <div>
            <label htmlFor="paciente" className="block text-sm font-medium text-gray-700">Paciente</label>
            <Input
              id="paciente"
              name="paciente"
              value={formData.paciente}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="origen" className="block text-sm font-medium text-gray-700">Origen</label>
            <Input
              id="origen"
              name="origen"
              value={formData.origen}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="destino" className="block text-sm font-medium text-gray-700">Destino</label>
            <Input
              id="destino"
              name="destino"
              value={formData.destino}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
            <Input
              id="fecha"
              name="fecha"
              type="datetime-local"
              value={formData.fecha}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700">Prioridad</label>
            <Select onValueChange={handleSelectChange} value={formData.prioridad}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccione la prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </form>
      </div>
    </GeneralLayout>
  );
}