'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000';

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: true
  });
};

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/reservations/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setReservations(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm('¿Seguro que deseas cancelar esta clase? Perderás tu cupo.')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/reservations/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert('Reserva cancelada y cupo liberado.');
        loadData(); 
      } else {
        alert('Error al cancelar');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Cargando tus clases...</div>;

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in max-w-5xl mx-auto">
      
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mis Clases Reservadas</h1>
        <p className="text-gray-500 mt-2 text-lg">Gestiona tu asistencia. Recuerda cancelar si no puedes asistir.</p>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
            <i className="bi bi-calendar-x"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900">No tienes clases próximas</h3>
          <p className="text-gray-500 mt-2 mb-6">Ve al horario y reserva tu primera práctica.</p>
          <a href="/dashboard/student/schedule" className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
            Ir a Reservar
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map((res: any) => {
            const cls = res.class;
            return (
              <div key={res.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
                
                <div className="flex flex-row md:flex-col items-center gap-4 md:gap-1 min-w-[100px] text-center">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                    {new Date(cls.class_date).toLocaleDateString('es-CO', { month: 'short', timeZone: 'UTC' })}
                  </span>
                  <span className="text-4xl font-black text-gray-900 leading-none">
                    {new Date(cls.class_date).toLocaleDateString('es-CO', { day: 'numeric', timeZone: 'UTC' })}
                  </span>
                  <span className="text-sm font-bold text-gray-400 uppercase">
                    {new Date(cls.class_date).toLocaleDateString('es-CO', { weekday: 'short', timeZone: 'UTC' })}
                  </span>
                </div>

                <div className="flex-1 text-center md:text-left border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full">
                  <h3 className="text-xl font-black text-gray-900 mb-1">{cls.subject.name}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-2">
                      <i className="bi bi-clock-history text-indigo-500"></i>
                      {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                    </span>
                    <span className="flex items-center gap-2">
                      <i className="bi bi-person-circle text-indigo-500"></i>
                      {cls.professor.user.full_name}
                    </span>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  <button 
                    onClick={() => handleCancel(res.id)}
                    className="w-full md:w-auto px-6 py-3 rounded-xl border-2 border-red-50 text-red-500 font-bold hover:bg-red-50 hover:border-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="bi bi-x-circle-fill"></i> Cancelar Clase
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}