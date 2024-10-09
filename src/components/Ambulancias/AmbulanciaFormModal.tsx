import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck } from 'lucide-react';
import { IAmbulancia, ITripulante, AmbulanciaFormData } from '@/services/ambulancia.service';

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
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" />
            {editingAmbulance ? 'Editar Ambulancia' : 'Nueva Ambulancia'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-600">Placa</label>
              <Input
                value={formData.placa}
                onChange={(e) => setFormData({...formData, placa: e.target.value})}
                placeholder="Ingrese la placa"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-600">Tripulación</label>
              <ScrollArea className="h-40 w-full border rounded-md p-2">
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
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{tripulante.nombre}</span>
                    <Badge className="ml-auto">{tripulante.idrol}</Badge>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-600">Estado</label>
              <Select
                value={formData.estadoId}
                onValueChange={(value) => setFormData({...formData, estadoId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                  <SelectItem value="EN_SERVICIO">En Servicio</SelectItem>
                  <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-600">Ubicación Actual</label>
              <Input
                value={formData.ubicacionActual}
                onChange={(e) => setFormData({...formData, ubicacionActual: e.target.value})}
                placeholder="Ubicación actual"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={onSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
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