import axios from 'axios';
import { toast } from '@/hooks/use-toast';

const API_URL = 'https://backendtraslado-production.up.railway.app';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ITripulante {
  id: number;
  nombre: string;
  apellido: string;
  idrol: 'PARAMEDICO' | 'CONDUCTOR' | 'ENFERMERO' | 'MEDICO';
}

export interface IAmbulancia {
  id: number;
  placa: string;
  user: ITripulante[];
  estado: {
    id: string;
    estado: string;
  };
  latitude: number;
  longitude: number;
  ultimaActualizacion: string;
  ubicacionActual: string;
  distancia?: number;
}

export interface AmbulanciaFormData {
  placa: string;
  tripulacion: ITripulante[];
  estadoId: string;
  ubicacionActual: string;
  latitude?: number;
  longitude?: number;
}

export const ambulanciaService = {
  getAmbulancias: async (): Promise<IAmbulancia[]> => {
    try {
      const response = await api.get('/ambulancia');
      return response.data;

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las ambulancias",
        variant: "destructive",
      });
      return [];
    }
  },

  getTripulantes: async (): Promise<ITripulante[]> => {
    try {
      const response = await api.get('/user/tripulantes');
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los tripulantes",
        variant: "destructive",
      });
      return [];
    }
  },

  createAmbulancia: async (formData: AmbulanciaFormData): Promise<IAmbulancia | null> => {
    try {
      const tripulacionIds = formData.tripulacion.map(t => t.id);
      const response = await api.post('/ambulancia', {
        ...formData,
        tripulacionIds,
        latitude: formData.latitude || 10.9639,
        longitude: formData.longitude || -74.7964,
      });
      
      toast({
        title: "Éxito",
        description: "Ambulancia creada correctamente",
      });
      
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la ambulancia",
        variant: "destructive",
      });
      return null;
    }
  },

  updateAmbulancia: async (id: number, formData: AmbulanciaFormData): Promise<IAmbulancia | null> => {
    try {
      const tripulacionIds = formData.tripulacion.map(t => t.id);
      const response = await api.patch(`/ambulancia/${id}`, {
        ...formData,
        tripulacionIds,
      });
      
      toast({
        title: "Éxito",
        description: "Ambulancia actualizada correctamente",
      });
      
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la ambulancia",
        variant: "destructive",
      });
      return null;
    }
  },

  deleteAmbulancia: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/ambulancia/${id}`);
      toast({
        title: "Éxito",
        description: "Ambulancia eliminada correctamente",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la ambulancia",
        variant: "destructive",
      });
      return false;
    }
  },

  findNearestambulancia: async (latitude: number, longitude: number): Promise<IAmbulancia | null> => {
    try {
      const response = await api.get('/ambulancias/nearest', {
        params: { latitude, longitude }
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo encontrar la ambulancia más cercana",
        variant: "destructive",
      });
      return null;
    }
  }

};