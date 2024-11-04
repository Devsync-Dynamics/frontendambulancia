'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Factura } from "./Facturacion"

interface GraficoPastelProps {
  facturas: Factura[]
}

export default function GraficoPastel({ facturas }: GraficoPastelProps) {
  const datosGrafico = [
    { name: 'Facturadas', value: facturas.filter(f => f.estado === 'Facturada').reduce((sum, f) => sum + f.valor, 0) },
    { name: 'Rechazadas', value: facturas.filter(f => f.estado === 'Rechazada').reduce((sum, f) => sum + f.valor, 0) },
    { name: 'Glosas', value: facturas.filter(f => f.estado === 'Glosa').reduce((sum, f) => sum + f.valor, 0) },
  ]

  const COLORS = ['#14b8a6', '#ef4444', '#eab308']

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-teal-800">Distribución de Facturación</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={datosGrafico}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {datosGrafico.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}