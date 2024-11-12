import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck } from 'lucide-react';
import { IAmbulancia, ITripulante, AmbulanciaFormData, ambulanciaService, IEstadoAmbulancia } from '@/services/ambulancia.service';
import { useEffect, useState } from "react";

interface AmbulanciaFormModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: AmbulanciaFormData;
  setFormData: (data: AmbulanciaFormData) => void;
  editingAmbulance: IAmbulancia | null;
  tripulantes: ITripulante[];
  loading: boolean;
}

export const AmbulanciaFormModal: React.FC<AmbulanciaFormModalProps> = ({
  show,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingAmbulance,
  tripulantes,
  loading
}) => {
  const [estados, setEstados] = useState<IEstadoAmbulancia[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);

  useEffect(() => {
    const fetchEstados = async () => {
      setLoadingEstados(true);
      try {
        const estadosData = await ambulanciaService.getEstadosAmbulancia();
        setEstados(estadosData);
      } catch (error) {
        console.error('Error al cargar estados:', error);
      } finally {
        setLoadingEstados(false);
      }
    };

    if (show) {
      fetchEstados();
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <Card className="max-w-md w-full shadow-xl bg-teal-50 border border-teal-200">
        <CardHeader>
          <CardTitle className="text-xl text-teal-700 flex items-center gap-2">
            <Truck className="h-6 w-6 text-teal-700" />
            {editingAmbulance ? 'Editar Ambulancia' : 'Nueva Ambulancia'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-teal-700">Placa</label>
              <Input
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                placeholder="Ingrese la placa"
                className="bg-teal-50 border border-teal-200 text-teal-700"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-teal-700">Tripulación</label>
              <ScrollArea className="h-40 w-full border border-teal-200 rounded-md p-2 bg-teal-50">
                {tripulantes.map((tripulante) => (
                  <div key={tripulante.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={formData.tripulacion.some(t => t.id === tripulante.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            tripulacion: [...formData.tripulacion, tripulante]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            tripulacion: formData.tripulacion.filter(t => t.id !== tripulante.id)
                          });
                        }
                      }}
                      className="rounded border-teal-200"
                    />
                    <span className="text-sm text-teal-700">{tripulante.nombre}</span>
                    <Badge className="ml-auto bg-teal-200 text-teal-700">{tripulante.idrol}</Badge>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-teal-700">Estado</label>
              <Select
                value={formData.estado?.id}
                onValueChange={(value) => {
                  const selectedEstado = estados.find(estado => estado.id === value);
                  if (selectedEstado) {
                    setFormData({
                      ...formData,
                      estado: selectedEstado
                    });
                  }
                }}
                disabled={loadingEstados || estados.length === 0}
              >
                <SelectTrigger className="bg-teal-50 border border-teal-200 text-teal-700">
                  <SelectValue placeholder={loadingEstados ? "Cargando estados..." : "Seleccione el estado"} />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((estado) => (
                    <SelectItem key={estado.id} value={estado.id}>
                      {estado.estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-teal-700">Ubicación Actual</label>
              <Input
                value={formData.ubicacionActual}
                onChange={(e) => setFormData({ ...formData, ubicacionActual: e.target.value })}
                placeholder="Ubicación actual"
                className="bg-teal-50 border border-teal-200 text-teal-700"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-teal-700 text-teal-700"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={onSubmit}
                className="flex-1 bg-teal-700 hover:bg-teal-600 text-white"
                disabled={loading || loadingEstados}
              >
                {loading ? 'Guardando...' : (editingAmbulance ? 'Guardar Cambios' : 'Crear Ambulancia')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};