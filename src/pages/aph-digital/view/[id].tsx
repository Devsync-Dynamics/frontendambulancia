"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Printer } from "lucide-react"
import Link from "next/link"
import { type IAphDigital, aphDigitalService } from "@/services/aph-digital.service"

export default function ViewAphDigitalPage() {
  const router = useRouter()
  const { id } = router.query
  const [formulario, setFormulario] = useState<IAphDigital | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadFormulario()
    }
  }, [id])

  const loadFormulario = async () => {
    if (id) {
      const data = await aphDigitalService.getAphDigitalById(Number(id))
      setFormulario(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Cargando formulario...</p>
      </div>
    )
  }

  if (!formulario) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p>Formulario no encontrado</p>
            <Link href="/aph-digital">
              <Button className="mt-4">Volver a la lista</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getServiceType = () => {
    if (formulario.ambulanciaBasica) return "Ambulancia Básica"
    if (formulario.medicalizado) return "Medicalizado"
    if (formulario.consultaMedica) return "Consulta Médica"
    return "No especificado"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/aph-digital">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Formulario APH #{formulario.numeroFormulario}</h1>
            <p className="text-muted-foreground">Visualización del formulario pre-hospitalario</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/aph-digital/edit/${formulario.id}`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Link href={`/aph-digital/print/${formulario.id}`}>
            <Button>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </Link>
        </div>
      </div>

      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Información Básica
            <Badge variant="secondary">{getServiceType()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Número de Formulario</p>
              <p className="text-lg">{formulario.numeroFormulario}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Placa</p>
              <p className="text-lg">{formulario.placa}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">C.C.</p>
              <p className="text-lg">{formulario.cc}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha</p>
              <p className="text-lg">{new Date(formulario.fecha).toLocaleDateString()}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre del Paciente</p>
              <p className="text-xl font-semibold">{formulario.nombrePaciente}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Edad</p>
                <p>{formulario.edad || "No especificada"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sexo</p>
                <p>
                  {formulario.sexo === "M" ? "Masculino" : formulario.sexo === "F" ? "Femenino" : "No especificado"}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Identificación</p>
              <p>{formulario.identificacion || "No especificada"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estado Civil</p>
              <p>{formulario.estadoCivil || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">EPS</p>
              <p>{formulario.eps || "No especificada"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico y Evolución */}
      {(formulario.diagnostico || formulario.notaEvolucion) && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico y Evolución</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formulario.diagnostico && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Diagnóstico</p>
                <p className="bg-muted p-3 rounded-md">{formulario.diagnostico}</p>
              </div>
            )}
            {formulario.notaEvolucion && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Nota de Evolución</p>
                <p className="bg-muted p-3 rounded-md">{formulario.notaEvolucion}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Signos Vitales */}
      {(formulario.fc || formulario.fr || formulario.temp || formulario.ta) && (
        <Card>
          <CardHeader>
            <CardTitle>Signos Vitales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formulario.fc && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">FC</p>
                  <p className="text-lg">{formulario.fc}</p>
                </div>
              )}
              {formulario.fr && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">FR</p>
                  <p className="text-lg">{formulario.fr}</p>
                </div>
              )}
              {formulario.temp && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Temperatura</p>
                  <p className="text-lg">{formulario.temp}</p>
                </div>
              )}
              {formulario.ta && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">TA</p>
                  <p className="text-lg">{formulario.ta}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información Adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formulario.aceptadoPor && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aceptado por</p>
                <p>{formulario.aceptadoPor}</p>
              </div>
            )}
            {formulario.estadoclinicopac && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado Clínico del Paciente</p>
                <p>{formulario.estadoclinicopac}</p>
              </div>
            )}
          </div>
          {formulario.createdAt && (
            <div className="text-sm text-muted-foreground">
              <p>Creado el: {new Date(formulario.createdAt).toLocaleString()}</p>
              {formulario.updatedAt && formulario.updatedAt !== formulario.createdAt && (
                <p>Última actualización: {new Date(formulario.updatedAt).toLocaleString()}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
