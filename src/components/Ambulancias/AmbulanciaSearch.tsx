import { useState } from 'react';
import { Search, AlertCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { IAmbulancia, ambulanciaService } from '@/services/ambulancia.service';

interface AmbulanciaSearchProps {
  ambulancia: IAmbulancia[];
}

export const AmbulanciaSearch = ({ ambulancia }: AmbulanciaSearchProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [ambulanciaCercana, setAmbulanciaCercana] = useState<IAmbulancia | null>(null);
  const { toast } = useToast();

  const getStatusColor = (estado: string): string => ({
    'Disponible': 'bg-green-100 text-green-800',
    'En mantenimiento': 'bg-red-100 text-red-800',
    'En servicio': 'bg-yellow-100 text-yellow-800'
  }[estado] || 'bg-gray-100 text-gray-800');

  const buscarUbicacion = async () => {
    if (!busqueda.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una ubicación para buscar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const ubicacion = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };

        try {
          const result = await ambulanciaService.findNearestambulancia(
            ubicacion.latitude,
            ubicacion.longitude
          );
          
          setAmbulanciaCercana(result);
          
          if (result) {
            toast({
              title: "Éxito",
              description: "Se encontró la ambulancia más cercana",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Error al buscar ambulancia cercana",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "No se encontró la ubicación especificada",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al buscar la ubicación",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buscarUbicacionActual = async () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "La geolocalización no está disponible en tu navegador",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await ambulanciaService.findNearestambulancia(
            position.coords.latitude,
            position.coords.longitude
          );
          
          setAmbulanciaCercana(result);
          
          if (result) {
            toast({
              title: "Éxito",
              description: "Se encontró la ambulancia más cercana",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Error al buscar ambulancia cercana",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        toast({
          title: "Error",
          description: "No se pudo obtener tu ubicación actual",
          variant: "destructive",
        });
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ingresa una ubicación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && buscarUbicacion()}
            />
            <Button
              onClick={buscarUbicacion}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">O</span>
            </div>
          </div>

          <Button
            onClick={buscarUbicacionActual}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-6"
            disabled={isLoading}
          >
            <MapPin className="h-5 w-5" />
            {isLoading ? 'Buscando...' : 'Usar mi ubicación actual'}
          </Button>
        </CardContent>
      </Card>

      {ambulanciaCercana && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="max-w-md w-full shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-blue-600" />
                Ambulancia más cercana encontrada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Placa</p>
                    <p className="font-semibold text-blue-900">{ambulanciaCercana.placa}</p>
                  </div>
                  {ambulanciaCercana.distancia && (
                    <div>
                      <p className="text-sm font-medium text-blue-600">Distancia</p>
                      <p className="font-semibold text-blue-900">
                        {ambulanciaCercana.distancia.toFixed(2)} km
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-blue-600">Estado</p>
                    <Badge className={getStatusColor(ambulanciaCercana.estado.estado)}>
                      {ambulanciaCercana.estado.estado}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-blue-600">Ubicación Actual</p>
                    <p className="font-semibold text-blue-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-400" />
                      {ambulanciaCercana.ubicacionActual}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setAmbulanciaCercana(null)}
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};