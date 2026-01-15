'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      
      
      const roleName = user.role?.name || user.role || 'STUDENT';
      
      setRole(roleName); 
    }
  }, []);

  const adminMenu = [
    { name: 'Panel General', icon: 'bi-speedometer2', path: '/dashboard' },
    { name: 'Gestionar Clases', icon: 'bi-calendar-week', path: '/dashboard/admin/classes' },
    { name: 'Usuarios', icon: 'bi-people-fill', path: '/dashboard/admin/users' },
    { name: 'Reportes', icon: 'bi-file-earmark-bar-graph', path: '/dashboard/admin/reports' },
  ];

  const studentMenu = [
    { name: 'Mi Resumen', icon: 'bi-grid-1x2-fill', path: '/dashboard' },
    { name: 'Registrar Clase', icon: 'bi-plus-circle-fill', path: '/dashboard/booking' },
    { name: 'Mis registros', icon: 'bi-calendar-check', path: '/dashboard/my-reservations' },
    { name: 'Historial', icon: 'bi-clock-history', path: '/dashboard/history' },
  ];

  const menuItems = role === 'ADMIN' ? adminMenu : studentMenu;

  if (!mounted) return null; 

  return (
    <aside className="hidden md:flex flex-col w-64 bg-zinc-900 text-white min-h-screen fixed left-0 top-0 z-50">
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/50">
             <i className="bi bi-person-workspace"></i>
          </div>
          <span className="font-bold text-lg tracking-tight">AutoClub</span>
        </div>
        <div className="mt-2 px-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold bg-zinc-800 px-2 py-1 rounded">
                {role === 'ADMIN' ? 'Administrador' : 'Estudiante'}
            </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <i className={`bi ${item.icon} text-lg ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`}></i>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        {role === 'STUDENT' && (
            <div className="bg-gradient-to-br from-indigo-900 to-zinc-900 p-4 rounded-xl border border-white/5 relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-xs text-indigo-300 font-semibold mb-1">Plan B1</p>
                <p className="text-[10px] text-zinc-400">Licencia en curso</p>
                <div className="w-full bg-zinc-800 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 w-3/4 h-full"></div>
                </div>
            </div>
            </div>
        )}
      </div>
    </aside>
  );
}