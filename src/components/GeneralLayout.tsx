import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, Home, Truck, Send, Inbox, LogOut, Receipt, Footprints } from 'lucide-react';

type LayoutProps = {
  children: React.ReactNode;
};

const navItems = [
  { path: '/dashboard', name: 'Dashboard', icon: Home },
  { path: '/ambulancia', name: 'Ambulancia', icon: Truck },
  { path: '/enviar-solicitud', name: 'Enviar Solicitud', icon: Send },
  { path: '/recibir-solicitud', name: 'Recibir Solicitud', icon: Inbox },
  { path: '/facturacion', name: 'Facturacion', icon: Receipt  },
  { path: '/WalkieTalkieView', name: 'WalktoTal', icon:  Footprints },
];

export default function GeneralLayout({ children }: LayoutProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/');
  };

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
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`${
                        router.pathname === item.path
                          ? 'border-b-2 border-teal-500 text-teal-400'
                          : 'border-b-2 border-transparent text-gray-300 hover:text-white hover:border-teal-400'
                      } inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200`}
                    >
                      <Icon className="mr-2 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
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

        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${
                    router.pathname === item.path
                      ? 'bg-teal-800 border-teal-500 text-white'
                      : 'border-transparent text-gray-300 hover:bg-teal-800 hover:border-teal-500 hover:text-white'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                </Link>
              );
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
  );
}
