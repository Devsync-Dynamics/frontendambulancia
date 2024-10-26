import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, UserX } from "lucide-react";

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

const ITEMS_PER_PAGE = 5;

export const SolicitudesTable: React.FC<SolicitudesTableProps> = ({ 
  solicitudes, 
  tipoVista,
  onAceptar,
  onRechazar
}) => {
  // Recuperar valores de filtros del localStorage
  const getStoredValue = (key: string, defaultValue: string) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      return stored ? stored : defaultValue;
    }
    return defaultValue;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [estadoFilter, setEstadoFilter] = useState(() => 
    getStoredValue('estadoFilter', 'todos')
  );
  const [prioridadFilter, setPrioridadFilter] = useState(() => 
    getStoredValue('prioridadFilter', 'todos')
  );

  // Guardar filtros en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('estadoFilter', estadoFilter);
  }, [estadoFilter]);

  useEffect(() => {
    localStorage.setItem('prioridadFilter', prioridadFilter);
  }, [prioridadFilter]);

  // Reset a primera página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [estadoFilter, prioridadFilter]);

  // Aplicar filtros
  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter(solicitud => {
      const matchEstado = estadoFilter === 'todos' || solicitud.estado === estadoFilter;
      const matchPrioridad = prioridadFilter === 'todos' || solicitud.prioridad === prioridadFilter;
      return matchEstado && matchPrioridad;
    });
  }, [solicitudes, estadoFilter, prioridadFilter]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredSolicitudes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSolicitudes = filteredSolicitudes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-teal-900">Estado:</span>
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="en_proceso">En Proceso</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-teal-900">Prioridad:</span>
          <Select value={prioridadFilter} onValueChange={setPrioridadFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg shadow-md border border-teal-200 bg-teal-50">
        <Table>
          <TableHeader className="bg-teal-200">
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
          </TableHeader>
          <TableBody>
            {paginatedSolicitudes.map((solicitud) => (
              <TableRow key={solicitud.id} className="hover:bg-teal-100">
                <TableCell className="py-4 px-6 text-teal-900">{solicitud.paciente}</TableCell>
                <TableCell className="py-4 px-6 text-teal-900">{solicitud.origen}</TableCell>
                <TableCell className="py-4 px-6 text-teal-900">{solicitud.destino}</TableCell>
                <TableCell className="py-4 px-6 text-teal-900">{solicitud.fecha}</TableCell>
                <TableCell className="py-4 px-6">
                  <Badge className={`${estadoColors[solicitud.estado]} py-1 px-3 rounded-full`}>
                    {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1).replace('_', ' ')}
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

      {/* Paginación */}
      <div className="flex justify-between items-center p-4 bg-teal-50 rounded-lg border border-teal-200">
        <div className="text-sm text-teal-900">
          Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredSolicitudes.length)} de {filteredSolicitudes.length} registros
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="border-teal-200 text-teal-900 hover:bg-teal-100"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="border-teal-200 text-teal-900 hover:bg-teal-100"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SolicitudesTable;