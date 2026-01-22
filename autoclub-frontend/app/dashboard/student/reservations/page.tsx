'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/app/context/ToastContext';
import ConfirmModal from '@/app/components/ConfirmModal';

import { API_URL } from '@/app/config/api';

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: true
  });
};

export default function MyReservationsPage() {
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal de cancelación
  const [cancelId, setCancelId] = useState<number | null>(null);

  // 1. Cargar Datos
  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/reservations/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (error) {
      showToast('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Lógica Cancelar (Dividida en 2 pasos para el Modal)
  const confirmCancel = (id: number) => {
    setCancelId(id);
  };

  const executeCancel = async () => {
    if (!cancelId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/reservations/${cancelId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Reserva cancelada y cupo liberado.', 'success');
        loadData(); 
      } else {
        showToast('Error al cancelar reserva', 'error');
      }
    } catch (error) { 
      showToast('Error de red', 'error'); 
    }
    setCancelId(null);
  };

  // 3. Confirmar Asistencia
  const handleConfirmAttendance = async (reservationId: number, attended: boolean) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/reservations/${reservationId}/attendance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ attended })
      });

      if (res.ok) {
        setReservations(prev => prev.map(r => 
          r.id === reservationId ? { ...r, attendance: attended } : r
        ));
        showToast(attended ? 'Asistencia confirmada' : 'Inasistencia registrada', 'success');
      } else {
        showToast('Error al guardar confirmación', 'error');
      }
    } catch (error) { 
      showToast('Error de conexión', 'error'); 
    }
  };

  const isPast = (dateStr: string, timeStr: string) => {
    const now = new Date();
    const clsDate = new Date(dateStr);
    clsDate.setHours(23, 59, 59); // Final del día
    return now > clsDate;
  };

  if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse">Cargando tus clases...</div>;

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in max-w-5xl mx-auto relative">
      
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mis Clases Registradas</h1>
        <p className="text-gray-500 mt-2 text-lg">Gestiona tu asistencia. Recuerda cancelar si no puedes asistir.</p>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
            <i className="bi bi-calendar-x"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900">No tienes clases próximas</h3>
          <p className="text-gray-500 mt-2 mb-6">Ve al horario y reserva tu primera práctica.</p>
          <a href="/dashboard/student/schedule" className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
            Ir a Reservar
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {reservations.map((res: any) => {
            const cls = res.class;
            
            const classHasPassed = isPast(cls.class_date, cls.start_time);
            const needsConfirmation = classHasPassed && res.attendance === null;
            
            return (
              <div 
                key={res.id} 
                className={`bg-white p-6 rounded-3xl shadow-sm border transition-all relative overflow-hidden
                  ${needsConfirmation ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-100'}
                `}
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  
                  {/* FECHA */}
                  <div className="flex flex-row md:flex-col items-center gap-4 md:gap-1 min-w-[100px] text-center">
                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full 
                      ${needsConfirmation ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-50 text-indigo-500'}`}>
                      {new Date(cls.class_date).toLocaleDateString('es-CO', { month: 'short', timeZone: 'UTC' })}
                    </span>
                    <span className="text-4xl font-black text-gray-900 leading-none">
                      {new Date(cls.class_date).toLocaleDateString('es-CO', { day: 'numeric', timeZone: 'UTC' })}
                    </span>
                    <span className="text-sm font-bold text-gray-400 uppercase">
                      {new Date(cls.class_date).toLocaleDateString('es-CO', { weekday: 'short', timeZone: 'UTC' })}
                    </span>
                  </div>

                  {/* INFO CENTRAL */}
                  <div className="flex-1 text-center md:text-left border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full">
                    <h3 className="text-xl font-black text-gray-900 mb-1">{cls.subject.name}</h3>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 font-medium mb-2">
                      <span className="flex items-center gap-2">
                        <i className="bi bi-clock-history text-indigo-500"></i>
                        {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                      </span>
                      <span className="flex items-center gap-2">
                        <i className="bi bi-person-circle text-indigo-500"></i>
                        {cls.professor.user.full_name}
                      </span>
                    </div>

                    {/* STATUS DE ASISTENCIA */}
                    {res.attendance === true && (
                      <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">
                        <i className="bi bi-check-circle-fill"></i> Asistida
                      </span>
                    )}
                    {res.attendance === false && (
                      <span className="inline-flex items-center gap-1 text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded">
                        <i className="bi bi-x-circle-fill"></i> No Asistida
                      </span>
                    )}
                  </div>

                  {/* ACCIONES */}
                  <div className="w-full md:w-auto flex justify-center">
                    {needsConfirmation ? (
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <p className="text-xs font-bold text-yellow-800 text-center mb-1">¿Asististe?</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleConfirmAttendance(res.id, false)}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 text-sm"
                          >
                            No fui
                          </button>
                          <button 
                            onClick={() => handleConfirmAttendance(res.id, true)}
                            className="px-6 py-2 rounded-xl bg-black text-white font-bold hover:bg-zinc-800 text-sm shadow-md"
                          >
                            Sí, Asistí
                          </button>
                        </div>
                      </div>
                    ) : (
                      (!classHasPassed && res.attendance === null) ? (
                        <button 
                          onClick={() => confirmCancel(res.id)}
                          className="w-full md:w-auto px-6 py-3 rounded-xl border-2 border-red-50 text-red-500 font-bold hover:bg-red-50 hover:border-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <i className="bi bi-x-circle-fill"></i> Cancelar
                        </button>
                      ) : null
                    )}
                  </div>

                </div>
                
                {needsConfirmation && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-yellow-400"></div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA CANCELAR */}
      <ConfirmModal 
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={executeCancel}
        title="¿Cancelar Reserva?"
        message="¿Estás seguro que deseas cancelar tu asistencia? Liberarás el cupo para otro compañero."
        type="danger"
      />
    </div>
  );
}