import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Edit, Trash2, User, MapPin, Calendar } from 'lucide-react';
import { IAmbulancia, IEstadoAmbulancia } from '@/services/ambulancia.service';
import ClientOnlyTimestamp from '../ClientOnlyTimestamp';
import React from "react";

interface AmbulanciaListProps {
  ambulancias: IAmbulancia[];
  onEdit: (ambulancia: IAmbulancia) => void;
  onDelete: (id: number) => void;
}

export const AmbulanciaList: React.FC<AmbulanciaListProps> = ({
  ambulancias,
  onEdit,
  onDelete
}) => {
  const getStatusColor = (estado: IEstadoAmbulancia): string => {
    // Mapeo basado en el estado.estado en lugar del ID
    const statusColors: { [key: string]: string } = {
      'Disponible': 'bg-green-500 text-white',
      'En servicio': 'bg-yellow-500 text-black',
      'En mantenimiento': 'bg-red-500 text-white',
     // 'INACTIVO': 'bg-gray-500 text-white'
    };
    return statusColors[estado.estado] || 'bg-gray-500 text-white';
  };

  return (
    <ScrollArea className="h-[500px] w-full pr-4">
      {ambulancias.map((ambulancia) => (
        <div key={ambulancia.id} className="mb-4 p-6 rounded-lg border border-teal-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-teal-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-teal-700">
              <Truck className="h-5 w-5 text-teal-600" />
              {ambulancia.placa}
            </h3>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(ambulancia.estado)} px-3 py-1 text-sm font-medium`}>
                {ambulancia.estado.estado}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(ambulancia)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(ambulancia.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-teal-600">
            <p className="flex items-center gap-2">
              {ambulancia.user.map((tripulante) => (
                <React.Fragment key={tripulante.id}>
                  <User className="h-4 w-4 text-teal-400" /> {tripulante.nombre} {tripulante.apellido}
                </React.Fragment>
              ))}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-400" /> {ambulancia.ubicacionActual}
            </p>
            <p className="flex items-center gap-2 col-span-2 text-xs text-teal-500">
              <Calendar className="h-3 w-3" /> Última actualización: <ClientOnlyTimestamp timestamp={ambulancia.updatedAt} />
            </p>
          </div>
        </div>
      ))}
    </ScrollArea>
  );
};