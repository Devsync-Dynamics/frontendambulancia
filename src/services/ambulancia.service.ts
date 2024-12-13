import axios from 'axios';
import { toast } from '@/hooks/use-toast';


const API_URL = 'https://backendtraslado-production-4194.up.railway.app';

//const API_URL = 'http://localhost:3001';
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
  email: string;
  ambulancia: {
    id: number;
  }
}
 

export interface IEstadoAmbulancia {
  id: string;
  estado: string;
}

export interface IAmbulancia {
  id: number;
  placa: string;
  user: ITripulante[];
  estado: IEstadoAmbulancia;
  latitude: number;
  longitude: number;
  updatedAt: string;
  ubicacionActual: string;
  distancia?: number;
}

export interface AmbulanciaFormData {
  placa: string;
  tripulacion: ITripulante[];
  estado: IEstadoAmbulancia;
  ubicacionActual: string;
  latitude?: number;
  longitude?: number;
}

export interface Solicitud {
  id: string;
  paciente: string;
  origen: string;
  destino: string;
  fecha: string;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  prioridad: 'baja' | 'media' | 'alta';
}

export interface CreateSolicitudDto {
  paciente: string;
  origen: string;
  destino: string;
  fecha: string;
  prioridad: 'baja' | 'media' | 'alta';
}


export const ambulanciaService = {

  getEstadosAmbulancia: async (): Promise<IEstadoAmbulancia[]> => {
    try {
      const response = await api.get('/estado-ambulancia');
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los estados de ambulancia",
        variant: "destructive",
      });
      return [];
    }
  },

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
      const response = await api.get('/users/tripulacion');
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

  getFilteredTripulantes: async (): Promise<number | null> => {
    try {
      // Obtener todos los tripulantes
      const allTripulantes = await ambulanciaService.getTripulantes();
  
      // Obtener el ID del tripulante almacenado en localStorage
      const storedTripulanteId = localStorage.getItem('user');
      
      if (storedTripulanteId) {
        // Buscar el tripulante basándose en el ID almacenado
        const foundTripulante = allTripulantes.find(tripulante => tripulante.email === storedTripulanteId);
        console.log('Tripulante encontrado:', foundTripulante);
        return foundTripulante?.ambulancia.id || null;  // Si no se encuentra, devuelve `null`
      } else {
        // Si no hay IDs almacenados en localStorage, retornar `null` o algún valor por defecto
        return null;
      }
    } catch (error) {
      console.error("Error al filtrar tripulantes:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al filtrar los tripulantes",
        variant: "destructive",
      });
      return null;
    }
  },
  

  createAmbulancia: async (formData: AmbulanciaFormData): Promise<IAmbulancia | null> => {
    try {
      const tripulacionIds = formData.tripulacion.map(t => t.id);
      const response = await api.post('/ambulancia', {
        placa: formData.placa,
        tripulacionIds,
        estadoAmbulanciaId: formData.estado.id, // Usar estado.id para el backend
        ubicacionActual: formData.ubicacionActual,
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
        placa: formData.placa,
        tripulacionIds,
        estadoAmbulanciaId: formData.estado.id, // Usar estado.id para el backend
        ubicacionActual: formData.ubicacionActual,
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
      const response = await api.get('/ambulancia/nearest', {
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
  },

  updateLocation: async (id: number, latitude: number, longitude: number): Promise<IAmbulancia | null> => {
    
    try {
     const ubicacionActual = await ambulanciaService.getLocationNeighbourhood(latitude,longitude);
     console.log('esto se va a enviar', ubicacionActual)
      const response = await api.patch(`/ambulancia/update/location/${id}`, {
        latitude, 
        longitude,
        ubicacionActual        
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la ubicacion actual de la ambulancia ",
        variant: "destructive",
      });
      return null;
    }
  },

  getLocationNeighbourhood: async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
  
      if (data.address) {
        const { road = '', neighbourhood = '', county = '' } = data.address;
        return `${road} ${neighbourhood} ${county}`.trim();
      } else {
        throw new Error('No address data found');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      throw new Error('No se pudo obtener la ubicación actual de la ambulancia');
    }
  },


  //SERVICIO PARA LAS SOLICITUDES

  async getSolicitudes(): Promise<Solicitud[]> {
    const response = await axios.get<Solicitud[]>(`${API_URL}/solicitudes`);
    return response.data;
  },

  async createSolicitud(solicitud: CreateSolicitudDto): Promise<Solicitud> {
    const response = await axios.post<Solicitud>(`${API_URL}/solicitudes`, solicitud);
    return response.data;
  },

  async updateSolicitud(id: string, estado: string): Promise<Solicitud> {
    const response = await axios.patch<Solicitud>(`${API_URL}/solicitudes/${id}`, { estado });
    return response.data;
  },
  
};