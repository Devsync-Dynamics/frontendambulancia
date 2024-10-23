'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ambulance, Lock, User, Heart } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://backendtraslado-production.up.railway.app/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', email); 
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Credenciales inválidas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-teal-50 to-blue-100 flex items-center justify-center p-4">
      <div className="relative bg-white bg-opacity-50 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-teal-200">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-200 to-blue-200 opacity-30 rounded-3xl blur-xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-teal-500 p-3 rounded-full mb-4 shadow-lg relative animate-pulse">
              <Ambulance className="h-12 w-12 text-white" />
              <Heart className="h-6 w-6 text-red-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-3xl font-bold text-teal-800 mb-2">Sistema de Salud</h1>
            <p className="text-teal-600">Acceso a Servicios de Emergencia</p>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-teal-700">Email</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-600 group-hover:text-teal-500 transition-colors duration-200" />
                <input
                  id="email"
                  type="email"
                  placeholder="Ingrese su email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 py-2 bg-white bg-opacity-70 border border-teal-200 text-teal-600 placeholder-teal-600 focus:border-teal-400 focus:ring-2 focus:ring-teal-400 rounded-lg transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-teal-700">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-600 group-hover:text-teal-500 transition-colors duration-200" />
                <input
                  id="password"
                  type="password"
                  placeholder="Ingrese su contraseña segura"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 py-2 bg-white bg-opacity-70 border border-teal-200 text-teal-800 placeholder-teal-600 focus:border-teal-400 focus:ring-2 focus:ring-teal-400 rounded-lg transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-teal-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
            <div className="loading flex justify-center items-center">
              <svg width="64px" height="48px">
                <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="back"></polyline>
                <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="front"></polyline>
              </svg>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
