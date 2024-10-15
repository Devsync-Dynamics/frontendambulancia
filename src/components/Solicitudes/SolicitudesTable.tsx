import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";

export type Solicitud = {
  id: string;
  paciente: string;
  origen: string;
  destino: string;
  fecha: string;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  prioridad: 'baja' | 'media' | 'alta';
};

type SolicitudesTableProps = {
  solicitudes: Solicitud[];
  onAceptar: (id: string) => void;
  onRechazar: (id: string) => void;
};

const estadoColors = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  completado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

const prioridadColors = {
  baja: 'bg-gray-100 text-gray-800',
  media: 'bg-orange-100 text-orange-800',
  alta: 'bg-red-100 text-red-800',
};

export const SolicitudesTable: React.FC<SolicitudesTableProps> = ({ solicitudes, onAceptar, onRechazar }) => {
  return (
    <Table className="w-full bg-white rounded-lg shadow-md">
      <TableHeader className="bg-blue-900 text-white">
        <TableRow>
          <TableHead className="font-semibold">Paciente</TableHead>
          <TableHead className="font-semibold">Origen</TableHead>
          <TableHead className="font-semibold">Destino</TableHead>
          <TableHead className="font-semibold">Fecha</TableHead>
          <TableHead className="font-semibold">Estado</TableHead>
          <TableHead className="font-semibold">Prioridad</TableHead>
          <TableHead className="font-semibold">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {solicitudes.map((solicitud) => (
          <TableRow key={solicitud.id} className="hover:bg-blue-50 transition-colors">
            <TableCell className="font-medium">{solicitud.paciente}</TableCell>
            <TableCell>{solicitud.origen}</TableCell>
            <TableCell>{solicitud.destino}</TableCell>
            <TableCell>{solicitud.fecha}</TableCell>
            <TableCell>
              <Badge className={`${estadoColors[solicitud.estado]} capitalize`}>
                {solicitud.estado.replace('_', ' ')}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={`${prioridadColors[solicitud.prioridad]} capitalize`}>
                {solicitud.prioridad}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  onClick={() => onAceptar(solicitud.id)}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Aceptar
                </Button>
                <Button
                  onClick={() => onRechazar(solicitud.id)}
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  Rechazar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SolicitudesTable;