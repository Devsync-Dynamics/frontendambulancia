export interface MedicamentoInsumo {
  id: string
  nombre: string
  dosis: string
  via: string
  frecuencia: string
}

export interface CreateAphDigitalDto {
  numeroFormulario: string
  placa: string
  cc: string
  fecha: string
  nombrePaciente: string
  horaLlegada?: string // Nuevo campo para hora de llegada

  // Tipo de servicio
  ambulanciaBasica?: boolean
  medicalizado?: boolean
  consultaMedica?: boolean

  // Información del paciente
  edad?: number
  sexo?: string
  identificacion?: string
  estadoCivil?: string
  eps?: string
  arl?: string
  estadoPaciente?: string // Nuevo campo seleccionable
  direccion?: string
  telefono?: string

  // Diagnóstico y evolución
  diagnostico?: string
  notaEvolucion?: string
  procedimientos?: string

  // Signos vitales
  fc?: string
  fr?: string
  temp?: string
  ta?: string
  spo2?: string
  glasgow?: string
  peso?: string
  talla?: string

  // Medicamentos
  medicamentosInsumos: MedicamentoInsumo[]

  // Información del servicio (sin remisión)
  ordenServicioNo?: string
  factura?: string
  lugarOcurrencia?: string
  destinoFinal?: string

  // Firmas
  firmaMedico?: string
  nombreMedico?: string
  registroMedico?: string
  firmaPaciente?: string
  nombreResponsable?: string
  parentesco?: string
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

class AphDigitalService {
  private readonly storageKey = "aph-digital-forms"

  private getStoredForms(): AphDigitalDto[] {
    if (typeof window === "undefined") return []

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
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el formulario APH",
        variant: "destructive",
      });
      return null;
    }
  },

  private saveToStorage(forms: AphDigitalDto[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(forms))
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
    if (data.edad && (data.edad < 0 || data.edad > 150)) {
      errors.push("La edad debe estar entre 0 y 150 años")
    }

    // Validar medicamentos
    if (data.medicamentosInsumos) {
      data.medicamentosInsumos.forEach((med, index) => {
        if (med.nombre && !med.dosis) {
          errors.push(`El medicamento ${index + 1} requiere especificar la dosis`)
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};