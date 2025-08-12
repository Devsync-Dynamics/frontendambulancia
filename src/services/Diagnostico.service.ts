import { NextResponse } from "next/server"

// Estructura normalizada hacia el cliente
type Diagnostico = {
    codigo: string
    nombre: string // descripcion legible
    descripcion?: string // codigo ICD-10
}

// Base del backend NestJS (por defecto tu producción actual)
const BASE = (process.env.CIE10_API_BASE_URL || "https://backendamed-production.up.railway.app").replace(/\/$/, "")
//const BASE = (process.env.CIE10_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "")

// Helpers para mapear distintas formas de respuesta
function mapList(raw: any): any[] {
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw?.items)) return raw.items
    if (Array.isArray(raw?.data)) return raw.data
    if (Array.isArray(raw?.results)) return raw.results
    if (Array.isArray(raw?.rows)) return raw.rows
    if (Array.isArray(raw?.records)) return raw.records
    if (Array.isArray(raw?.content)) return raw.content
    return []
}

function mapItem(r: any, idx: number): Diagnostico | null {
    // Preferimos campos típicos de CIE10: descripcion / codigo
    const id =  r.codigo  ?? idx
    const name = r.nombre  ?? ""
    const description = r.descripcion ??  ""
    if (!name) return null
    return { codigo: String(id), nombre: String(name), descripcion: description ? String(description) : undefined }
}

export async function getDiagnosticos(search: string, page = 1, limit = 10): Promise<Diagnostico[]> {
    try {
        const url = `${BASE}/cie10?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
        const res = await fetch(url);

        if (!res.ok) {
            console.error(`Error al consultar diagnósticos: ${res.statusText}`);
            return [];
        }

        const raw = await res.json();

        // Usamos mapList y mapItem para normalizar cualquier estructura
        const list = mapList(raw);
        const items = list.map(mapItem).filter(Boolean) as Diagnostico[];

        return items;
    } catch (error) {
        console.error("Error de red al consultar diagnósticos:", error);
        return [];
    }
}

// export async function POST(req: Request) {
//     // Crear un nuevo diagnóstico en tu backend NestJS
//     // Esperamos body mínimo: { descripcion: string, codigo?: string }
//     try {
//         const body = await req.json().catch(() => ({}))
//         const dto: Record<string, any> = {
//             // Ajusta nombres según tu CreateCie10Dto
//             descripcion: body.descripcion ?? body.name ?? "",
//             codigo: body.codigo ?? body.code ?? undefined,
//         }
//
//         const res = await fetch(`${BASE}/cie10`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json", Accept: "application/json" },
//             body: JSON.stringify(dto),
//         })
//
//         if (!res.ok) {
//             return NextResponse.json({ item: null }, { status: 200 })
//         }
//
//         const created = await res.json()
//         const mapped = mapItem(created, 0)
//         return NextResponse.json({ item: mapped ?? null })
//     } catch {
//         return NextResponse.json({ item: null }, { status: 200 })
//     }
//}
