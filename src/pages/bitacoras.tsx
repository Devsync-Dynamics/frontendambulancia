"use client"

import React, {useState, useEffect, useMemo, ReactElement} from "react"
import GeneralLayout from "@/components/GeneralLayout"
import { Loader2, ChevronDown, ChevronUp, Download } from "lucide-react"
import { motion } from "framer-motion"
import { bitacoraService, IBitacoraEntry } from '@/services/bitacoras.service';
import * as XLSX from 'xlsx';

const HEADINGS = [
  "No.",
  "Radio Operador",
  "Entidad",
  //"ARL",
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
  //"Evolución y Procedimientos Durante el Traslado",
  "Código",
  "MV",
  "Médico",
  "Observación",
  "Valor",
  //"No. Planilla",
]

export default function BitacoraPage() {
  const [entries, setEntries] = useState<IBitacoraEntry[]>([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [openRows, setOpenRows] = useState<{[key: number]: boolean}>({})
  const [exporting, setExporting] = useState(false)

  // NUEVO: filtros por mes y año
  const [filterMonth, setFilterMonth] = useState<string>("")
  const [filterYear, setFilterYear] = useState<string>("")

  const pageSize = 5

  useEffect(() => {
    const loadBitacoraEntries = async () => {
      try {
        setLoading(true)
        setError(null)
        const bitacoraData = await bitacoraService.getEntries()
        const safeData = Array.isArray(bitacoraData) ? bitacoraData : []
        setEntries(safeData)
      } catch (err) {
        console.error('Error loading bitacora entries:', err)
        setError('Error al cargar las entradas de la bitácora')
        setEntries([])
      } finally {
        setLoading(false)
      }
    }
    loadBitacoraEntries()
  }, [])

  // --- Filtrado ---
  const filtered = useMemo(() => {
    const safeEntries = Array.isArray(entries) ? entries : []
    let result = safeEntries

    // filtro por texto
    if (search) {
      const term = search.toLowerCase()
      result = result.filter((r) =>
        [r.nombrePaciente, r.entidad, r.tipoTraslado, r.diagnostico]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(term))
      )
    }

    // filtro por año
    if (filterYear) {
      result = result.filter((r) => {
        const fecha = new Date(r.fechaTraslado)
        return fecha.getFullYear().toString() === filterYear
      })
    }

    // filtro por mes
    if (filterMonth) {
      result = result.filter((r) => {
        const fecha = new Date(r.fechaTraslado)
        return (fecha.getMonth() + 1).toString().padStart(2, "0") === filterMonth
      })
    }

    return result
  }, [entries, search, filterMonth, filterYear])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  )

  const toggleRow = (no: number) =>
    setOpenRows(prev => ({ ...prev, [no]: !prev[no] }))

  // Función para exportar a Excel
  const exportToExcel = async () => {
    try {
      setExporting(true)
      const dataToExport = filtered.map(entry => ({
        'No.': entry.no || 'N/A',
        'Radio Operador': entry.radioOperador || 'N/A',
        'Entidad': entry.entidad || 'N/A',
        'Contacto': entry.contacto || 'N/A',
        'Nombre Completo del Paciente': entry.nombrePaciente || 'N/A',
        'Tipo Documento': entry.tipoDocumento || 'N/A',
        'Documento': entry.documento || 'N/A',
        'Nombre del Acompañante': entry.nombreAcompanante || 'N/A',
        'Fecha de Traslado': entry.fechaTraslado || 'N/A',
        'Hora de Traslado': entry.horaTraslado || 'N/A',
        'Origen del Traslado': entry.origen || 'N/A',
        'Destino del Servicio': entry.destino || 'N/A',
        'Tipo Traslado': entry.tipoTraslado || 'N/A',
        'Conductor': entry.conductor || 'N/A',
        'Paramédico': entry.paramedico || 'N/A',
        'Diagnóstico': entry.diagnostico || 'N/A',
        'Código': entry.codigo || 'N/A',
        'MV': entry.mv || 'N/A',
        'Médico': entry.medico || 'N/A',
        'Observación': entry.observacion || 'N/A',
        'Valor': entry.valor || 'N/A',
      }))

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      worksheet['!cols'] = [
        { width: 8 }, { width: 15 }, { width: 20 }, { width: 15 },
        { width: 30 }, { width: 15 }, { width: 15 }, { width: 25 },
        { width: 15 }, { width: 15 }, { width: 25 }, { width: 25 },
        { width: 15 }, { width: 20 }, { width: 20 }, { width: 30 },
        { width: 10 }, { width: 10 }, { width: 20 }, { width: 30 },
        { width: 12 }
      ]
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bitácora de Traslados')
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
      const fileName = `bitacora-traslados-${dateStr}-${timeStr}.xlsx`
      XLSX.writeFile(workbook, fileName)
    } catch (error) {
      console.error('Error al exportar a Excel:', error)
      setError('Error al exportar los datos a Excel')
    } finally {
      setExporting(false)
    }
  }

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-teal-800">Bitácora de Traslados</h2>
        
        {/* Botón de exportar */}
        <button
          onClick={exportToExcel}
          disabled={exporting || !entries || entries.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Exportando...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Exportar a Excel</span>
            </>
          )}
        </button>
      </div>

      {/* filtros */}
      <div className="flex flex-col text-black md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0 md:space-x-4">
        <input
          type="text"
          placeholder="Buscar paciente, entidad, tipo traslado, diagnóstico..."
          className="bitacora-input flex-1"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />

        {/* Filtro por año */}
        <div className="flex items-center space-x-2">
          <label htmlFor="yearSelect" className="text-sm font-medium text-gray-700">
            Año:
          </label>
          <select
            id="yearSelect"
            value={filterYear}
            onChange={e => { setFilterYear(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Todos</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        {/* Filtro por mes */}
        <div className="flex items-center space-x-2">
          <label htmlFor="monthSelect" className="text-sm font-medium text-gray-700">
            Mes:
          </label>
          <select
            id="monthSelect"
            value={filterMonth}
            onChange={e => { setFilterMonth(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Todos</option>
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
            <option value="04">Abril</option>
            <option value="05">Mayo</option>
            <option value="06">Junio</option>
            <option value="07">Julio</option>
            <option value="08">Agosto</option>
            <option value="09">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
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
                        <td className="bitacora-td">{row.codigo || 'N/A'}</td>
                        <td className="bitacora-td">{row.mv || 'N/A'}</td>
                        <td className="bitacora-td">{row.medico || 'N/A'}</td>
                        <td className="bitacora-td truncate max-w-xs">
                          {row.observacion || 'N/A'}
                        </td>
                        <td className="bitacora-td">{row.valor || 'N/A'}</td>
                        <td className="px-4">
                          {isOpen
                            ? <ChevronUp className="h-5 w-5 text-teal-600"/>
                            : <ChevronDown className="h-5 w-5 text-teal-600"/>}
                        </td>
                      </motion.tr>
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* paginación */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Mostrando {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, filtered.length)} de {filtered.length} registros
              {search && ` (filtrados de ${entries.length} total)`}
            </div>
            <div className="flex space-x-2">
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
        </>
      )}
    </div>
  )
}

BitacoraPage.getLayout = (page: ReactElement) => <GeneralLayout>{page}</GeneralLayout>
