import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// Usar la misma configuración de API
const API_URL = 'http://localhost:3001';
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface para AphDigital basada en la entidad
export interface IAphDigital {
  id?: number;
  // Información básica
  numeroFormulario: string;
  placa: string;
  cc: string;
  fecha: string; // Date como string para el frontend
  nombrePaciente: string;

  // Tipo de servicio
  ambulanciaBasica?: boolean;
  medicalizado?: boolean;
  consultaMedica?: boolean;
  edad?: number;
  sexo?: 'M' | 'F';
  identificacion?: string;
  estadoCivil?: 'Soltero' | 'Casado' | 'Viudo' | 'Divorciado' | 'Union Libre';
  diagnostico?: string;
  notaEvolucion?: string;

  // Signos Vitales
  fc?: string; // Frecuencia cardíaca
  fr?: string; // Frecuencia respiratoria
  temp?: string; // Temperatura
  ta?: string; // Tensión arterial
  aceptadoPor?: string;
  estadoclinicopac?: string;
  eps?: string;
  arl?: string;

  // Oxígeno y equipos
  o2?: string;
  canulaNasal?: boolean;
  equipoVenturi?: boolean;
  porcentajeOxigeno?: string;
  mascaraReservorio?: boolean;
  via?: string;
  ccVia?: string;
  via2?: string;
  ccVia2?: string;

  // Equipos adicionales
  equipoMultiparametro?: boolean;
  ventiladorMecanico?: boolean;
  valvulaPeep?: boolean;
  desfibrilador?: boolean;
  joules?: boolean;
  aspirador?: string;
  capnografo?: boolean;
  pulmoaire?: boolean;

  // Información de transporte
  ambulanciaSolicitada?: string;
  direccionServicio?: string;
  tel?: string;
  destinoPaciente?: string;
  estudio?: string;

  // Horarios
  horarioLL1?: string;
  horarioSa1?: string;
  horarioLL2?: string;
  horarioSa2?: string;
  horarioLL3?: string;
  horarioSa3?: string;
  horarioLL4?: string;
  horarioSa4?: string;

  // Tipo de servicio de ambulancia
  servicioSimple?: boolean;
  redondo?: boolean;
  fallido?: boolean;
  direccionTrasladoPaciente?: string;

  // Responsable del paciente
  responsablePaciente?: string;
  acompanante?: string;
  ccAcompanante?: string;
  recomendacionesTraslado?: string;

  // Medicamentos e insumos
  medicamentosInsumos?: {
    descripcion: string;
    cantidad: number;
  }[];

  // Información del servicio
  ordenServicioNo?: string;
  remision?: string;
  factura?: string;
  comoParecioServicio?: 'MUY_BUENA' | 'BUENA' | 'REGULAR' | 'MALA' | 'MUY_MALA';

  // Recomendaciones
  definitivamenteSi?: boolean;
  probablementeSi?: boolean;
  definitivamenteNo?: boolean;
  probablementeNo?: boolean;

  // Firmas y funcionarios
  firmaSelloResponsable?: string;
  funcionarioAMED?: string;
  firmaInstitucionRecibePaciente?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// DTO para crear AphDigital (sin id, createdAt, updatedAt)
export interface CreateAphDigitalDto extends Omit<IAphDigital, 'id' | 'createdAt' | 'updatedAt'> {}

// DTO para actualizar AphDigital (todos los campos opcionales excepto los requeridos)
export interface UpdateAphDigitalDto extends Partial<CreateAphDigitalDto> {}

// Interface para filtros de búsqueda
export interface IAphDigitalFilters {
  fechaInicio?: string;
  fechaFin?: string;
  nombrePaciente?: string;
  placa?: string;
  eps?: string;
  tipoServicio?: 'ambulanciaBasica' | 'medicalizado' | 'consultaMedica';
}

// Servicio para AphDigital
export const aphDigitalService = {
  
  // Obtener todos los formularios APH o con filtros
  getAphDigitals: async (filters?: IAphDigitalFilters): Promise<IAphDigital[]> => {
    try {
      const response = await api.get('/aph-digital', {
        params: filters
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los formularios APH",
        variant: "destructive",
      });
      return [];
    }
  },

  // Obtener un formulario APH por ID
  getAphDigitalById: async (id: number): Promise<IAphDigital | null> => {
    try {
      const response = await api.get(`/aph-digital/${id}`);
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el formulario APH",
        variant: "destructive",
      });
      return null;
    }
  },

  // Obtener formulario APH por número de formulario
  getAphDigitalByNumero: async (numeroFormulario: string): Promise<IAphDigital | null> => {
    try {
      const response = await api.get(`/aph-digital/numero/${numeroFormulario}`);
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo encontrar el formulario APH",
        variant: "destructive",
      });
      return null;
    }
  },

  // Obtener formularios APH por nombre de paciente
  getAphDigitalByPaciente: async (nombrePaciente: string): Promise<IAphDigital[]> => {
    try {
      const response = await api.get(`/aph-digital/paciente/${nombrePaciente}`);
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron encontrar formularios para el paciente",
        variant: "destructive",
      });
      return [];
    }
  },

  // Obtener formularios APH por fecha específica
  getAphDigitalByFecha: async (fecha: string): Promise<IAphDigital[]> => {
    try {
      const response = await api.get(`/aph-digital/fecha/${fecha}`);
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron encontrar formularios para la fecha especificada",
        variant: "destructive",
      });
      return [];
    }
  },

  // Crear un nuevo formulario APH
  createAphDigital: async (formData: CreateAphDigitalDto): Promise<IAphDigital | null> => {
    try {
      const response = await api.post('/aph-digital', formData);
      
      toast({
        title: "Éxito",
        description: "Formulario APH creado correctamente",
      });
      
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el formulario APH",
        variant: "destructive",
      });
      return null;
    }
  },

  // Actualizar un formulario APH existente
  updateAphDigital: async (id: number, formData: UpdateAphDigitalDto): Promise<IAphDigital | null> => {
    try {
      const response = await api.patch(`/aph-digital/${id}`, formData);
      
      toast({
        title: "Éxito",
        description: "Formulario APH actualizado correctamente",
      });
      
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el formulario APH",
        variant: "destructive",
      });
      return null;
    }
  },

  // Eliminar un formulario APH
  deleteAphDigital: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/aph-digital/${id}`);
      toast({
        title: "Éxito",
        description: "Formulario APH eliminado correctamente",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el formulario APH",
        variant: "destructive",
      });
      return false;
    }
  },

  // Buscar con múltiples filtros (método conveniente)
  searchAphDigitals: async (filters: IAphDigitalFilters): Promise<IAphDigital[]> => {
    return await aphDigitalService.getAphDigitals(filters);
  },

  // Validar formulario antes de enviar
  validateAphDigital: (formData: CreateAphDigitalDto): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validaciones básicas requeridas
    if (!formData.numeroFormulario?.trim()) {
      errors.push("El número de formulario es requerido");
    }
    if (!formData.placa?.trim()) {
      errors.push("La placa de la ambulancia es requerida");
    }
    if (!formData.cc?.trim()) {
      errors.push("La cédula es requerida");
    }
    if (!formData.fecha) {
      errors.push("La fecha es requerida");
    }
    if (!formData.nombrePaciente?.trim()) {
      errors.push("El nombre del paciente es requerido");
    }

    // Validaciones de formato
    if (formData.cc && !/^\d+$/.test(formData.cc)) {
      errors.push("La cédula debe contener solo números");
    }
    
    if (formData.edad && (formData.edad < 0 || formData.edad > 150)) {
      errors.push("La edad debe estar entre 0 y 150 años");
    }

    // Validar signos vitales si están presentes
    if (formData.fc && !/^\d+$/.test(formData.fc)) {
      errors.push("La frecuencia cardíaca debe ser un número");
    }
    if (formData.fr && !/^\d+$/.test(formData.fr)) {
      errors.push("La frecuencia respiratoria debe ser un número");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};