'use client';

import { useEffect, useState } from 'react';
import StatCard from './components/StatCard';
import Link from 'next/link';

interface DashboardStats {
  totalReservations: number;
  nextClass?: string;
  active: boolean;
}

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ totalReservations: 0, active: false });

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (userStr && token) {
        const user = JSON.parse(userStr);
        
        const userRole = user.role?.name || user.role || 'STUDENT';
        setRole(userRole);

        if (userRole === 'STUDENT') {
          try {
            const res = await fetch('http://localhost:3000/reservations', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
              const data = await res.json();
              const upcoming = data.find((r: any) => new Date(r.class.class_date) > new Date());
              
              setStats({
                totalReservations: data.length,
                nextClass: upcoming ? new Date(upcoming.class.class_date).toLocaleDateString() : 'Sin agendar',
                active: true
              });
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-zinc-500">Cargando tablero de control...</div>;
  }

  if (role === 'ADMIN') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Panel Administrativo</h1>
          <p className="text-zinc-500 text-sm mt-1">Visión global de la escuela de conducción.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Estudiantes Activos" value="24" icon="bi-people-fill" trend="+5 nuevos" />
          <StatCard title="Clases Hoy" value="8" icon="bi-calendar-event" />
          <StatCard title="Instructores" value="3" icon="bi-person-badge-fill" />
          <StatCard title="Graduados" value="15" icon="bi-mortarboard-fill" trend="+3 este mes" />
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-gear-wide-connected text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-zinc-800">Gestión del Sistema</h3>
            <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
                Desde aquí puedes crear nuevas clases en la malla horaria, registrar profesores o ver los logs del sistema.
            </p>
            <div className="flex gap-4 justify-center">
                <button className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors">
                    Crear Clase
                </button>
                <button className="bg-white border border-zinc-200 text-zinc-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
                    Ver Usuarios
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Mi Progreso</h1>
          <p className="text-zinc-500 text-sm mt-1">Resumen de tu formación práctica.</p>
        </div>
        <Link href="/dashboard/booking" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
          <i className="bi bi-plus-lg mr-2"></i>
          Nuevo Registro
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Reservas Totales" 
          value={stats.totalReservations} 
          icon="bi-journal-check" 
        />
        <StatCard 
          title="Próxima Clase" 
          value={stats.nextClass || '---'} 
          icon="bi-calendar-event-fill" 
        />
        <StatCard 
          title="Estado Licencia" 
          value="Activa" 
          icon="bi-person-vcard-fill" 
          trend="En curso"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <h3 className="font-bold text-zinc-800 mb-6">Actividad Reciente</h3>
          
          {stats.totalReservations === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
               <i className="bi bi-inbox text-4xl mb-2"></i>
               <p className="text-sm">Aún no tienes clases registradas.</p>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center bg-indigo-50/50 rounded-xl border border-indigo-100">
                <p className="text-indigo-800 font-medium">¡Vas muy bien!</p>
                <p className="text-indigo-600/70 text-sm">Has completado {stats.totalReservations} sesiones prácticas.</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-2">¿Listo para conducir?</h3>
            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
              Recuerda que debes completar al menos 10 horas prácticas antes de tu examen final.
            </p>
            <Link href="/dashboard/booking">
                <button className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm">
                Agendar Horario
                </button>
            </Link>
          </div>
          <i className="bi bi-speedometer absolute -bottom-6 -right-6 text-9xl text-white opacity-10 rotate-12"></i>
        </div>
      </div>
    </div>
  );
}