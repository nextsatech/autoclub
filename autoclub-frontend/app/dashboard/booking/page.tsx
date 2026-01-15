'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClassSession {
  id: number;
  title: string;
  class_date: string;
  start_time: string;
  end_time: string;
  available_capacity: number;
  max_capacity: number;
  professor?: {
    user?: {
      full_name: string;
    }
  };
}

export default function BookingPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // 1. Cargar Clases Disponibles
  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:3000/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Filtramos solo las futuras (opcional)
          setClasses(data);
        }
      } catch (error) {
        console.error("Error cargando clases", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // 2. Lógica de Reserva
  const handleReserve = async (classId: number) => {
    setProcessingId(classId);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:3000/reservations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ class_id: classId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al reservar');

      alert('¡Clase registrada!');
      router.push('/dashboard'); // Redirigir al home para ver el progreso

    } catch (error: any) {
      alert(`❌ ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Función auxiliar para formato de fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p>Buscando horarios disponibles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Reservar Práctica</h1>
        <p className="text-zinc-500 text-sm mt-1">Selecciona un horario disponible para tu sesión de manejo.</p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border border-zinc-100 shadow-sm">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
            <i className="bi bi-calendar-x text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-zinc-900">No hay clases programadas</h3>
          <p className="text-zinc-500 mt-2">Intenta de nuevo más tarde o contacta administración.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const isFull = cls.available_capacity === 0;
            const percentage = ((cls.max_capacity - cls.available_capacity) / cls.max_capacity) * 100;

            return (
              <div key={cls.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                
                {/* Cabecera de la Tarjeta */}
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Práctica B1
                    </span>
                    {isFull && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <i className="bi bi-lock-fill"></i> Agotado
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-zinc-900 leading-tight mb-2">{cls.title || 'Sesión Práctica'}</h3>
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <i className="bi bi-person-badge"></i>
                    <span>{cls.professor?.user?.full_name || 'Instructor de turno'}</span>
                  </div>
                </div>

                {/* Cuerpo de la Tarjeta */}
                <div className="p-6 flex-1">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <i className="bi bi-calendar-event"></i>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 font-medium uppercase">Fecha</p>
                        <p className="text-sm font-semibold text-zinc-700 capitalize">{formatDate(cls.class_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <i className="bi bi-clock"></i>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 font-medium uppercase">Horario</p>
                        <p className="text-sm font-semibold text-zinc-700">
                          {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Cupos */}
                  <div className="mt-6">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-500 font-medium">Disponibilidad</span>
                      <span className={`font-bold ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
                        {cls.available_capacity} cupos libres
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-400' : 'bg-emerald-500'}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Botón de Acción */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleReserve(cls.id)}
                    disabled={isFull || processingId === cls.id}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                      ${isFull 
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                        : 'bg-zinc-900 text-white hover:bg-black shadow-lg shadow-zinc-200 hover:-translate-y-0.5'
                      }`}
                  >
                    {processingId === cls.id ? (
                      <>
                        <span className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></span>
                        Procesando...
                      </>
                    ) : isFull ? (
                      'Clase Llena'
                    ) : (
                      <>Confirmar Reserva <i className="bi bi-arrow-right"></i></>
                    )}
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