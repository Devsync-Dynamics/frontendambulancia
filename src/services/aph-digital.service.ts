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

export interface AphDigitalDto extends CreateAphDigitalDto {
  id: string
  fechaCreacion: string
  fechaActualizacion: string
}

class AphDigitalService {
  private readonly storageKey = "aph-digital-forms"

  private getStoredForms(): AphDigitalDto[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return []
    }
  }

  private saveToStorage(forms: AphDigitalDto[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(forms))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }

  async getAllAphDigital(): Promise<AphDigitalDto[]> {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 500))
    return this.getStoredForms()
  }

  async getAphDigitalById(id: string): Promise<AphDigitalDto | null> {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 300))

    const forms = this.getStoredForms()
    return forms.find((form) => form.id === id) || null
  }

  async createAphDigital(data: CreateAphDigitalDto): Promise<AphDigitalDto> {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const forms = this.getStoredForms()
    const newForm: AphDigitalDto = {
      ...data,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    }

    forms.push(newForm)
    this.saveToStorage(forms)

    return newForm
  }

  async updateAphDigital(id: string, data: CreateAphDigitalDto): Promise<AphDigitalDto | null> {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const forms = this.getStoredForms()
    const index = forms.findIndex((form) => form.id === id)

    if (index === -1) return null

    const updatedForm: AphDigitalDto = {
      ...forms[index],
      ...data,
      fechaActualizacion: new Date().toISOString(),
    }

    forms[index] = updatedForm
    this.saveToStorage(forms)

    return updatedForm
  }

  async deleteAphDigital(id: string): Promise<boolean> {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 500))

    const forms = this.getStoredForms()
    const filteredForms = forms.filter((form) => form.id !== id)

    if (filteredForms.length === forms.length) return false

    this.saveToStorage(filteredForms)
    return true
  }

  validateAphDigital(data: CreateAphDigitalDto): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validaciones requeridas
    if (!data.numeroFormulario?.trim()) {
      errors.push("El número de formulario es requerido")
    }

    if (!data.placa?.trim()) {
      errors.push("La placa es requerida")
    }

    if (!data.cc?.trim()) {
      errors.push("La C.C. es requerida")
    }

    if (!data.fecha?.trim()) {
      errors.push("La fecha es requerida")
    }

    if (!data.nombrePaciente?.trim()) {
      errors.push("El nombre del paciente es requerido")
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
      errors,
    }
  }
}

export const aphDigitalService = new AphDigitalService()
