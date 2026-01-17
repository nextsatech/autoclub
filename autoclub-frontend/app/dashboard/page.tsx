'use client';

import { useEffect, useState } from 'react';
import StatCard from './components/StatCard';
import Link from 'next/link';

const API_URL = 'http://localhost:3000';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setStats(await res.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'Panel de Administración General';
      case 'student': return 'Portal de Aprendizaje';
      case 'professor': return 'Panel de Instructor';
      default: return 'Panel de Usuario';
    }
  };

  if (loading || !user) return <div className="p-10 animate-pulse text-gray-500">Cargando panel...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl font-black text-gray-900">Hola, {user.full_name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1 font-medium">
          {getRoleDisplayName(user.role?.name)}
        </p>
      </div>

      {user.role?.name === 'admin' && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Estudiantes" value={stats.students} icon="bi-people-fill" color="bg-blue-500" />
            <StatCard title="Instructores" value={stats.professors} icon="bi-person-badge-fill" color="bg-purple-500" />
            <StatCard title="Clases Activas" value={stats.activeClasses} icon="bi-calendar-check-fill" color="bg-green-500" />
            <StatCard title="Reservas" value={stats.reservations} icon="bi-bookmark-check-fill" color="bg-orange-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <QuickAction href="/dashboard/admin/users" icon="bi-person-plus" text="Registrar Nuevo Usuario" />
                <QuickAction href="/dashboard/admin/classes" icon="bi-plus-circle" text="Programar Nueva Clase" />
              </div>
            </div>
          </div>
        </>
      )}

      {user.role?.name === 'student' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                Tu progreso
              </span>
              <h2 className="text-3xl font-black mt-4 mb-2">¿Listo para tu próxima práctica?</h2>
              <p className="text-indigo-100 mb-8 max-w-md">
                Recuerda completar tus horas prácticas. Revisa la disponibilidad de esta semana.
              </p>
              <Link href="/dashboard/student/schedule" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
                <i className="bi bi-calendar-plus-fill"></i> Reservar Clase Ahora
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
              <i className="bi bi-car-front-fill text-[200px]"></i>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-4">
               <i className="bi bi-check-circle-fill text-2xl"></i>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Estado Activo</h3>
            <p className="text-gray-500 text-sm mt-1">Acceso autorizado.</p>
            <div className="mt-6 w-full">
              <Link href="/dashboard/student/reservations" className="block w-full py-2 rounded-lg border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">
                Ver mis reservas
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const QuickAction = ({ href, icon, text }: { href: string, icon: string, text: string }) => (
  <Link href={href} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm group-hover:text-indigo-600 transition-colors">
        <i className={`bi ${icon}`}></i>
      </div>
      <span className="font-bold text-sm text-gray-700">{text}</span>
    </div>
    <i className="bi bi-chevron-right text-gray-400 text-xs"></i>
  </Link>
);