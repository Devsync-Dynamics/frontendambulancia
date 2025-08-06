"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { Menu, X, Home, Truck, LogOut, Receipt, Activity, Users, PlusCircle, Edit, FolderOpen } from "lucide-react" // Importa el icono Users y PlusCircle, Edit

type LayoutProps = {
  children: React.ReactNode
}

const navItems = [
  { path: "/dashboard", name: "Dashboard", icon: Home, roles: ["SuperAdmin", "Admin"] },
  { path: "/ambulancia", name: "Ambulancia", icon: Truck, roles: ["SuperAdmin", "Admin"] },
  { path: "/aph-digital", name: "Aph Digital", icon: Activity, roles: ["SuperAdmin", "Admin", "usuario"] },
  { path: "/aph-digital/create", name: "Aph Digital", icon: Activity, roles: ["SuperAdmin", "Admin", "usuario"],hidden: true },
  { path: "/aph-digital/edit/[id]", name: "Aph Digital", icon: Activity, roles: ["SuperAdmin", "Admin", "usuario"],hidden: true},
  { path: "/aph-digital/print/[id]", name: "Aph Digital", icon: Activity, roles: ["SuperAdmin", "Admin", "usuario"],hidden: true },
  { path: "/aph-digital/view/[id]", name: "Aph Digital", icon: Activity, roles: ["SuperAdmin", "Admin", "usuario"],hidden: true },

  { path: "/facturacion", name: "Facturacion", icon: Receipt, roles: ["SuperAdmin", "Admin"] },
  { path: "/users", name: "Gestión de Usuarios", icon: Users, roles: ["SuperAdmin", "Admin"] },
  { path: "/bitacoras", name: "Bitácoras", icon: FolderOpen, roles: ["SuperAdmin", "Admin"] }, // Nuevo elemento de navegación
  { path: "/users/create", name: "Crear Usuario", icon: PlusCircle, roles: ["SuperAdmin", "Admin"], hidden: true }, // Oculto en nav, pero permitido
  { path: "/users/edit/[id]", name: "Editar Usuario", icon: Edit, roles: ["SuperAdmin", "Admin"], hidden: true }, // Oculto en nav, pero permitido
]

export default function GeneralLayout({ children }: LayoutProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null) // Estado para almacenar el rol del usuario

  // Efecto para cargar el rol del usuario desde localStorage al montar el componente
  useEffect(() => {
    const storedRole = localStorage.getItem("role")
    setUserRole(storedRole)
  }, [])

  // Efecto para proteger las rutas
  useEffect(() => {
    // Esperar a que el router esté listo y el rol del usuario se haya cargado
    if (!router.isReady || userRole === null) {
      console.log("--- Debugging Layout Effect ---")
      console.log("router.isReady:", router.isReady)
      console.log("userRole (from localStorage):", userRole)
      console.log("router.pathname:", router.pathname)
      return
    }

    // Si no hay rol (usuario no logueado o sesión inválida), redirigir al login
    if (!userRole) {
      router.replace("/")
      return
    }

    // Definir las rutas permitidas para el rol actual
    console.log("Nav Items:", navItems)
    const allowedPathsForRole = navItems.filter((item) => item.roles.includes(userRole)).map((item) => item.path)
    console.log("Allowed Paths for Role:", allowedPathsForRole)

    // La página de login siempre debe ser accesible
    if (router.pathname === "/") {
      return
    }

    // Si la ruta actual no está permitida para el rol del usuario
    // También considera las rutas dinámicas como /users/edit/[id]
    const isPathAllowed = allowedPathsForRole.some((path) => {
      console.log(`Comparing current path '${router.pathname}' with allowed path '${path}'`)
      if (path.includes("[id]")) {
        // Para rutas dinámicas, verifica si el pathname comienza con la parte estática de la ruta
        const staticPath = path.split("/[id]")[0]
        return router.pathname.startsWith(staticPath)
      }
      return router.pathname === path
    })

    console.log("Is Path Allowed (final check):", isPathAllowed)
    // Si la ruta actual NO está permitida para el rol del usuario, redirigir
    if (!isPathAllowed) {
      console.warn(`Acceso denegado para el rol '${userRole}' a la ruta '${router.pathname}'. Redirigiendo.`)
      if (userRole === "super_Admin" || userRole === "Admin") {
        // Roles en minúsculas
        router.replace("/dashboard") // Redirigir a dashboard para Admins
      } else if (userRole === "usuario") {
        // Rol en minúsculas
        router.replace("/aph-digital") // Redirigir a aph-digital para usuarios
      } else {
        // Fallback para roles desconocidos o si no hay una redirección específica
        router.replace("/") // Redirigir al login
      }
    }
  }, [router.isReady, router.pathname, userRole, router]) // Dependencias para re-ejecutar el efecto

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("role") // También elimina el rol al cerrar sesión
    router.push("/")
  }

  // Filtra los elementos de navegación según el rol del usuario y si no están ocultos
  const filteredNavItems = navItems.filter((item) => userRole && item.roles.includes(userRole) && !item.hidden)

  // Si el rol aún no se ha cargado, puedes mostrar un loader o null
  if (userRole === null) {
    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-teal-900 to-blue-900 text-white">
          Cargando...
        </div>
    )
  }

  return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-teal-900 to-blue-900 text-white">
        <nav className="bg-white/10 backdrop-blur-md shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-2xl font-bold text-white tracking-wide">SIGTA</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`${
                                router.pathname === item.path ||
                                (item.path.includes("[id]") && router.pathname.startsWith(item.path.split("/[id]")[0]))
                                    ? "border-b-2 border-teal-500 text-teal-400"
                                    : "border-b-2 border-transparent text-gray-300 hover:text-white hover:border-teal-400"
                            } inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200`}
                        >
                          <Icon className="mr-2 h-5 w-5" />
                          {item.name}
                        </Link>
                    )
                  })}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all shadow-lg"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-200"
                >
                  <span className="sr-only">Abrir menú principal</span>
                  {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
          {/* Menú móvil */}
          <div className={`${isMobileMenuOpen ? "block" : "hidden"} sm:hidden`}>
            <div className="pt-2 pb-3 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                return (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`${
                            router.pathname === item.path ||
                            (item.path.includes("[id]") && router.pathname.startsWith(item.path.split("/[id]")[0]))
                                ? "bg-teal-800 border-teal-500 text-white"
                                : "border-transparent text-gray-300 hover:bg-teal-800 hover:border-teal-500 hover:text-white"
                        } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                    </Link>
                )
              })}
              <button
                  onClick={handleLogout}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-300 hover:bg-teal-800 hover:border-teal-500 hover:text-white transition-all duration-200"
              >
                <div className="flex items-center">
                  <LogOut className="mr-3 h-5 w-5" />
                  Cerrar Sesión
                </div>
              </button>
            </div>
          </div>
        </nav>
        <main className="flex-1 overflow-auto p-6 bg-teal-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
  )
}
