"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Edit, Trash2 } from "lucide-react"
import { SignatureModal } from "@/components/signature-modal"

interface SignatureFieldProps {
  label: string
  value?: string
  onChange: (signature: string) => void
  placeholder?: string
}

export function SignatureField({ label, value, onChange, placeholder = "Firma y sello" }: SignatureFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSaveSignature = (signature: string) => {
    console.log('=== SignatureField - handleSaveSignature ===');
    console.log('Firma recibida del modal:', signature ? 'SÍ' : 'NO');
    console.log('Tamaño de la firma:', signature?.length || 0);
    console.log('¿Es base64 válido?', signature?.startsWith('data:image/') || false);

    if (!signature) {
      console.error('❌ Firma vacía recibida del modal');
      alert('Error: La firma está vacía');
      return;
    }

    // Verificar que onChange existe
    if (typeof onChange !== 'function') {
      console.error('❌ onChange no es una función:', typeof onChange);
      alert('Error: Función onChange no válida');
      return;
    }

    try {
      onChange(signature);
    } catch (error) {
      console.error('❌ Error en onChange:', error);
     // alert('Error al guardar la firma: ' + error.message);
    }
  }

  const handleClearSignature = () => {
    onChange("")
    console.log('✅ Firma eliminada');
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
  }

  return (
      <div className="space-y-2">
        <Label className="font-medium">{label}</Label>

        {/* Debug info - remover en producción */}
        <div className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
          {value && ` (${value.length} chars, ${value.startsWith('data:image/') ? 'base64 válido' : 'formato inválido'})`}
        </div>

        {value ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-600">Firma capturada:</span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleOpenModal}>
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleClearSignature}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
              <div className="border border-gray-300 rounded bg-white p-2">
                {value.startsWith('data:image/') ? (
                    <img
                        src={value}
                        alt="Firma"
                        className="max-w-full h-auto max-h-32 mx-auto"
                        onError={(e) => {
                          console.error('❌ Error al cargar imagen de firma:', e);
                          console.log('Datos de la imagen (primeros 100 chars):', value.substring(0, 100));
                        }}
                        onLoad={() => {
                          console.log('✅ Imagen de firma cargada correctamente');
                        }}
                    />
                ) : (
                    <div className="text-red-500 text-center p-4">
                      ❌ Formato de firma inválido
                      <br />
                      <small>{value.substring(0, 50)}...</small>
                    </div>
                )}
              </div>
            </div>
        ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">{placeholder}</p>
              <Button type="button" variant="outline" onClick={handleOpenModal}>
                <Edit className="h-4 w-4 mr-2" />
                Capturar Firma
              </Button>
            </div>
        )}

        <SignatureModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveSignature}
            title={label}
            currentSignature={value}
        />
      </div>
  )
}