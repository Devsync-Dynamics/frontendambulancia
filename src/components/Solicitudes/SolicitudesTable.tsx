import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, UserCheck, UserX } from "lucide-react";

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
  tipoVista: 'enviar' | 'recibir';
  onAceptar?: (id: string) => void;
  onRechazar?: (id: string) => void;
};

const estadoColors = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-400',
  en_proceso: 'bg-blue-100 text-blue-800 border-l-4 border-blue-400',
  completado: 'bg-green-100 text-green-800 border-l-4 border-green-400',
  cancelado: 'bg-red-100 text-red-800 border-l-4 border-red-400',
};

const prioridadColors = {
  baja: 'bg-gray-100 text-gray-800 border-l-4 border-gray-400',
  media: 'bg-orange-100 text-orange-800 border-l-4 border-orange-400',
  alta: 'bg-red-100 text-red-800 border-l-4 border-red-400',
};

export const SolicitudesTable: React.FC<SolicitudesTableProps> = ({ 
  solicitudes, 
  tipoVista,
  onAceptar,
  onRechazar
}) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-teal-200 bg-teal-50">
      <Table className="min-w-full divide-y divide-teal-200">
        <thead className="bg-teal-200">
          <TableRow>
            <TableHead className="py-4 px-6 text-left text-xs font-semibold text-teal-900 uppercase tracking-wider">
              Paciente
            </TableHead>
            <TableHead className="py-4 px-6 text-left text-xs font-semibold text-teal-900 uppercase tracking-wider">
              Origen
            </TableHead>
            <TableHead className="py-4 px-6 text-left text-xs font-semibold text-teal-900 uppercase tracking-wider">
              Destino
            </TableHead>
            <TableHead className="py-4 px-6 text-left text-xs font-semibold text-teal-900 uppercase tracking-wider">
              Fecha
            </TableHead>
            <TableHead className="py-4 px-6 text-left text-xs font-semibold text-teal-900 uppercase tracking-wider">
              Estado
            </TableHead>
            <TableHead className="py-4 px-6 text-left text-xs font-semibold text-teal-900 uppercase tracking-wider">
              Prioridad
            </TableHead>
            {tipoVista === 'recibir' && (
              <TableHead className="py-4 px-6 text-left text-xs font-semibold text-teal-900 uppercase tracking-wider">
                Acciones
              </TableHead>
            )}
          </TableRow>
        </thead>
        <TableBody className="bg-teal-50">
          {solicitudes.map((solicitud) => (
            <TableRow key={solicitud.id} className="hover:bg-teal-100">
              <TableCell className="py-4 px-6 text-teal-900">{solicitud.paciente}</TableCell>
              <TableCell className="py-4 px-6 text-teal-900">{solicitud.origen}</TableCell>
              <TableCell className="py-4 px-6 text-teal-900">{solicitud.destino}</TableCell>
              <TableCell className="py-4 px-6 text-teal-900">{solicitud.fecha}</TableCell>
              <TableCell className="py-4 px-6">
                <Badge className={`${estadoColors[solicitud.estado]} py-1 px-3 rounded-full`}>
                  {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="py-4 px-6">
                <Badge className={`${prioridadColors[solicitud.prioridad]} py-1 px-3 rounded-full`}>
                  {solicitud.prioridad.charAt(0).toUpperCase() + solicitud.prioridad.slice(1)}
                </Badge>
              </TableCell>
              {tipoVista === 'recibir' && (
                <TableCell className="py-4 px-6 flex space-x-4">
                  <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white flex items-center"
                    onClick={() => onAceptar && onAceptar(solicitud.id)}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Aceptar
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center"
                    onClick={() => onRechazar && onRechazar(solicitud.id)}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Rechazar
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SolicitudesTable;
