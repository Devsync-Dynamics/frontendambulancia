import { Card, CardContent } from "@/components/ui/card";
import { Activity, Truck, AlertCircle, Clock } from 'lucide-react';
import { IAmbulancia } from '@/services/ambulancia.service';

interface AmbulanciaSearchProps {
  ambulancias: IAmbulancia[];
}

export const AmbulanciaSearch: React.FC<AmbulanciaSearchProps> = ({ ambulancias }) => {
  const stats = [
    { 
      label: 'Total Ambulancias', 
      value: ambulancias.length, 
      icon: Truck, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      label: 'Disponibles',  
      value: ambulancias.filter(a => a.estado.estado === 'Disponible').length, 
      icon: AlertCircle, 
      color: 'bg-green-100 text-green-600' 
    },
    { 
      label: 'En Servicio', 
      value: ambulancias.filter(a => a.estado.estado === 'En servicio').length, 
      icon: Clock, 
      color: 'bg-yellow-100 text-yellow-600' 
    },
    { 
      label: 'En Mantenimiento', 
      value: ambulancias.filter(a => a.estado.estado === 'En mantenimiento').length, 
      icon: Activity, 
      color: 'bg-red-100 text-red-600' 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
          <CardContent className="flex items-center p-6">
            <div className={`rounded-full p-3 mr-4 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};