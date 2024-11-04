'use client'

import React, { useState, useEffect } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from 'lucide-react'
import ResumenCard from './Card'
import ResumenGrafico from './Grafica'
import GraficoLineal from './GraficaLineal'
import GraficoPastel from './GraficoPastel'
import TablaFacturas from './Tabla'

export interface Factura {
  id: string
  numero: string
  fecha: string
  valor: number
  estado: 'Facturada' | 'Rechazada' | 'Glosa'
}

const obtenerDatosDian = async (): Promise<Factura[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    { id: '1', numero: 'F001', fecha: '2023-05-01', valor: 1000000, estado: 'Facturada' },
    { id: '2', numero: 'F002', fecha: '2023-05-02', valor: 1500000, estado: 'Facturada' },
    { id: '3', numero: 'F003', fecha: '2023-05-03', valor: 800000, estado: 'Rechazada' },
    { id: '4', numero: 'F004', fecha: '2023-05-04', valor: 2000000, estado: 'Glosa' },
    { id: '5', numero: 'F005', fecha: '2023-05-05', valor: 1200000, estado: 'Facturada' },
    { id: '6', numero: 'F006', fecha: '2023-05-06', valor: 900000, estado: 'Facturada' },
    { id: '7', numero: 'F007', fecha: '2023-05-07', valor: 1800000, estado: 'Glosa' },
  ]
}

export default function FacturacionDian() {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true)
      try {
        const datos = await obtenerDatosDian()
        setFacturas(datos)
      } catch (error) {
        console.error('Error al cargar los datos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    cargarDatos()
  }, [])

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold text-teal-800">Facturación DIAN</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ResumenCard 
                titulo="Total Facturado"
                valor={facturas.filter(f => f.estado === 'Facturada').reduce((sum, f) => sum + f.valor, 0)}
                icono="FileText"
                colorClase="bg-teal-100 text-teal-800"
              />
              <ResumenCard 
                titulo="Total Rechazado"
                valor={facturas.filter(f => f.estado === 'Rechazada').reduce((sum, f) => sum + f.valor, 0)}
                icono="AlertTriangle"
                colorClase="bg-red-100 text-red-800"
              />
              <ResumenCard 
                titulo="Total en Glosa"
                valor={facturas.filter(f => f.estado === 'Glosa').reduce((sum, f) => sum + f.valor, 0)}
                icono="DollarSign"
                colorClase="bg-yellow-100 text-yellow-800"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResumenGrafico facturas={facturas} />
              <GraficoLineal facturas={facturas} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GraficoPastel facturas={facturas} />
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-teal-800">Detalle de Facturas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="todas">
                    <TabsList className="bg-teal-100">
                      <TabsTrigger value="todas" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">Todas</TabsTrigger>
                      <TabsTrigger value="facturadas" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">Facturadas</TabsTrigger>
                      <TabsTrigger value="rechazadas" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">Rechazadas</TabsTrigger>
                      <TabsTrigger value="glosas" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">Glosas</TabsTrigger>
                    </TabsList>
                    <TabsContent value="todas">
                      <TablaFacturas facturas={facturas} />
                    </TabsContent>
                    <TabsContent value="facturadas">
                      <TablaFacturas facturas={facturas.filter(f => f.estado === 'Facturada')} />
                    </TabsContent>
                    <TabsContent value="rechazadas">
                      <TablaFacturas facturas={facturas.filter(f => f.estado === 'Rechazada')} />
                    </TabsContent>
                    <TabsContent value="glosas">
                      <TablaFacturas facturas={facturas.filter(f => f.estado === 'Glosa')} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  )
}