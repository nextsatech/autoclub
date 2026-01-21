'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Props nuevas
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [userRole, setUserRole] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userLicenses, setUserLicenses] = useState<string[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role?.name || '');
      setUserEmail(user.email || ''); 

      if (user.student && user.student.license_categories && user.student.license_categories.length > 0) {
        const licenses = user.student.license_categories.map((l: any) => l.name);
        setUserLicenses(licenses);
      } else {
        setUserLicenses(['Sin Licencia']); 
      }
    }
  }, []);

  // Cerrar el sidebar automáticamente cuando cambias de página (solo en móvil)
  useEffect(() => {
    onClose();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  // Helpers visuales
  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'admin': return 'Administrador';
      case 'student': return 'Estudiante'; 
      case 'professor': return 'Instructor';
      default: return 'Usuario';
    }
  };

  const getLicenseStyle = (type: string) => {
    if (!type) return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    if (type.toUpperCase().includes('A')) return 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
    if (type.toUpperCase().includes('B') || type.toUpperCase().includes('C')) return 'bg-red-600 text-white border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.4)]';
    return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

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
            <NavLink href="/dashboard/student/curriculum" icon="bi-journal-richtext" label="Malla Curricular" active={isActive('/dashboard/student/curriculum')} activeClass={activeClass} inactiveClass={inactiveClass} />
            <NavLink href="/dashboard/student/schedule" icon="bi-calendar-plus" label="Registrar Clases" active={isActive('/dashboard/student/schedule')} activeClass={activeClass} inactiveClass={inactiveClass} />
            <NavLink href="/dashboard/student/reservations" icon="bi-ticket-detailed" label="Mis Registros" active={isActive('/dashboard/student/reservations')} activeClass={activeClass} inactiveClass={inactiveClass} />
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
    <>
      {/* 1. OVERLAY (Fondo oscuro) - Solo visible en móvil cuando el menú está abierto */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* 2. SIDEBAR - Deslizante en móvil, Fijo en escritorio */}
      <aside className={`
        w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full 
        fixed inset-y-0 left-0 z-30 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0  /* En escritorio (md) siempre se muestra (reset transform) */
      `}>
        
        {/* HEADER DEL SIDEBAR */}
        <div className="p-6 flex items-center justify-between border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-500/20">
              <i className="bi bi-car-front-fill"></i>
            </div>
            <span className="font-black text-xl tracking-tight text-white">AutoClub</span>
          </div>
          {/* Botón Cerrar (Solo móvil) */}
          <button onClick={onClose} className="md:hidden text-zinc-400 hover:text-white">
            <i className="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {renderLinks()}
        </nav>

        {/* FOOTER USER */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
          <div className="mb-4 px-2">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center justify-between">
              {getRoleLabel(userRole)}
              <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></span>
            </p>

            {userRole === 'student' ? (
               <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-zinc-400">Licencias Activas:</span>
                  {userLicenses.map((license, index) => (
                    <div key={index} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${getLicenseStyle(license)} transition-all hover:scale-[1.02]`}>
                      <div className="flex items-center gap-2">
                        <i className="bi bi-person-vcard-fill text-lg opacity-80"></i>
                        <span className="font-mono text-lg font-black tracking-wider leading-none">
                          {license}
                        </span>
                      </div>
                      <i className="bi bi-shield-check opacity-70"></i>
                    </div>
                  ))}
               </div>
            ) : (
               <p className="text-sm font-bold text-white truncate opacity-90" title={userEmail}>
                 {userEmail || 'Cargando...'}
               </p>
            )}
          </div>

          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all border border-transparent hover:border-zinc-700">
            <i className="bi bi-box-arrow-right text-base"></i>
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
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