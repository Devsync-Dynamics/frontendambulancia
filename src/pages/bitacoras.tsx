"use client"

import React, { useState, useEffect, useMemo } from "react"
import GeneralLayout from "@/components/GeneralLayout"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { motion } from "framer-motion"
import { bitacoraService, IBitacoraEntry } from '@/services/bitacoras.service';


const HEADINGS = [
  "No.",
  "Radio Operador",
  "Entidad",
  "Contacto",
  "Nombre Completo del Paciente",
  "Tipo Documento",
  "Documento",
  "Nombre del Acompañante",
  "Fecha de Traslado",
  "Hora de Traslado",
  "Origen del Traslado",
  "Destino del Servicio",
  "Tipo Traslado",
  "Conductor",
  "Paramédico",
  "Diagnóstico",
  "Evolución y Procedimientos Durante el Traslado",
  "Código",
  "MV",
  "Médico",
  "Observación",
  "Valor",
  "No. Planilla",
]

// Muchísima más data dummy
const DUMMY = [
  {
    no: 1, radioOperador: "Operador A", entidad: "Clínica Central", contacto: "3001234567",
    nombrePaciente: "Juan Pérez", tipoDocumento: "C.C.", documento: "12345678",
    nombreAcompanante: "María López", fechaTraslado: "2025-08-01", horaTraslado: "14:30",
    origen: "Barranquilla", destino: "Hospital Norte", tipoTraslado: "Urgente",
    conductor: "Carlos Díaz", paramedico: "Ana Rojas", diagnostico: "Trauma cráneo",
    evolucion: "Estable, monitorización continua", codigo: "TRM-001", mv: "N/A",
    medico: "Dr. Gómez", observacion: "Sin complicaciones", valor: "$120.000", noPlanilla: "0001",
  },
  {
    no: 2, radioOperador: "Operador B", entidad: "AmbuSalud", contacto: "3187654321",
    nombrePaciente: "Luisa Martínez", tipoDocumento: "T.I.", documento: "87654321",
    nombreAcompanante: "Pedro Castro", fechaTraslado: "2025-08-02", horaTraslado: "09:15",
    origen: "Soledad", destino: "Clínica del Caribe", tipoTraslado: "Programado",
    conductor: "Juan Salinas", paramedico: "Erika Silva", diagnostico: "Infarto agudo",
    evolucion: "Mejorando tras tratamiento", codigo: "INF-002", mv: "N/A",
    medico: "Dra. Ramírez", observacion: "Monitoreo ECG activo", valor: "$150.000", noPlanilla: "0002",
  },
  {
    no: 3, radioOperador: "Operador C", entidad: "Hospital San José", contacto: "3021122334",
    nombrePaciente: "Miguel Torres", tipoDocumento: "C.E.", documento: "11223344",
    nombreAcompanante: "Laura Ruiz", fechaTraslado: "2025-08-03", horaTraslado: "11:20",
    origen: "Malambo", destino: "Clínica del Atlántico", tipoTraslado: "Urgente",
    conductor: "Luis Ramírez", paramedico: "Pedro Nieto", diagnostico: "COVID-19 severo",
    evolucion: "En observación con oxígeno", codigo: "COV-003", mv: "02",
    medico: "Dra. Salazar", observacion: "Uso de ventilador", valor: "$200.000", noPlanilla: "0003",
  },
  {
    no: 4, radioOperador: "Operador D", entidad: "EMS Barranquilla", contacto: "3009988776",
    nombrePaciente: "Ana Castillo", tipoDocumento: "C.C.", documento: "44556677",
    nombreAcompanante: "Diego Morales", fechaTraslado: "2025-08-04", horaTraslado: "20:45",
    origen: "Soledad", destino: "Hospital General", tipoTraslado: "No urgente",
    conductor: "Sandra Pérez", paramedico: "Luis Gómez", diagnostico: "Deshidratación",
    evolucion: "Hidratada antes del traslado", codigo: "DES-004", mv: "N/A",
    medico: "Dr. Castro", observacion: "Administración de suero", valor: "$100.000", noPlanilla: "0004",
  },
  {
    no: 5, radioOperador: "Operador E", entidad: "Clínica SaludVital", contacto: "3025566778",
    nombrePaciente: "Carlos Ruiz", tipoDocumento: "T.I.", documento: "55667788",
    nombreAcompanante: "Julia Mendoza", fechaTraslado: "2025-08-05", horaTraslado: "07:50",
    origen: "Puerto Colombia", destino: "Clínica SaludVital", tipoTraslado: "Programado",
    conductor: "María Paredes", paramedico: "Raúl Ortiz", diagnostico: "Fractura de brazo",
    evolucion: "Férula colocada", codigo: "FRAC-005", mv: "N/A",
    medico: "Dr. Villalba", observacion: "Reposo absoluto", valor: "$180.000", noPlanilla: "0005",
  },
  {
    no: 6, radioOperador: "Operador F", entidad: "AmbuExpress", contacto: "3002233445",
    nombrePaciente: "Elena Gómez", tipoDocumento: "C.C.", documento: "66778899",
    nombreAcompanante: "Sofía Díaz", fechaTraslado: "2025-08-06", horaTraslado: "13:05",
    origen: "Galapa", destino: "Hospital Norte", tipoTraslado: "Urgente",
    conductor: "Pedro Salcedo", paramedico: "Mónica Torres", diagnostico: "Accidente vehicular",
    evolucion: "Estable post cirugía", codigo: "ACC-006", mv: "N/A",
    medico: "Dra. Blanco", observacion: "Sutura de heridas", valor: "$250.000", noPlanilla: "0006",
  },
  {
    no: 7, radioOperador: "Operador G", entidad: "Clínica del Mar", contacto: "3183344556",
    nombrePaciente: "Ricardo Fernández", tipoDocumento: "C.E.", documento: "77889900",
    nombreAcompanante: "Marta Leal", fechaTraslado: "2025-08-07", horaTraslado: "16:40",
    origen: "Puerto Colombia", destino: "Clínica del Mar", tipoTraslado: "Programado",
    conductor: "Andrés Ruíz", paramedico: "Estefanía Ríos", diagnostico: "Neumonía",
    evolucion: "Baja fiebre", codigo: "NEU-007", mv: "N/A",
    medico: "Dr. Pardo", observacion: "Antibióticos IV", valor: "$220.000", noPlanilla: "0007",
  },
  {
    no: 8, radioOperador: "Operador H", entidad: "AmbuLife", contacto: "3006677889",
    nombrePaciente: "Valentina Ramírez", tipoDocumento: "T.I.", documento: "88990011",
    nombreAcompanante: "Gabriel Torres", fechaTraslado: "2025-08-08", horaTraslado: "08:25",
    origen: "Soledad", destino: "Hospital General", tipoTraslado: "Urgente",
    conductor: "Juliana Cruz", paramedico: "Camilo López", diagnostico: "Aneurisma",
    evolucion: "En quirófano", codigo: "ANE-008", mv: "N/A",
    medico: "Dr. Herrera", observacion: "Cirugía programada", valor: "$300.000", noPlanilla: "0008",
  },
]

export default function BitacoraPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState("fechaTraslado")
  const [page, setPage] = useState(1)
  const [openRows, setOpenRows] = useState({})

  const pageSize = 5

  useEffect(() => {
    setTimeout(() => {
      setEntries(DUMMY)
      setLoading(false)
    }, 500)
  }, [])

  const filtered = useMemo(() => {
    if (!search) return entries
    const term = search.toLowerCase()
    return entries.filter((r) =>
      [r.nombrePaciente, r.entidad, r.tipoTraslado, r.diagnostico]
        .some(f => f.toLowerCase().includes(term))
    )
  }, [entries, search])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      if (sortKey === "fechaTraslado") {
        return new Date(a[sortKey]) - new Date(b[sortKey])
      }
      return a[sortKey].toString().localeCompare(b[sortKey].toString())
    })
    return arr
  }, [filtered, sortKey])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page]
  )

  const toggleRow = (no) =>
    setOpenRows(prev => ({ ...prev, [no]: !prev[no] }))

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2 text-teal-800">Cargando bitácora...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-background">
      <h2 className="text-3xl font-bold text-teal-800 mb-6">Bitácora de Traslados</h2>

      {/* filtros */}
      <div className="flex flex-col text-black md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
        <input
          type="text"
          placeholder="Buscar paciente, entidad..."
          className="bitacora-input"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
       
      </div>

      {/* tabla */}
      <div className="bitacora-table-container">
        <table className="min-w-full">
          <thead className="bg-teal-100 sticky top-0 z-10">
            <tr>
              {HEADINGS.map(h => (
                <th key={h} className="bitacora-th">{h}</th>
              ))}
              <th className="bitacora-th" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginated.map((row, i) => {
              const isOpen = openRows[row.no]
              return (
                <React.Fragment key={row.no}>
                  <motion.tr
                    custom={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                    className={`
                      transition-colors duration-200
                      ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      hover:bg-medical-primary-light/10 cursor-pointer
                    `}
                    onClick={() => toggleRow(row.no)}
                  >
                    {[
                      row.no,
                      row.radioOperador,
                      row.entidad,
                      row.contacto,
                      row.nombrePaciente,
                      row.tipoDocumento,
                      row.documento,
                      row.nombreAcompanante,
                      row.fechaTraslado,
                      row.horaTraslado,
                      row.origen,
                      row.destino,
                      row.tipoTraslado,
                      row.conductor,
                      row.paramedico,
                      row.diagnostico,
                    ].map((cell, idx) => (
                      <td key={idx} className="bitacora-td">{cell}</td>
                    ))}
                    <td className="bitacora-td truncate max-w-xs">
                      {row.evolucion}
                    </td>
                    <td className="bitacora-td">{row.codigo}</td>
                    <td className="bitacora-td">{row.mv}</td>
                    <td className="bitacora-td">{row.medico}</td>
                    <td className="bitacora-td truncate max-w-xs">
                      {row.observacion}
                    </td>
                    <td className="bitacora-td">{row.valor}</td>
                    <td className="bitacora-td">{row.noPlanilla}</td>
                    <td className="px-4">
                      {isOpen
                        ? <ChevronUp className="h-5 w-5 text-teal-600"/>
                        : <ChevronDown className="h-5 w-5 text-teal-600"/>}
                    </td>
                  </motion.tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={HEADINGS.length+1} className="bg-muted p-4">
                        <strong>Evolución y Procedimientos:</strong>
                        <p className="mt-2">{row.evolucion}</p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* paginación */}
      <div className="flex justify-end mt-4 space-x-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(p-1,1))}
          className="bitacora-btn-page disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-3 py-1 text-sm text-gray-600">
          Página {page} de {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => Math.min(p+1,totalPages))}
          className="bitacora-btn-page disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

BitacoraPage.getLayout = page => <GeneralLayout>{page}</GeneralLayout>
