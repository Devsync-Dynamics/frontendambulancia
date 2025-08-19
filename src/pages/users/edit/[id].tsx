"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { ArrowLeft, Loader2, Save, KeyRound } from "lucide-react"
import {roleService, userService} from "@/services/users.service";
import GeneralLayout from "@/components/GeneralLayout";
// Definición de tipos para el usuario y el rol
interface Rol {
    id: number
    nombre: string
}

interface User {
    id: string
    nombre: string
    apellido: string
    username: string
    telefono?: string
    rol?: Rol // Hacemos 'rol' opcional aquí por si el backend no lo envía
}

function EditUserPage() {
    const router = useRouter()
    const { id } = router.query // Obtener el ID del usuario de la URL
    const [userData, setUserData] = useState<User | null>(null)
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        username: "",
        telefono: "",
        rolId: "",
    })
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [roles, setRoles] = useState<Rol[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [passwordError, setPasswordError] = useState<string | null>(null)

    // Cargar datos del usuario y roles disponibles
    useEffect(() => {
        console.log("--- EditUserPage useEffect started ---")
        console.log("router.query.id:", id)

        if (!router.isReady || !id) {
            // Esperar a que el router esté listo y el ID esté disponible
            console.log("Router not ready or ID not available yet, returning.")
            return
        }

        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                // Fetch user data
                console.log(`Fetching user with ID: ${id}`)
                const userResponse = await userService.getUserById(id as string) // Usa el servicio
                console.log("Raw user data fetched:", userResponse) // Log la respuesta cruda

                let user: User | null = null
                if (Array.isArray(userResponse) && userResponse.length > 0) {
                    user = userResponse[0] // Toma el primer elemento si es un array
                    console.log("Extracted user from array:", user)
                } else if (userResponse && typeof userResponse === "object") {
                    user = userResponse // Asume que ya es un objeto único
                    console.log("User data is a single object:", user)
                }

                if (!user) {
                    throw new Error("No se encontró el usuario o los datos son inválidos.")
                }

                setUserData(user)
                setFormData({
                    nombre: user.nombre || "",
                    apellido: user.apellido || "",
                    username: user.username || "",
                    telefono: user.telefono || "",
                    rolId: String(user.rol?.id || ""), // Asegúrate de que el rolId se establezca correctamente
                })
                console.log("FormData set to:", {
                    nombre: user.nombre || "",
                    apellido: user.apellido || "",
                    username: user.username || "",
                    telefono: user.telefono || "",
                    rolId: String(user.rol?.id || ""),
                })

                // Fetch roles
                console.log("Fetching roles...")
                const rolesData = await roleService.getRoles() // Usa el servicio de roles
                console.log("Roles data fetched:", rolesData)
                setRoles(rolesData)
            } catch (err: any) {
                console.error("Error fetching data:", err)
                setError(err.message || "No se pudieron cargar los datos.")
                if (err.message.includes("token")) {
                    router.push("/")
                }
            } finally {
                setLoading(false)
                console.log("--- EditUserPage useEffect finished ---")
            }
        }
        fetchData()
    }, [id, router.isReady]) // Dependencias: id y router.isReady

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            await userService.updateUser(id as string, {
                ...formData,
                rolId: Number(formData.rolId),
            }) // Usa el servicio

            alert("Usuario actualizado exitosamente.")
            router.push("/users") // Redirigir a la lista de usuarios
        } catch (err: any) {
            console.error("Error updating user:", err)
            setError(err.message || "No se pudo actualizar el usuario.")
            if (err.message.includes("token")) {
                router.push("/")
            }
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordSaving(true)
        setPasswordError(null)

        if (newPassword !== confirmPassword) {
            setPasswordError("Las contraseñas no coinciden.")
            setPasswordSaving(false)
            return
        }
        if (newPassword.length < 6) {
            setPasswordError("La contraseña debe tener al menos 6 caracteres.")
            setPasswordSaving(false)
            return
        }

        try {
            await userService.changeUserPassword(id as string, { newPassword }) // Usa el servicio

            alert("Contraseña cambiada exitosamente.")
            setNewPassword("")
            setConfirmPassword("")
        } catch (err: any) {
            console.error("Error changing password:", err)
            setPasswordError(err.message || "No se pudo cambiar la contraseña.")
            if (err.message.includes("token")) {
                router.push("/")
            }
        } finally {
            setPasswordSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-2 text-teal-800">Cargando datos del usuario...</span>
            </div>
        )
    }

    if (error && !userData) {
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

    if (!userData) {
        return (
            <div className="text-center text-gray-600 p-4">
                <p>Usuario no encontrado o ID inválido.</p>
                <Link href="/users" className="mt-4 inline-block px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                    Volver a la lista de usuarios
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
                <Link href="/users" className="p-2 rounded-full text-teal-600 hover:bg-teal-100 transition-colors mr-2">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h2 className="text-3xl font-bold text-teal-800">
                    Editar Usuario: {userData.nombre} {userData.apellido}
                </h2>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

            <form onSubmit={handleUpdateUser} className="space-y-6 mb-8 p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold text-teal-700 mb-4">Datos del Usuario</h3>
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                    />
                </div>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                    </label>
                    <input
                        type="username"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
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
                    disabled={saving}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors"
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-5 w-5" /> Guardar Cambios
                        </>
                    )}
                </button>
            </form>

            <form onSubmit={handleChangePassword} className="space-y-6 p-6 border border-gray-200 rounded-lg mt-8">
                <h3 className="text-xl font-semibold text-teal-700 mb-4">Cambiar Contraseña</h3>
                {passwordError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{passwordError}</div>
                )}
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                    />
                </div>
                <button
                    type="submit"
                    disabled={passwordSaving}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                    {passwordSaving ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cambiando...
                        </>
                    ) : (
                        <>
                            <KeyRound className="mr-2 h-5 w-5" /> Cambiar Contraseña
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}

EditUserPage.getLayout = (page: React.ReactElement) => {
    return <GeneralLayout>{page}</GeneralLayout>
}

export default EditUserPage
