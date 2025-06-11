"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { type CreateAphDigitalDto, aphDigitalService } from "@/services/aph-digital.service"
import { SignatureField } from "@/components/signature-field"

export default function CreateAphDigitalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateAphDigitalDto>({
    numeroFormulario: "",
    placa: "",
    cc: "",
    fecha: new Date().toISOString().split("T")[0],
    nombrePaciente: "",
    medicamentosInsumos: [
      { descripcion: "", cantidad: 0 },
      { descripcion: "", cantidad: 0 },
      { descripcion: "", cantidad: 0 },
      { descripcion: "", cantidad: 0 },
      { descripcion: "", cantidad: 0 },
      { descripcion: "", cantidad: 0 },
    ],
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
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateMedicamento = (index: number, field: string, value: any) => {
    const updatedMedicamentos = [...(formData.medicamentosInsumos || [])]
    updatedMedicamentos[index] = {
      ...updatedMedicamentos[index],
      [field]: value,
    }
    updateFormData("medicamentosInsumos", updatedMedicamentos)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/aph-digital">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Formulario APH</h1>
          <p className="text-muted-foreground">Crear un nuevo formulario pre-hospitalario</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
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
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  value={formData.placa}
                  onChange={(e) => updateFormData("placa", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cc">C.C. *</Label>
                <Input id="cc" value={formData.cc} onChange={(e) => updateFormData("cc", e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => updateFormData("fecha", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombrePaciente">Nombre del Paciente *</Label>
                <Input
                  id="nombrePaciente"
                  value={formData.nombrePaciente}
                  onChange={(e) => updateFormData("nombrePaciente", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Servicio */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ambulanciaBasica"
                  checked={formData.ambulanciaBasica || false}
                  onCheckedChange={(checked) => updateFormData("ambulanciaBasica", checked)}
                />
                <Label htmlFor="ambulanciaBasica">Ambulancia Básica</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="medicalizado"
                  checked={formData.medicalizado || false}
                  onCheckedChange={(checked) => updateFormData("medicalizado", checked)}
                />
                <Label htmlFor="medicalizado">Medicalizado</Label>
              </div>
              <div className="flex items-center space-x-2">
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
        <Card>
          <CardHeader>
            <CardTitle>Información del Paciente</CardTitle>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Select value={formData.sexo} onValueChange={(value) => updateFormData("sexo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estadoCivil">Estado Civil</Label>
                <Select value={formData.estadoCivil} onValueChange={(value) => updateFormData("estadoCivil", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eps">EPS</Label>
                <Input id="eps" value={formData.eps || ""} onChange={(e) => updateFormData("eps", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arl">ARL</Label>
                <Input id="arl" value={formData.arl || ""} onChange={(e) => updateFormData("arl", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccionTrasladoPaciente">Dirección y teléfono del paciente</Label>
              <Input
                id="direccionTrasladoPaciente"
                value={formData.direccionTrasladoPaciente || ""}
                onChange={(e) => updateFormData("direccionTrasladoPaciente", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Diagnóstico y Evolución */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico y Evolución</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnostico">Diagnóstico</Label>
              <Textarea
                id="diagnostico"
                value={formData.diagnostico || ""}
                onChange={(e) => updateFormData("diagnostico", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notaEvolucion">Nota de Evolución</Label>
              <Textarea
                id="notaEvolucion"
                value={formData.notaEvolucion || ""}
                onChange={(e) => updateFormData("notaEvolucion", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Signos Vitales */}
        <Card>
          <CardHeader>
            <CardTitle>Signos Vitales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fc">FC (Frecuencia Cardíaca)</Label>
                <Input id="fc" value={formData.fc || ""} onChange={(e) => updateFormData("fc", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fr">FR (Frecuencia Respiratoria)</Label>
                <Input id="fr" value={formData.fr || ""} onChange={(e) => updateFormData("fr", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temp">Temperatura</Label>
                <Input id="temp" value={formData.temp || ""} onChange={(e) => updateFormData("temp", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ta">TA (Tensión Arterial)</Label>
                <Input id="ta" value={formData.ta || ""} onChange={(e) => updateFormData("ta", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aceptadoPor">Aceptado por</Label>
                <Input
                  id="aceptadoPor"
                  value={formData.aceptadoPor || ""}
                  onChange={(e) => updateFormData("aceptadoPor", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estadoclinicopac">Estado Clínico del Paciente</Label>
                <Input
                  id="estadoclinicopac"
                  value={formData.estadoclinicopac || ""}
                  onChange={(e) => updateFormData("estadoclinicopac", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Oxígeno y Equipos */}
        <Card>
          <CardHeader>
            <CardTitle>Oxígeno y Equipos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="o2">O2 (LXMT)</Label>
                <Input id="o2" value={formData.o2 || ""} onChange={(e) => updateFormData("o2", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de equipo de Oxígeno</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canulaNasal"
                      checked={formData.canulaNasal || false}
                      onCheckedChange={(checked) => updateFormData("canulaNasal", checked)}
                    />
                    <Label htmlFor="canulaNasal">Cánula nasal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="equipoVenturi"
                      checked={formData.equipoVenturi || false}
                      onCheckedChange={(checked) => updateFormData("equipoVenturi", checked)}
                    />
                    <Label htmlFor="equipoVenturi">Equipo Venturi</Label>
                    <Input
                      id="porcentajeOxigeno"
                      placeholder="%"
                      className="w-16"
                      value={formData.porcentajeOxigeno || ""}
                      onChange={(e) => updateFormData("porcentajeOxigeno", e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mascaraReservorio"
                      checked={formData.mascaraReservorio || false}
                      onCheckedChange={(checked) => updateFormData("mascaraReservorio", checked)}
                    />
                    <Label htmlFor="mascaraReservorio">Máscara con Reservorio</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bomba de Infusión</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Label htmlFor="via" className="self-center">
                    1. Vía
                  </Label>
                  <Input id="via" value={formData.via || ""} onChange={(e) => updateFormData("via", e.target.value)} />
                  <div className="flex items-center gap-1">
                    <Label htmlFor="ccVia" className="whitespace-nowrap">
                      C.C.
                    </Label>
                    <Input
                      id="ccVia"
                      value={formData.ccVia || ""}
                      onChange={(e) => updateFormData("ccVia", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Label htmlFor="via2" className="self-center">
                    2. Vía
                  </Label>
                  <Input
                    id="via2"
                    value={formData.via2 || ""}
                    onChange={(e) => updateFormData("via2", e.target.value)}
                  />
                  <div className="flex items-center gap-1">
                    <Label htmlFor="ccVia2" className="whitespace-nowrap">
                      C.C.
                    </Label>
                    <Input
                      id="ccVia2"
                      value={formData.ccVia2 || ""}
                      onChange={(e) => updateFormData("ccVia2", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Equipos Biomecánicos */}
            <div className="mt-4">
              <Label className="font-medium mb-2 block">Equipos Biomecánicos</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="equipoMultiparametro"
                      checked={formData.equipoMultiparametro || false}
                      onCheckedChange={(checked) => updateFormData("equipoMultiparametro", checked)}
                    />
                    <Label htmlFor="equipoMultiparametro">Equipo Multiparámetro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ventiladorMecanico"
                      checked={formData.ventiladorMecanico || false}
                      onCheckedChange={(checked) => updateFormData("ventiladorMecanico", checked)}
                    />
                    <Label htmlFor="ventiladorMecanico">Ventilador Mecánico o Respirador</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="valvulaPeep"
                      checked={formData.valvulaPeep || false}
                      onCheckedChange={(checked) => updateFormData("valvulaPeep", checked)}
                    />
                    <Label htmlFor="valvulaPeep">Válvula Peep.O</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="desfibrilador"
                      checked={formData.desfibrilador || false}
                      onCheckedChange={(checked) => updateFormData("desfibrilador", checked)}
                    />
                    <Label htmlFor="desfibrilador">Desfibrilador</Label>
                    <Checkbox
                      id="joules"
                      checked={formData.joules || false}
                      onCheckedChange={(checked) => updateFormData("joules", checked)}
                    />
                    <Label htmlFor="joules">Joules</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aspirador"
                      checked={!!formData.aspirador}
                      onCheckedChange={(checked) => updateFormData("aspirador", checked ? "Si" : "")}
                    />
                    <Label htmlFor="aspirador">Aspirador</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="capnografo"
                      checked={formData.capnografo || false}
                      onCheckedChange={(checked) => updateFormData("capnografo", checked)}
                    />
                    <Label htmlFor="capnografo">Capnógrafo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pulmoaire"
                      checked={formData.pulmoaire || false}
                      onCheckedChange={(checked) => updateFormData("pulmoaire", checked)}
                    />
                    <Label htmlFor="pulmoaire">Pulmoaire</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Transporte */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Transporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ambulanciaSolicitada">Ambulancia solicitada por</Label>
                <Input
                  id="ambulanciaSolicitada"
                  value={formData.ambulanciaSolicitada || ""}
                  onChange={(e) => updateFormData("ambulanciaSolicitada", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tel">Teléfono</Label>
                <Input id="tel" value={formData.tel || ""} onChange={(e) => updateFormData("tel", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccionServicio">Dirección del servicio de ambulancia</Label>
              <Input
                id="direccionServicio"
                value={formData.direccionServicio || ""}
                onChange={(e) => updateFormData("direccionServicio", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destinoPaciente">Destino del paciente</Label>
                <Input
                  id="destinoPaciente"
                  value={formData.destinoPaciente || ""}
                  onChange={(e) => updateFormData("destinoPaciente", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estudio">Estudio</Label>
                <Input
                  id="estudio"
                  value={formData.estudio || ""}
                  onChange={(e) => updateFormData("estudio", e.target.value)}
                />
              </div>
            </div>

            {/* Horarios */}
            <div className="space-y-2">
              <Label className="font-medium">Horarios</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="horarioLL1">H. LL 1</Label>
                  <Input
                    id="horarioLL1"
                    type="time"
                    value={formData.horarioLL1 || ""}
                    onChange={(e) => updateFormData("horarioLL1", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="horarioSa1">H. S 1</Label>
                  <Input
                    id="horarioSa1"
                    type="time"
                    value={formData.horarioSa1 || ""}
                    onChange={(e) => updateFormData("horarioSa1", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="horarioLL2">H. LL 2</Label>
                  <Input
                    id="horarioLL2"
                    type="time"
                    value={formData.horarioLL2 || ""}
                    onChange={(e) => updateFormData("horarioLL2", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="horarioSa2">H. S 2</Label>
                  <Input
                    id="horarioSa2"
                    type="time"
                    value={formData.horarioSa2 || ""}
                    onChange={(e) => updateFormData("horarioSa2", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="space-y-1">
                  <Label htmlFor="horarioLL3">H. LL 3</Label>
                  <Input
                    id="horarioLL3"
                    type="time"
                    value={formData.horarioLL3 || ""}
                    onChange={(e) => updateFormData("horarioLL3", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="horarioSa3">H. S 3</Label>
                  <Input
                    id="horarioSa3"
                    type="time"
                    value={formData.horarioSa3 || ""}
                    onChange={(e) => updateFormData("horarioSa3", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="horarioLL4">H. LL 4</Label>
                  <Input
                    id="horarioLL4"
                    type="time"
                    value={formData.horarioLL4 || ""}
                    onChange={(e) => updateFormData("horarioLL4", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="horarioSa4">H. S 4</Label>
                  <Input
                    id="horarioSa4"
                    type="time"
                    value={formData.horarioSa4 || ""}
                    onChange={(e) => updateFormData("horarioSa4", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tipo de servicio de ambulancia */}
            <div className="space-y-2">
              <Label className="font-medium">Servicio de ambulancia</Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="servicioSimple"
                    checked={formData.servicioSimple || false}
                    onCheckedChange={(checked) => updateFormData("servicioSimple", checked)}
                  />
                  <Label htmlFor="servicioSimple">Simple</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="redondo"
                    checked={formData.redondo || false}
                    onCheckedChange={(checked) => updateFormData("redondo", checked)}
                  />
                  <Label htmlFor="redondo">Redondo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fallido"
                    checked={formData.fallido || false}
                    onCheckedChange={(checked) => updateFormData("fallido", checked)}
                  />
                  <Label htmlFor="fallido">Fallido</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsable y Acompañante */}
        <Card>
          <CardHeader>
            <CardTitle>Responsable y Acompañante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsablePaciente">Responsable del paciente</Label>
                <Input
                  id="responsablePaciente"
                  value={formData.responsablePaciente || ""}
                  onChange={(e) => updateFormData("responsablePaciente", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="acompanante">Acompañante</Label>
                  <Input
                    id="acompanante"
                    value={formData.acompanante || ""}
                    onChange={(e) => updateFormData("acompanante", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ccAcompanante">C.C.</Label>
                  <Input
                    id="ccAcompanante"
                    value={formData.ccAcompanante || ""}
                    onChange={(e) => updateFormData("ccAcompanante", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recomendacionesTraslado">Recomendaciones al Traslado</Label>
              <Textarea
                id="recomendacionesTraslado"
                value={formData.recomendacionesTraslado || ""}
                onChange={(e) => updateFormData("recomendacionesTraslado", e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Medicamentos e Insumos */}
        <Card>
          <CardHeader>
            <CardTitle>Medicamentos / Insumos Utilizados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-6 gap-2 font-medium">
              <div className="col-span-2">Descripción</div>
              <div>Cant.</div>
              <div className="col-span-2">Descripción</div>
              <div>Cant.</div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <span>1.</span>
                  <Input
                    value={formData.medicamentosInsumos?.[0]?.descripcion || ""}
                    onChange={(e) => updateMedicamento(0, "descripcion", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Input
                  type="number"
                  value={formData.medicamentosInsumos?.[0]?.cantidad || ""}
                  onChange={(e) => updateMedicamento(0, "cantidad", Number(e.target.value))}
                />
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <span>3.</span>
                  <Input
                    value={formData.medicamentosInsumos?.[2]?.descripcion || ""}
                    onChange={(e) => updateMedicamento(2, "descripcion", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Input
                  type="number"
                  value={formData.medicamentosInsumos?.[2]?.cantidad || ""}
                  onChange={(e) => updateMedicamento(2, "cantidad", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <span>2.</span>
                  <Input
                    value={formData.medicamentosInsumos?.[1]?.descripcion || ""}
                    onChange={(e) => updateMedicamento(1, "descripcion", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Input
                  type="number"
                  value={formData.medicamentosInsumos?.[1]?.cantidad || ""}
                  onChange={(e) => updateMedicamento(1, "cantidad", Number(e.target.value))}
                />
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <span>4.</span>
                  <Input
                    value={formData.medicamentosInsumos?.[3]?.descripcion || ""}
                    onChange={(e) => updateMedicamento(3, "descripcion", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Input
                  type="number"
                  value={formData.medicamentosInsumos?.[3]?.cantidad || ""}
                  onChange={(e) => updateMedicamento(3, "cantidad", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-3"></div>
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <span>5.</span>
                  <Input
                    value={formData.medicamentosInsumos?.[4]?.descripcion || ""}
                    onChange={(e) => updateMedicamento(4, "descripcion", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Input
                  type="number"
                  value={formData.medicamentosInsumos?.[4]?.cantidad || ""}
                  onChange={(e) => updateMedicamento(4, "cantidad", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-3"></div>
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <span>6.</span>
                  <Input
                    value={formData.medicamentosInsumos?.[5]?.descripcion || ""}
                    onChange={(e) => updateMedicamento(5, "descripcion", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Input
                  type="number"
                  value={formData.medicamentosInsumos?.[5]?.cantidad || ""}
                  onChange={(e) => updateMedicamento(5, "cantidad", Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Servicio */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ordenServicioNo">Orden del servicio No.</Label>
                <Input
                  id="ordenServicioNo"
                  value={formData.ordenServicioNo || ""}
                  onChange={(e) => updateFormData("ordenServicioNo", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remision">Remisión</Label>
                <Input
                  id="remision"
                  value={formData.remision || ""}
                  onChange={(e) => updateFormData("remision", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="factura">Factura</Label>
                <Input
                  id="factura"
                  value={formData.factura || ""}
                  onChange={(e) => updateFormData("factura", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluación del Servicio */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluación del Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium">¿Cómo le pareció el servicio?</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="muyBuena"
                    name="comoParecioServicio"
                    checked={formData.comoParecioServicio === "MUY_BUENA"}
                    onChange={() => updateFormData("comoParecioServicio", "MUY_BUENA")}
                  />
                  <Label htmlFor="muyBuena">MUY BUENA</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="buena"
                    name="comoParecioServicio"
                    checked={formData.comoParecioServicio === "BUENA"}
                    onChange={() => updateFormData("comoParecioServicio", "BUENA")}
                  />
                  <Label htmlFor="buena">BUENA</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="regular"
                    name="comoParecioServicio"
                    checked={formData.comoParecioServicio === "REGULAR"}
                    onChange={() => updateFormData("comoParecioServicio", "REGULAR")}
                  />
                  <Label htmlFor="regular">REGULAR</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="mala"
                    name="comoParecioServicio"
                    checked={formData.comoParecioServicio === "MALA"}
                    onChange={() => updateFormData("comoParecioServicio", "MALA")}
                  />
                  <Label htmlFor="mala">MALA</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="muyMala"
                    name="comoParecioServicio"
                    checked={formData.comoParecioServicio === "MUY_MALA"}
                    onChange={() => updateFormData("comoParecioServicio", "MUY_MALA")}
                  />
                  <Label htmlFor="muyMala">MUY MALA</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">¿Recomendaría a Familiares y Amigos?</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="definitivamenteSi"
                    checked={formData.definitivamenteSi || false}
                    onCheckedChange={(checked) => updateFormData("definitivamenteSi", checked)}
                  />
                  <Label htmlFor="definitivamenteSi">Definitivamente Si</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="probablementeSi"
                    checked={formData.probablementeSi || false}
                    onCheckedChange={(checked) => updateFormData("probablementeSi", checked)}
                  />
                  <Label htmlFor="probablementeSi">Probablemente Si</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="definitivamenteNo"
                    checked={formData.definitivamenteNo || false}
                    onCheckedChange={(checked) => updateFormData("definitivamenteNo", checked)}
                  />
                  <Label htmlFor="definitivamenteNo">Definitivamente No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="probablementeNo"
                    checked={formData.probablementeNo || false}
                    onCheckedChange={(checked) => updateFormData("probablementeNo", checked)}
                  />
                  <Label htmlFor="probablementeNo">Probablemente No</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Firmas */}
        <Card>
          <CardHeader>
            <CardTitle>Firmas</CardTitle>
            <CardDescription>Capture las firmas digitales requeridas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SignatureField
                label="Institución responsable del paciente"
                value={formData.firmaSelloResponsable || ""}
                onChange={(signature) => updateFormData("firmaSelloResponsable", signature)}
                placeholder="Firma y sello de la institución responsable"
              />
              <SignatureField
                label="Funcionario de AMED"
                value={formData.funcionarioAMED || ""}
                onChange={(signature) => updateFormData("funcionarioAMED", signature)}
                placeholder="Firma y sello del funcionario"
              />
            </div>
            <div className="max-w-md">
              <SignatureField
                label="Institución que recibe el paciente"
                value={formData.firmaInstitucionRecibePaciente || ""}
                onChange={(signature) => updateFormData("firmaInstitucionRecibePaciente", signature)}
                placeholder="Firma y sello de la institución receptora"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/aph-digital">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Guardando..." : "Guardar Formulario"}
          </Button>
        </div>
      </form>
    </div>
  )
}
