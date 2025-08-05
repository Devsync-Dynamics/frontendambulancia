"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import {roleService, userService} from "@/services/users.service";
import GeneralLayout from "@/components/GeneralLayout";
// Definición de tipos para el rol
interface Rol {
    id: number
    nombre: string
}

function CreateUserPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        telefono: "",
        rolId: "", // Para el ID del rol
    })
    const [roles, setRoles] = useState<Rol[]>([])
    const [loading, setLoading] = useState(false)
    const [rolesLoading, setRolesLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Cargar roles disponibles
    useEffect(() => {
        const fetchRoles = async () => {
            setRolesLoading(true)
            try {
                const data = await roleService.getRoles() // Usa el servicio de roles
                setRoles(data)
                if (data.length > 0) {
                    setFormData((prev) => ({ ...prev, rolId: String(data[0].id) })) // Seleccionar el primer rol por defecto
                }
            } catch (err: any) {
                console.error("Error fetching roles:", err)
                setError(err.message || "No se pudieron cargar los roles.")
                if (err.message.includes("token")) {
                    router.push("/")
                }
            } finally {
                setRolesLoading(false)
            }
        }
        fetchRoles()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await userService.createUser({
                ...formData,
                rolId: Number(formData.rolId), // Asegúrate de que rolId sea un número
            }) // Usa el servicio de usuarios

            alert("Usuario creado exitosamente.")
            router.push("/users") // Redirigir a la lista de usuarios
        } catch (err: any) {
            console.error("Error creating user:", err)
            setError(err.message || "No se pudo crear el usuario.")
            if (err.message.includes("token")) {
                router.push("/")
            }
        } finally {
            setLoading(false)
        }
    }

    if (rolesLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-2 text-teal-800">Cargando roles...</span>
            </div>
        )
    }

    if (error && !loading) {
        return (
            <div className="text-center text-red-600 p-4 bg-red-100 border border-red-400 rounded-lg">
                <p>Error: {error}</p>
                <button
                    onClick={() => router.reload()}
                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
                <Link href="/users" className="p-2 rounded-full text-teal-600 hover:bg-teal-100 transition-colors mr-2">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h2 className="text-3xl font-bold text-teal-800">Crear Nuevo Usuario</h2>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900" // Added text-gray-900
                    />
                </div>
                <div>
                    <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido
                    </label>
                    <input
                        type="text"
                        id="apellido"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900" // Added text-gray-900
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900" // Added text-gray-900
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900" // Added text-gray-900
                    />
                </div>
                <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono (Opcional)
                    </label>
                    <input
                        type="text"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900" // Added text-gray-900
                    />
                </div>
                <div>
                    <label htmlFor="rolId" className="block text-sm font-medium text-gray-700 mb-1">
                        Rol
                    </label>
                    <select
                        id="rolId"
                        name="rolId"
                        value={formData.rolId}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900" // Added text-gray-900
                    >
                        {roles.map((rol) => (
                            <option key={rol.id} value={rol.id}>
                                {rol.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creando...
                        </>
                    ) : (
                        "Crear Usuario"
                    )}
                </button>
            </form>
        </div>
    )
}

CreateUserPage.getLayout = (page: React.ReactElement) => {
    return <GeneralLayout>{page}</GeneralLayout>
}

export default CreateUserPage
