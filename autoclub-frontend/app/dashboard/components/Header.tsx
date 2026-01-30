'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/context/ToastContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
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

  const handleNotifyClick = () => {
    showToast('Centro de notificaciones en desarrollo 🛠️', 'info');
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
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shadow-sm md:shadow-none">
      
      <div className="flex items-center gap-4">
        <button 
          id="mobile-menu-btn"
          onClick={onMenuClick}
          className="md:hidden text-gray-600 hover:text-black focus:outline-none active:scale-95 transition-transform"
        >
          <i className="bi bi-list text-3xl"></i>
        </button>

        <div className="text-sm font-medium text-gray-500 uppercase tracking-widest text-[10px]">
          Panel de Control
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={handleNotifyClick}
          className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors active:scale-90"
        >
          <i className="bi bi-bell-fill text-xl"></i>
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-900 leading-none">
              {user?.full_name || 'Cargando...'}
            </p>
            <p className="text-[9px] text-gray-400 mt-1 uppercase font-black tracking-tighter">
              {user ? getRoleLabel(user.role?.name) : '...'}
            </p>
          </div>
          
          <div className="w-9 h-9 bg-zinc-900 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg shadow-zinc-900/20">
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