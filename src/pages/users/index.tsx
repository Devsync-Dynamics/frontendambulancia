"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react"
import GeneralLayout from "@/components/GeneralLayout" // Asegúrate de que la ruta sea correcta
import { userService } from "@/services/users.service" // Importa el servicio

// Definición de tipos para el usuario y el rol
interface Rol {
    id: number
    nombre: string
}

interface User {
    id: string
    nombre: string
    apellido: string
    email: string
    telefono?: string
    rol: Rol
}

function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await userService.getUsers() // Usa el servicio
            setUsers(data)
        } catch (err: any) {
            console.error("Error fetching users:", err)
            setError(err.message || "No se pudieron cargar los usuarios.")
            // Si el error es por token inválido, redirigir al login
            if (err.message.includes("token")) {
                router.push("/")
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleDelete = async (userId: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
            return
        }

        try {
            await userService.deleteUser(userId) // Usa el servicio
            setUsers(users.filter((user) => user.id !== userId))
            alert("Usuario eliminado exitosamente.")
        } catch (err: any) {
            console.error("Error deleting user:", err)
            alert(`Error al eliminar usuario: ${err.message}`)
            if (err.message.includes("token")) {
                router.push("/")
            }
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-2 text-teal-800">Cargando usuarios...</span>
            </div>
        )
    }

    if (!Array.isArray(users)) {
        return (
            <div className="text-center text-red-600 p-4 bg-red-100 border border-red-400 rounded-lg">
                <p>Error: Los datos de usuarios no son válidos.</p>
                <button onClick={fetchUsers} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                    Reintentar
                </button>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4 bg-red-100 border border-red-400 rounded-lg">
                <p>Error: {error}</p>
                <button onClick={fetchUsers} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-teal-800">Gestión de Usuarios</h2>
                <Link
                    href="/users/create"
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors shadow-md"
                >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Crear Nuevo Usuario
                </Link>
            </div>

            {users.length === 0 ? (
                <p className="text-center text-gray-600">No hay usuarios registrados.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-teal-100">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-medium text-teal-700 uppercase tracking-wider border-b">
                                Nombre
                            </th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-teal-700 uppercase tracking-wider border-b">
                                Apellido
                            </th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-teal-700 uppercase tracking-wider border-b">
                                Email
                            </th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-teal-700 uppercase tracking-wider border-b">
                                Rol
                            </th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-teal-700 uppercase tracking-wider border-b">
                                Teléfono
                            </th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-teal-700 uppercase tracking-wider border-b">
                                Acciones
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 whitespace-nowrap text-gray-800">{user.nombre}</td>
                                <td className="py-3 px-4 whitespace-nowrap text-gray-800">{user.apellido}</td>
                                <td className="py-3 px-4 whitespace-nowrap text-gray-800">{user.email}</td>
                                <td className="py-3 px-4 whitespace-nowrap text-gray-800">{user.rol?.nombre || "N/A"}</td>
                                <td className="py-3 px-4 whitespace-nowrap text-gray-800">{user.telefono || "N/A"}</td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        <Link
                                            href={`/users/edit/${user.id}`}
                                            className="p-2 rounded-full text-teal-600 hover:bg-teal-100 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

UsersPage.getLayout = (page: React.ReactElement) => {
    return <GeneralLayout>{page}</GeneralLayout>
}

export default UsersPage
