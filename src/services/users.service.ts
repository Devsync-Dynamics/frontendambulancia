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
    rol: Rol
}

interface CreateUserPayload {
    nombre: string
    apellido: string
    username: string
    password?: string // La contraseña es opcional para la edición, pero requerida para la creación
    telefono?: string
    rolId: number
}

interface UpdateUserPayload {
    nombre?: string
    apellido?: string
    username?: string
    telefono?: string
    rolId?: number
}

interface ChangePasswordPayload {
    newPassword: string
}

interface SaveFirmaPayload {
    firma: string
}


const API_BASE_URL = "https://backendamed-production.up.railway.app" // Ajusta esta URL a tu API de NestJS
//const API_BASE_URL = "http://localhost:3001"

// Función auxiliar para manejar las solicitudes fetch
async function authenticatedFetch(url: string, options?: RequestInit) {
    const token = localStorage.getItem("token")
    if (!token) {
        // En un entorno real, podrías redirigir al login o lanzar un error específico
        throw new Error("No se encontró el token de autenticación. Por favor, inicie sesión.")
    }

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // <-- Aquí se añade el token
        ...options?.headers, // Permite sobrescribir o añadir otros headers
    }

    const response = await fetch(url, {
        ...options,
        headers,
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({message: "Error desconocido"}))
        throw new Error(errorData.message || `Error en la solicitud: ${response.statusText}`)
    }

    // Algunas respuestas DELETE o PATCH pueden no devolver JSON
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
        return response.json()
    }
    return response.text() // O simplemente null si no esperas contenido
}

// Funciones de servicio para Usuarios
export const userService = {
    getUsers: async (): Promise<User[]> => {
        return authenticatedFetch(`${API_BASE_URL}/users`)
    },

    getUserById: async (id: string): Promise<User> => {
        return authenticatedFetch(`${API_BASE_URL}/users/${id}`)
    },

    createUser: async (userData: CreateUserPayload): Promise<User> => {
        return authenticatedFetch(`${API_BASE_URL}/users`, {
            method: "POST",
            body: JSON.stringify(userData),
        })
    },

    updateUser: async (id: string, userData: UpdateUserPayload): Promise<User> => {
        return authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify(userData),
        })
    },

    changeUserPassword: async (id: string, passwordData: ChangePasswordPayload): Promise<void> => {
        // Asumimos que este endpoint no devuelve contenido, solo un 200 OK
        await authenticatedFetch(`${API_BASE_URL}/users/${id}/password`, {
            method: "PATCH",
            body: JSON.stringify(passwordData),
        })
    },

    deleteUser: async (id: string): Promise<void> => {
        // Asumimos que este endpoint no devuelve contenido, solo un 200 OK
        await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
            method: "DELETE",
        })
    },

    saveMySignature: async (firmaData: SaveFirmaPayload): Promise<User> => {
        return authenticatedFetch(`${API_BASE_URL}/users/me/signature`, {
            method: "PATCH",
            body: JSON.stringify(firmaData),
        })
    },

    // Método para obtener solo la firma del usuario autenticado
    getMySignature: async (): Promise<{firma: string}> => {
        return authenticatedFetch(`${API_BASE_URL}/users/me/signature`)
    },

}

// Funciones de servicio para Roles
export const roleService = {
    getRoles: async (): Promise<Rol[]> => {
        return authenticatedFetch(`${API_BASE_URL}/rol`)
    },
}
