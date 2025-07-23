"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Edit, Printer, Filter, Activity, Calendar, User, FileText, Shield } from "lucide-react"
import Link from "next/link"
import { type IAphDigital, type IAphDigitalFilters, aphDigitalService } from "@/services/aph-digital.service"
import GeneralLayout from "@/components/GeneralLayout";

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

  const getServiceBadgeClass = (form: IAphDigital) => {
    if (form.ambulanciaBasica) return "medical-badge-primary"
    if (form.medicalizado) return "medical-badge-warning"
    if (form.consultaMedica) return "medical-badge-success"
    return "bg-muted text-muted-foreground border border-border"
  }

  return (
      <GeneralLayout>
    <div className="min-h-screen medical-bg-gradient">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center animate-slide-in-up">
          <div className="flex items-center gap-4">
            <div className="medical-icon-wrapper">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold medical-text-gradient">Formularios APH Digital</h1>
              <p className="text-muted-foreground">Gestión de formularios pre-hospitalarios</p>
            </div>
          </div>
          <Link href="/aph-digital/create">
            <Button className="medical-button-primary hover-lift">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Formulario
            </Button>
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="medical-grid grid-cols-1 md:grid-cols-4 animate-fade-in">
          <Card className="medical-section">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-medical-primary">{formularios.length}</p>
                </div>
                <div className="medical-icon-small">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-section">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ambulancia</p>
                  <p className="text-2xl font-bold text-medical-primary">
                    {formularios.filter((f) => f.ambulanciaBasica).length}
                  </p>
                </div>
                <div className="medical-icon-small">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-section">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medicalizado</p>
                  <p className="text-2xl font-bold text-medical-primary">
                    {formularios.filter((f) => f.medicalizado).length}
                  </p>
                </div>
                <div className="medical-icon-small">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-section">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Consulta</p>
                  <p className="text-2xl font-bold text-medical-primary">
                    {formularios.filter((f) => f.consultaMedica).length}
                  </p>
                </div>
                <div className="medical-icon-small">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Búsqueda */}
        <Card className="medical-section animate-slide-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Search className="h-5 w-5 text-medical-primary" />
              Buscar y Filtrar
            </CardTitle>
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
                    className="pl-10 medical-input-focus"
                  />
                </div>
              </div>
              <Button variant="outline" className="medical-button-secondary bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de formularios */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="loading mx-auto mb-4">
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <polyline id="back" points="0.157 23.954, 14 23.954, 21.843 48, 50 48"></polyline>
                  <polyline id="front" points="0.157 23.954, 14 23.954, 21.843 48, 50 48"></polyline>
                </svg>
              </div>
              <p className="text-muted-foreground">Cargando formularios...</p>
            </div>
          ) : filteredFormularios.length === 0 ? (
            <Card className="medical-section">
              <CardContent className="text-center py-12">
                <div className="medical-icon-wrapper mx-auto mb-4">
                  <FileText className="h-8 w-8" />
                </div>
                <p className="text-muted-foreground text-lg">No se encontraron formularios</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Intenta ajustar los filtros de búsqueda o crear un nuevo formulario
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFormularios.map((formulario, index) => (
              <Card
                key={formulario.id}
                className="medical-section hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="medical-icon-small">
                          <User className="h-4 w-4" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{formulario.nombrePaciente}</h3>
                        <Badge className={`${getServiceBadgeClass(formulario)} font-medium`}>
                          {getServiceType(formulario)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="medical-info-field">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-3 w-3 text-medical-primary" />
                            <span className="text-xs font-medium text-muted-foreground">Formulario</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{formulario.numeroFormulario}</p>
                        </div>

                        <div className="medical-info-field">
                          <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-3 w-3 text-medical-primary" />
                            <span className="text-xs font-medium text-muted-foreground">Placa</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{formulario.placa}</p>
                        </div>

                        <div className="medical-info-field">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-3 w-3 text-medical-primary" />
                            <span className="text-xs font-medium text-muted-foreground">Fecha</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {new Date(formulario.fecha).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="medical-info-field">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="h-3 w-3 text-medical-primary" />
                            <span className="text-xs font-medium text-muted-foreground">EPS</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{formulario.eps || "No especificada"}</p>
                        </div>
                      </div>

                      {formulario.diagnostico && (
                        <div className="medical-info-field">
                          <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-3 w-3 text-medical-primary" />
                            <span className="text-xs font-medium text-muted-foreground">Diagnóstico</span>
                          </div>
                          <p className="text-sm text-foreground line-clamp-2">{formulario.diagnostico}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-6">
                      <Link href={`/aph-digital/view/${formulario.id}`}>
                        <Button variant="outline" size="sm" className="hover-lift bg-transparent">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/aph-digital/edit/${formulario.id}`}>
                        <Button variant="outline" size="sm" className="hover-lift bg-transparent">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/aph-digital/print/${formulario.id}`}>
                        <Button variant="outline" size="sm" className="hover-lift bg-transparent">
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
    </div>
      </GeneralLayout>

  )
}
