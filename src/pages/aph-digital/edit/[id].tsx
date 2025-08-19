"use client"

import type React from "react"

import {useState, useEffect} from "react"
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
import {useRouter} from "next/router";
import { DiagnosticoCombobox } from "@/components/ui/diagnostico-combobox"

export default function EditAphDigitalPage() {
    const router = useRouter()
    const {id} = router.query

    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // Obtener hora actual del sistema si no existe
    const getCurrentTime = () => {
        const now = new Date()
        return now.toTimeString().slice(0, 5) // HH:MM format
    }

    const [formData, setFormData] = useState<CreateAphDigitalDto>({
        numeroFormulario: "",
        placa: "",
        cc: "",
        fecha: new Date().toISOString().split("T")[0],
        nombrePaciente: "",
        horaLlegada: getCurrentTime(),
        medicamentosInsumos: [],
    })

    useEffect(() => {
        if (router.isReady && id) {
            const loadFormData = async () => {
                try {
                    // Convertir id a número y validar que sea válido
                    const numericId = Number(id)

                    // Verificar que el ID sea un número válido
                    if (isNaN(numericId) || numericId <= 0) {
                        console.error("ID inválido:", id)
                        setInitialLoading(false)
                        return
                    }

                    const data = await aphDigitalService.getAphDigitalById(numericId)
                    if (data) {
                        // Ensure all medications have valid IDs
                        const medicamentosWithIds = (data.medicamentosInsumos || []).map((med, index) => ({
                            ...med,
                            id: med.id || `med-${Date.now()}-${index}`
                        }))

                        setFormData({
                            ...data,
                            horaLlegada: data.horaLlegada || getCurrentTime(),
                            medicamentosInsumos: medicamentosWithIds,
                        })
                    }
                } catch (error) {
                    console.error("Error loading form data:", error)
                } finally {
                    setInitialLoading(false)
                }
            }

            loadFormData()
        } else if (router.isReady && !id) {
            // Si el router está listo pero no hay id, marcar como no cargando
            setInitialLoading(false) // Cambié setLoading por setInitialLoading para consistencia
        }
    }, [router.isReady, id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const validation = aphDigitalService.validateAphDigital(formData)
        if (!validation.isValid) {
            alert("Errores de validación:\n" + validation.errors.join("\n"))
            setLoading(false)
            return
        }

        const result = await aphDigitalService.updateAphDigital(id, formData)
        if (result) {
            router.push("/aph-digital")
        }
        setLoading(false)
    }

    const updateFormData = (field: keyof CreateAphDigitalDto, value: any) => {
        setFormData((prev) => ({...prev, [field]: value}))
    }

    const addMedicamento = () => {
        const newMedicamento = {
            id: `med-${Date.now()}`,
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

    const removeMedicamento = (medId: string | undefined) => {
        setFormData((prev) => ({
            ...prev,
            medicamentosInsumos: (prev.medicamentosInsumos || []).filter((med) => med.id !== medId),
        }))
    }

    const updateMedicamento = (medId: string | undefined, field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            medicamentosInsumos: (prev.medicamentosInsumos || []).map((med) =>
                med.id === medId ? {...med, [field]: value} : med
            ),
        }))
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen medical-bg-gradient flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-primary mx-auto"></div>
                    <p className="mt-4 text-medical-primary">Cargando formulario...</p>
                </div>
            </div>
        )
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
                                <h1 className="text-3xl font-bold medical-text-gradient">Editar Formulario APH</h1>
                                <p className="text-muted-foreground">Modificar formulario pre-hospitalario
                                    #{formData.numeroFormulario}</p>
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
                                            required
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
                                       <Label htmlFor="horaLlegada">Hora de Llegada *</Label>
                                       <Input
                                           id="horaLlegada"
                                           type="time"
                                           value={formData.horaLlegada || ""}
                                           onChange={(e) => updateFormData("horaLlegada", e.target.value)}
                                           className="medical-input-focus"
                                           required
                                       />
                                       <p className="text-xs text-muted-foreground">Hora automática del sistema</p>
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
                            <CardContent className="space-y-4">
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
                                       <Label htmlFor="tipoDocumento">Tipo de documento *</Label>
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
                                           <SelectItem value="PT">Permiso de trabajo</SelectItem>
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
                                <CardTitle className="text-medical-primary">Horario</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioLL1">H. LL:</Label>
                                        <Input
                                            id="horarioLL1"
                                            type="time"
                                            value={formData.horarioLL1 || ""}
                                            onChange={(e) => updateFormData("horarioLL1", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioSa1">H. S:</Label>
                                        <Input
                                            id="horarioSa1"
                                            type="time"
                                            value={formData.horarioSa1 || ""}
                                            onChange={(e) => updateFormData("horarioSa1", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioLL2">H. LL:</Label>
                                        <Input
                                            id="horarioLL2"
                                            type="time"
                                            value={formData.horarioLL2 || ""}
                                            onChange={(e) => updateFormData("horarioLL2", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioSa2">H. S:</Label>
                                        <Input
                                            id="horarioSa2"
                                            type="time"
                                            value={formData.horarioSa2 || ""}
                                            onChange={(e) => updateFormData("horarioSa2", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioLL3">H. LL:</Label>
                                        <Input
                                            id="horarioLL3"
                                            type="time"
                                            value={formData.horarioLL3 || ""}
                                            onChange={(e) => updateFormData("horarioLL3", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioSa3">H. S:</Label>
                                        <Input
                                            id="horarioSa3"
                                            type="time"
                                            value={formData.horarioSa3 || ""}
                                            onChange={(e) => updateFormData("horarioSa3", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioLL4">H. LL:</Label>
                                        <Input
                                            id="horarioLL4"
                                            type="time"
                                            value={formData.horarioLL4 || ""}
                                            onChange={(e) => updateFormData("horarioLL4", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horarioSa4">H. S:</Label>
                                        <Input
                                            id="horarioSa4"
                                            type="time"
                                            value={formData.horarioSa4 || ""}
                                            onChange={(e) => updateFormData("horarioSa4", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
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
                                                onClick={() => removeMedicamento(medicamento?.id)}
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`medicamento-${medicamento.id}`}>Nombre del
                                                    Medicamento</Label>
                                                <Input
                                                    id={`medicamento-${medicamento.id}`}
                                                    value={medicamento.nombre}
                                                    onChange={(e) => updateMedicamento(medicamento.id, "nombre", e.target.value)}
                                                    className="medical-input-focus"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`dosis-${medicamento.id}`}>Dosis</Label>
                                                <Input
                                                    id={`dosis-${medicamento.id}`}
                                                    value={medicamento.dosis}
                                                    onChange={(e) => updateMedicamento(medicamento.id, "dosis", e.target.value)}
                                                    className="medical-input-focus"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`via-${medicamento.id}`}>Vía de Administración</Label>
                                                <Select
                                                    value={medicamento.via || ""}
                                                    onValueChange={(value) => updateMedicamento(medicamento.id, "via", value)}
                                                >
                                                    <SelectTrigger className="medical-select-focus">
                                                        <SelectValue placeholder="Seleccionar vía"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Oral">Oral</SelectItem>
                                                        <SelectItem value="Intravenosa">Intravenosa</SelectItem>
                                                        <SelectItem value="Intramuscular">Intramuscular</SelectItem>
                                                        <SelectItem value="Subcutánea">Subcutánea</SelectItem>
                                                        <SelectItem value="Tópica">Tópica</SelectItem>
                                                        <SelectItem value="Inhalatoria">Inhalatoria</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`frecuencia-${medicamento.id}`}>Frecuencia</Label>
                                                <Input
                                                    id={`frecuencia-${medicamento.id}`}
                                                    value={medicamento.frecuencia}
                                                    onChange={(e) => updateMedicamento(medicamento.id, "frecuencia", e.target.value)}
                                                    className="medical-input-focus"
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


                                <div className="mt-3 flex gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            console.log('=== ESTADO COMPLETO DEL FORMULARIO ===');
                                            console.log('formData completo:', formData);
                                            console.log('firmaMedico:', formData.firmaMedico);
                                            console.log('firmaPaciente:', formData.firmaPaciente);
                                        }}
                                    >
                                        Log Estado
                                    </Button>

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            const testSignature = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

                                            console.log('=== PRUEBA MANUAL DE updateFormData ===');
                                            console.log('Antes - firmaMedico:', formData.firmaMedico ? 'PRESENTE' : 'AUSENTE');
                                            updateFormData("firmaMedico", testSignature);

                                            setTimeout(() => {
                                                console.log('Después - firmaMedico:', formData.firmaMedico ? 'PRESENTE' : 'AUSENTE');
                                            }, 100);
                                        }}
                                    >
                                        Test Manual
                                    </Button>
                                </div>

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
                                        <div className="space-y-2">
                                            <Label htmlFor="parentesco">Parentesco</Label>
                                            <Select
                                                value={formData.parentesco}
                                                onValueChange={(value) => updateFormData("parentesco", value)}
                                            >
                                                <SelectTrigger className="medical-select-focus">
                                                    <SelectValue placeholder="Seleccionar parentesco"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Paciente">Paciente</SelectItem>
                                                    <SelectItem value="Padre">Padre</SelectItem>
                                                    <SelectItem value="Madre">Madre</SelectItem>
                                                    <SelectItem value="Cónyuge">Cónyuge</SelectItem>
                                                    <SelectItem value="Hijo/a">Hijo/a</SelectItem>
                                                    <SelectItem value="Hermano/a">Hermano/a</SelectItem>
                                                    <SelectItem value="Otro">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                {loading ? "Guardando..." : "Actualizar Formulario"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </GeneralLayout>

    )
}
