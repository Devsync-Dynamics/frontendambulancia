"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { type UpdateAphDigitalDto, aphDigitalService } from "@/services/aph-digital.service"

export default function EditAphDigitalPage() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<UpdateAphDigitalDto>({})

  useEffect(() => {
    if (id) {
      loadFormulario()
    }
  }, [id])

  const loadFormulario = async () => {
    if (id) {
      const data = await aphDigitalService.getAphDigitalById(Number(id))
      if (data) {
        setFormData(data)
      }
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const result = await aphDigitalService.updateAphDigital(Number(id), formData)
    if (result) {
      router.push(`/aph-digital/view/${id}`)
    }
    setSaving(false)
  }

  const updateFormData = (field: keyof UpdateAphDigitalDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Cargando formulario...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/aph-digital/view/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Formulario APH</h1>
          <p className="text-muted-foreground">Modificar formulario pre-hospitalario</p>
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
                <Label htmlFor="numeroFormulario">Número de Formulario</Label>
                <Input
                  id="numeroFormulario"
                  value={formData.numeroFormulario || ""}
                  onChange={(e) => updateFormData("numeroFormulario", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placa">Placa</Label>
                <Input
                  id="placa"
                  value={formData.placa || ""}
                  onChange={(e) => updateFormData("placa", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cc">C.C.</Label>
                <Input id="cc" value={formData.cc || ""} onChange={(e) => updateFormData("cc", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha ? formData.fecha.split("T")[0] : ""}
                  onChange={(e) => updateFormData("fecha", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombrePaciente">Nombre del Paciente</Label>
                <Input
                  id="nombrePaciente"
                  value={formData.nombrePaciente || ""}
                  onChange={(e) => updateFormData("nombrePaciente", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resto del formulario igual que en create pero con valores pre-poblados */}
        {/* ... (resto de las secciones del formulario) */}

        <div className="flex justify-end gap-4">
          <Link href={`/aph-digital/view/${id}`}>
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
