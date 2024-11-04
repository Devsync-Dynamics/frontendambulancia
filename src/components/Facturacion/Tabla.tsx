import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Factura } from "./Facturacion"

interface TablaFacturasProps {
  facturas: Factura[]
}

export default function TablaFacturas({ facturas }: TablaFacturasProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-teal-800">Número</TableHead>
          <TableHead className="text-teal-800">Fecha</TableHead>
          <TableHead className="text-teal-800">Valor</TableHead>
          <TableHead className="text-teal-800">Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {facturas.map((factura) => (
          <TableRow key={factura.id} className="hover:bg-teal-50">
            <TableCell>{factura.numero}</TableCell>
            <TableCell>{factura.fecha}</TableCell>
            <TableCell>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(factura.valor)}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                factura.estado === 'Facturada' ? 'bg-teal-100 text-teal-800' :
                factura.estado === 'Rechazada' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {factura.estado}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}