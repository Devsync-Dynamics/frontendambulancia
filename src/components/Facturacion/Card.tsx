import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertTriangle, DollarSign } from 'lucide-react'

interface ResumenCardProps {
  titulo: string
  valor: number
  icono: 'FileText' | 'AlertTriangle' | 'DollarSign'
  colorClase: string
}

const iconos = {
  FileText,
  AlertTriangle,
  DollarSign
}

export default function ResumenCard({ titulo, valor, icono, colorClase }: ResumenCardProps) {
  const IconoComponente = iconos[icono]
  const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })

  return (
    <Card className={`${colorClase} shadow-lg`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
        <IconoComponente className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatoMoneda.format(valor)}
        </div>
      </CardContent>
    </Card>
  )
}