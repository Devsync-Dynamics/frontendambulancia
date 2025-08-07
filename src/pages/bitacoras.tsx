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

export default function BitacoraPage() {
  const [entries, setEntries] = useState<IBitacoraEntry[]>([]) // Inicializar con array vacío
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState("fechaTraslado")
  const [page, setPage] = useState(1)
  const [openRows, setOpenRows] = useState<{[key: number]: boolean}>({})

  const pageSize = 5

  useEffect(() => {
    const loadBitacoraEntries = async () => {
      try {
        setLoading(true)
        setError(null)

        // Usar getEntries en lugar de getAll
        const bitacoraData = await bitacoraService.getEntries()

        console.log('Bitacora data:', bitacoraData)

        // Asegurar que siempre sea un array
        const safeData = Array.isArray(bitacoraData) ? bitacoraData : []
        setEntries(safeData)

      } catch (err) {
        console.error('Error loading bitacora entries:', err)
        setError('Error al cargar las entradas de la bitácora')
        setEntries([]) // Asegurar array vacío en caso de error
      } finally {
        setLoading(false)
      }
    }

    loadBitacoraEntries()
  }, [])

  const filtered = useMemo(() => {
    // Asegurar que entries sea siempre un array
    const safeEntries = Array.isArray(entries) ? entries : []

    if (!search) return safeEntries
    const term = search.toLowerCase()
    return safeEntries.filter((r) =>
        [r.nombrePaciente, r.entidad, r.tipoTraslado, r.diagnostico]
            .filter(Boolean) // Eliminar valores null/undefined
            .some(f => f.toLowerCase().includes(term))
    )
  }, [entries, search])

  const sorted = useMemo(() => {
    // Asegurar que filtered sea siempre un array
    const safeFiltered = Array.isArray(filtered) ? filtered : []
    const arr = [...safeFiltered]

    arr.sort((a, b) => {
      if (sortKey === "fechaTraslado") {
        const dateA = new Date(a.fechaTraslado)
        const dateB = new Date(b.fechaTraslado)

        // Verificar si las fechas son válidas
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0
        }

        return dateA.getTime() - dateB.getTime()
      }

      if (sortKey === "no") {
        // Ordenar números correctamente
        return a.no - b.no
      }

      // Para otros campos string, manejar valores nulos/undefined
      const valueA = (a[sortKey as keyof IBitacoraEntry] as string) || ''
      const valueB = (b[sortKey as keyof IBitacoraEntry] as string) || ''

      return valueA.localeCompare(valueB)
    })
    return arr
  }, [filtered, sortKey])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = useMemo(
      () => sorted.slice((page - 1) * pageSize, page * pageSize),
      [sorted, page]
  )

  const toggleRow = (no: number) =>
      setOpenRows(prev => ({ ...prev, [no]: !prev[no] }))

  if (loading) {
    return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <span className="ml-2 text-teal-800">Cargando bitácora...</span>
        </div>
    )
  }

  if (error) {
    return (
        <div className="flex justify-center items-center h-full">
          <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Error</h3>
            <p>{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
    )
  }

  return (
      <div className="container mx-auto px-4 py-8 bg-background">
        <h2 className="text-3xl font-bold text-teal-800 mb-6">Bitácora de Traslados</h2>

        {/* filtros */}
        <div className="flex flex-col text-black md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0 md:space-x-4">
          <input
              type="text"
              placeholder="Buscar paciente, entidad, tipo traslado, diagnóstico..."
              className="bitacora-input flex-1"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
          />

          <div className="flex items-center space-x-2">
            <label htmlFor="sortSelect" className="text-sm font-medium text-gray-700">
              Ordenar por:
            </label>
            <select
                id="sortSelect"
                value={sortKey}
                onChange={e => setSortKey(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="fechaTraslado">Fecha de Traslado</option>
              <option value="no">Número</option>
              <option value="nombrePaciente">Nombre Paciente</option>
              <option value="entidad">Entidad</option>
              <option value="tipoTraslado">Tipo Traslado</option>
              <option value="origen">Origen</option>
              <option value="destino">Destino</option>
            </select>
          </div>
        </div>

        {!entries || entries.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>No se encontraron entradas en la bitácora.</p>
            </div>
        ) : (
            <>
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
                                <td key={idx} className="bitacora-td">{cell || 'N/A'}</td>
                            ))}
                            <td className="bitacora-td truncate max-w-xs">
                              {row.evolucion || 'N/A'}
                            </td>
                            <td className="bitacora-td">{row.codigo || 'N/A'}</td>
                            <td className="bitacora-td">{row.mv || 'N/A'}</td>
                            <td className="bitacora-td">{row.medico || 'N/A'}</td>
                            <td className="bitacora-td truncate max-w-xs">
                              {row.observacion || 'N/A'}
                            </td>
                            <td className="bitacora-td">{row.valor || 'N/A'}</td>
                            <td className="bitacora-td">{row.noPlanilla || 'N/A'}</td>
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
                                  <p className="mt-2">{row.evolucion || 'No hay información disponible'}</p>
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
            </>
        )}
      </div>
  )
}

BitacoraPage.getLayout = page => <GeneralLayout>{page}</GeneralLayout>