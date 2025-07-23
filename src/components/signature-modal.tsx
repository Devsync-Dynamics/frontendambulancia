import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Save, X } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  title: string;
  currentSignature?: string;
}

export function SignatureModal({
                                 isOpen,
                                 onClose,
                                 onSave,
                                 title,
                                 currentSignature
                               }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);

  // Inicializar canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size - importante para la calidad
    canvas.width = 600;
    canvas.height = 300;

    // Set drawing properties
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Reset drawing properties
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    console.log('Canvas inicializado:', canvas.width, 'x', canvas.height);
  }, []);

  // Load existing signature
  const loadSignature = useCallback(() => {
    if (!currentSignature) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHasSignature(true);
      console.log('Firma existente cargada');
    };
    img.onerror = () => {
      console.error('Error cargando firma existente');
    };
    img.src = currentSignature;
  }, [currentSignature]);

  useEffect(() => {
    if (!isOpen) return;

    console.log('Modal abierto, inicializando canvas...');
    initCanvas();

    // Pequeño delay para asegurar que el canvas esté renderizado
    setTimeout(() => {
      loadSignature();
    }, 100);
  }, [isOpen, initCanvas, loadSignature]);

  // Get coordinates from event
  const getCoordinates = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;

    if (e.type.startsWith('touch')) {
      const touch = (e as TouchEvent).touches[0] || (e as TouchEvent).changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      const mouse = e as MouseEvent;
      clientX = mouse.clientX;
      clientY = mouse.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Start drawing
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    console.log('Iniciando dibujo...');
    setIsDrawing(true);

    const coords = getCoordinates(e.nativeEvent, canvas);
    setLastPoint(coords);

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  // Continue drawing
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e.nativeEvent, canvas);

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    setLastPoint(coords);

    if (!hasSignature) {
      setHasSignature(true);
      console.log('Primera marca detectada');
    }
  };

  // Stop drawing
  const handleEnd = () => {
    if (!isDrawing) return;

    console.log('Finalizando dibujo...');
    setIsDrawing(false);
    setLastPoint(null);
  };

  // Clear canvas
  const handleClear = () => {
    console.log('Limpiando canvas...');
    initCanvas();
    setHasSignature(false);
  };

  // Save signature
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('❌ Canvas no encontrado');
      alert('Error: Canvas no encontrado');
      return;
    }

    if (!hasSignature) {
      alert('Por favor, dibuje una firma antes de guardar.');
      return;
    }

    try {
      console.log('=== GUARDANDO FIRMA ===');

      // Convertir a base64
      const signatureData = canvas.toDataURL('image/png', 1.0);

      console.log('✅ Firma convertida a base64');
      console.log('Tamaño:', signatureData.length, 'caracteres');
      console.log('Válida:', signatureData.startsWith('data:image/png;base64,'));

      // Verificar callback
      if (typeof onSave !== 'function') {
        console.error('❌ onSave no es función:', typeof onSave);
        alert('Error: Callback de guardado inválido');
        return;
      }

      // Guardar y cerrar
      console.log('Ejecutando callback onSave...');
      onSave(signatureData);
      console.log('✅ Callback ejecutado, cerrando modal...');
      onClose();

    } catch (error) {
      console.error('❌ Error al guardar firma:', error);
      alert('Error al guardar la firma: ' + (error as Error).message);
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {title}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Dibuje su firma en el área de abajo. Funciona con mouse en computadora o dedo en dispositivos táctiles.
            </div>

            {/* Canvas Container */}
            <div className="border-2 border-gray-300 rounded-lg bg-white p-4">
              <canvas
                  ref={canvasRef}
                  className="w-full border border-gray-200 rounded cursor-crosshair"
                  style={{
                    height: '300px',
                    maxWidth: '100%',
                    touchAction: 'none', // Previene scroll en móviles
                    userSelect: 'none'    // Previene selección de texto
                  }}
                  onMouseDown={handleStart}
                  onMouseMove={handleMove}
                  onMouseUp={handleEnd}
                  onMouseLeave={handleEnd}
                  onTouchStart={handleStart}
                  onTouchMove={handleMove}
                  onTouchEnd={handleEnd}
              />
            </div>

            {/* Status Messages */}
            {!hasSignature && (
                <div className="text-center text-gray-400 text-sm">
                  📝 El área de firma está vacía. Dibuje su firma arriba.
                </div>
            )}

            {hasSignature && (
                <div className="text-center text-green-600 text-sm">
                  ✅ Firma capturada. Puede continuar editando o guardar.
                </div>
            )}

            {/* Debug Info */}
            <div className="text-xs bg-blue-50 p-2 rounded border">
              <strong>Debug:</strong> Canvas {canvasRef.current ? 'OK' : 'NO'},
              Dibujando: {isDrawing ? 'SÍ' : 'NO'},
              Tiene firma: {hasSignature ? 'SÍ' : 'NO'}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={!hasSignature}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasSignature}
                  className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Firma
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}