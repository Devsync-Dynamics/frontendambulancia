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
    onChange(signature)
  }

  const handleClearSignature = () => {
    onChange("")
  }

  return (
    <div className="space-y-2">
      <Label className="font-medium">{label}</Label>

      {value ? (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-gray-600">Firma capturada:</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
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
            <img src={value || "/placeholder.svg"} alt="Firma" className="max-w-full h-auto max-h-32 mx-auto" />
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">{placeholder}</p>
          <Button type="button" variant="outline" onClick={() => setIsModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Capturar Firma
          </Button>
        </div>
      )}

      <SignatureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSignature}
        title={label}
        currentSignature={value}
      />
    </div>
  )
}
