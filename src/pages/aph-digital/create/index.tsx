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

export default function CreateAphDigitalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateAphDigitalDto>({
    numeroFormulario: "",
    placa: "",
    cc: "",
    fecha: new Date().toISOString().split("T")[0],
    nombrePaciente: "",
    medicamentosInsumos: [],
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
