"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Edit, Printer, Filter } from "lucide-react"
import Link from "next/link"
import { type IAphDigital, type IAphDigitalFilters, aphDigitalService } from "@/services/aph-digital.service"

export default function AphDigitalListPage() {
  const [formularios, setFormularios] = useState<IAphDigital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<IAphDigitalFilters>({})

  useEffect(() => {
    loadFormularios()
  }, [filters])

  const loadFormularios = async () => {
    setLoading(true)
    const data = await aphDigitalService.getAphDigitals(filters)
    setFormularios(data)
    setLoading(false)
  }

  const filteredFormularios = formularios.filter(
    (form) =>
      form.nombrePaciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.numeroFormulario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.placa.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getServiceType = (form: IAphDigital) => {
    if (form.ambulanciaBasica) return "Ambulancia Básica"
    if (form.medicalizado) return "Medicalizado"
    if (form.consultaMedica) return "Consulta Médica"
    return "No especificado"
  }

  const getServiceBadgeColor = (form: IAphDigital) => {
    if (form.ambulanciaBasica) return "bg-blue-100 text-blue-800"
    if (form.medicalizado) return "bg-red-100 text-red-800"
    if (form.consultaMedica) return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Formularios APH Digital</h1>
          <p className="text-muted-foreground">Gestión de formularios pre-hospitalarios</p>
        </div>
        <Link href="/aph-digital/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Formulario
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar y Filtrar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, número de formulario o placa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <p>Cargando formularios...</p>
          </div>
        ) : filteredFormularios.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron formularios</p>
            </CardContent>
          </Card>
        ) : (
          filteredFormularios.map((formulario) => (
            <Card key={formulario.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{formulario.nombrePaciente}</h3>
                      <Badge className={getServiceBadgeColor(formulario)}>{getServiceType(formulario)}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Formulario:</span> {formulario.numeroFormulario}
                      </div>
                      <div>
                        <span className="font-medium">Placa:</span> {formulario.placa}
                      </div>
                      <div>
                        <span className="font-medium">Fecha:</span> {new Date(formulario.fecha).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">EPS:</span> {formulario.eps || "No especificada"}
                      </div>
                    </div>
                    {formulario.diagnostico && (
                      <div className="text-sm">
                        <span className="font-medium">Diagnóstico:</span> {formulario.diagnostico}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/aph-digital/view/${formulario.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/aph-digital/edit/${formulario.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/aph-digital/print/${formulario.id}`}>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
