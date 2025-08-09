import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// Usar la misma configuración de API
//const API_URL = 'https://backendamed-production.up.railway.app';

const API_URL = 'http://localhost:3001';
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface para medicamentos e insumos
export interface IMedicamentoInsumo {
  id?: string; // Para manejo en frontend
  nombre: string;
  dosis: string;
  via: string;
  frecuencia: string;
}

// Interface principal para AphDigital ajustada a los campos del formulario
export interface IAphDigital {
  id?: number;

  // Información básica (requeridos)
  numeroFormulario: string;
  placa: string;
  cc: string;
  fecha: string; // Date como string para el frontend
  nombrePaciente: string;

  // Campos adicionales del formulario
  horaLlegada?: string;
  estadoPaciente?: string;

  // Tipo de servicio
  ambulanciaBasica?: boolean;
  medicalizado?: boolean;
  consultaMedica?: boolean;

  // Información del paciente
  edad?: number;
  sexo?: 'M' | 'F';
  identificacion?: string;
  estadoCivil?: 'Soltero' | 'Casado' | 'Viudo' | 'Divorciado' | 'Union Libre';
  eps?: string;
  arl?: string;
  direccion?: string;
  telefono?: string;

  // Diagnóstico y evolución
  diagnostico?: string;
  notaEvolucion?: string;
  procedimientos?: string;

  // Signos Vitales
  fc?: string; // Frecuencia cardíaca
  fr?: string; // Frecuencia respiratoria
  temp?: string; // Temperatura
  ta?: string; // Tensión arterial
  spo2?: string; // Saturación de oxígeno
  glasgow?: string; // Escala de Glasgow
  peso?: string; // Peso en kg
  talla?: string; // Talla en cm

  // Campos del servicio original que pueden ser útiles
  aceptadoPor?: string;
  estadoclinicopac?: string;

  // Oxígeno y equipos (del DTO original)
  o2?: string;
  canulaNasal?: boolean;
  equipoVenturi?: boolean;
  porcentajeOxigeno?: string;
  mascaraReservorio?: boolean;
  via?: string;
  ccVia?: string;
  via2?: string;
  ccVia2?: string;

  // Equipos adicionales (del DTO original)
  equipoMultiparametro?: boolean;
  ventiladorMecanico?: boolean;
  valvulaPeep?: boolean;
  desfibrilador?: boolean;
  joules?: boolean;
  aspirador?: boolean;
  capnografo?: boolean;
  pulmoaire?: boolean;

  // Información de transporte (del DTO original)
  ambulanciaSolicitada?: string;
  direccionServicio?: string;
  tel?: string;
  destinoPaciente?: string;
  estudio?: string;

  // Horarios (del DTO original)
  horarioLL1?: string;
  horarioSa1?: string;
  horarioLL2?: string;
  horarioSa2?: string;
  horarioLL3?: string;
  horarioSa3?: string;
  horarioLL4?: string;
  horarioSa4?: string;

  // Tipo de servicio de ambulancia (del DTO original)
  servicioSimple?: boolean;
  redondo?: boolean;
  fallido?: boolean;
  direccionTrasladoPaciente?: string;

  // Responsable del paciente (del DTO original)
  responsablePaciente?: string;
  acompanante?: string;
  ccAcompanante?: string;
  recomendacionesTraslado?: string;

  // Medicamentos e insumos (ajustado al formulario)
  medicamentosInsumos?: IMedicamentoInsumo[];

  // Información del servicio (del formulario)
  ordenServicioNo?: string;
  remision?: string;
  factura?: string;
  lugarOcurrencia?: string;
  destinoFinal?: string;

  // Evaluación del servicio (del DTO original)
  comoParecioServicio?: 'MUY_BUENA' | 'BUENA' | 'REGULAR' | 'MALA' | 'MUY_MALA';

  // Recomendaciones (del DTO original)
  definitivamenteSi?: boolean;
  probablementeSi?: boolean;
  definitivamenteNo?: boolean;
  probablementeNo?: boolean;

  // Firmas y autorización (del formulario)
  firmaMedico?: string;
  nombreMedico?: string;
  registroMedico?: string;
  firmaPaciente?: string;
  nombreResponsable?: string;
  parentesco?: string;

  // Firmas y funcionarios (del DTO original)
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
  getAphDigitalById: async (id: number | string): Promise<IAphDigital | null> => {
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
      // Procesar medicamentos antes de enviar
      const processedData = {
        ...formData,
        medicamentosInsumos: formData.medicamentosInsumos?.map(med => ({
          nombre: med.nombre || '',
          dosis: med.dosis || '',
          via: med.via || '',
          frecuencia: med.frecuencia || ''
        })) || []
      };
console.log("DATA A GUARDAR",processedData)
      const response = await api.post('/aph-digital', processedData);

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
  updateAphDigital: async (id: string | string[] | undefined, formData: UpdateAphDigitalDto): Promise<IAphDigital | null> => {
    try {
      // Procesar medicamentos antes de enviar
      const processedData = {
        ...formData,
        medicamentosInsumos: formData.medicamentosInsumos?.map(med => ({
          nombre: med.nombre || '',
          dosis: med.dosis || '',
          via: med.via || '',
          frecuencia: med.frecuencia || ''
        })) || []
      };

      const response = await api.patch(`/aph-digital/${id}`, processedData);

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

    // Validar medicamentos
    if (formData.medicamentosInsumos && formData.medicamentosInsumos.length > 0) {
      formData.medicamentosInsumos.forEach((med, index) => {
        if (med.nombre && med.nombre.trim() && !med.dosis?.trim()) {
          errors.push(`El medicamento ${index + 1} requiere especificar la dosis`);
        }
        if (med.nombre && med.nombre.trim() && !med.via?.trim()) {
          errors.push(`El medicamento ${index + 1} requiere especificar la vía de administración`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }


};