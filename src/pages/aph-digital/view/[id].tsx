"use client"

import {useState, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {ArrowLeft, FileText, Edit, Printer, Clock} from "lucide-react"
import Link from "next/link"
import {type CreateAphDigitalDto, aphDigitalService} from "@/services/aph-digital.service"
import GeneralLayout from "@/components/GeneralLayout";
import {useRouter} from "next/router";

export default function ViewAphDigitalPage() {
    const router = useRouter()
    const { id } = router.query

    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState<CreateAphDigitalDto | null>(null)

    useEffect(() => {
        const loadFormData = async () => {
            try {
                // Validar que el ID sea válido antes de la llamada
                if (!id || typeof id !== 'string') {
                    console.error("ID inválido:", id)
                    setLoading(false)
                    return
                }

                const data = await aphDigitalService.getAphDigitalById(id)
                if (data) {
                    setFormData(data)
                }
            } catch (error) {
                console.error("Error loading form data:", error)
            } finally {
                setLoading(false)
            }
        }

        // Solo ejecutar si el router está listo y hay un ID válido
        if (router.isReady && id && typeof id === 'string') {
            loadFormData()
        } else if (router.isReady && !id) {
            // Si el router está listo pero no hay ID, dejar de cargar
            setLoading(false)
        }
    }, [router.isReady, id])

    if (loading) {
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

    if (!formData) {
        return (
            <div className="min-h-screen medical-bg-gradient flex items-center justify-center">
                <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-muted-foreground mb-2">Formulario no encontrado</h2>
                    <p className="text-muted-foreground mb-4">El formulario solicitado no existe o ha sido
                        eliminado.</p>
                    <Link href="/aph-digital">
                        <Button className="medical-button-primary">
                            <ArrowLeft className="h-4 w-4 mr-2"/>
                            Volver al listado
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <GeneralLayout>

            <div className="min-h-screen medical-bg-gradient">
                <div className="container mx-auto p-6 space-y-6">
                    <div className="flex items-center justify-between animate-slide-in-up">
                        <div className="flex items-center gap-4">
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
                                    <h1 className="text-3xl font-bold medical-text-gradient">
                                        Formulario APH #{formData.numeroFormulario}
                                    </h1>
                                    <p className="text-muted-foreground">Vista detallada del formulario
                                        pre-hospitalario</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/aph-digital/${id}/edit`}>
                                <Button className="medical-button-secondary bg-transparent">
                                    <Edit className="h-4 w-4 mr-2"/>
                                    Editar
                                </Button>
                            </Link>
                            <Link href={`/aph-digital/${id}/print`}>
                                <Button className="medical-button-primary">
                                    <Printer className="h-4 w-4 mr-2"/>
                                    Imprimir
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Información Básica */}
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Información Básica</CardTitle>
                                <CardDescription>Datos principales del formulario y paciente</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Número de
                                            Formulario</label>
                                        <p className="text-lg font-semibold">{formData.numeroFormulario}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Placa</label>
                                        <p className="text-lg font-semibold">{formData.placa}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">C.C.</label>
                                        <p className="text-lg font-semibold">{formData.cc}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                                        <p className="text-lg font-semibold">{new Date(formData.fecha).toLocaleDateString()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Hora de
                                            Llegada</label>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-medical-primary"/>
                                            <p className="text-lg font-semibold">{formData.horaLlegada || "No registrada"}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Nombre del
                                            Paciente</label>
                                        <p className="text-lg font-semibold">{formData.nombrePaciente}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tipo de Servicio */}
                        <Card className="medical-section animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-medical-primary">Tipo de Servicio</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2 flex-wrap">
                                    {formData.ambulanciaBasica &&
                                        <Badge className="medical-badge">Ambulancia Básica</Badge>}
                                    {formData.medicalizado && <Badge className="medical-badge">Medicalizado</Badge>}
                                    {formData.consultaMedica &&
                                        <Badge className="medical-badge">Consulta Médica</Badge>}
                                    {!formData.ambulanciaBasica && !formData.medicalizado && !formData.consultaMedica && (
                                        <p className="text-muted-foreground">No se ha especificado el tipo de
                                            servicio</p>
                                    )}
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
                                        <label className="text-sm font-medium text-muted-foreground">Edad</label>
                                        <p className="text-lg font-semibold">{formData.edad || "No especificada"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Sexo</label>
                                        <p className="text-lg font-semibold">
                                            {formData.sexo === "M" ? "Masculino" : formData.sexo === "F" ? "Femenino" : "No especificado"}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label
                                            className="text-sm font-medium text-muted-foreground">Identificación</label>
                                        <p className="text-lg font-semibold">{formData.identificacion || "No especificada"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Estado
                                            Civil</label>
                                        <p className="text-lg font-semibold">{formData.estadoCivil || "No especificado"}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">EPS</label>
                                        <p className="text-lg font-semibold">{formData.eps || "No especificada"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">ARL</label>
                                        <p className="text-lg font-semibold">{formData.arl || "No especificada"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Estado del
                                            Paciente</label>
                                        <div className="flex items-center gap-2">
                                            {formData.estadoPaciente && (
                                                <Badge
                                                    className={`${
                                                        formData.estadoPaciente === "Crítico"
                                                            ? "bg-red-100 text-red-800 border-red-200"
                                                            : formData.estadoPaciente === "Grave"
                                                                ? "bg-orange-100 text-orange-800 border-orange-200"
                                                                : formData.estadoPaciente === "Estable"
                                                                    ? "bg-green-100 text-green-800 border-green-200"
                                                                    : formData.estadoPaciente === "Leve"
                                                                        ? "bg-blue-100 text-blue-800 border-blue-200"
                                                                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                    }`}
                                                >
                                                    {formData.estadoPaciente}
                                                </Badge>
                                            )}
                                            {!formData.estadoPaciente && (
                                                <p className="text-lg font-semibold text-muted-foreground">No
                                                    especificado</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                                        <p className="text-lg font-semibold">{formData.direccion || "No especificada"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                                        <p className="text-lg font-semibold">{formData.telefono || "No especificado"}</p>
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
                                    <label className="text-sm font-medium text-muted-foreground">Diagnóstico</label>
                                    <div className="bg-muted/20 p-4 rounded-lg">
                                        <p className="whitespace-pre-wrap">{formData.diagnostico || "No especificado"}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Nota de
                                        Evolución</label>
                                    <div className="bg-muted/20 p-4 rounded-lg">
                                        <p className="whitespace-pre-wrap">{formData.notaEvolucion || "No especificada"}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Procedimientos
                                        Realizados</label>
                                    <div className="bg-muted/20 p-4 rounded-lg">
                                        <p className="whitespace-pre-wrap">{formData.procedimientos || "No especificados"}</p>
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
                                        <label className="text-sm font-medium text-muted-foreground">FC (Frecuencia
                                            Cardíaca)</label>
                                        <p className="text-lg font-semibold">{formData.fc || "No registrada"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">FR (Frecuencia
                                            Respiratoria)</label>
                                        <p className="text-lg font-semibold">{formData.fr || "No registrada"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Temperatura</label>
                                        <p className="text-lg font-semibold">{formData.temp || "No registrada"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">TA (Tensión
                                            Arterial)</label>
                                        <p className="text-lg font-semibold">{formData.ta || "No registrada"}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">SpO2</label>
                                        <p className="text-lg font-semibold">{formData.spo2 || "No registrada"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Escala de
                                            Glasgow</label>
                                        <p className="text-lg font-semibold">{formData.glasgow || "No registrada"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Peso (kg)</label>
                                        <p className="text-lg font-semibold">{formData.peso || "No registrado"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Talla (cm)</label>
                                        <p className="text-lg font-semibold">{formData.talla || "No registrada"}</p>
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
                            <CardContent>
                                {formData.medicamentosInsumos && formData.medicamentosInsumos.length > 0 ? (
                                    <div className="space-y-4">
                                        {formData.medicamentosInsumos
                                            .filter(medicamento => medicamento !== null && medicamento !== undefined)
                                            .map((medicamento, index) => (
                                                <div key={medicamento.id || `medicamento-${index}`} className="border rounded-lg p-4 bg-muted/20">
                                                    <h5 className="font-medium text-medical-primary mb-3">Medicamento {index + 1}</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <div className="space-y-2">
                                                            <label
                                                                className="text-sm font-medium text-muted-foreground">Descripción</label>
                                                            <p className="font-semibold">{medicamento.nombre || "No especificado"}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label
                                                                className="text-sm font-medium text-muted-foreground">Cantidad</label>
                                                            <p className="font-semibold">{medicamento.dosis || "No especificada"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No hay medicamentos registrados en este formulario.
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
                                        <label className="text-sm font-medium text-muted-foreground">Orden del servicio
                                            No.</label>
                                        <p className="text-lg font-semibold">{formData.ordenServicioNo || "No especificada"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Factura</label>
                                        <p className="text-lg font-semibold">{formData.factura || "No especificada"}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Lugar de
                                            Ocurrencia</label>
                                        <p className="text-lg font-semibold">{formData.lugarOcurrencia || "No especificado"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Destino
                                            Final</label>
                                        <p className="text-lg font-semibold">{formData.destinoFinal || "No especificado"}</p>
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
                                        <label className="text-sm font-medium text-muted-foreground">Institución responsable del paciente</label>
                                        {formData.firmaMedico ? (
                                            <div className="border rounded-lg p-4 bg-muted/20">
                                                <img
                                                    src={formData.firmaMedico || "/placeholder.svg"}
                                                    alt="Firma del médico"
                                                    className="max-h-32 mx-auto"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="border-2 border-dashed border-muted rounded-lg p-8 text-center text-muted-foreground">
                                                Sin firma registrada
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Nombre del
                                                Médico/Paramédico</label>
                                            <p className="font-semibold">{formData.nombreMedico || "No especificado"}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Registro
                                                Profesional</label>
                                            <p className="font-semibold">{formData.registroMedico || "No especificado"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-medium text-muted-foreground">Institución que recibe paciente</label>
                                        {formData.firmaPaciente ? (
                                            <div className="border rounded-lg p-4 bg-muted/20">
                                                <img
                                                    src={formData.firmaPaciente || "/placeholder.svg"}
                                                    alt="Firma del paciente"
                                                    className="max-h-32 mx-auto"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="border-2 border-dashed border-muted rounded-lg p-8 text-center text-muted-foreground">
                                                Sin firma registrada
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Nombre del
                                                Responsable</label>
                                            <p className="font-semibold">{formData.nombreResponsable || "No especificado"}</p>
                                        </div>
                                       
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </GeneralLayout>

    )
}