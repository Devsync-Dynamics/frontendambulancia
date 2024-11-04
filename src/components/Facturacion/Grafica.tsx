'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Factura } from "./Facturacion"

interface ResumenGraficoProps {
  facturas: Factura[]
}

export default function ResumenGrafico({ facturas }: ResumenGraficoProps) {
  const datosGrafico = [
    {
      nombre: 'Mayo',
      facturadas: facturas.filter(f => f.estado === 'Facturada').reduce((sum, f) => sum + f.valor, 0) / 1000000,
      rechazadas: facturas.filter(f => f.estado === 'Rechazada').reduce((sum, f) => sum + f.valor, 0) / 1000000,
      glosas: facturas.filter(f => f.estado === 'Glosa').reduce((sum, f) => sum + f.valor, 0) / 1000000,
    },
  ]

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-teal-800">Resumen de Facturación</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="facturadas" fill="#14b8a6" name="Facturadas" />
            <Bar dataKey="rechazadas" fill="#ef4444" name="Rechazadas" />
            <Bar dataKey="glosas" fill="#eab308" name="Glosas" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}