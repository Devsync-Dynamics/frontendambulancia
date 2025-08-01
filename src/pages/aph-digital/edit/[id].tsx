
"use client"

import type React from "react"

import {useState, useEffect} from "react"
import {useRouter, useParams} from "next/navigation"
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

export default function EditAphDigitalPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
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
        const loadFormData = async () => {
            try {
                const data = await aphDigitalService.getAphDigitalById(Number(id))
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

        if (id) {
            loadFormData()
        }
    }, [id])

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
                                        <Label htmlFor="horaLlegada">Hora de Llegada</Label>
                                        <Input
                                            id="horaLlegada"
                                            type="time"
                                            value={formData.horaLlegada || ""}
                                            onChange={(e) => updateFormData("horaLlegada", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                        <p className="text-xs text-muted-foreground">Hora del sistema</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nombrePaciente">Nombre del Paciente *</Label>
                                        <Input
                                            id="nombrePaciente"
                                            value={formData.nombrePaciente}
                                            onChange={(e) => updateFormData("nombrePaciente", e.target.value)}
                                            className="medical-input-focus"
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
                                        <Label htmlFor="edad">Edad</Label>
                                        <Input
                                            id="edad"
                                            type="number"
                                            value={formData.edad || ""}
                                            onChange={(e) => updateFormData("edad", Number.parseInt(e.target.value) || undefined)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sexo">Sexo</Label>
                                        <Select value={formData.sexo}
                                                onValueChange={(value) => updateFormData("sexo", value)}>
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
                                        <Label htmlFor="identificacion">Identificación</Label>
                                        <Input
                                            id="identificacion"
                                            value={formData.identificacion || ""}
                                            onChange={(e) => updateFormData("identificacion", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="estadoCivil">Estado Civil</Label>
                                        <Select value={formData.estadoCivil}
                                                onValueChange={(value) => updateFormData("estadoCivil", value)}>
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
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="eps">EPS</Label>
                                        <Input
                                            id="eps"
                                            value={formData.eps || ""}
                                            onChange={(e) => updateFormData("eps", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="arl">ARL</Label>
                                        <Input
                                            id="arl"
                                            value={formData.arl || ""}
                                            onChange={(e) => updateFormData("arl", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="estadoPaciente">Estado del Paciente</Label>
                                        <Select
                                            value={formData.estadoPaciente}
                                            onValueChange={(value) => updateFormData("estadoPaciente", value)}
                                        >
                                            <SelectTrigger className="medical-select-focus">
                                                <SelectValue placeholder="Seleccionar estado"/>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="direccion">Dirección</Label>
                                        <Input
                                            id="direccion"
                                            value={formData.direccion || ""}
                                            onChange={(e) => updateFormData("direccion", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telefono">Teléfono</Label>
                                        <Input
                                            id="telefono"
                                            value={formData.telefono || ""}
                                            onChange={(e) => updateFormData("telefono", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Diagnóstico y Evolución */}
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Diagnóstico y Evolución</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="diagnostico">Diagnóstico</Label>
                                    <Textarea
                                        id="diagnostico"
                                        value={formData.diagnostico || ""}
                                        onChange={(e) => updateFormData("diagnostico", e.target.value)}
                                        className="medical-input-focus"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notaEvolucion">Nota de Evolución</Label>
                                    <Textarea
                                        id="notaEvolucion"
                                        value={formData.notaEvolucion || ""}
                                        onChange={(e) => updateFormData("notaEvolucion", e.target.value)}
                                        className="medical-input-focus"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="procedimientos">Procedimientos Realizados</Label>
                                    <Textarea
                                        id="procedimientos"
                                        value={formData.procedimientos || ""}
                                        onChange={(e) => updateFormData("procedimientos", e.target.value)}
                                        className="medical-input-focus"
                                        rows={3}
                                    />
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
                                        <Label htmlFor="fc">FC (Frecuencia Cardíaca)</Label>
                                        <Input
                                            id="fc"
                                            value={formData.fc || ""}
                                            onChange={(e) => updateFormData("fc", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fr">FR (Frecuencia Respiratoria)</Label>
                                        <Input
                                            id="fr"
                                            value={formData.fr || ""}
                                            onChange={(e) => updateFormData("fr", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="temp">Temperatura</Label>
                                        <Input
                                            id="temp"
                                            value={formData.temp || ""}
                                            onChange={(e) => updateFormData("temp", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ta">TA (Tensión Arterial)</Label>
                                        <Input
                                            id="ta"
                                            value={formData.ta || ""}
                                            onChange={(e) => updateFormData("ta", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="spo2">SpO2</Label>
                                        <Input
                                            id="spo2"
                                            value={formData.spo2 || ""}
                                            onChange={(e) => updateFormData("spo2", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="glasgow">Escala de Glasgow</Label>
                                        <Input
                                            id="glasgow"
                                            value={formData.glasgow || ""}
                                            onChange={(e) => updateFormData("glasgow", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="peso">Peso (kg)</Label>
                                        <Input
                                            id="peso"
                                            type="number"
                                            value={formData.peso || ""}
                                            onChange={(e) => updateFormData("peso", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="talla">Talla (cm)</Label>
                                        <Input
                                            id="talla"
                                            type="number"
                                            value={formData.talla || ""}
                                            onChange={(e) => updateFormData("talla", e.target.value)}
                                            className="medical-input-focus"
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
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="factura">Factura</Label>
                                        <Input
                                            id="factura"
                                            value={formData.factura || ""}
                                            onChange={(e) => updateFormData("factura", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="lugarOcurrencia">Lugar de Ocurrencia</Label>
                                        <Input
                                            id="lugarOcurrencia"
                                            value={formData.lugarOcurrencia || ""}
                                            onChange={(e) => updateFormData("lugarOcurrencia", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="destinoFinal">Destino Final</Label>
                                        <Input
                                            id="destinoFinal"
                                            value={formData.destinoFinal || ""}
                                            onChange={(e) => updateFormData("destinoFinal", e.target.value)}
                                            className="medical-input-focus"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Firmas */}
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Firmas y Autorización</CardTitle>
                                <CardDescription>Firmas del personal médico y del paciente/responsable</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <SignatureField
                                            label="Firma del Médico/Paramédico"
                                            onChange={(signature) => updateFormData("firmaMedico", signature)}
                                            placeholder="Firma del médico o paramédico responsable"
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
                                            label="Firma del Paciente/Responsable"
                                            onChange={(signature) => updateFormData("firmaPaciente", signature)}
                                            placeholder="Firma del paciente o responsable legal"
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
