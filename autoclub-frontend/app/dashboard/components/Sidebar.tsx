'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Estados para datos del usuario
  const [userRole, setUserRole] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role?.name || '');
      setUserEmail(user.email || ''); // Capturamos el email
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  // --- HELPER: TRADUCTOR DE ROLES ---
  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'admin': return 'Administrador';
      case 'student': return 'Estudiante';
      case 'professor': return 'Instructor';
      default: return 'Usuario';
    }
  };

  // --- ESTILOS OSCUROS ---
  const activeClass = "text-white bg-indigo-600 shadow-lg shadow-indigo-900/50";
  const inactiveClass = "text-zinc-400 hover:text-white hover:bg-zinc-800";

  const renderLinks = () => {
    switch (userRole) {
      case 'admin':
        return (
          <>
            <SectionTitle>Gestión Académica</SectionTitle>
            <NavLink href="/dashboard" icon="bi-grid-fill" label="Panel Principal" active={isActive('/dashboard')} activeClass={activeClass} inactiveClass={inactiveClass} />
            <NavLink href="/dashboard/admin/schedules" icon="bi-calendar-week" label="Programación Semanal" active={isActive('/dashboard/admin/schedules')} activeClass={activeClass} inactiveClass={inactiveClass} />
            <NavLink href="/dashboard/admin/classes" icon="bi-easel2-fill" label="Crear Clases" active={isActive('/dashboard/admin/classes')} activeClass={activeClass} inactiveClass={inactiveClass} />
            
            <SectionTitle>Configuración</SectionTitle>
            <NavLink href="/dashboard/admin/subjects" icon="bi-book-half" label="Materias" active={isActive('/dashboard/admin/subjects')} activeClass={activeClass} inactiveClass={inactiveClass} />
            <NavLink href="/dashboard/admin/modules" icon="bi-layers-fill" label="Módulos" active={isActive('/dashboard/admin/modules')} activeClass={activeClass} inactiveClass={inactiveClass} />
            <NavLink href="/dashboard/admin/users" icon="bi-people-fill" label="Usuarios" active={isActive('/dashboard/admin/users')} activeClass={activeClass} inactiveClass={inactiveClass} />
            <NavLink href="/dashboard/admin/categories" icon="bi-tags-fill" label="Licencias" active={isActive('/dashboard/admin/categories')} activeClass={activeClass} inactiveClass={inactiveClass} />
          </>
        );
      case 'student':
        return (
          <>
            <SectionTitle>Mi Aprendizaje</SectionTitle>
            <NavLink href="/dashboard" icon="bi-grid-fill" label="Inicio" active={isActive('/dashboard')} activeClass={activeClass} inactiveClass={inactiveClass} />
            <NavLink 
  href="/dashboard/student/curriculum" 
  icon="bi-journal-richtext" 
  label="Malla Curricular" 
  active={isActive('/dashboard/student/curriculum')} 
  activeClass={activeClass} 
  inactiveClass={inactiveClass} 
/>
            <NavLink href="/dashboard/student/schedule" icon="bi-calendar-plus" label="Reservar Clases" active={isActive('/dashboard/student/schedule')} activeClass={activeClass} inactiveClass={inactiveClass} />
            <NavLink href="/dashboard/student/reservations" icon="bi-ticket-detailed" label="Mis Reservas" active={isActive('/dashboard/student/reservations')} activeClass={activeClass} inactiveClass={inactiveClass} />
          </>
        );
      case 'professor':
        return (
          <>
             <SectionTitle>Instructor</SectionTitle>
             <NavLink href="/dashboard" icon="bi-grid-fill" label="Inicio" active={isActive('/dashboard')} activeClass={activeClass} inactiveClass={inactiveClass} />
             <NavLink href="#" icon="bi-calendar-check" label="Mis Clases" active={false} activeClass={activeClass} inactiveClass={inactiveClass} />
          </>
        );
      default: return null;
    }
  };

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full fixed left-0 top-0 bottom-0 z-20 text-zinc-100">
      <div className="p-6 flex items-center gap-3 border-b border-zinc-800/50">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-500/20">
          <i className="bi bi-car-front-fill"></i>
        </div>
        <span className="font-black text-xl tracking-tight">AutoClub</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {renderLinks()}
      </nav>

      {/* FOOTER CON INFO DE USUARIO */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        
        <div className="mb-4 px-2">
          {/* Rol formateado (ADMINISTRADOR, ESTUDIANTE) */}
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
            {getRoleLabel(userRole)}
          </p>
          {/* Email del usuario */}
          <p className="text-sm font-bold text-white truncate" title={userEmail}>
            {userEmail || 'Cargando...'}
          </p>
        </div>

        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-all">
          <i className="bi bi-box-arrow-right text-lg"></i>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 mt-6">{children}</p>
);

const NavLink = ({ href, icon, label, active, activeClass, inactiveClass }: any) => (
  <Link href={href} className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${active ? activeClass : inactiveClass}`}>
    <i className={`bi ${icon} text-lg`}></i>
    {label}
  </Link>
);