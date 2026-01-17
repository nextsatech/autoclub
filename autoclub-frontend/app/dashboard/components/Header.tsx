'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Leer usuario real del localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'admin': return 'Administrador';
      case 'student': return 'Estudiante';
      case 'professor': return 'Instructor';
      default: return 'Usuario';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Lado Izquierdo (Título o Breadcrumbs) */}
      <div className="text-sm font-medium text-gray-500">
        Panel de Control
      </div>

      {/* Lado Derecho (Usuario) */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <i className="bi bi-bell-fill"></i>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            {/* AQUÍ ESTABA EL ERROR: Antes decía texto fijo, ahora usa variables */}
            <p className="text-sm font-bold text-gray-900 leading-none">
              {user?.full_name || 'Cargando...'}
            </p>
            <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">
              {user ? getRoleLabel(user.role?.name) : '...'}
            </p>
          </div>
          
          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold border border-gray-200">
            {user?.full_name?.charAt(0) || 'U'}
          </div>

          <button 
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <i className="bi bi-box-arrow-right text-xl"></i>
          </button>
        </div>
      </div>
    </header>
  );
}