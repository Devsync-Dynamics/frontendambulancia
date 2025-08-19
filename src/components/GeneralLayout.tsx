"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { Menu, X, Home, Truck, LogOut, Receipt, Activity, Users, PlusCircle, Edit, FolderOpen, Settings, Ambulance } from "lucide-react"

type LayoutProps = {
  children: React.ReactNode
}

const navItems = [
  { path: "/dashboard", name: "Dashboard", icon: Home, roles: ["SuperAdmin", "Admin"] },
  { path: "/ambulancia", name: "Ambulancia", icon: Ambulance, roles: ["SuperAdmin", "Admin"] },
  { path: "/aph-digital", name: "Aph Digital", icon: Activity, roles: ["SuperAdmin", "Admin", "usuario"] },
  { path: "/aph-digital/create", name: "Aph Digital", icon: Activity, roles: ["SuperAdmin", "Admin", "usuario"], hidden: true },
  { path: "/aph-digital/edit/[id]", name: "Aph Digital", icon: Activity, roles: ["SuperAdmin", "Admin", "usuario"], hidden: true },
  { path: "/aph-digital/print/[id]", name: "Aph Digital", icon: Activity, roles: ["SuperAdmin", "Admin", "usuario"], hidden: true },
  { path: "/aph-digital/view/[id]", name: "Aph Digital", icon: Activity, roles: ["SuperAdmin", "Admin", "usuario"], hidden: true },
  { path: "/facturacion", name: "Facturacion", icon: Receipt, roles: ["SuperAdmin", "Admin"] },
  { path: "/users", name: "Gestión de Usuarios", icon: Users, roles: ["SuperAdmin", "Admin"] },
  { path: "/bitacoras", name: "Bitácoras", icon: FolderOpen, roles: ["SuperAdmin", "Admin"] },
  { path: "/configuracion", name: "Firma", icon: Settings, roles: ["SuperAdmin", "Admin"] },
  { path: "/users/create", name: "Crear Usuario", icon: PlusCircle, roles: ["SuperAdmin", "Admin"], hidden: true },
  { path: "/users/edit/[id]", name: "Editar Usuario", icon: Edit, roles: ["SuperAdmin", "Admin"], hidden: true },
]

export default function GeneralLayout({ children }: LayoutProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const storedRole = localStorage.getItem("role")
    setUserRole(storedRole)
  }, [])

  useEffect(() => {
    if (!router.isReady || userRole === null) {
      console.log("--- Debugging Layout Effect ---")
      console.log("router.isReady:", router.isReady)
      console.log("userRole (from localStorage):", userRole)
      console.log("router.pathname:", router.pathname)
      return
    }

    if (!userRole) {
      router.replace("/")
      return
    }

    console.log("Nav Items:", navItems)
    const allowedPathsForRole = navItems.filter((item) => item.roles.includes(userRole)).map((item) => item.path)
    console.log("Allowed Paths for Role:", allowedPathsForRole)

    if (router.pathname === "/") {
      return
    }

    const isPathAllowed = allowedPathsForRole.some((path) => {
      console.log(`Comparing current path '${router.pathname}' with allowed path '${path}'`)
      if (path.includes("[id]")) {
        const staticPath = path.split("/[id]")[0]
        return router.pathname.startsWith(staticPath)
      }
      return router.pathname === path
    })

    console.log("Is Path Allowed (final check):", isPathAllowed)
    if (!isPathAllowed) {
      console.warn(`Acceso denegado para el rol '${userRole}' a la ruta '${router.pathname}'. Redirigiendo.`)
      if (userRole === "super_Admin" || userRole === "Admin") {
        router.replace("/dashboard")
      } else if (userRole === "usuario") {
        router.replace("/aph-digital")
      } else {
        router.replace("/")
      }
    }
  }, [router.isReady, router.pathname, userRole, router])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("role")
    router.push("/")
  }

  const filteredNavItems = navItems.filter((item) => userRole && item.roles.includes(userRole) && !item.hidden)

  if (userRole === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-teal-900 to-blue-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-900 to-blue-900 text-white">
      <nav className="bg-white/10 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            {/* Logo y navegación principal */}
            <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">SIGTA</h1>
              </div>
              
              {/* Navegación desktop y tablet */}
              <div className="hidden md:flex md:space-x-1 lg:space-x-4 xl:space-x-6">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = router.pathname === item.path ||
                    (item.path.includes("[id]") && router.pathname.startsWith(item.path.split("/[id]")[0]))
                  
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`${
                        isActive
                          ? "border-b-2 border-teal-400 text-teal-300 bg-white/5"
                          : "border-b-2 border-transparent text-gray-300 hover:text-white hover:border-teal-400 hover:bg-white/5"
                      } inline-flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium transition-all duration-200 rounded-t-lg`}
                    >
                      <Icon className="h-4 w-4 lg:mr-2" />
                      <span className="hidden lg:inline ml-1">{item.name}</span>
                      {/* Texto abreviado para tablets */}
                      <span className="lg:hidden ml-1 text-xs">
                        {item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Botón de logout - Desktop */}
            <div className="hidden md:flex md:items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 lg:px-4 py-2 border border-transparent text-xs lg:text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all shadow-lg"
              >
                <LogOut className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Cerrar Sesión</span>
              </button>
            </div>

            {/* Botón menú móvil */}
            <div className="flex items-center md:hidden">
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
        <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:hidden border-t border-white/20`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-black/20">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = router.pathname === item.path ||
                (item.path.includes("[id]") && router.pathname.startsWith(item.path.split("/[id]")[0]))
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${
                    isActive
                      ? "bg-teal-700 border-teal-400 text-white shadow-md"
                      : "border-transparent text-gray-300 hover:bg-teal-800 hover:border-teal-500 hover:text-white"
                  } block px-3 py-3 border-l-4 text-base font-medium transition-all duration-200 rounded-r-lg`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              )
            })}
            
            {/* Logout móvil */}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-3 border-l-4 border-transparent text-base font-medium text-gray-300 hover:bg-teal-800 hover:border-teal-500 hover:text-white transition-all duration-200 rounded-r-lg"
            >
              <div className="flex items-center">
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Cerrar Sesión</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="flex-1 w-full">
        <div className="h-full p-3 sm:p-4 lg:p-6 bg-gradient-to-b from-teal-50 to-blue-50">
          <div className="max-w-full mx-auto h-full">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 min-h-full">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}