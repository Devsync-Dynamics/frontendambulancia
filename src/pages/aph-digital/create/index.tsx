"use client"

import type React from "react"

import {useState} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Checkbox} from "@/components/ui/checkbox"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {ArrowLeft, Save, FileText, Plus, Trash2} from 'lucide-react'
import Link from "next/link"
import {type CreateAphDigitalDto, aphDigitalService} from "@/services/aph-digital.service"
import {SignatureField} from "@/components/signature-field"
import GeneralLayout from "@/components/GeneralLayout";
import {DiagnosticoCombobox} from "@/components/ui/diagnostico-combobox";

export default function CreateAphDigitalPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Obtener hora actual del sistema en formato 24h
    const getCurrentTime = () => {
        const now = new Date()
        const hours = now.getHours().toString().padStart(2, '0')
        const minutes = now.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}` // Formato HH:MM en 24h
    }

    const [formData, setFormData] = useState<CreateAphDigitalDto>({
        numeroFormulario: "",
        placa: "",
        cc: "",
        fecha: new Date().toISOString().split("T")[0],
        nombrePaciente: "",
        horaLlegada: getCurrentTime(),
        medicamentosInsumos: [],
        estadoPaciente: "",
        diagnostico: "",
        nombreConductor:"",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const validation = aphDigitalService.validateAphDigital(formData)
        if (!validation.isValid) {
            alert("Errores de validación:\n" + validation.errors.join("\n"))
            setLoading(false)
            return
        }

        const result = await aphDigitalService.createAphDigital(formData)
        if (result) {
            router.push("/aph-digital")
        }
        setLoading(false)
    }

    const updateFormData = (field: keyof CreateAphDigitalDto, value: any) => {
        setFormData((prev) => ({...prev, [field]: value}))
    }

    // Función para validar formato de hora 24h
    const validateTimeFormat = (time: string): boolean => {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        return timeRegex.test(time)
    }

    // Función para formatear hora a 24h
    const formatTo24Hour = (time: string): string => {
        if (!time) return ""

        // Si ya está en formato correcto, retornarlo
        if (validateTimeFormat(time)) return time

        // Intentar parsear y formatear
        try {
            const [hours, minutes] = time.split(':')
            const h = parseInt(hours, 10)
            const m = parseInt(minutes, 10)

            if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
                return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
            }
        } catch (error) {
            console.error('Error formatting time:', error)
        }

        return time
    }

    // BUSCA ESTA SECCIÓN EN TU CÓDIGO (líneas aproximadamente 98-160):
// Componente personalizado para input de tiempo 24h
    const TimeInput24 = ({
                             id,
                             value,
                             onChange,
                             className,
                             required = false,
                             placeholder = "HH:MM"
                         }: {
        id: string
        value: string
        onChange: (value: string) => void
        className?: string
        required?: boolean
        placeholder?: string
    }) => {
        // ====== REEMPLAZA TODO ESTE BLOQUE CON EL CÓDIGO DE ABAJO ======

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let newValue = e.target.value;

            // Remover caracteres que no sean números o ':'
            newValue = newValue.replace(/[^0-9:]/g, '');

            // Si el usuario está escribiendo y llegó al carácter 2, agregar ':' automáticamente
            if (newValue.length === 2 && !newValue.includes(':') && /^\d{2}$/.test(newValue)) {
                // Validar que las horas sean válidas (00-23)
                const hours = parseInt(newValue, 10);
                if (hours <= 23) {
                    newValue = newValue + ':';
                } else {
                    newValue = '23:';
                }
            }

            // Limitar la longitud máxima
            if (newValue.length > 5) {
                newValue = newValue.substring(0, 5);
            }

            // Si está completo (HH:MM), validar minutos
            if (newValue.length === 5 && newValue.includes(':')) {
                const parts = newValue.split(':');
                if (parts.length === 2) {
                    let hours = parseInt(parts[0], 10);
                    let minutes = parseInt(parts[1], 10);

                    // Validar y corregir horas
                    if (isNaN(hours) || hours > 23) {
                        hours = 23;
                    }

                    // Validar y corregir minutos
                    if (isNaN(minutes) || minutes > 59) {
                        minutes = 59;
                    }

                    // Formatear con ceros a la izquierda solo si está completo
                    if (!isNaN(hours) && !isNaN(minutes)) {
                        newValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    }
                }
            }

            onChange(newValue);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            // Permitir teclas de navegación y control
            const allowedKeys = [
                'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'Home', 'End'
            ];

            // Permitir Ctrl+A, Ctrl+C, Ctrl+V, etc.
            if (e.ctrlKey || e.metaKey) {
                return;
            }

            // Si es una tecla permitida, dejar pasar
            if (allowedKeys.includes(e.key)) {
                return;
            }

            // Solo permitir números y ':'
            if (!/[0-9:]/.test(e.key)) {
                e.preventDefault();
            }
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            let finalValue = e.target.value;

            // Si hay algo escrito pero está incompleto, intentar completarlo
            if (finalValue && finalValue.length > 0) {
                // Si solo tiene 1 dígito, asumir que son las horas y completar
                if (finalValue.length === 1 && /^\d$/.test(finalValue)) {
                    finalValue = `0${finalValue}:00`;
                }
                // Si tiene 2 dígitos, agregar :00
                else if (finalValue.length === 2 && /^\d{2}$/.test(finalValue)) {
                    const hours = parseInt(finalValue, 10);
                    if (hours <= 23) {
                        finalValue = `${finalValue}:00`;
                    } else {
                        finalValue = `23:00`;
                    }
                }
                // Si tiene HH:M (4 caracteres), completar minutos
                else if (finalValue.length === 4 && finalValue.includes(':')) {
                    const parts = finalValue.split(':');
                    if (parts.length === 2 && parts[1].length === 1) {
                        const minutes = parseInt(parts[1], 10);
                        if (minutes <= 5) {
                            finalValue = `${parts[0]}:0${parts[1]}`;
                        } else {
                            finalValue = `${parts[0]}:${parts[1]}0`;
                        }
                    }
                }

                // Validación final
                const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (timeRegex.test(finalValue)) {
                    const parts = finalValue.split(':');
                    const formattedTime = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
                    if (formattedTime !== value) {
                        onChange(formattedTime);
                    }
                }
            }
        };

        return (
            <Input
                id={id}
                type="text"
                value={value || ""}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className={className}
                placeholder={placeholder}
                maxLength={5}
                title="Formato: HH:MM (24 horas). Ejemplo: 14:30"
                required={required}
            />
        );
    };

    const addMedicamento = () => {
        const newMedicamento = {
            id: Date.now().toString(),
            nombre: "",
            dosis: "",
            via: "",
            frecuencia: "",
        }
        setFormData((prev) => ({
            ...prev,
            medicamentosInsumos: [...(prev.medicamentosInsumos || []), newMedicamento],
        }))
    }

    const removeMedicamento = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            medicamentosInsumos: (prev.medicamentosInsumos || []).filter((med) => med.id !== id),
        }))
    }

    const updateMedicamento = (id: string, field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            medicamentosInsumos: (prev.medicamentosInsumos || []).map((med) =>
                med.id === id ? {...med, [field]: value} : med
            ),
        }))
    }

    return (
        <GeneralLayout>
            <div className="min-h-screen medical-bg-gradient">
                <div className="container mx-auto p-6 space-y-6">
                    <div className="flex items-center gap-4 animate-slide-in-up">
                        <Link href="/aph-digital">
                            <Button variant="outline" size="sm" className="medical-button-secondary bg-transparent">
                                <ArrowLeft className="h-4 w-4 mr-2"/>
                                Volver
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="medical-icon-wrapper">
                                <FileText className="h-6 w-6"/>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold medical-text-gradient">Nuevo Formulario APH</h1>
                                <p className="text-muted-foreground">Crear un nuevo formulario pre-hospitalario</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Información Básica */}
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Información Básica</CardTitle>
                                <CardDescription>Datos principales del formulario y paciente</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="numeroFormulario">Número de Formulario *</Label>
                                        <Input
                                            id="numeroFormulario"
                                            value={formData.numeroFormulario}
                                            onChange={(e) => updateFormData("numeroFormulario", e.target.value)}
                                            className="medical-input-focus"
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="placa">Placa *</Label>
                                        <Input
                                            id="placa"
                                            value={formData.placa}
                                            onChange={(e) => updateFormData("placa", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Ingrese la placa"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cc">C.C. *</Label>
                                        <Input
                                            id="cc"
                                            value={formData.cc}
                                            onChange={(e) => updateFormData("cc", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Ingrese el C.C"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fecha">Fecha *</Label>
                                        <Input
                                            id="fecha"
                                            type="date"
                                            value={formData.fecha}
                                            onChange={(e) => updateFormData("fecha", e.target.value)}
                                            className="medical-input-focus"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horaLlegada">Hora de Llegada (24h) *</Label>
                                        <TimeInput24
                                            id="horaLlegada"
                                            value={formData.horaLlegada || ""}
                                            onChange={(value) => updateFormData("horaLlegada", value)}
                                            className="medical-input-focus"
                                            required
                                            placeholder="HH:MM"
                                        />
                                        <p className="text-xs text-muted-foreground">Formato 24h (ej: 14:30 para 2:30 PM)</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nombrePaciente">Nombre del Paciente *</Label>
                                        <Input
                                            id="nombrePaciente"
                                            value={formData.nombrePaciente}
                                            onChange={(e) => updateFormData("nombrePaciente", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Nombre del paciente"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nombreConductor">Conductor. *</Label>
                                        <Input
                                            id="nombreConductor"
                                            value={formData.nombreConductor}
                                            onChange={(e) => updateFormData("nombreConductor", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Ingrese el Nombre del Conductor"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tipo de Servicio */}
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Tipo de Servicio</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-6">
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="ambulanciaBasica"
                                            checked={formData.ambulanciaBasica || false}
                                            onCheckedChange={(checked) => updateFormData("ambulanciaBasica", checked)}
                                        />
                                        <Label htmlFor="ambulanciaBasica">Ambulancia Básica</Label>
                                    </div>
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="medicalizado"
                                            checked={formData.medicalizado || false}
                                            onCheckedChange={(checked) => updateFormData("medicalizado", checked)}
                                        />
                                        <Label htmlFor="medicalizado">Medicalizado</Label>
                                    </div>
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="consultaMedica"
                                            checked={formData.consultaMedica || false}
                                            onCheckedChange={(checked) => updateFormData("consultaMedica", checked)}
                                        />
                                        <Label htmlFor="consultaMedica">Consulta Médica</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Información del Paciente */}
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Información del Paciente</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edad">Edad *</Label>
                                        <Input
                                            id="edad"
                                            type="number"
                                            value={formData.edad || ""}
                                            onChange={(e) => updateFormData("edad", Number.parseInt(e.target.value) || undefined)}
                                            className="medical-input-focus"
                                            placeholder="Edad real del paciente"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sexo">Sexo *</Label>
                                        <Select value={formData.sexo}
                                                onValueChange={(value) => updateFormData("sexo", value)} required>
                                            <SelectTrigger className="medical-select-focus">
                                                <SelectValue placeholder="Seleccionar"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="M">Masculino</SelectItem>
                                                <SelectItem value="F">Femenino</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tipoDocumento">Tipo de documento *</Label >
                                        <Select
                                            value={formData.tipoDocumento}
                                            onValueChange={(value) => updateFormData("tipoDocumento", value)} required>
                                            <SelectTrigger className="medical-select-focus">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CC">Cédula de ciudadanía</SelectItem>
                                                <SelectItem value="TI">Tarjeta de identidad</SelectItem>
                                                <SelectItem value="CE">Cédula de extranjería</SelectItem>
                                                <SelectItem value="PT">Perismiso de trabajo</SelectItem>
                                                <SelectItem value="RC">Registro civil</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="identificacion">Identificación *</Label>
                                        <Input
                                            id="identificacion"
                                            value={formData.identificacion || ""}
                                            onChange={(e) => updateFormData("identificacion", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Identificación del paciente"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-1">
                                        <Label htmlFor="estadoCivil">Estado Civil *</Label>
                                        <Select value={formData.estadoCivil}
                                                onValueChange={(value) => updateFormData("estadoCivil", value)} required>
                                            <SelectTrigger className="medical-select-focus">
                                                <SelectValue placeholder="Seleccionar"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Soltero">Soltero</SelectItem>
                                                <SelectItem value="Casado">Casado</SelectItem>
                                                <SelectItem value="Viudo">Viudo</SelectItem>
                                                <SelectItem value="Divorciado">Divorciado</SelectItem>
                                                <SelectItem value="Union Libre">Unión Libre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 md:col-span-3">
                                        <DiagnosticoCombobox
                                            name="diagnostico"
                                            label="Diagnóstico *"
                                            placeholder="Buscar o ingresar diagnóstico"
                                            value={formData.diagnostico || ""}
                                            onChange={(value) => updateFormData("diagnostico", value)}
                                            required
                                            className="md:col-span-4"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-4">
                                        <Label htmlFor="notaEvolucion">Notas de evolución *</Label>
                                        <Textarea
                                            id="notaEvolucion"
                                            value={formData.notaEvolucion || ""}
                                            onChange={(e) => updateFormData("notaEvolucion", e.target.value)}
                                            className="medical-input-focus"
                                            rows={3}
                                            placeholder="Notas de evolución del paciente"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Signos Vitales */}
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Signos Vitales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fc">FC *</Label>
                                        <Input
                                            id="fc"
                                            value={formData.fc || ""}
                                            onChange={(e) => updateFormData("fc", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Frecuencia cardiaca"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fr">FR *</Label>
                                        <Input
                                            id="fr"
                                            value={formData.fr || ""}
                                            onChange={(e) => updateFormData("fr", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Frecuencia respiratoria"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="temp">Temperatura *</Label>
                                        <Input
                                            id="temp"
                                            value={formData.temp || ""}
                                            onChange={(e) => updateFormData("temp", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Temperatura"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ta">TA *</Label>
                                        <Input
                                            id="ta"
                                            value={formData.ta || ""}
                                            onChange={(e) => updateFormData("ta", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Tensión arterial"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="aceptadoPor">Aceptado por *</Label>
                                        <Input
                                            id="aceptadoPor"
                                            value={formData.aceptadoPor || ""}
                                            onChange={(e) => updateFormData("aceptadoPor", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Nombre de quien aceptó"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="estadoPaciente">Estado del Paciente *</Label>
                                        <Select
                                            value={formData.estadoPaciente}
                                            onValueChange={(value) => updateFormData("estadoPaciente", value)}
                                        >
                                            <SelectTrigger className="medical-select-focus">
                                                <SelectValue placeholder="Seleccionar estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Estable">Estable</SelectItem>
                                                <SelectItem value="Crítico">Crítico</SelectItem>
                                                <SelectItem value="Grave">Grave</SelectItem>
                                                <SelectItem value="Leve">Leve</SelectItem>
                                                <SelectItem value="En observación">En observación</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="eps">EPS *</Label>
                                        <Input
                                            id="eps"
                                            value={formData.eps || ""}
                                            onChange={(e) => updateFormData("eps", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Ingrese la EPS"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="arl">ARL *</Label>
                                        <Input
                                            id="arl"
                                            value={formData.arl || ""}
                                            onChange={(e) => updateFormData("arl", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Ingrese la ARL"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="spo2">O2 </Label>
                                        <div className="flex items-center">
                                            <Input
                                                id="spo2"
                                                value={formData.spo2 || ""}
                                                onChange={(e) => updateFormData("spo2", e.target.value)}
                                                className="medical-input-focus"
                                                placeholder="Ingrese el O2"
                                            />
                                            <span className="ml-2 text-gray-500">LXMT</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tipo de equipo de oxígeno */}
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Tipo de equipo de oxígeno</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-6">
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="canulaNasal"
                                            checked={formData.canulaNasal || false}
                                            onCheckedChange={(checked) => updateFormData("canulaNasal", checked)}
                                        />
                                        <Label htmlFor="canulaNasal">Cánula nasal</Label>
                                    </div>
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="mascaraReservorio"
                                            checked={formData.mascaraReservorio || false}
                                            onCheckedChange={(checked) => updateFormData("mascaraReservorio", checked)}
                                        />
                                        <Label htmlFor="mascaraReservorio">Mascara con reservorio</Label>
                                    </div>
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="equipoVenturi"
                                            checked={formData.equipoVenturi || false}
                                            onCheckedChange={(checked) => updateFormData("equipoVenturi", checked)}
                                        />
                                        <Label htmlFor="equipoVenturi">Equipo venturi</Label>
                                    </div>
                                </div>
                            </CardContent>

                            {/* Equipos Biomecánicos */}
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Equipos Biomecánicos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-6">
                                    <div className="flex items-center gap-6">
                                        <span>1. Vía</span>
                                        <Input
                                            id="via"
                                            type="text"
                                            className="w-16"
                                            value={formData.via || ""}
                                            onChange={(e) => updateFormData("via", e.target.value)}
                                        />
                                        <span>C.C.</span>
                                        <Input
                                            id="ccVia"
                                            type="text"
                                            className="w-20"
                                            value={formData.ccVia || ""}
                                            onChange={(e) => updateFormData("ccVia", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span>2. Vía</span>
                                        <Input
                                            id="via2"
                                            type="text"
                                            className="w-16"
                                            value={formData.via2 || ""}
                                            onChange={(e) => updateFormData("via2", e.target.value)}
                                        />
                                        <span>C.C.</span>
                                        <Input
                                            id="ccVia2"
                                            type="text"
                                            className="w-20"
                                            value={formData.ccVia2 || ""}
                                            onChange={(e) => updateFormData("ccVia2", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="equipoMultiparametro"
                                            checked={formData.equipoMultiparametro || false}
                                            onCheckedChange={(checked) => updateFormData("equipoMultiparametro", checked)}
                                        />
                                        <Label htmlFor="equipoMultiparametro">Equipo multiparámetro</Label>
                                    </div>
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="ventiladorMecanico"
                                            checked={formData.ventiladorMecanico || false}
                                            onCheckedChange={(checked) => updateFormData("ventiladorMecanico", checked)}
                                        />
                                        <Label htmlFor="ventiladorMecanico">Ventilador Mecánico o respirador</Label>
                                    </div>
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="valvulaPeep"
                                            checked={formData.valvulaPeep || false}
                                            onCheckedChange={(checked) => updateFormData("valvulaPeep", checked)}
                                        />
                                        <Label htmlFor="valvulaPeep">Válvula Peep</Label>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="desfibrilador"
                                            checked={formData.desfibrilador || false}
                                            onCheckedChange={(checked) => updateFormData("desfibrilador", checked)}
                                        />
                                        <Label htmlFor="desfibrilador">Desfibrilador</Label>
                                    </div>
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="aspirador"
                                            checked={formData.aspirador || false}
                                            onCheckedChange={(checked) => updateFormData("aspirador", checked)}
                                        />
                                        <Label htmlFor="aspirador">Aspirador</Label>
                                    </div>
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="capnografo"
                                            checked={formData.capnografo || false}
                                            onCheckedChange={(checked) => updateFormData("capnografo", checked)}
                                        />
                                        <Label htmlFor="capnografo">Capnógrafo</Label>
                                    </div>
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="pulmoaire"
                                            checked={formData.pulmoaire || false}
                                            onCheckedChange={(checked) => updateFormData("pulmoaire", checked)}
                                        />
                                        <Label htmlFor="pulmoaire">Pulmoaire</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Información del servicio */}
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Información del servicio</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ambulanciaSolicitada">Ambulancia solicitada por *</Label>
                                        <Input
                                            id="ambulanciaSolicitada"
                                            value={formData.ambulanciaSolicitada || ""}
                                            onChange={(e) => updateFormData("ambulanciaSolicitada", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Nombre de quien solicito la ambulancia"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="direccionServicio">Dirección del servicio de ambulancia *</Label>
                                        <Input
                                            id="direccionServicio"
                                            value={formData.direccionServicio || ""}
                                            onChange={(e) => updateFormData("direccionServicio", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Dirección del servicio"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tel">Teléfono *</Label>
                                        <Input
                                            id="tel"
                                            value={formData.tel || ""}
                                            onChange={(e) => updateFormData("tel", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Ingrese el teléfono"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="destinoPaciente">Destino del paciente *</Label>
                                        <Input
                                            id="destinoPaciente"
                                            value={formData.destinoPaciente || ""}
                                            onChange={(e) => updateFormData("destinoPaciente", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Destino del paciente"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="estudio">Estudio *</Label>
                                        <Input
                                            id="estudio"
                                            value={formData.estudio || ""}
                                            onChange={(e) => updateFormData("estudio", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Estudio"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>

                            {/* Horario */}
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Horario (Formato 24h)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioLL1">H. LL:</Label>
                                        <TimeInput24
                                            id="horarioLL1"
                                            value={formData.horarioLL1 || ""}
                                            onChange={(value) => updateFormData("horarioLL1", value)}
                                            className="medical-input-focus"
                                            placeholder="HH:MM"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioSa1">H. S:</Label>
                                        <TimeInput24
                                            id="horarioSa1"
                                            value={formData.horarioSa1 || ""}
                                            onChange={(value) => updateFormData("horarioSa1", value)}
                                            className="medical-input-focus"
                                            placeholder="HH:MM"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioLL2">H. LL:</Label>
                                        <TimeInput24
                                            id="horarioLL2"
                                            value={formData.horarioLL2 || ""}
                                            onChange={(value) => updateFormData("horarioLL2", value)}
                                            className="medical-input-focus"
                                            placeholder="HH:MM"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioSa2">H. S:</Label>
                                        <TimeInput24
                                            id="horarioSa2"
                                            value={formData.horarioSa2 || ""}
                                            onChange={(value) => updateFormData("horarioSa2", value)}
                                            className="medical-input-focus"
                                            placeholder="HH:MM"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioLL3">H. LL:</Label>
                                        <TimeInput24
                                            id="horarioLL3"
                                            value={formData.horarioLL3 || ""}
                                            onChange={(value) => updateFormData("horarioLL3", value)}
                                            className="medical-input-focus"
                                            placeholder="HH:MM"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioSa3">H. S:</Label>
                                        <TimeInput24
                                            id="horarioSa3"
                                            value={formData.horarioSa3 || ""}
                                            onChange={(value) => updateFormData("horarioSa3", value)}
                                            className="medical-input-focus"
                                            placeholder="HH:MM"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioLL4">H. LL:</Label>
                                        <TimeInput24
                                            id="horarioLL4"
                                            value={formData.horarioLL4 || ""}
                                            onChange={(value) => updateFormData("horarioLL4", value)}
                                            className="medical-input-focus"
                                            placeholder="HH:MM"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioSa4">H. S:</Label>
                                        <TimeInput24
                                            id="horarioSa4"
                                            value={formData.horarioSa4 || ""}
                                            onChange={(value) => updateFormData("horarioSa4", value)}
                                            className="medical-input-focus"
                                            placeholder="HH:MM"
                                        />
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    <p>H. LL = Hora de Llegada | H. S = Hora de Salida</p>
                                    <p>Formato 24h (ej: 14:30 para 2:30 PM, 09:15 para 9:15 AM)</p>
                                </div>
                            </CardContent>

                            {/* Servicio de ambulancia */}
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Servicio de ambulancia</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-6">
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="servicioSimple"
                                            checked={formData.servicioSimple || false}
                                            onCheckedChange={(checked) => updateFormData("servicioSimple", checked)}
                                        />
                                        <Label htmlFor="servicioSimple">Simple</Label>
                                    </div>
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="redondo"
                                            checked={formData.redondo || false}
                                            onCheckedChange={(checked) => updateFormData("redondo", checked)}
                                        />
                                        <Label htmlFor="redondo">Redondo</Label>
                                    </div>
                                    <div className="medical-checkbox-group">
                                        <Checkbox
                                            id="fallido"
                                            checked={formData.fallido || false}
                                            onCheckedChange={(checked) => updateFormData("fallido", checked)}
                                        />
                                        <Label htmlFor="fallido">Fallido</Label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="direccion">Dirección del paciente *</Label>
                                        <Input
                                            id="direccion"
                                            value={formData.direccion || ""}
                                            onChange={(e) => updateFormData("direccion", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Dirección del paciente"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telefono">Teléfono del paciente *</Label>
                                        <Input
                                            id="telefono"
                                            value={formData.telefono || ""}
                                            onChange={(e) => updateFormData("telefono", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Teléfono del paciente"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="responsablePaciente">Responsable del paciente *</Label>
                                        <Input
                                            id="responsablePaciente"
                                            value={formData.responsablePaciente || ""}
                                            onChange={(e) => updateFormData("responsablePaciente", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Nombre completo del responsable"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="acompanante">Acompañante *</Label>
                                            <Input
                                                id="acompanante"
                                                value={formData.acompanante || ""}
                                                onChange={(e) => updateFormData("acompanante", e.target.value)}
                                                className="medical-input-focus"
                                                placeholder="Nombre del acompañante"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ccAcompanante">C.C. *</Label>
                                            <Input
                                                id="ccAcompanante"
                                                value={formData.ccAcompanante || ""}
                                                onChange={(e) => updateFormData("ccAcompanante", e.target.value)}
                                                className="medical-input-focus"
                                                placeholder="Cédula"
                                                type="number"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="recomendacionesTraslado">Recomendaciones al Traslado *</Label>
                                        <textarea
                                            id="recomendacionesTraslado"
                                            value={formData.recomendacionesTraslado || ""}
                                            onChange={(e) => updateFormData("recomendacionesTraslado", e.target.value)}
                                            className="medical-input-focus min-h-[80px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent resize-vertical"
                                            placeholder="Escriba las recomendaciones especiales para el traslado del paciente..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Medicamentos e Insumos */}
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Medicamentos e Insumos</CardTitle>
                                <CardDescription>Registro de medicamentos administrados e insumos
                                    utilizados</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Lista de Medicamentos</h4>
                                    <Button
                                        type="button"
                                        onClick={addMedicamento}
                                        className="medical-button-primary"
                                        size="sm"
                                    >
                                        <Plus className="h-4 w-4 mr-2"/>
                                        Agregar Medicamento
                                    </Button>
                                </div>

                                {(formData.medicamentosInsumos || []).map((medicamento, index) => (
                                    <div key={medicamento.id} className="border rounded-lg p-4 space-y-4 bg-muted/20">
                                        <div className="flex justify-between items-center">
                                            <h5 className="font-medium text-medical-primary">Medicamento {index + 1}</h5>
                                            <Button
                                                type="button"
                                                onClick={() => removeMedicamento(medicamento.id || "")}
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor={`medicamento-${medicamento.id}`}>Descripción</Label>
                                                <Input
                                                    id={`medicamento-${medicamento.id}`}
                                                    value={medicamento.nombre || ""}
                                                    onChange={(e) => updateMedicamento(medicamento.id || "", "nombre", e.target.value)}
                                                    className="medical-input-focus"
                                                    placeholder="Nombre del Medicamento"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor={`dosis-${medicamento.id}`}>Cantidad</Label>
                                                <Input
                                                    id={`dosis-${medicamento.id}`}
                                                    value={medicamento.dosis || ""}
                                                    onChange={(e) => updateMedicamento(medicamento.id || "", "dosis", e.target.value)}
                                                    className="medical-input-focus"
                                                    placeholder="Cantidad del Medicamento"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {(formData.medicamentosInsumos || []).length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No hay medicamentos registrados. Haga clic en "Agregar Medicamento" para
                                        comenzar.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Información del Servicio */}
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Información del Servicio</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ordenServicioNo">Orden del servicio No.</Label>
                                        <Input
                                            id="ordenServicioNo"
                                            value={formData.ordenServicioNo || ""}
                                            onChange={(e) => updateFormData("ordenServicioNo", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Número de la orden del servicio"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="factura">Factura</Label>
                                        <Input
                                            id="factura"
                                            value={formData.factura || ""}
                                            onChange={(e) => updateFormData("factura", e.target.value)}
                                            className="medical-input-focus"
                                            placeholder="Factura"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Firmas */}
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Firmas y Autorización</CardTitle>
                                <CardDescription>Firmas de institución responsable y que recibe</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <SignatureField
                                            label="Institución responsable del paciente"
                                            onChange={(signature) => {
                                                updateFormData("firmaMedico", signature);
                                                setTimeout(() => {
                                                    console.log('Estado DESPUÉS de updateFormData:', formData.firmaMedico ? 'PRESENTE' : 'AUSENTE');
                                                }, 0);
                                            }}
                                            placeholder="Firma de institución responsable del paciente"
                                            value={formData.firmaMedico}
                                        />

                                        <div className="space-y-2">
                                            <Label htmlFor="nombreMedico">Nombre del Médico/Paramédico</Label>
                                            <Input
                                                id="nombreMedico"
                                                value={formData.nombreMedico || ""}
                                                onChange={(e) => updateFormData("nombreMedico", e.target.value)}
                                                className="medical-input-focus"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="registroMedico">Registro Profesional</Label>
                                            <Input
                                                id="registroMedico"
                                                value={formData.registroMedico || ""}
                                                onChange={(e) => updateFormData("registroMedico", e.target.value)}
                                                className="medical-input-focus"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <SignatureField
                                            label="Institución que recibe paciente"
                                            onChange={(signature) => {
                                                console.log('=== onChange PACIENTE EJECUTADO ===');
                                                console.log('Signature recibida:', signature ? 'SÍ' : 'NO');
                                                console.log('Estado ANTES de updateFormData:', formData.firmaPaciente ? 'PRESENTE' : 'AUSENTE');

                                                updateFormData("firmaPaciente", signature);

                                                setTimeout(() => {
                                                    console.log('Estado DESPUÉS de updateFormData:', formData.firmaPaciente ? 'PRESENTE' : 'AUSENTE');
                                                }, 0);
                                            }}
                                            placeholder="Firma de institución que recibe al paciente"
                                            value={formData.firmaPaciente}
                                        />

                                        <div className="space-y-2">
                                            <Label htmlFor="nombreResponsable">Nombre del Responsable</Label>
                                            <Input
                                                id="nombreResponsable"
                                                value={formData.nombreResponsable || ""}
                                                onChange={(e) => updateFormData("nombreResponsable", e.target.value)}
                                                className="medical-input-focus"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Encuesta de Satisfacción</CardTitle>
                                <CardDescription>Evaluación del servicio prestado</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <Label className="text-base font-medium">Cómo le pareció el servicio:</Label>
                                        <div className="flex flex-wrap gap-6">
                                            <div className="medical-radio-group">
                                                <input
                                                    type="radio"
                                                    id="muyBuena"
                                                    name="servicioCalidad"
                                                    value="muyBuena"
                                                    checked={formData.servicioCalidad === "muyBuena"}
                                                    onChange={(e) => updateFormData("servicioCalidad", e.target.value)}
                                                />
                                                <Label htmlFor="muyBuena">MUY BUENA</Label>
                                            </div>
                                            <div className="medical-radio-group">
                                                <input
                                                    type="radio"
                                                    id="buena"
                                                    name="servicioCalidad"
                                                    value="buena"
                                                    checked={formData.servicioCalidad === "buena"}
                                                    onChange={(e) => updateFormData("servicioCalidad", e.target.value)}
                                                />
                                                <Label htmlFor="buena">BUENA</Label>
                                            </div>
                                            <div className="medical-radio-group">
                                                <input
                                                    type="radio"
                                                    id="regular"
                                                    name="servicioCalidad"
                                                    value="regular"
                                                    checked={formData.servicioCalidad === "regular"}
                                                    onChange={(e) => updateFormData("servicioCalidad", e.target.value)}
                                                />
                                                <Label htmlFor="regular">REGULAR</Label>
                                            </div>
                                            <div className="medical-radio-group">
                                                <input
                                                    type="radio"
                                                    id="mala"
                                                    name="servicioCalidad"
                                                    value="mala"
                                                    checked={formData.servicioCalidad === "mala"}
                                                    onChange={(e) => updateFormData("servicioCalidad", e.target.value)}
                                                />
                                                <Label htmlFor="mala">MALA</Label>
                                            </div>
                                            <div className="medical-radio-group">
                                                <input
                                                    type="radio"
                                                    id="muyMala"
                                                    name="servicioCalidad"
                                                    value="muyMala"
                                                    checked={formData.servicioCalidad === "muyMala"}
                                                    onChange={(e) => updateFormData("servicioCalidad", e.target.value)}
                                                />
                                                <Label htmlFor="muyMala">MUY MALA</Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-base font-medium">Recomendaría a Familiares y Amigos:</Label>
                                        <div className="flex flex-wrap gap-6">
                                            <div className="medical-radio-group">
                                                <input
                                                    type="radio"
                                                    id="definitivamenteSi"
                                                    name="recomendacion"
                                                    value="definitivamenteSi"
                                                    checked={formData.recomendacion === "definitivamenteSi"}
                                                    onChange={(e) => updateFormData("recomendacion", e.target.value)}
                                                />
                                                <Label htmlFor="definitivamenteSi">Definitivamente Sí</Label>
                                            </div>
                                            <div className="medical-radio-group">
                                                <input
                                                    type="radio"
                                                    id="probablementeSi"
                                                    name="recomendacion"
                                                    value="probablementeSi"
                                                    checked={formData.recomendacion === "probablementeSi"}
                                                    onChange={(e) => updateFormData("recomendacion", e.target.value)}
                                                />
                                                <Label htmlFor="probablementeSi">Probablemente Sí</Label>
                                            </div>
                                            <div className="medical-radio-group">
                                                <input
                                                    type="radio"
                                                    id="definitivamenteNo"
                                                    name="recomendacion"
                                                    value="definitivamenteNo"
                                                    checked={formData.recomendacion === "definitivamenteNo"}
                                                    onChange={(e) => updateFormData("recomendacion", e.target.value)}
                                                />
                                                <Label htmlFor="definitivamenteNo">Definitivamente No</Label>
                                            </div>
                                            <div className="medical-radio-group">
                                                <input
                                                    type="radio"
                                                    id="probablementeNo"
                                                    name="recomendacion"
                                                    value="probablementeNo"
                                                    checked={formData.recomendacion === "probablementeNo"}
                                                    onChange={(e) => updateFormData("recomendacion", e.target.value)}
                                                />
                                                <Label htmlFor="probablementeNo">Probablemente No</Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Link href="/aph-digital">
                                <Button variant="outline" type="button"
                                        className="medical-button-secondary bg-transparent">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" disabled={loading} className="medical-button-primary">
                                <Save className="h-4 w-4 mr-2"/>
                                {loading ? "Guardando..." : "Guardar Formulario"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </GeneralLayout>
    )
}