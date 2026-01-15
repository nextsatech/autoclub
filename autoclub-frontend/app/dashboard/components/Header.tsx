'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.fullName || user.email);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <h2 className="text-xl font-semibold text-zinc-800">Panel Principal</h2>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-zinc-400 hover:text-indigo-600 transition-colors">
          <i className="bi bi-bell-fill text-xl"></i>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-zinc-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-zinc-900">{userName}</p>
            <p className="text-xs text-zinc-500">Estudiante</p>
          </div>
          <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
            <i className="bi bi-person-fill text-zinc-500"></i>
          </div>
          
          <button 
            onClick={handleLogout}
            className="ml-2 text-zinc-400 hover:text-red-500 transition-colors"
            title="Cerrar Sesión"
          >
            <i className="bi bi-box-arrow-right text-xl"></i>
          </button>
        </div>
      </div>
    </header>
  );
}