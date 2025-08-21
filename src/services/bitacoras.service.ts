import axios from 'axios';
import {toast} from '@/hooks/use-toast';

// Usar la misma configuración de API
const API_URL = 'https://backendamed-production.up.railway.app';
//const API_URL = 'http://localhost:3001';
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interfaz para un registro de bitácora
export interface IBitacoraEntry {
    no: number;
    radioOperador: string;
    entidad: string;
    arl: string;
    contacto: string;
    nombrePaciente: string;
    tipoDocumento: string;
    documento: string;
    nombreAcompanante: string;
    fechaTraslado: string;
    horaTraslado: string;
    origen: string;
    destino: string;
    tipoTraslado: string;
    conductor: string;
    paramedico: string;
    diagnostico: string;
    //evolucion: string;
    codigo: string;
    mv: string;
    medico: string;
    observacion: string;
    valor: string;
    //noPlanilla: string;
}

// DTO para crear un registro (omitimos el campo 'no' si se autogenera)
export interface CreateBitacoraDto extends Omit<IBitacoraEntry, 'no'> {
}

// DTO para actualizar un registro (todos opcionales salvo 'no')
export interface UpdateBitacoraDto extends Partial<CreateBitacoraDto> {
    no: number;
}

// Filtros de búsqueda
export interface IBitacoraFilters {
    nombrePaciente?: string;
    entidad?: string;
    arl?: string;
    tipoTraslado?: string;
    fechaInicio?: string;
    fechaFin?: string;
}

// Servicio de Bitácora
export const bitacoraService = {
    // Obtener todos los registros o con filtros
    getEntries: async (filters?: IBitacoraFilters): Promise<IBitacoraEntry[]> => {
        try {
            const response = await api.get<{
                message: string;
                data: IBitacoraEntry[];
                count: number;
            }>('/bitacoras', {
                params: filters,
            });
            return response.data.data || [];
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los registros de bitácora',
                variant: 'destructive',
            });
            return [];
        }
    },

    // Obtener un registro por su número
    getEntryById: async (no: number): Promise<IBitacoraEntry | null> => {
        try {
            const response = await api.get<IBitacoraEntry>(`/bitacora/${no}`);
            return response.data;
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo cargar el registro de bitácora',
                variant: 'destructive',
            });
            return null;
        }
    },

    // Crear un nuevo registro de bitácora
    //createEntry: async (data: CreateBitacoraDto): Promise<IBitacoraEntry | null> => {
    //  try {
    //   const response = await api.post<IBitacoraEntry>('/bitacora', data);
    //   toast({
    //       title: 'Éxito',
    //      description: 'Registro de bitácora creado correctamente',
    //  });
    //   return response.data;
    // } catch (error) {
    //  toast({
    //     title: 'Error',
    //      description: 'No se pudo crear el registro de bitácora',
    //      variant: 'destructive',
    //  });
    //   return null;
    //  }
    // },

    // Actualizar un registro existente
    updateEntry: async (data: UpdateBitacoraDto): Promise<IBitacoraEntry | null> => {
        try {
            const {no, ...rest} = data;
            const response = await api.patch<IBitacoraEntry>(`/bitacora/${no}`, rest);
            toast({
                title: 'Éxito',
                description: 'Registro de bitácora actualizado correctamente',
            });
            return response.data;
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo actualizar el registro de bitácora',
                variant: 'destructive',
            });
            return null;
        }
    },

    // Eliminar un registro
    deleteEntry: async (no: number): Promise<boolean> => {
        try {
            await api.delete(`/bitacora/${no}`);
            toast({
                title: 'Éxito',
                description: 'Registro de bitácora eliminado correctamente',
            });
            return true;
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo eliminar el registro de bitácora',
                variant: 'destructive',
            });
            return false;
        }
    },


    searchEntries: async (filters: IBitacoraFilters): Promise<IBitacoraEntry[]> => {
        return bitacoraService.getEntries(filters);
    },
};
