'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Factura } from "./Facturacion"

interface GraficoLinealProps {
  facturas: Factura[]
}

export default function GraficoLineal({ facturas }: GraficoLinealProps) {
  const datosGrafico = facturas
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map(factura => ({
      fecha: factura.fecha,
      valor: factura.valor / 1000000, // Convertir a millones para mejor visualización
    }))

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-teal-800">Evolución de Facturación</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="valor" stroke="#14b8a6" name="Valor (Millones COP)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}