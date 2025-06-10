"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"
import { type IAphDigital, aphDigitalService }  from "@/services/aph-digital.service"

export default function PrintAphDigitalPage() {
  const router = useRouter()
  const { id } = router.query
  const [formulario, setFormulario] = useState<IAphDigital | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadFormulario()
    }
  }, [id])

  const loadFormulario = async () => {
    if (id) {
      const data = await aphDigitalService.getAphDigitalById(Number(id))
      setFormulario(data)
    }
    setLoading(false)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Cargando formulario...</p>
      </div>
    )
  }

  if (!formulario) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p>Formulario no encontrado</p>
          <Link href="/aph-digital">
            <Button className="mt-4">Volver a la lista</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Controles de impresión - se ocultan al imprimir */}
      <div className="print:hidden bg-gray-50 p-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={`/aph-digital/view/${formulario.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Contenido del formulario para impresión */}
      <div className="container mx-auto p-4 print:p-2 max-w-[210mm]">
        <div className="border border-black p-4 print:p-2">
          {/* Encabezado con logo */}
          <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-4">
            <div className="w-1/6">
              <div className="bg-gray-200 p-2 text-center font-bold border border-black">AMED</div>
            </div>
            <div className="w-4/6 text-center">
              <h1 className="text-xl font-bold">ATENCIÓN MÉDICA DOMICILIARIA LTDA</h1>
              <p className="text-xs">NIT. 802.019.439-2</p>
              <p className="text-xs">CALLE 79 No. 42B - 28 TEL: 3561420 Cel: 310 6302185 - 315 6897079</p>
              <p className="text-xs">atencionmedicadomiciliaria@hotmail.com</p>
            </div>
            <div className="w-1/6"></div>
          </div>

          {/* Título del formulario */}
          <div className="text-center font-bold text-lg mb-4">HOJA PRE-HOSPITALARIA</div>

          {/* Primera fila: Placa, CC, Fecha */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="border border-black p-1">
              <span className="font-bold">Placa:</span> {formulario.placa || ""}
            </div>
            <div className="border border-black p-1">
              <span className="font-bold">C.C. No.:</span> {formulario.cc || ""}
            </div>
            <div className="border border-black p-1">
              <span className="font-bold">Fecha:</span>{" "}
              {formulario.fecha ? new Date(formulario.fecha).toLocaleDateString() : ""}
            </div>
          </div>

          {/* Nombre del paciente */}
          <div className="border border-black p-1 mb-2">
            <span className="font-bold">Nombre del paciente:</span> {formulario.nombrePaciente || ""}
          </div>

          {/* Tipo de servicio */}
          <div className="border border-black p-1 mb-2">
            <div className="flex gap-4">
              <span className="font-bold">Servicio de</span>
              <label className="flex items-center">
                <input type="checkbox" checked={formulario.ambulanciaBasica || false} readOnly className="mr-1" />
                Ambulancia Básica
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={formulario.medicalizado || false} readOnly className="mr-1" />
                Medicalizado
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={formulario.consultaMedica || false} readOnly className="mr-1" />
                Consulta Médica
              </label>
            </div>
          </div>

          {/* Información del paciente */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            <div className="border border-black p-1">
              <span className="font-bold">Edad:</span> {formulario.edad || ""}
            </div>
            <div className="border border-black p-1">
              <span className="font-bold">Sexo:</span> M_{formulario.sexo === "M" ? "X" : "_"} F_
              {formulario.sexo === "F" ? "X" : "_"}
            </div>
            <div className="border border-black p-1">
              <span className="font-bold">Identificación:</span> {formulario.identificacion || ""}
            </div>
            <div className="border border-black p-1">
              <span className="font-bold">Estado Civil:</span> {formulario.estadoCivil || ""}
            </div>
          </div>

          {/* Diagnóstico */}
          <div className="border border-black p-1 mb-2">
            <div className="font-bold">Diagnóstico:</div>
            <div className="min-h-[60px]">{formulario.diagnostico || ""}</div>
          </div>

          {/* Nota de Evolución */}
          <div className="border border-black p-1 mb-2">
            <div className="font-bold">Nota de Evolución:</div>
            <div className="min-h-[60px]">{formulario.notaEvolucion || ""}</div>
          </div>

          {/* Signos Vitales */}
          <div className="border border-black p-1 mb-2">
            <div className="font-bold">Signos Vitales:</div>
            <div className="grid grid-cols-4 gap-2">
              <div>Fc: {formulario.fc || ""}</div>
              <div>Fr: {formulario.fr || ""}</div>
              <div>Temp: {formulario.temp || ""}</div>
              <div>Ta: {formulario.ta || ""}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>Aceptado por: {formulario.aceptadoPor || ""}</div>
              <div>A.R.L.: {formulario.arl || ""}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>Estado Clínico del Paciente: {formulario.estadoclinicopac || ""}</div>
              <div>E.P.S.: {formulario.eps || ""}</div>
            </div>
          </div>

          {/* Oxígeno y equipos */}
          <div className="border border-black p-1 mb-2">
            <div className="grid grid-cols-3 gap-2">
              <div>O2 a {formulario.o2 || ""} LXMT.</div>
              <div className="col-span-2">
                <span className="font-bold">Tipo de equipo de Oxígeno</span>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" checked={formulario.canulaNasal || false} readOnly className="mr-1" />
                    Cánula nasal
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked={formulario.equipoVenturi || false} readOnly className="mr-1" />
                    Equipo Venturi {formulario.porcentajeOxigeno || ""}%
                  </label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="flex items-center">
                  <input type="checkbox" checked={formulario.mascaraReservorio || false} readOnly className="mr-1" />
                  Máscara con Reservorio
                </label>
              </div>
              <div className="col-span-2">
                <span className="font-bold">Equipos Biomecánicos:</span>
                <div className="flex gap-4">
                  <div>Bomba de Infusión:</div>
                  <div>
                    1. Vía {formulario.via || ""} C.C. {formulario.ccVia || ""}
                  </div>
                </div>
                <div className="flex gap-4 ml-[120px]">
                  <div>
                    2. Vía {formulario.via2 || ""} C.C. {formulario.ccVia2 || ""}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="flex items-center">
                  <input type="checkbox" checked={formulario.equipoMultiparametro || false} readOnly className="mr-1" />
                  Equipo Multiparámetro
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" checked={formulario.ventiladorMecanico || false} readOnly className="mr-1" />
                  Ventilador Mecánico o Respirador
                </label>
              </div>
              <div></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="flex items-center">
                  <input type="checkbox" checked={formulario.valvulaPeep || false} readOnly className="mr-1" />
                  Válvula Peep.O
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" checked={formulario.desfibrilador || false} readOnly className="mr-1" />
                  Desfibrilador {formulario.joules ? "Joules" : ""}
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" checked={!!formulario.aspirador} readOnly className="mr-1" />
                  Aspirador
                </label>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="flex items-center">
                  <input type="checkbox" checked={formulario.capnografo || false} readOnly className="mr-1" />
                  Capnógrafo
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" checked={formulario.pulmoaire || false} readOnly className="mr-1" />
                  Pulmoaire
                </label>
              </div>
              <div>Ambulancia solicitada por: {formulario.ambulanciaSolicitada || ""}</div>
            </div>
          </div>

          {/* Dirección y destino */}
          <div className="border border-black p-1 mb-2">
            <div>
              <span className="font-bold">Dirección del servicio de ambulancia:</span>{" "}
              {formulario.direccionServicio || ""}
              <span className="font-bold ml-2">Tel.:</span> {formulario.tel || ""}
            </div>
            <div>
              <span className="font-bold">Destino del paciente:</span> {formulario.destinoPaciente || ""}
            </div>
            <div>
              <span className="font-bold">Estudio:</span> {formulario.estudio || ""}
            </div>
          </div>

          {/* Horarios */}
          <div className="border border-black p-1 mb-2">
            <div className="font-bold">Horario:</div>
            <div className="grid grid-cols-8 gap-1">
              <div>H. LL:</div>
              <div>{formulario.horarioLL1 || ""}</div>
              <div>H. S:</div>
              <div>{formulario.horarioSa1 || ""}</div>
              <div>H. LL:</div>
              <div>{formulario.horarioLL2 || ""}</div>
              <div>H. S:</div>
              <div>{formulario.horarioSa2 || ""}</div>
            </div>
            <div className="grid grid-cols-8 gap-1">
              <div>H. LL:</div>
              <div>{formulario.horarioLL3 || ""}</div>
              <div>H. S:</div>
              <div>{formulario.horarioSa3 || ""}</div>
              <div>H. LL:</div>
              <div>{formulario.horarioLL4 || ""}</div>
              <div>H. S:</div>
              <div>{formulario.horarioSa4 || ""}</div>
            </div>
          </div>

          {/* Tipo de servicio de ambulancia */}
          <div className="border border-black p-1 mb-2">
            <div className="flex gap-4">
              <span className="font-bold">Servicio de ambulancia</span>
              <label className="flex items-center">
                <input type="checkbox" checked={formulario.servicioSimple || false} readOnly className="mr-1" />
                Simple
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={formulario.redondo || false} readOnly className="mr-1" />
                Redondo
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={formulario.fallido || false} readOnly className="mr-1" />
                Fallido
              </label>
            </div>
          </div>

          {/* Dirección del paciente */}
          <div className="border border-black p-1 mb-2">
            <div>
              <span className="font-bold">Dirección y teléfono del paciente:</span>{" "}
              {formulario.direccionTrasladoPaciente || ""}
            </div>
          </div>

          {/* Responsable y acompañante */}
          <div className="border border-black p-1 mb-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-bold">Responsable del paciente:</span> {formulario.responsablePaciente || ""}
              </div>
              <div>
                <span className="font-bold">Acompañante:</span> {formulario.acompanante || ""}
                <span className="font-bold ml-2">C.C.:</span> {formulario.ccAcompanante || ""}
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="border border-black p-1 mb-2">
            <div className="font-bold">Recomendaciones al Traslado:</div>
            <div className="min-h-[40px]">{formulario.recomendacionesTraslado || ""}</div>
          </div>

          {/* Medicamentos e insumos */}
          <div className="border border-black p-1 mb-4">
            <div className="font-bold text-center border-b border-black pb-1 mb-2">
              MEDICAMENTOS / INSUMOS UTILIZADOS
            </div>
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-2 font-bold">Descripción</div>
              <div className="font-bold">Cant.</div>
              <div className="col-span-2 font-bold">Descripción</div>
              <div className="font-bold">Cant.</div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-2">1. {formulario.medicamentosInsumos?.[0]?.descripcion || ""}</div>
              <div>{formulario.medicamentosInsumos?.[0]?.cantidad || ""}</div>
              <div className="col-span-2">3. {formulario.medicamentosInsumos?.[2]?.descripcion || ""}</div>
              <div>{formulario.medicamentosInsumos?.[2]?.cantidad || ""}</div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-2">2. {formulario.medicamentosInsumos?.[1]?.descripcion || ""}</div>
              <div>{formulario.medicamentosInsumos?.[1]?.cantidad || ""}</div>
              <div className="col-span-2">4. {formulario.medicamentosInsumos?.[3]?.descripcion || ""}</div>
              <div>{formulario.medicamentosInsumos?.[3]?.cantidad || ""}</div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-2"></div>
              <div></div>
              <div className="col-span-2">5. {formulario.medicamentosInsumos?.[4]?.descripcion || ""}</div>
              <div>{formulario.medicamentosInsumos?.[4]?.cantidad || ""}</div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-2"></div>
              <div></div>
              <div className="col-span-2">6. {formulario.medicamentosInsumos?.[5]?.descripcion || ""}</div>
              <div>{formulario.medicamentosInsumos?.[5]?.cantidad || ""}</div>
            </div>
          </div>

          {/* Información del servicio */}
          <div className="border border-black p-1 mb-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="font-bold">Orden del servicio No.:</span> {formulario.ordenServicioNo || ""}
              </div>
              <div>
                <span className="font-bold">Remisión:</span> {formulario.remision || ""}
              </div>
              <div>
                <span className="font-bold">Factura:</span> {formulario.factura || ""}
              </div>
            </div>
          </div>

          {/* Evaluación del servicio */}
          <div className="border border-black p-1 mb-4">
            <div>
              <span className="font-bold">Como le pareció el servicio:</span>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formulario.comoParecioServicio === "MUY_BUENA"}
                    readOnly
                    className="mr-1"
                  />
                  MUY BUENA
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formulario.comoParecioServicio === "BUENA"}
                    readOnly
                    className="mr-1"
                  />
                  BUENA
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formulario.comoParecioServicio === "REGULAR"}
                    readOnly
                    className="mr-1"
                  />
                  REGULAR
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formulario.comoParecioServicio === "MALA"}
                    readOnly
                    className="mr-1"
                  />
                  MALA
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formulario.comoParecioServicio === "MUY_MALA"}
                    readOnly
                    className="mr-1"
                  />
                  MUY MALA
                </label>
              </div>
            </div>
            <div className="mt-2">
              <span className="font-bold">Recomendaría a Familiares y Amigos:</span>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center">
                  <input type="checkbox" checked={formulario.definitivamenteSi || false} readOnly className="mr-1" />
                  Definitivamente Si
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={formulario.probablementeSi || false} readOnly className="mr-1" />
                  Probablemente Si
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={formulario.definitivamenteNo || false} readOnly className="mr-1" />
                  Definitivamente No
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={formulario.probablementeNo || false} readOnly className="mr-1" />
                  Probablemente No
                </label>
              </div>
            </div>
          </div>

          {/* Firmas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-black p-2 text-center">
              <div className="mb-16">Institución responsable del paciente</div>
              <div className="border-t border-black pt-2">{formulario.firmaSelloResponsable || "Firma y sello"}</div>
            </div>
            <div className="border border-black p-2 text-center">
              <div className="mb-16">Funcionario de AMED</div>
              <div className="border-t border-black pt-2">{formulario.funcionarioAMED || "Firma y sello"}</div>
            </div>
          </div>

          {/* Pie de página */}
          <div className="text-xs text-center mt-4 print:block">
            <p>Formulario APH Digital #{formulario.numeroFormulario}</p>
            <p>Impreso el: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
