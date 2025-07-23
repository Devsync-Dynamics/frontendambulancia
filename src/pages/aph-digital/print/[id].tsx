"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"
import { type CreateAphDigitalDto, aphDigitalService } from "@/services/aph-digital.service"

export default function PrintAphDigitalPage() {
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<CreateAphDigitalDto | null>(null)

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const data = await aphDigitalService.getAphDigitalById(id)
        if (data) {
          setFormData(data)
        }
      } catch (error) {
        console.error("Error loading form data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadFormData()
    }
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-teal-600">Cargando formulario...</p>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Formulario no encontrado</h2>
          <p className="text-gray-500 mb-4">El formulario solicitado no existe o ha sido eliminado.</p>
          <Link href="/aph-digital">
            <Button className="bg-teal-600 hover:bg-teal-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al listado
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Controles de impresión - Solo visible en pantalla */}
      <div className="print:hidden bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Link href={`/aph-digital/${id}/view`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <Button onClick={handlePrint} className="bg-teal-600 hover:bg-teal-700">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Contenido imprimible */}
      <div className="print-container">
        {/* Header del formulario */}
        <div className="print-header">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-teal-800 mb-2">FORMULARIO APH - ATENCIÓN PRE-HOSPITALARIA</h1>
            <div className="flex justify-between items-center text-sm">
              <span>
                Formulario No: <strong>{formData.numeroFormulario}</strong>
              </span>
              <span>
                Fecha: <strong>{new Date(formData.fecha).toLocaleDateString()}</strong>
              </span>
              <span>
                Hora: <strong>{formData.horaLlegada || "No registrada"}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Información básica */}
        <div className="print-section">
          <h2 className="print-section-title">INFORMACIÓN BÁSICA</h2>
          <div className="print-grid-3">
            <div className="print-field">
              <label>Placa:</label>
              <span>{formData.placa}</span>
            </div>
            <div className="print-field">
              <label>C.C.:</label>
              <span>{formData.cc}</span>
            </div>
            <div className="print-field">
              <label>Paciente:</label>
              <span>{formData.nombrePaciente}</span>
            </div>
          </div>
        </div>

        {/* Tipo de servicio */}
        <div className="print-section">
          <h2 className="print-section-title">TIPO DE SERVICIO</h2>
          <div className="flex gap-6">
            <label className="print-checkbox">
              <input type="checkbox" checked={formData.ambulanciaBasica || false} readOnly />
              Ambulancia Básica
            </label>
            <label className="print-checkbox">
              <input type="checkbox" checked={formData.medicalizado || false} readOnly />
              Medicalizado
            </label>
            <label className="print-checkbox">
              <input type="checkbox" checked={formData.consultaMedica || false} readOnly />
              Consulta Médica
            </label>
          </div>
        </div>

        {/* Información del paciente */}
        <div className="print-section">
          <h2 className="print-section-title">INFORMACIÓN DEL PACIENTE</h2>
          <div className="print-grid-4">
            <div className="print-field">
              <label>Edad:</label>
              <span>{formData.edad || "N/A"}</span>
            </div>
            <div className="print-field">
              <label>Sexo:</label>
              <span>{formData.sexo === "M" ? "Masculino" : formData.sexo === "F" ? "Femenino" : "N/A"}</span>
            </div>
            <div className="print-field">
              <label>Identificación:</label>
              <span>{formData.identificacion || "N/A"}</span>
            </div>
            <div className="print-field">
              <label>Estado Civil:</label>
              <span>{formData.estadoCivil || "N/A"}</span>
            </div>
          </div>
          <div className="print-grid-3 mt-4">
            <div className="print-field">
              <label>EPS:</label>
              <span>{formData.eps || "N/A"}</span>
            </div>
            <div className="print-field">
              <label>ARL:</label>
              <span>{formData.arl || "N/A"}</span>
            </div>
            <div className="print-field">
              <label>Estado del Paciente:</label>
              <span className="font-semibold">{formData.estadoPaciente || "N/A"}</span>
            </div>
          </div>
          <div className="print-grid-2 mt-4">
            <div className="print-field">
              <label>Dirección:</label>
              <span>{formData.direccion || "N/A"}</span>
            </div>
            <div className="print-field">
              <label>Teléfono:</label>
              <span>{formData.telefono || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Signos vitales */}
        <div className="print-section">
          <h2 className="print-section-title">SIGNOS VITALES</h2>
          <div className="print-grid-4">
            <div className="print-field">
              <label>FC:</label>
              <span>{formData.fc || "N/A"}</span>
            </div>
            <div className="print-field">
              <label>FR:</label>
              <span>{formData.fr || "N/A"}</span>
            </div>
            <div className="print-field">
              <label>Temperatura:</label>
              <span>{formData.temp || "N/A"}</span>
            </div>
            <div className="print-field">
              <label>TA:</label>
              <span>{formData.ta || "N/A"}</span>
            </div>
          </div>
          <div className="print-grid-4 mt-4">
            <div className="print-field">
              <label>SpO2:</label>
              <span>{formData.spo2 || "N/A"}</span>
            </div>
            <div className="print-field">
              <label>Glasgow:</label>
              <span>{formData.glasgow || "N/A"}</span>
            </div>
            <div className="print-field">
              <label>Peso (kg):</label>
              <span>{formData.peso || "N/A"}</span>
            </div>
            <div className="print-field">
              <label>Talla (cm):</label>
              <span>{formData.talla || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Diagnóstico */}
        <div className="print-section">
          <h2 className="print-section-title">DIAGNÓSTICO Y EVOLUCIÓN</h2>
          <div className="print-field-full">
            <label>Diagnóstico:</label>
            <div className="print-textarea">{formData.diagnostico || "No especificado"}</div>
          </div>
          <div className="print-field-full mt-4">
            <label>Nota de Evolución:</label>
            <div className="print-textarea">{formData.notaEvolucion || "No especificada"}</div>
          </div>
          <div className="print-field-full mt-4">
            <label>Procedimientos Realizados:</label>
            <div className="print-textarea">{formData.procedimientos || "No especificados"}</div>
          </div>
        </div>

        {/* Medicamentos */}
        {formData.medicamentosInsumos && formData.medicamentosInsumos.length > 0 && (
          <div className="print-section">
            <h2 className="print-section-title">MEDICAMENTOS E INSUMOS</h2>
            <table className="print-table">
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Dosis</th>
                  <th>Vía</th>
                  <th>Frecuencia</th>
                </tr>
              </thead>
              <tbody>
                {formData.medicamentosInsumos.map((med, index) => (
                  <tr key={index}>
                    <td>{med.nombre || "N/A"}</td>
                    <td>{med.dosis || "N/A"}</td>
                    <td>{med.via || "N/A"}</td>
                    <td>{med.frecuencia || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Información del servicio */}
        <div className="print-section">
          <h2 className="print-section-title">INFORMACIÓN DEL SERVICIO</h2>
          <div className="print-grid-2">
            <div className="print-field">
              <label>Orden del servicio No:</label>
              <span>{formData.ordenServicioNo || "N/A"}</span>
            </div>
            <div className="print-field">
              <label>Factura:</label>
              <span>{formData.factura || "N/A"}</span>
            </div>
          </div>
          <div className="print-grid-2 mt-4">
            <div className="print-field">
              <label>Lugar de Ocurrencia:</label>
              <span>{formData.lugarOcurrencia || "N/A"}</span>
            </div>
            <div className="print-field">
              <label>Destino Final:</label>
              <span>{formData.destinoFinal || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Firmas */}
        <div className="print-section">
          <h2 className="print-section-title">FIRMAS Y AUTORIZACIÓN</h2>
          <div className="print-signatures">
            <div className="print-signature-box">
              <div className="print-signature-area">
                {formData.firmaMedico ? (
                  <img
                    src={formData.firmaMedico || "/placeholder.svg"}
                    alt="Firma médico"
                    className="print-signature-img"
                  />
                ) : (
                  <div className="print-signature-placeholder">Sin firma</div>
                )}
              </div>
              <div className="print-signature-info">
                <p>
                  <strong>Médico/Paramédico:</strong> {formData.nombreMedico || "N/A"}
                </p>
                <p>
                  <strong>Registro:</strong> {formData.registroMedico || "N/A"}
                </p>
              </div>
            </div>

            <div className="print-signature-box">
              <div className="print-signature-area">
                {formData.firmaPaciente ? (
                  <img
                    src={formData.firmaPaciente || "/placeholder.svg"}
                    alt="Firma paciente"
                    className="print-signature-img"
                  />
                ) : (
                  <div className="print-signature-placeholder">Sin firma</div>
                )}
              </div>
              <div className="print-signature-info">
                <p>
                  <strong>Paciente/Responsable:</strong> {formData.nombreResponsable || "N/A"}
                </p>
                <p>
                  <strong>Parentesco:</strong> {formData.parentesco || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
